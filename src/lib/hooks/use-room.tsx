import { useEffect, useState } from "react";
import type { RoomPicData } from "../types";
import { API } from "../constants";



export default function useRoom({ periodId }: { periodId: string | null }) {
  const [roomPic, setRoomPic] = useState<RoomPicData[]>([])

  const fetchData = async () => {
    if (!periodId) return
    try {
      const result = await (await API.get(`/room-pic/${periodId}`)).data
      setRoomPic(result)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [periodId])

  const saveRoomPic = async (roomPic: RoomPicData[]) => {
    try {
      const res = await API.post('/room-pic/bulk', {
        picRooms: roomPic,
        periodId: periodId
      })
      console.log(res.data)
      await fetchData()
    } catch (error) {
      console.log(error)
    }
  }

  return { roomPic, setRoomPic, saveRoomPic }
}