import { useCallback } from "react";
import type { ActivityData, CalibSlot, RoomPicData, WorkingShiftData } from "../types";
import { usePapa } from "./use-papa";
import { isStaffCountSufficient, dailyStandbyCount, tryFindSlots } from "../facades/allocation-facade";
import { randomNumber } from "../facades/util";

export function useAllocate() {
  const { parse } = usePapa()

  const getShiftNum = useCallback((shiftCategory: string, day: number) => {
    return shiftCategory === 'P' ? (day != 6 ? [1, 2, 3, 4] : [1, 2, 3]) : (day != 6 ? [3, 4, 5, 6] : [3, 4, 5])
  }, [])

  const allocateWorking = useCallback(async (workingShiftFile: File) => {
    const shiftData = await parse<WorkingShiftData>(workingShiftFile, row => ({
      division: row.division,
      initial: row.initial,
      shifts: [row.monday, row.tuesday, row.wednesday, row.thursday, row.friday, row.saturday],
      team: row.team
    }))
    return shiftData.flatMap(data => {
      return data.shifts.flatMap((shiftCategory, d) => {
        const day = d + 1
        const shiftNums = getShiftNum(shiftCategory, day)

        return shiftNums.map(shiftNum => ({
          code: 99,
          description: 'Working',
          room: null,
          day: String(day),
          shift: String(shiftNum),
          pic: data.initial
        }))
      })
    })
  }, [])

  const allocateTeachingCollege = useCallback(async (teachingCollegeData: File) => await parse<ActivityData>(teachingCollegeData, (row) => ({ ...row, code: Number(row.code) })), [])


  function pushifNotExists<T = any>(arr: T[], obj: T, conditionCallback: (e: T) => boolean) {
    const found = arr.findIndex(conditionCallback)
    if (found === -1) arr.push(obj)
  }

  function eliminateExistingCalibration({ room, pic }: RoomPicData, schedule: ActivityData[], unAllocated: RoomPicData[]) {
    pushifNotExists(unAllocated, { pic: pic, room: room }, (e) => e.room === room)
    schedule.filter(e => e.code === 23 && e.room === room).forEach(cal => schedule.splice(schedule.indexOf(cal), 1))
  }

  function reallocateCalibration(
    unAllocated: RoomPicData[],
    schedule: ActivityData[],
    transaction: ActivityData[],
    untouchedSchedule: ActivityData[]
  ): CalibSlot[] | null {

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

  const allocateCalibration = useCallback(async (workTeachColl: ActivityData[], roomPicFile: File, transactionFile: File) => {
    const untouchedSchedule = [...workTeachColl]
    const schedule = [...workTeachColl]
    const _roomPic = await parse<RoomPicData>(roomPicFile)
    const _transaction = await parse<ActivityData>(transactionFile)

    const unAllocated: RoomPicData[] = []

    for (const { pic, room } of _roomPic) {
      let slots = tryFindSlots({ pic, room }, schedule, _transaction)

      if (!slots) {
        console.warn(`⚠️ Try reallocate for ${room}`)
        pushifNotExists<RoomPicData>(unAllocated, { pic: pic, room: room }, (e) => e.room === room)
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
      const slots = reallocateCalibration(unAllocated, schedule, _transaction, untouchedSchedule)
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

    return schedule.filter(e => e.code === 23)
  }, [])

  const allocateStandby = useCallback(async (workTeachCollCal: ActivityData[], workingShiftFile: File) => {
    const schedule = [...workTeachCollCal]
    const shiftData = await parse<WorkingShiftData>(workingShiftFile, row => ({
      division: row.division,
      initial: row.initial,
      shifts: [row.monday, row.tuesday, row.wednesday, row.thursday, row.friday, row.saturday],
      team: row.team,
    }))
    const countMap = new Map<string, number>()

    const getTeam = (initial: string): string => shiftData.find(e => e.initial === initial)!.team

    // initialize countMap
    for (const { initial } of shiftData) countMap.set(initial, 0)

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
          shift,
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

    return schedule.filter(e => e.code === 24)
  }, [])


  return { allocateWorking, allocateTeachingCollege, allocateCalibration, allocateStandby }
}