import { ROOMS } from "@/constants/schedule";
import type { ScheduleTableProps, TimeCellData, TransactionData } from "@/types/schedule";

export function Allocate(scheduleData: TimeCellData[], transactionData: TimeCellData[]): ScheduleTableProps {

  const allocationResult = [...scheduleData]

  function getTransactionData(): TransactionData[] {
    const lookup = new Map<string, Set<string>>();
    for (const t of transactionData) {
      if (!t.room) continue;
      const key = `${t.day}-${t.shift}`;
      if (!lookup.has(t.room)) {
        lookup.set(t.room, new Set());
      }
      lookup.get(t.room)!.add(key);
    }

    const rooms = [...ROOMS].sort();

    return rooms.map(room => {
      console.log(room)
      const availableKeys = lookup.get(room)!;
      console.log(availableKeys)
      const transaction = Array.from({ length: 6 }, (_, d) =>
        Array.from({ length: 6 }, (_, s) => {
          const day = String(d + 1);
          const shift = String(s + 1);
          return {
            day,
            shift,
            available: availableKeys ? !availableKeys.has(`${day}-${shift}`) : true
          };
        })
      ).flat();

      return { room, transaction };
    });
  }

  function generateCalib() {
    // cari day-shift yang NA nya workingnya > 4 (calibable) dari si allocationResult, simpen juga data NA nya

    // bikin dulu object
    const obj: TimeCellData = {
      code: 21,
      day: '0',
      shift: '0',
      room: '000',
      description: 'calibration 000',
      PIC: 'kosong dulu'
    }

  }

  console.log('transaction data :', getTransactionData())

  return {
    timeCellData: allocationResult,
    pics: [...new Set(scheduleData.map(e => e.PIC))].sort(),
    days: ['1', '2', '3', '4', '5', '6'],
    shifts: ['1', '2', '3', '4', '5', '6']
  }

}