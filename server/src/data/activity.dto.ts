import { PeriodResponseDto } from "./period.dto"

interface ActivityResponseDto {
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

export { ActivityResponseDto, GetActivitiesResponseDto }