
export interface HeaderProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
};

export interface UploadSectionProps {
  scheduleFile: File | null
  onScheduleFileUploaded: (file: File) => void
  transactionFile: File | null
  onTransactionFileUploaded: (file: File) => void
  roomPicFile: File | null
  onRoomPicFileUploaded: (file: File) => void
  hasAllocated: boolean
  onAllocate: () => void
};

export interface FileUploadProps {
  onFileUpload: (file: File) => void
};

export interface ScheduleTableProps {
  pics: string[]
  timeCellData: TimeCellData[]
}

export type TimeCellData = {
  description: string
  room: string | null
  day: string
  shift: string
  PIC: string
  code: number
};

export type ActivityLegend = {
  code: number
  description: string
  color: string
  textColor: string
}

export type RoomPicData = {
  pic: string
  room: string[]
}

export type TransactionData = {
  room: string
  transaction: {
    day: string
    shift: string
    available: boolean
  }[]
}

export type CalibShiftAvailability = {
  day: String
  shift: String
  staffAvailableCount: number
  staffAvailable: string[]
}