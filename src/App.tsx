import { useState, useCallback, useEffect } from 'react'
import './App.css'
import { Header } from "./components/sections/header"
import { UploadSection } from './components/sections/upload-section'
import type { ActivityData, UploadedFiles } from './lib/types'
import { ScheduleTable } from './components/sections/schedule-table'
import { useAllocate } from './lib/hooks/use-allocate'
import usePeriod from './lib/hooks/use-period'
import useActivity from './lib/hooks/use-activity'

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [files, setFiles] = useState<UploadedFiles>({})
  const handlePeriodChange = useCallback((period: string) => setSelectedPeriod(period), [])
  const setShiftFile = useCallback((file: File) => setFiles(prev => ({ ...prev, shiftFile: file })), [])
  const setRoomPicFile = useCallback((file: File) => setFiles(prev => ({ ...prev, roomPicFile: file })), [])
  const setTeachingCollegeFile = useCallback((file: File) => setFiles(prev => ({ ...prev, teachingCollegeFile: file })), [])
  const setTransactionFile = useCallback((file: File) => setFiles(prev => ({ ...prev, transactionFile: file })), [])
  const { allocateWorking, allocateTeachingCollege, allocateCalibration, allocateStandby } = useAllocate()
  const { periods } = usePeriod()
  const { hasAllocated, setHasAllocated, saveActivity, activities } = useActivity({ periodId: selectedPeriod })

  const handleAllocate = useCallback(async () => {
    if (!files.shiftFile || !files.roomPicFile || !files.teachingCollegeFile || !files.transactionFile)
      return
    setHasAllocated(true)

    // Working shift
    const working: ActivityData[] = await allocateWorking(files.shiftFile)

    // Teaching and College shift defined by Resman
    const teachingCollege: ActivityData[] = await allocateTeachingCollege(files.teachingCollegeFile)

    const workTeachCollege = [...working, ...teachingCollege]

    // Calibration
    const calibration = await allocateCalibration(workTeachCollege, files.roomPicFile, files.transactionFile)

    const workTeachCollCal = [...workTeachCollege, ...calibration]

    // Standby 
    const standby = await allocateStandby(workTeachCollCal, files.shiftFile)

    saveActivity([...workTeachCollCal, ...standby])
  }, [files.shiftFile, files.roomPicFile, files.teachingCollegeFile, files.transactionFile]);

  return <div className='min-h-screen bg-background'>
    <Header onPeriodChange={handlePeriodChange} selectedPeriod={selectedPeriod} periods={periods} />
    <main className='container mx-auto px-6 py-8 space-y-8'>

      {
        selectedPeriod &&
        <UploadSection
          files={files}
          setFiles={[setShiftFile, setRoomPicFile, setTeachingCollegeFile, setTransactionFile]}
          hasAllocated={hasAllocated}
          onAllocate={handleAllocate}
        />
      }

      {
        activities &&
        <ScheduleTable data={activities} />
      }

    </main>
  </div>
}

export default App
