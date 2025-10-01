import { ActivityResponseDto } from "./activity.dto"

interface CreatePeriodDto {
  periodName: string
}

interface UpdatePeriodDto {
  periodId: string
  periodName?: string
  isPresent?: boolean
}

interface UpdatePresentPeriodDto {
  oldPeriodId: string
  newPeriodId: string
}

interface PeriodResponseDto {
  periodId: string
  periodName: string
  isPresent: boolean

  activities?: ActivityResponseDto[]
}

interface UpdatePresentPeriodResponseDto {
  before: PeriodResponseDto
  after: PeriodResponseDto
}

export type { CreatePeriodDto, PeriodResponseDto, UpdatePeriodDto, UpdatePresentPeriodDto, UpdatePresentPeriodResponseDto }