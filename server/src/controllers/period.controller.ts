import { Request, Response } from "express"
import * as periodService from "../services/period.service"
import { CreatePeriodDto, UpdatePeriodDto, UpdatePresentPeriodDto } from "../data/period.dto"
import { BadRequestError, ErrorBase } from "../lib/error"
import * as util from "../lib/util"

export const createPeriod = async (req: Request, res: Response) => {
  try {
    const { periodName }: CreatePeriodDto = req.body
    if (!periodName) throw new BadRequestError({ details: ['periodName is missing!'] })
    const result = await periodService.createPeriod({ periodName })
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status).json(error.data)
  }
}

export const updatePresentPeriod = async (req: Request, res: Response) => {
  try {
    const { newPeriodId, oldPeriodId }: UpdatePresentPeriodDto = req.body
    if (!newPeriodId || !oldPeriodId)
      throw new BadRequestError({
        details: util.getDetailArray([
          !oldPeriodId ? 'Old periodId is missing!' : undefined,
          !newPeriodId ? 'New periodId is missing!' : undefined
        ])
      })
    const result = await periodService.updatePresentPeriod({ newPeriodId, oldPeriodId })
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status).json(error.data)
  }
}

export const updatePeriod = async (req: Request, res: Response) => {
  try {
    const { periodId, isPresent, periodName }: UpdatePeriodDto = req.body
    if (!periodId) throw new BadRequestError({ details: ['periodId is missing!'] })
    const result = await periodService.updatePeriod({ periodId, isPresent, periodName })
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status).json(error.data)
  }
}

export const getPeriods = async (req: Request, res: Response) => {
  try {
    const result = await periodService.getPeriods()
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    console.log('test debug' + error)
    if (error instanceof ErrorBase)
      res.status(error.status).json(error.data)
  }
}