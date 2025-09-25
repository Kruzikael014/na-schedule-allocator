
type UploadedFiles = {
  shiftFile?: File
  roomPicFile?: File
  teachingCollegeFile?: File
  transactionFile?: File
}

type Division = 'NetSys' | 'Software' | 'Event' | 'Asset'

type Team = 'A' | 'B'

type WorkingShift = 'P' | 'M'

type ActivityLegend = {
  code: number
  description: string
  color: string
  textColor: string
}

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
}

export type { UploadedFiles, Division, Team, WorkingShift, ActivityLegend }
export type { UploadSectionProps, ChecklistItemProps }