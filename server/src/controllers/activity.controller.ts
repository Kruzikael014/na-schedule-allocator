import { Request, Response } from "express";
import { BadRequestError, ErrorBase } from "../lib/error";
import * as service from "../services/activity.service"
import { CreateActivitiesRequestDto } from "../data/activity.dto";
import * as util from "../lib/util"

export const createActivities = async (req: Request, res: Response) => {
  try {
    const { activities, periodId }: CreateActivitiesRequestDto = req.body
    if (!periodId || !activities || activities.length === 0) {
      throw new BadRequestError({
        details: util.getDetailArray([
          !periodId ? 'periodId is missing!' : undefined,
          !activities ? 'activities is missing!' : undefined,
          activities.length === 0 ? 'activities is empty' : undefined
        ])
      })
    }
    const result = await service.createActivities({ periodId, activities })
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status).json(error.data)
  }
}

export const getActivities = async (req: Request, res: Response) => {
  try {
    const periodId = req.params.periodId as string
    if (!periodId)
      throw new BadRequestError({ details: ['periodId is missing on path param!'] })
    const result = await service.getActivities(periodId)
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status).json(error.data)
  }
}