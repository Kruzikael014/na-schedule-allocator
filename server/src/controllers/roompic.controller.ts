import { Request, Response } from "express"
import { BadRequestError, ErrorBase } from "../lib/error"
import { CreateRoomPicRequestDto, CreateRoomPicsRequestDto } from "../data/roompic.dto"
import * as service from '../services/roompic.service'
import * as util from "../lib/util"

export const createRoomPic = async (req: Request, res: Response) => {
  try {
    const { periodId, pic, room }: CreateRoomPicRequestDto = req.body

    if (!periodId || !pic || !room) {
      throw new BadRequestError({
        details: util.getDetailArray([
          !periodId ? 'periodId is missing!' : undefined,
          !pic ? 'pic is missing!' : undefined,
          !room ? 'room is missing!' : undefined,
        ])
      })
    }

    const result = await service.createRoomPic({ periodId, pic, room })
    res.status(201).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status || 500).json(error.data || { message: error.message })
  }
}

export const getRoomPics = async (req: Request, res: Response) => {
  try {
    const periodId = req.params.periodId as string
    const result = await service.getRoomPic(periodId)
    res.status(200).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status || 500).json(error.data || { message: error.message })
  }
}

export const createBulkRoomPic = async (req: Request, res: Response) => {
  try {
    const { periodId, picRooms }: CreateRoomPicsRequestDto = req.body
    if (!periodId || picRooms.length === 0)
      throw new BadRequestError({
        details: util.getDetailArray([
          !periodId ? 'periodId is missing!' : undefined,
          !picRooms ? 'pic-room data cannot be empty!' : undefined,
        ])
      })
    const result = await service.createManyRoomPic({ periodId, picRooms })
    res.status(201).json(result)
  } catch (error: any | ErrorBase) {
    res.status(error.status || 500).json(error.data || { message: error.message })
  }
}