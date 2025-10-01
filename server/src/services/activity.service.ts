import { PrismaClient } from "@prisma/client"
import { CreateActivitiesRequestDto, GetActivitiesResponseDto } from "../data/activity.dto"
import { InternalError, NotFoundError } from "../lib/error"
import { CreatePeriodDto } from "../data/period.dto"

const prisma = new PrismaClient()

export const getActivities = async (periodId: string): Promise<GetActivitiesResponseDto> => {
  const result = await prisma.period.findFirst({
    where: {
      periodId: periodId
    },
    include: {
      activities: true
    }
  })
  if (!result) throw new NotFoundError()
  return {
    period: {
      periodId: result.periodId,
      periodName: result.periodName,
      isPresent: result.isPresent
    },
    activities: result.activities.map(e => ({
      code: e.code,
      day: e.day,
      description: e.description,
      pic: e.pic,
      room: e.room,
      shift: e.shift
    }))
  }
}

export const createActivities = async (data: CreateActivitiesRequestDto) => {
  await prisma.activity.deleteMany({
    where: {
      periodId: data.periodId
    }
  })
  const result = await prisma.activity.createMany({
    data: data.activities.map(e => ({
      description: e.description,
      room: e.room,
      day: e.day,
      shift: e.shift,
      pic: e.pic,
      code: e.code,
      periodId: data.periodId
    })),
    skipDuplicates: true
  })
  if (!result) throw new InternalError()
  return result
}
