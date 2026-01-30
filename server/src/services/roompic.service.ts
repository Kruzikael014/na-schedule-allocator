import { CreateRoomPicRequestDto, CreateRoomPicsRequestDto, RoomPicResponseDto } from "../data/roompic.dto";
import prisma from "../lib/prisma"

const formatResponse = (data: any): RoomPicResponseDto => ({ ...data, roomPicId: data.roomPicId.toString() })

export const createRoomPic = async (data: CreateRoomPicRequestDto) => {
  const result = await prisma.roomPic.create({ data })
  return formatResponse(result)
}

export const createManyRoomPic = async (data: CreateRoomPicsRequestDto) => {
  const result = await prisma.roomPic.createManyAndReturn({
    data: data.picRooms.map(e => ({
      periodId: data.periodId,
      pic: e.pic,
      room: e.room
    }))
  })
  return result.map(formatResponse)
}

export const getRoomPic = async (periodId?: string) => {
  const where = periodId ? { periodId } : {}
  const result = await prisma.roomPic.findMany({ where })
  return result.map(formatResponse)
}

export const clearRoomPic = async (periodId: string) => {
  const res = await prisma.roomPic.deleteMany({
    where: {
      periodId: periodId
    }
  })
  return res.count > 0
}