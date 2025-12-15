

type RoomPic = {
  roomPicId: number
  periodId: string
  pic: string
  room: string
}

type CreateRoomPicRequestDto = Omit<RoomPic, 'roomPicId'>

type CreateRoomPicsRequestDto = {
  periodId: string,
  picRooms: {
    pic: string, room: string
  }[]
}

type RoomPicResponseDto = Omit<RoomPic, 'roomPicId'> & { roomPicId: string }

export { CreateRoomPicRequestDto, RoomPicResponseDto, CreateRoomPicsRequestDto }