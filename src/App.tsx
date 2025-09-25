import { useState, useCallback } from 'react'
import './App.css'
import { Header } from "./components/sections/header"
import { UploadSection } from './components/sections/upload-section'
import { CsvUtil } from './lib/csv-util'
import type { ScheduleTableProps, TimeCellData } from './types/schedule'
import { Allocate } from './lib/allocate-util'
import { ScheduleTable } from './components/sections/schedule-table'


function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ODD 2024/2025")
  const [hasAllocated, setHasAllocated] = useState<boolean>(false)
  const [scheduleFile, setScheduleFile] = useState<File | null>(null)
  const [transactionFile, setTransactionFile] = useState<File | null>(null)
  const [allocatedSchedule, setAllocatedSchedule] = useState<ScheduleTableProps>()

  const handlePeriodChange = useCallback((period: string) => setSelectedPeriod(period), [])

  const handleScheduleFileUpload = useCallback((file: File) => setScheduleFile(file), [])

  const handleTransactionFileUpload = useCallback((file: File) => setTransactionFile(file), [])

  const handleAllocate = useCallback(async () => {
    if (scheduleFile && transactionFile) {
      setHasAllocated(true)
      console.log('Processing file:', scheduleFile.name, 'and', transactionFile.name)
      const [scheduleData, transactionData] = await Promise.all([
        CsvUtil.parse<TimeCellData>(scheduleFile),
        CsvUtil.parse<TimeCellData>(transactionFile)
      ])
      const allocatedSchedule = Allocate(scheduleData, transactionData)
      setAllocatedSchedule(allocatedSchedule)
    }
  }, [scheduleFile, transactionFile])

  return <div className='min-h-screen bg-background'>
    <Header onPeriodChange={handlePeriodChange} selectedPeriod={selectedPeriod} />
    <main className='container mx-auto px-6 py-8 space-y-8'>
      <UploadSection
        onScheduleFileUploaded={handleScheduleFileUpload}
        onTransactionFileUploaded={handleTransactionFileUpload}
        scheduleFile={scheduleFile}
        transactionFile={transactionFile}
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
