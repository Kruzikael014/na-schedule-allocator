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
    if (activities.length === 0) return false // not in working shift, not even in college outside shift
    const hasWorking = activities.some(e => e.code === 99)
    const hasAnotherActivity = activities.some(e => {
      const res = [21, 22, 23, 24].includes(e.code)
      return res
    })
    return hasWorking && !hasAnotherActivity
  }

  const isRoomFree = (room: string, day: string, shift: string, transaction: ActivityData[]): boolean => !transaction.some(e => e.room === room && e.day === day && e.shift === shift)

  function hasEnoughStaff(pic: string, day: string, shift: string, schedule: ActivityData[]): boolean {
    const entries = schedule.filter(e => e.day === day && e.shift === shift)

    const byPic = entries.reduce<Record<string, ActivityData[]>>((acc, e) => {
      (acc[e.pic] ??= []).push(e)
      return acc
    }, {})
    // availablePics = pics yang *semua* activity-nya untuk slot ini adalah code 99
    const availablePics = Object.entries(byPic)
      .filter(([p, acts]) => {
        // convert code to number defensively in case code is string like "99.9"
        const codes = acts.map(a => Number(a.code));
        // must have at least one 99 AND no non-99 "busy" codes
        const hasWorking = codes.some(c => c === 99);
        const hasBusy = codes.some(c => [21, 22, 23, 24].includes(c));
        return hasWorking && !hasBusy;
      })
      .map(([p]) => p);

    // target pic must be in availablePics, and count of availablePics >= 5
    const enough = availablePics.length >= 5 && availablePics.includes(pic);
    return enough;
  }

  const allocateCalibration = useCallback(async (workTeachColl: ActivityData[], roomPicFile: File, transactionFile: File) => {
    const schedule = [...workTeachColl]
    const _roomPic = await parse<RoomPicData>(roomPicFile)
    const _transaction = await parse<ActivityData>(transactionFile)

    const calibration: ActivityData[] = []

    for (const { room, pic } of _roomPic) {
      let allocated = 0
      const usedDays = new Set<string>()

      for (let day = 1; day <= 6 && allocated < 2; day++) {
        for (let shift = 1; shift <= 6 && allocated < 2; shift++) {
          const d = String(day)
          const s = String(shift)

          if (usedDays.has(d) || [...usedDays].some(e => Math.abs(day - Number(e)) <= 2)) break // has allocated on that day or previously has been allocated without 2 days gap

          if (!isPicAvailable(pic, d, s, schedule)) continue
          if (!isRoomFree(room, d, s, _transaction)) continue
          if (!hasEnoughStaff(pic, d, s, schedule)) continue

          const newCalib: ActivityData = {
            code: 23,
            description: `Calibration ${room}`,
            room: room,
            day: d,
            shift: s,
            pic: pic
          }

          calibration.push(newCalib)
          schedule.push(newCalib) // because we use schedule to validate if we had enough staff on that shift

          usedDays.add(d)
          allocated++
        }
      }
    }

    return calibration
  }, [])

  const allocateStandby = useCallback(async (workTeachCollCal: ActivityData[]) => {

  }, [workingShift])

  return { allocateWorking, allocateTeachingCollege, allocateCalibration }
}