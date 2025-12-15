import { useState, useCallback } from 'react'
import { UploadSection } from '../sections/upload-section'
import type { ActivityData, UploadedFiles } from '../../lib/types'
import { ScheduleTable } from '../sections/schedule-table'
import { useAllocate } from '../../lib/hooks/use-allocate'
import usePeriod from '../../lib/hooks/use-period'
import useActivity from '../../lib/hooks/use-activity'
import Header from '../sections/header'
import { usePapa } from '@/lib/hooks/use-papa'
import toast from 'react-hot-toast'
import useRoom from '@/lib/hooks/use-room'
import RoomPicTable from '../sections/roompic-table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [files, setFiles] = useState<UploadedFiles>({})
  const handlePeriodChange = useCallback((period: string) => setSelectedPeriod(period), [])
  const { allocateWorking, allocateTeachingCollege, allocateRoomPIC, allocateCalibration, allocateStandby } = useAllocate()
  const { parse } = usePapa()
  const setShiftFile = useCallback((file: File) => setFiles(prev => ({ ...prev, shiftFile: file })), [])
  const setTeachingCollegeFile = useCallback((file: File) => setFiles(prev => ({ ...prev, teachingCollegeFile: file })), [])
  const setTransactionFile = useCallback((file: File) => setFiles(prev => ({ ...prev, transactionFile: file })), [])
  const { periods } = usePeriod()
  const { hasAllocated, setHasAllocated, saveActivity, activities, setActivities } = useActivity({ periodId: selectedPeriod })
  const { saveRoomPic, roomPic, setRoomPic } = useRoom({ periodId: selectedPeriod })

  const handleAllocate = useCallback(async () => {
    if (!files.shiftFile || !files.teachingCollegeFile || !files.transactionFile)
      return
    setHasAllocated(true)
    const toastId = toast.loading('Allocating schedule!')

    let acts = []

    // Assign Working
    const { staff, workingSchedule } = await allocateWorking(files.shiftFile)
    acts = [...workingSchedule]

    // Assign Teaching + College
    const teachingCollegeSchedule: ActivityData[] = await allocateTeachingCollege(files.teachingCollegeFile)
    acts = [...acts, ...teachingCollegeSchedule]

    const transactions = await parse<ActivityData>(files.transactionFile)

    // Assign Room - PIC Mapping
    let roomPic = await allocateRoomPIC(staff, acts, transactions)

    // Assign Calibration
    let result = await allocateCalibration(acts, roomPic, transactions)
    while (!result.isSafe) {
      roomPic = await allocateRoomPIC(staff, acts, transactions)
      result = await allocateCalibration(acts, roomPic, transactions)
    }
    setRoomPic(roomPic)
    acts = [...acts, ...result.calibrationSchedule]


    // Assign Standby
    const standBySchedule = await allocateStandby(acts, staff)
    acts = [...acts, ...standBySchedule]

    setActivities(acts)
    await saveRoomPic(roomPic)
    await saveActivity(acts)
    toast.dismiss(toastId)
    toast.success('Successfully allocated!')
  }, [files.shiftFile, files.teachingCollegeFile, files.transactionFile])

  return <div className='min-h-screen bg-background'>
    <Header onPeriodChange={handlePeriodChange} selectedPeriod={selectedPeriod} periods={periods} />
    <main className='container mx-auto px-6 py-8 space-y-8'>
      <Accordion type='single' collapsible className='w-full' defaultValue='upload-section'>
        <AccordionItem value='upload-section'>
          <AccordionTrigger>Upload Files</AccordionTrigger>
          <AccordionContent>
            {
              selectedPeriod ?
                <UploadSection
                  files={files}
                  setFiles={[setShiftFile, setTeachingCollegeFile, setTransactionFile]}
                  hasAllocated={hasAllocated}
                  onAllocate={handleAllocate}
                />
                :
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Select Period to Start</p>
                  </div>
                </div>
            }
          </AccordionContent>
        </AccordionItem>


        <AccordionItem value='roompic-section' disabled={roomPic.length === 0}>
          <AccordionTrigger>Room PIC</AccordionTrigger>
          <AccordionContent>
            {
              roomPic.length > 0 &&
              <RoomPicTable roomPic={roomPic} />
            }
          </AccordionContent>
        </AccordionItem>


        <AccordionItem value='schedule-section' disabled={activities.length === 0}>
          <AccordionTrigger>Allocated Schedule</AccordionTrigger>
          <AccordionContent>
            {
              activities.length > 0 &&
              <ScheduleTable data={activities} />
            }
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </main>
  </div>
}

export default App
