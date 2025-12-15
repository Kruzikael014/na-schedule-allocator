import { useCallback, useState } from "react";
import type { ActivityData, CalibSlot, Division, RoomPicData, Staff } from "../types";
import { usePapa } from "./use-papa";
import { isStaffCountSufficient, dailyStandbyCount, tryFindSlots, findIncompleteStandbyDay, isPicAvailable } from "../facades/allocation-facade";
import { pushIfNotExists, randomNumber, shuffleArray } from "../facades/util";
import { getRoom, getRoomWeight, popUnmatchingRoomPic } from "../facades/room-allocation-facade";

const shiftDetail: { [key: string]: any } = {
  P: {
    normal: [1, 2, 3, 4],
    sat: [1, 2, 3]
  },
  N: {
    normal: [2, 3, 4, 5],
    sat: [2, 3, 4]
  },
  M: {
    normal: [3, 4, 5, 6],
    sat: [3, 4, 5]
  }
}

const getShiftArr = (category: string, day: number): number[] => shiftDetail[category][day === 6 ? 'sat' : 'normal']

export function useAllocate() {
  const { parse } = usePapa()

  const allocateWorking = async (shiftFile: File): Promise<{ workingSchedule: ActivityData[], staff: Staff[] }> => {
    const staff = await parse<Staff>(shiftFile, row => ({
      division: row.division,
      initial: row.initial,
      shifts: [row.monday, row.tuesday, row.wednesday, row.thursday, row.friday, row.saturday],
      team: row.team
    }))

    return {
      workingSchedule: staff.flatMap(data => {
        return data.shifts.flatMap((category, index) => {
          const day = index + 1
          const shiftArr = getShiftArr(category, day)
          return shiftArr.map(shiftNumber => ({
            code: 99,
            description: 'Working',
            room: null,
            day: String(day),
            shift: String(shiftNumber),
            pic: data.initial
          }))
        })
      }),
      staff: staff
    }
  }

  const allocateTeachingCollege = async (teachingCollegeFile: File) =>
    await parse<ActivityData>(teachingCollegeFile, row => ({ ...row, code: Number(row.code) }))

  const allocateRoomPIC = async (staff: Staff[], schedule: ActivityData[], transaction: ActivityData[]): Promise<RoomPicData[]> => {
    if (staff.length === 0 || schedule.length === 0 || transaction.length === 0) return []

    const result: Record<string, { weight: number, count: number, room: string[] }> = {}
    staff.forEach(e => {
      result[e.initial] = { weight: 0, count: 0, room: [] }
    })

    for (const r of getRoom(staff)) {
      // mekanisme dikitin candidate sampai cuman 1
      popUnmatchingRoomPic(r, schedule, transaction)

      if (r.candidates.length === 0) {
        console.warn(`No candidate can calib ${JSON.stringify(r)}!`)
        continue
      }

      const MAX_WEIGHT = 4, MAX_COUNT = 3
      r.candidates = r.candidates.filter(e => {
        const curr = result[e]
        const futureWeight = curr.weight + r.weight
        const futureCount = curr.count + 1
        return futureWeight <= MAX_WEIGHT && futureCount <= MAX_COUNT
      })

      if (r.candidates.length === 0) {
        console.warn('No candidate can take this calib anymore!')
        continue
      }

      if (r.candidates.length > 1) {
        shuffleArray(r.candidates)
        r.candidates.sort((_a, _b) => {
          const a = result[_a]
          const b = result[_b]

          if (a.count !== b.count)
            return a.count - b.count

          return a.weight - b.weight
        })

        r.candidates = [r.candidates[0]]
      }

      result[r.candidates[0]].count += 1
      result[r.candidates[0]].weight += r.weight
      result[r.candidates[0]].room.push(r.description)
    }

    return Object.entries(result).flatMap(([k, v]) => (v.room.map(e => ({ pic: k, room: e }))))
  }

  function reallocateCalibration(
    unAllocated: RoomPicData[],
    schedule: ActivityData[],
    transaction: ActivityData[],
    untouchedSchedule: ActivityData[]
  ): CalibSlot[] | null {
    function eliminateExistingCalibration({ room, pic }: RoomPicData, schedule: ActivityData[], unAllocated: RoomPicData[]) {
      pushIfNotExists<RoomPicData>(unAllocated, { pic: pic, room: room }, (e) => e.room === room)
      schedule.filter(e => e.code === 23 && e.room === room).forEach(cal => schedule.splice(schedule.indexOf(cal), 1))
    }

    function delayReallocation() {
      unAllocated.push({ pic, room })
      unAllocated.shift()
    }

    const { pic, room } = unAllocated[0]
    let slots = tryFindSlots({ pic, room }, schedule, transaction)

    if (!slots) {
      slots = tryFindSlots({ pic, room }, untouchedSchedule, transaction, true)
      if (!slots) {
        delayReallocation()
        return null
      }
    }

    for (const { day, shift } of slots) {
      // apakah di shift tsb ada calib dia, kalau ada maka harus di remove dan masukkan ke unAllocated array
      const samePicCalibConflict = schedule.find(e => e.code === 23 && e.day === day && e.shift === shift && e.pic === pic)
      if (samePicCalibConflict) {
        eliminateExistingCalibration({ pic: samePicCalibConflict.pic, room: samePicCalibConflict.room! }, schedule, unAllocated)
      }
      // apakah shift tsb availability aman? kalau aman langsung insert aja
      const { isSufficient } = isStaffCountSufficient(day, shift, schedule)
      if (!isSufficient) {
        // kalau gak aman, berarti harus eliminate existing calib
        const _substitutor = schedule.filter(e => e.code === 23 && e.day === day && e.shift === shift)
        if (_substitutor.length === 0) {
          delayReallocation()
          return null
        }
        const { pic, room } = _substitutor[randomNumber(0, _substitutor.length - 1)]
        eliminateExistingCalibration({ pic: pic, room: room! }, schedule, unAllocated)
      }
      // kalau aman berarti langsung return slot ({day, shift}) aja
    }
    return slots
  }

  const allocateCalibration = useCallback(async (workTeachColl: ActivityData[], roomPic: RoomPicData[], transactions: ActivityData[]): Promise<{ calibrationSchedule: ActivityData[], isSafe: boolean }> => {
    const untouchedSchedule = [...workTeachColl]
    const schedule = [...workTeachColl]

    const unAllocated: RoomPicData[] = []

    for (const { pic, room } of roomPic) {
      let slots = tryFindSlots({ pic, room }, schedule, transactions)

      if (!slots) {
        console.warn(`⚠️ Try reallocate for ${room}`)
        pushIfNotExists<RoomPicData>(unAllocated, { pic: pic, room: room }, (e) => e.room === room)
        unAllocated.push({ pic, room })
        continue
      }

      for (const { day, shift } of slots) {
        const calibData = {
          code: 23,
          description: `Calibration ${room}`,
          room: room,
          day: day,
          shift: shift,
          pic: pic
        }
        schedule.push(calibData)
      }
    }

    let attempt = 0
    let maxAttempt = unAllocated.length * 150

    while (unAllocated.length > 0 && attempt < maxAttempt) {
      const slots = reallocateCalibration(unAllocated, schedule, transactions, untouchedSchedule)
      if (slots) {
        for (const { day, shift } of slots) {
          const room = unAllocated[0].room
          const pic = unAllocated[0].pic
          schedule.push({
            code: 23,
            day: day,
            shift: shift,
            description: `Calibration ${unAllocated[0].room}`,
            pic: pic,
            room: room
          })
        }
        unAllocated.shift()
      }
      attempt++
    }

    return {
      calibrationSchedule: schedule.filter(e => e.code === 23),
      isSafe: unAllocated.length === 0
    }
  }, [])

  function reallocateStandby(countMap: Map<string, number>, schedule: ActivityData[]) {
    let toAllocate = [...countMap].filter(e => e[1] < 5)

    while (toAllocate.length > 0) {
      const incompleteStandby = findIncompleteStandbyDay(schedule)

      if (!incompleteStandby) break // artinya semuanya lengkap

      const { day, shift } = incompleteStandby
      const { freeStaff } = isStaffCountSufficient(day, shift, schedule)

      const candidate = freeStaff[randomNumber(0, freeStaff.length - 1)]

      schedule.push({
        code: 24,
        day: day,
        shift: shift,
        description: `Standby day ${day} shift ${shift}`,
        pic: candidate,
        room: null,
      })
      countMap.set(candidate, countMap.get(candidate)! + 1)

      // candidate might be over standby -> search substitutor
      for (const [substitutor, _] of toAllocate) {
        // find candidate std by schedule
        const candidateStdBySchedule = schedule.filter(e => e.code === 24 && e.pic === candidate && e.day !== '6')
        // find the std by schedule where substitutor is free
        const act = candidateStdBySchedule.find(e => isPicAvailable(substitutor, e.day, e.shift, schedule))
        if (act) {
          // update data
          const idx = schedule.indexOf(act)
          schedule[idx].pic = substitutor
          // update countMap (sub+1 | candidate -1)
          countMap.set(substitutor, countMap.get(substitutor)! + 1)
          countMap.set(candidate, countMap.get(candidate)! - 1)
        }
      }
      toAllocate = [...countMap].filter(e => e[1] < 5)
    }
  }

  const allocateStandby = useCallback(async (activities: ActivityData[], staff: Staff[]) => {
    const schedule = [...activities]
    const countMap = new Map<string, number>()

    const getTeam = (initial: string): string => staff.find(e => e.initial === initial)!.team

    // initialize countMap
    for (const { initial } of staff) countMap.set(initial, 0)

    // saturday standby
    for (let s = 1; s <= 5; s++) {
      const shift = String(s)

      // sort countMap by count (lowest first), so we process staff with the least standby count
      const sortedMap = [...countMap].sort((a, b) => a[1] - b[1])

      const candidates: string[] = []
      const { freeStaff } = isStaffCountSufficient('6', shift, schedule)

      // fill the 1st and 2nd slot with team A staff
      for (const [key, val] of sortedMap) {
        if (candidates.length === 2) break
        if (dailyStandbyCount(key, '6', schedule) === 2) continue
        if (val >= 5) continue
        if (getTeam(key) !== 'A') continue
        if (freeStaff.includes(key)) {
          candidates.push(key)
        }
      }

      // fill the 3rd and 4th slot with team B staff
      for (const [key, val] of sortedMap) {
        if (candidates.length === 4) break
        if (dailyStandbyCount(key, '6', schedule) === 2) continue
        if (val >= 5) continue
        if (getTeam(key) !== 'B') continue
        if (freeStaff.includes(key)) {
          candidates.push(key)
        }
      }

      // update countMap and insert chosen staff to schedule
      for (const initial of candidates) {
        countMap.set(initial, countMap.get(initial)! + 1)
        schedule.push({
          code: 24,
          day: '6',
          shift: shift,
          description: `Standby day 6 shift ${shift} (${getTeam(initial) === "A" ? "Red" : "Blue"})`,
          pic: initial,
          room: null,
        })
      }
    }

    // monday - friday standby
    for (let d = 1; d <= 5; d++) {
      for (let s = 1; s <= 6; s++) {
        const day = String(d)
        const shift = String(s)

        const { freeStaff } = isStaffCountSufficient(day, shift, schedule)

        // sort by least standby count
        const sortedMap = [...countMap].sort((a, b) => a[1] - b[1])

        const candidates: string[] = []

        // pick 2 candidates
        for (const [key, val] of sortedMap) {
          if (candidates.length === 2) break
          if (dailyStandbyCount(key, day, schedule) === 2) continue
          if (val >= 5) continue
          if (freeStaff.includes(key)) {
            candidates.push(key)
          }
        }

        for (const initial of candidates) {
          countMap.set(initial, countMap.get(initial)! + 1)
          schedule.push({
            code: 24,
            day,
            shift,
            description: `Standby day ${day} shift ${shift}`,
            pic: initial,
            room: null,
          })
        }
      }
    }

    reallocateStandby(countMap, schedule)

    return schedule.filter(e => e.code === 24)
  }, [])

  return { allocateWorking, allocateTeachingCollege, allocateRoomPIC, allocateCalibration, allocateStandby }
}
