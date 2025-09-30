
type UploadedFiles = {
  shiftFile?: File
  roomPicFile?: File
  teachingCollegeFile?: File
  transactionFile?: File
}

type Division = 'NetSys' | 'Software' | 'Event' | 'Asset'

type Team = 'A' | 'B'

type ShiftCategory = 'P' | 'M'

type WorkingShiftData = {
  initial: string
  shifts: ShiftCategory[]
  division: string
  team: string
}

type RoomPicData = {
  pic: string
  room: string
}

type ActivityLegend = {
  code: number
  description: string
  color: string
  textColor: string
}

type ActivityData = {
  description: string
  room: string | null
  day: string
  shift: string
  pic: string
  code: number
}

type CalibSlot = { day: string, shift: string }

interface UploadSectionProps {
  files: UploadedFiles
  setFiles: ((file: File) => void)[]
  hasAllocated: boolean
  onAllocate: () => void
}

interface ChecklistItemProps {
  stepNumber: number
  completed: boolean
  label: string
  fileName?: string
  showUpload?: boolean
  onFileUpload?: (file: File) => void
  disabled?: boolean
  onClick?: () => void
}

interface ScheduleTableProps {
  data: ActivityData[]
}


export type { UploadedFiles, Division, Team, ShiftCategory, ActivityData, ActivityLegend, WorkingShiftData, RoomPicData, CalibSlot }
export type { UploadSectionProps, ChecklistItemProps, ScheduleTableProps }