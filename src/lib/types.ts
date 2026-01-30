
type UploadedFiles = {
  shiftFile?: File
  teachingCollegeFile?: File
  transactionFile?: File
}

type Division = 'NetSys' | 'Software' | 'Event' | 'Asset'

type Team = 'A' | 'B'

type ShiftCategory = 'P' | 'M' | "N"

type Staff = {
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
  activityId?: number
  description: string
  room: string | null
  day: string
  shift: string
  pic: string
  code: number
}

type CalibSlot = { day: string, shift: string }

type Period = {
  periodId: string
  periodName: string
  isPresent: boolean
}

type Activity = {
  activityId: string
  description: string
  room: string | null
  day: string
  shift: string
  pic: string
  code: number
  periodId: string
}

type Room = {
  description: string
  weight: number
  candidates: string[]
}

interface UploadSectionProps {
  files: UploadedFiles
  setFiles: ((file: File) => void)[]
  keepRoomPic: boolean
  setKeepRoomPic: ((keepRoomPic: boolean) => void)
  hasAllocated: boolean
  onAllocate: () => void
}

interface ChecklistItemProps {
  title?: string
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
  onUpdateCallback: ({ day, id, pic, shift }: { id: string, pic: string, day: string, shift: string }) => Promise<void>
}

interface HeaderProps {
  selectedPeriod: string | null
  onPeriodChange: (period: string) => void
  periods: Period[] | null
}

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

export type { Staff, Room, UploadedFiles, Division, Team, ShiftCategory, ActivityData, ActivityLegend, RoomPicData, CalibSlot, Period, Activity }
export type { UploadSectionProps, ChecklistItemProps, ScheduleTableProps, HeaderProps, FileUploadProps }