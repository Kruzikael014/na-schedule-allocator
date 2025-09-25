import { useState, useCallback } from 'react'
import './App.css'
import { Header } from "./components/sections/header"
import { UploadSection } from './components/sections/upload-section'
import { ScheduleTable } from './components/sections/schedule-table'


function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ODD 2024/2025")
  const [hasAllocated, setHasAllocated] = useState<boolean>(false)
  const [scheduleFile, setScheduleFile] = useState<File | null>(null)
  const [transactionFile, setTransactionFile] = useState<File | null>(null)
  const [roomPicFile, setRoomPicFile] = useState<File | null>(null)
  const [allocatedSchedule, setAllocatedSchedule] = useState<ScheduleTableProps>()

  const handlePeriodChange = useCallback((period: string) => setSelectedPeriod(period), [])
  const handleScheduleFileUpload = useCallback((file: File) => setScheduleFile(file), [])
  const handleTransactionFileUpload = useCallback((file: File) => setTransactionFile(file), [])
  const handleRoomPicFileUpload = useCallback((file: File) => setRoomPicFile(file), [])

  const handleAllocate = useCallback(async () => {
    
  }, []);

  return <div className='min-h-screen bg-background'>
    <Header onPeriodChange={handlePeriodChange} selectedPeriod={selectedPeriod} />
    <main className='container mx-auto px-6 py-8 space-y-8'>
      <UploadSection
        onScheduleFileUploaded={handleScheduleFileUpload}
        onTransactionFileUploaded={handleTransactionFileUpload}
        scheduleFile={scheduleFile}
        transactionFile={transactionFile}
        roomPicFile={roomPicFile}
        onRoomPicFileUploaded={handleRoomPicFileUpload}
        hasAllocated={hasAllocated}
        onAllocate={handleAllocate}
      />

      {
        allocatedSchedule &&
        <ScheduleTable props={allocatedSchedule} />
      }

    </main>
  </div>
}

export default App
