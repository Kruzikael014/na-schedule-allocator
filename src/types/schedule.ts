
export interface HeaderProps {
  selectedPeriod: string
  onPeriodChange: (period: string) => void
};

export interface UploadSectionProps {
  scheduleFile: File | null
  onScheduleFileUploaded: (file: File) => void
  transactionFile: File | null
  onTransactionFileUploaded: (file: File) => void
  hasAllocated: boolean
  onAllocate: () => void
};

export interface FileUploadProps {
  onFileUpload: (file: File) => void
};

export interface ScheduleTableProps {
  days: string[]
  shifts: string[]
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