import { PeriodResponseDto } from "./period.dto"

interface ActivityResponseDto {
    activityId?: number
    description: string
    room: string | null
    day: string
    shift: string
    pic: string
    code: number
}

interface GetActivitiesResponseDto {
    period: PeriodResponseDto,
    activities: ActivityResponseDto[]
}

interface CreateActivitiesRequestDto {
    periodId: string
    activities: ActivityResponseDto[]
}

interface UpdateActivityDto {
    activityId: number
    description?: string
    room?: string | null
    day?: string
    shift?: string
    pic?: string
    code?: number
}

export { UpdateActivityDto, ActivityResponseDto, GetActivitiesResponseDto, CreateActivitiesRequestDto }