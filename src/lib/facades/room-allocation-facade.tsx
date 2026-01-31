import type { ActivityData, Room, Staff } from "../types"
import { isPicAvailable, isRoomFree } from "./allocation-facade"

const getRoomCandidates = (room: string, staff: Staff[]): string[] => {
  const NETSYS_ONLY = ['601', '603']
  const SOFTWARE_ONLY = ['706', '708', '710']
  const ZENLI_ONLY = ['606']
  const MAC_ONLY = ['711A']
  const MAC_USER = ['IO', 'HI', 'YD']
  if (NETSYS_ONLY.includes(room)) return staff.filter(s => s.division === 'NetSys').map(s => s.initial)
  else if (MAC_ONLY.includes(room)) return staff.filter(s => MAC_USER.includes(s.initial)).map(s => s.initial)
  else if (ZENLI_ONLY.includes(room)) return staff.filter(s => s.initial === 'ZN').map(s => s.initial)
  else if (SOFTWARE_ONLY.includes(room)) return staff.filter(s => s.division === 'Software').map(s => s.initial)
  else return staff.map(s => s.initial)
}

export const roomWeight: Record<string, number> = {
  '606': 0,
  '601': 3,
  '602': 1,
  '603': 3,
  '604': 1,
  '605': 1,
  '608': 1,
  '609': 1,
  '610': 1,
  '621': 2,
  '622': 1,
  '623': 2,
  '624': 1,
  '625': 2,
  '626': 1,
  '627': 2,
  '628': 1,
  '629': 1,
  '630': 1,
  '631': 3,
  '706': 3,
  '708': 3,
  '710': 3,
  '721': 1,
  '722': 1,
  '723': 1,
  '724': 1,
  '725': 1,
  '727': 1,
  '729': 1,
  '730': 2,
  '731': 2,
  '711A': 2,
}

const getRoomWeight = (roomDesc: string) => roomWeight[roomDesc] || 0

const getRoom = (staff: Staff[]): Room[] => {
  const result: Room[] = []

  for (const [room, weight] of Object.entries(roomWeight)) {
    result.push({
      description: room,
      weight: Number(weight),
      candidates: getRoomCandidates(room, staff)
    })
  }

  result.sort((a, b) => {
    if (a.candidates.length !== b.candidates.length) {
      return a.candidates.length - b.candidates.length;
    }

    return b.weight - a.weight;
  });

  return result
}

const popUnmatchingRoomPic = (room: Room, schedule: ActivityData[], transactions: ActivityData[]) => {

  for (const initial of room.candidates) {
    const calibable: string[][] = [
      [], // day 1
      [], // day 2,
      [], // day 3,
      [], // day 4,
      [] // day 5
    ]

    // populate calibable
    for (const day of [1, 2, 3, 4, 5]) {
      for (const shift of [1, 2, 3, 4, 5, 6]) {
        if (day === 3) continue
        const d = String(day)
        const s = String(shift)
        const isStaffFree = isPicAvailable(initial, d, s, schedule)
        const isRoomAvailable = isRoomFree(room.description, d, s, transactions)
        if (isStaffFree && isRoomAvailable)
          calibable[day - 1].push(d + s)
      }
    }

    const cat1 = (calibable[0].length >= 1) && ((calibable[3].length + calibable[4].length) >= 1),
      cat2 = (calibable[1].length >= 1) && (calibable[4].length >= 1)

    if (!(cat1 || cat2))
      room.candidates = room.candidates.filter(e => e !== initial)
  }
}



export { getRoom, popUnmatchingRoomPic, getRoomWeight }