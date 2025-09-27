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

  function tryFindSlots({ pic, room }: RoomPicData, schedule: ActivityData[], transaction: ActivityData[]): { day: string, shift: string }[] | null {
    const candidates: { day: string, shift: string }[] = []

    // get all valid calib shedule
    for (let d = 1; d <= 5; d++) {
      for (const s of shiftPriority) {
        const day = String(d)
        const shift = String(s)

        if (!isPicAvailable(pic, day, shift, schedule)) continue
        const { isSufficient } = isStaffCountSufficient(day, shift, schedule)
        if (!isSufficient) continue
        if (!isRoomFree(room, day, shift, transaction)) continue

        candidates.push({ day, shift })
      }
    }

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

  const shiftPriority = [3, 4, 2, 5, 1, 6]

  const allocateCalibration = useCallback(async (workTeachColl: ActivityData[], roomPicFile: File, transactionFile: File) => {
    const schedule = [...workTeachColl]
    const _roomPic = await parse<RoomPicData>(roomPicFile)
    const _transaction = await parse<ActivityData>(transactionFile)

    const calibration: ActivityData[] = []

    for (const { pic, room } of _roomPic) {
      let slots = tryFindSlots({ pic, room }, schedule, _transaction)

      if (!slots) {
        console.warn(`⚠️ Try reallocate for ${room}`)
        // TODO: Reallocate logic
        // slots = reallocate({pic, room}, schedule, _transaction)
      }

      // still no slot even after reallocation
      if (!slots) {
        console.warn(`❌ Drop calibration for ${room}`)
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
        calibration.push(calibData)
        schedule.push(calibData)
      }
    }

    return calibration
  }, [])

  const allocateStandby = useCallback(async (workTeachCollCal: ActivityData[]) => {

  }, [workingShift])

  return { allocateWorking, allocateTeachingCollege, allocateCalibration }
}