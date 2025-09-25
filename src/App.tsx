import { useState, useCallback } from 'react'
import './App.css'
import { Header } from "./components/sections/header"
import { UploadSection } from './components/sections/upload-section'
import type { ActivityData, UploadedFiles, WorkingShiftData } from './lib/types'
import { ScheduleTable } from './components/sections/schedule-table'
import { usePapa } from './lib/hooks/use-papa'

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ODD 2024/2025")
  const [files, setFiles] = useState<UploadedFiles>({})
  const [hasAllocated, setHasAllocated] = useState<boolean>(false)
  const [schedule, setSchedule] = useState<ActivityData[]>()
  const { parse } = usePapa()

  const handlePeriodChange = useCallback((period: string) => setSelectedPeriod(period), [])

  const setShiftFile = useCallback((file: File) => setFiles(prev => ({ ...prev, shiftFile: file })), [])
  const setRoomPicFile = useCallback((file: File) => setFiles(prev => ({ ...prev, roomPicFile: file })), [])
  const setTeachingCollegeFile = useCallback((file: File) => setFiles(prev => ({ ...prev, teachingCollegeFile: file })), [])
  const setTransactionFile = useCallback((file: File) => setFiles(prev => ({ ...prev, transactionFile: file })), [])

  const handleAllocate = useCallback(async () => {
    if (!files.shiftFile || !files.roomPicFile || !files.teachingCollegeFile || !files.transactionFile)
      return

    const shiftData = await parse<WorkingShiftData>(files.shiftFile, row => ({
      division: row.division,
      initial: row.initial,
      shifts: [row.monday, row.tuesday, row.wednesday, row.thursday, row.friday, row.saturday],
      team: row.team
    }))

    function getShiftNum(shiftCategory: string, day: number): number[] {
      if (shiftCategory === 'P') return day != 6 ? [1, 2, 3, 4] : [1, 2, 3]
      return day != 6 ? [3, 4, 5, 6] : [3, 4, 5]
    }


    const _1: ActivityData[] = shiftData.flatMap(data => {
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

    console.log(_1)

    setSchedule([..._1])

  }, [files.shiftFile, files.roomPicFile, files.teachingCollegeFile, files.transactionFile]);

  return <div className='min-h-screen bg-background'>
    <Header onPeriodChange={handlePeriodChange} selectedPeriod={selectedPeriod} />
    <main className='container mx-auto px-6 py-8 space-y-8'>
      <UploadSection
        files={files}
        setFiles={[setShiftFile, setRoomPicFile, setTeachingCollegeFile, setTransactionFile]}
        hasAllocated={hasAllocated}
        onAllocate={handleAllocate}
      />

      {
        schedule &&
        <ScheduleTable data={schedule} />
      }

    </main>
  </div>
}

export default App
