import prisma from "../lib/prisma"
import { CreatePeriodDto, PeriodResponseDto, UpdatePeriodDto, UpdatePresentPeriodDto, UpdatePresentPeriodResponseDto } from "../data/period.dto";
import { InternalError, NotFoundError } from "../lib/error";
import { cleanPayload } from "../lib/util";

export const createPeriod = async (data: CreatePeriodDto) => {
  const newPeriod = await prisma.period.create({
    data: {
      periodName: data.periodName,
      isPresent: false
    }
  })
  if (!newPeriod) throw new InternalError()
  return newPeriod
}

export const updatePeriod = async (data: UpdatePeriodDto) => {
  const updatedPeriod = await prisma.period.update({
    where: {
      periodId: data.periodId
    },
    data: cleanPayload(data, ['periodId'])
  })
  if (!updatedPeriod) throw new NotFoundError()
  return updatedPeriod
}

export const updatePresentPeriod = async (data: UpdatePresentPeriodDto): Promise<UpdatePresentPeriodResponseDto | null> => {
  const oldPeriod = await prisma.period.update({
    where: {
      periodId: data.oldPeriodId
    },
    data: {
      isPresent: false
    }
  })
  if (!oldPeriod) throw new NotFoundError()
  const updatedPeriod = await prisma.period.update({
    where: {
      periodId: data.newPeriodId
    },
    data: {
      isPresent: true
    }
  })
  if (!updatedPeriod) throw new NotFoundError()
  return {
    before: oldPeriod,
    after: updatedPeriod
  }
}

export const getPeriods = async (): Promise<PeriodResponseDto[]> => {
  const result = await prisma.period.findMany()
  if (result.length === 0) throw new NotFoundError()
  return result.map(e => ({
    periodId: e.periodId,
    periodName: e.periodName,
    isPresent: e.isPresent,
  }))
}
