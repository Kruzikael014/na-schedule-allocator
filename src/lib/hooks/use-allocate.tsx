import { useCallback, useState } from "react";
import type { ActivityData, RoomPicData, WorkingShiftData } from "../types";
import { usePapa } from "./use-papa";

export function useAllocate() {
  const { parse } = usePapa()
  const [workingShift, setWorkingShift] = useState<WorkingShiftData[]>()

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
    setWorkingShift(shiftData)
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

  function isPicAvailable(pic: string, day: string, shift: string, schedule: ActivityData[]): boolean {
    const activities = schedule.filter(e => e.pic === pic && e.day === day && e.shift === shift)
    if (activities.some(a => [21, 22, 23, 24].includes(a.code)) || activities.length === 0) return false
    return true
  }

  function isStaffCountSufficient(day: string, shift: string, schedule: ActivityData[]): { isSufficient: boolean, freeStaff: string[] } {
    const matchCondition = (e: ActivityData): boolean => e.day === day && e.shift === shift
    const unavailableStaff = schedule.filter(e => matchCondition(e) && [21, 22, 23, 24].includes(e.code)).map(e => e.pic)
    const freeStaff = schedule.filter(e => !unavailableStaff.includes(e.pic) && matchCondition(e)).map(e => e.pic)
    return { isSufficient: freeStaff.length > 5, freeStaff }
  }

  function isRoomFree(room: string, day: string, shift: string, transactions: ActivityData[]): boolean {
    return !transactions.some(e => e.room === room && e.day === day && e.shift === shift)
  }

  function findAllCandidates(pic: string, room: string, schedule: ActivityData[], transactions: ActivityData[], ignoreStaffCountAvailability: boolean = false): { day: string, shift: string }[] {
    const candidates: { day: string, shift: string }[] = []
    for (let d = 1; d <= 5; d++) {
      for (const s of shiftPriority) {
        const day = String(d)
        const shift = String(s)

        if (!isPicAvailable(pic, day, shift, schedule)) continue
        const { isSufficient } = isStaffCountSufficient(day, shift, schedule)
        if (!ignoreStaffCountAvailability && !isSufficient) continue
        if (!isRoomFree(room, day, shift, transactions)) continue

        candidates.push({ day, shift })
      }
    }
    return candidates
  }

  function tryFindSlots({ pic, room }: RoomPicData, schedule: ActivityData[], transaction: ActivityData[], ignoreStaffCountAvailability: boolean = false): { day: string, shift: string }[] | null {
    const candidates: { day: string, shift: string }[] = findAllCandidates(pic, room, schedule, transaction, ignoreStaffCountAvailability)

    // eliminate consecutive calib schedule to make sure gap > 2 days
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        if (Math.abs(Number(candidates[j].day) - Number(candidates[i].day)) > 2) {
          return [candidates[i], candidates[j]]
        }
      }
    }

    return null
  }

  function imGoingToPopThisShitOutOfTheScheduleAndInsertInIntoToAllocateArray({ room, pic }: RoomPicData, schedule: ActivityData[], toAllocate: RoomPicData[]) {
    toAllocate.push({ pic: pic, room: room })
    schedule.filter(e => e.code === 23 && e.room === room).forEach(cal => schedule.splice(schedule.indexOf(cal), 1))
  }

  function tryReallocate(
    toAllocate: RoomPicData[],
    schedule: ActivityData[],
    transaction: ActivityData[],
    untouchedSchedule: ActivityData[]
  ): { day: string, shift: string, pic: string, room: string }[] | null {
    console.log(`${JSON.stringify(toAllocate)}\n-------------------`)
    const { pic, room } = toAllocate[0]

    let slots = tryFindSlots({ pic, room }, schedule, transaction)
    let emergencySlots: {
      day: string;
      shift: string;
    }[] | null

    console.log('find replacement slots: ', slots, ' for ', { pic, room })

    if (!slots) {
      emergencySlots = tryFindSlots({ pic, room }, untouchedSchedule, transaction, true)
      if (!emergencySlots) {
        const picRoom = toAllocate.shift()
        toAllocate.push(picRoom!)
        return null
      }
      console.log('find emergency replacement slots: ', emergencySlots, ' for ', { pic, room })
      slots = emergencySlots
    }

    const firstSub = schedule
      .filter(e => e.code === 23 &&
        (e.day === slots[0].day && e.shift === slots[0].shift)
      ).map(e => {
        return {
          room: e.room!,
          pic: e.pic,
          dayshift: schedule.filter(s => e.room === s.room && s.code === 23).map(e => e.day + e.shift).join('-')
        }
      })

    const secondSub = schedule
      .filter(e => e.code === 23 &&
        (e.day === slots[1].day && e.shift === slots[1].shift)
      ).map(e => {
        return {
          room: e.room!,
          pic: e.pic,
          dayshift: schedule.filter(s => e.room === s.room && s.code === 23).map(e => e.day + e.shift).join('-')
        }
      })

    console.log('first', firstSub, 'second', secondSub)

    // kalau ada diri dia di substitutor?
    if (firstSub.some(e => e.pic === pic)) {
      // remove from schedule, add to toALlocate
      const _r = firstSub.filter(e => e.pic === pic)
      for (const r of _r)
        imGoingToPopThisShitOutOfTheScheduleAndInsertInIntoToAllocateArray({ room: r.room, pic: r.pic }, schedule, toAllocate)
    }
    else if (secondSub.some(e => e.pic === pic)) {
      // remove from schedule, add to toALlocate
      const _r = secondSub.filter(e => e.pic === pic)
      for (const r of _r)
        imGoingToPopThisShitOutOfTheScheduleAndInsertInIntoToAllocateArray({ room: r.room, pic: r.pic }, schedule, toAllocate)
    }
    // kalau ada exact match
    const exactMatchIdx = firstSub.findIndex(e => e.dayshift === `${slots[0].day + slots[0].shift + '-' + slots[1].day + slots[1].shift}`)
    if (exactMatchIdx !== -1) {
      imGoingToPopThisShitOutOfTheScheduleAndInsertInIntoToAllocateArray({ pic: firstSub[exactMatchIdx].pic, room: firstSub[exactMatchIdx].room }, schedule, toAllocate)
    }
    // kalau tidak ada yang exactly match dia 
    else {
      const substitutorsMap = new Map(
        schedule.filter(
          e =>
            e.code === 23 &&
            (
              (e.day === slots[0].day && e.shift === slots[0].shift) ||
              (e.day === slots[1].day && e.shift === slots[1].shift)
            )
        ).map(e => [`${e.room}-${e.pic}`, { room: e.room!, pic: e.pic }])
      )
      const substitutors = [...substitutorsMap.values()]

      for (const { room } of substitutors) {
        schedule.filter(e => e.code === 23 && e.room === room).forEach(a => schedule.splice(schedule.indexOf(a), 1))
      }

    }
    return slots.map(e => ({ ...e, pic: pic, room: room }))
  }

  const shiftPriority = [3, 4, 2, 5, 1, 6]

  const allocateCalibration = useCallback(async (workTeachColl: ActivityData[], roomPicFile: File, transactionFile: File) => {
    const untouchedSchedule = [...workTeachColl]
    const schedule = [...workTeachColl]
    const _roomPic = await parse<RoomPicData>(roomPicFile)
    const _transaction = await parse<ActivityData>(transactionFile)

    const failedToAllocate: RoomPicData[] = []

    for (const { pic, room } of _roomPic) {
      let slots = tryFindSlots({ pic, room }, schedule, _transaction)

      if (!slots) {
        console.warn(`⚠️ Try reallocate for ${room}`)
        failedToAllocate.push({ pic, room })
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

    console.log('failed', failedToAllocate)

    let attempts = 0
    const maxAttempts = failedToAllocate.length * 5 // fleksibel, 3x percobaan per item

    for (let i = 0; i < 3; i++)
    // while (failedToAllocate.length > 0 && attempts < maxAttempts) 
    {
      attempts++
      const slots = tryReallocate(failedToAllocate, schedule, _transaction, untouchedSchedule)
      if (slots) {
        for (const { day, shift, pic, room } of slots) {
          schedule.push({
            code: 23,
            day: day,
            shift: shift,
            description: `Calibration ${room}`,
            pic: pic,
            room: room
          })
        }
        failedToAllocate.shift()
      }
    }

    if (failedToAllocate.length > 0) {
      console.warn("⚠️ Masih ada yang gagal dialokasikan setelah reallocation attempts:", failedToAllocate)
    }

    return schedule.filter(e => e.code === 23)
  }, [])

  const allocateStandby = useCallback(async (workTeachCollCal: ActivityData[]) => {

  }, [workingShift])

  return { allocateWorking, allocateTeachingCollege, allocateCalibration }
}