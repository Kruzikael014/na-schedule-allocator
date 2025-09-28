// contain all util (function or logic) for allocation
import type { ActivityData, CalibSlot, RoomPicData } from "../types"

function isPicAvailable(pic: string, day: string, shift: string, schedule: ActivityData[]): boolean {
  const activities = schedule.filter(e => e.pic === pic && e.day === day && e.shift === shift)
  if (activities.some(a => [21, 22, 23, 24].includes(a.code)) || activities.length === 0) return false
  return true
}

const minAmountOfAvailableStaff = 5

function isStaffCountSufficient(day: string, shift: string, schedule: ActivityData[]): { isSufficient: boolean, freeStaff: string[] } {
  const matchCondition = (e: ActivityData): boolean => e.day === day && e.shift === shift
  const unavailableStaff = schedule.filter(e => matchCondition(e) && [21, 22, 23, 24].includes(e.code)).map(e => e.pic)
  const freeStaff = schedule.filter(e => !unavailableStaff.includes(e.pic) && matchCondition(e)).map(e => e.pic)
  return { isSufficient: freeStaff.length >= minAmountOfAvailableStaff, freeStaff }
}

function isRoomFree(room: string, day: string, shift: string, transactions: ActivityData[]): boolean {
  return !transactions.some(e => e.room === room && e.day === day && e.shift === shift)
}

const shiftPriority = [3, 4, 2, 5, 1, 6]

function findCalibSlot(pic: string, room: string, schedule: ActivityData[], transactions: ActivityData[], ignoreStaffCountAvailability: boolean = false): CalibSlot[] {
  const candidates: CalibSlot[] = []
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

export { isPicAvailable, isStaffCountSufficient, isRoomFree, findCalibSlot }