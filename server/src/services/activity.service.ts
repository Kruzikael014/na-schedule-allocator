import prisma from "../lib/prisma"
import { CreateActivitiesRequestDto, GetActivitiesResponseDto, UpdateActivityDto } from "../data/activity.dto"
import { InternalError, NotFoundError } from "../lib/error"

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
      activityId: Number(e.activityId),
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

export const updateActivity = async (data: UpdateActivityDto) => {
  const { activityId, ...rest } = data

  const result = await prisma.activity.update({
    where: { activityId },
    data: {
      ...(rest.description !== undefined && { description: rest.description }),
      ...(rest.room !== undefined && { room: rest.room }),
      ...(rest.day !== undefined && { day: rest.day }),
      ...(rest.shift !== undefined && { shift: rest.shift }),
      ...(rest.pic !== undefined && { pic: rest.pic }),
      ...(rest.code !== undefined && { code: rest.code }),
    }
  })

  return {
    ...result,
    activityId: Number(result.activityId)
  }
}