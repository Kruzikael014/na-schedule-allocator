// contain all util (function or logic) for allocation
import type { ActivityData, CalibSlot, RoomPicData } from "../types"

function isPicAvailable(pic: string, day: string, shift: string, schedule: ActivityData[]): boolean {
  const activities = schedule.filter(e => e.pic === pic && e.day === day && e.shift === shift)
  if (activities.some(a => [21, 22, 23, 24].includes(a.code)) || activities.length === 0) return false
  return true
}

const minAmountOfAvailableStaff = 5

const sameDaySameShift = (e: ActivityData, day: string, shift: string): boolean => e.day === day && e.shift === shift

function isStaffCountSufficient(day: string, shift: string, schedule: ActivityData[]): { isSufficient: boolean, freeStaff: string[] } {
  const unavailableStaff = schedule.filter(e => sameDaySameShift(e, day, shift) && [21, 22, 23, 24].includes(e.code)).map(e => e.pic)
  console.log(`h${day}s${shift} unavailable: `, unavailableStaff)
  const freeStaff = schedule.filter(e => !unavailableStaff.includes(e.pic) && sameDaySameShift(e, day, shift)).map(e => e.pic)
  console.log(`h${day}s${shift} free : `, freeStaff)
  return { isSufficient: freeStaff.length >= minAmountOfAvailableStaff, freeStaff }
}

function isRoomFree(room: string, day: string, shift: string, transactions: ActivityData[]): boolean {
  return !transactions.some(e => e.room === room && e.day === day && e.shift === shift)
}

function dailyStandbyCount(initial: string, day: string, schedule: ActivityData[]): number {
  return schedule.filter(e => e.code === 24 && e.pic === initial && e.day === day).length
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

function tryFindSlots({ pic, room }: RoomPicData, schedule: ActivityData[], transaction: ActivityData[], ignoreStaffCountAvailability: boolean = false): CalibSlot[] | null {
  const candidates: CalibSlot[] = findCalibSlot(pic, room, schedule, transaction, ignoreStaffCountAvailability)
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

export { isPicAvailable, isStaffCountSufficient, isRoomFree, tryFindSlots, dailyStandbyCount }