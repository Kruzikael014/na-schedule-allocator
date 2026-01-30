import { useEffect, useState } from "react"
import type { ActivityData } from "../types"
import { API } from "../constants"
import toast from "react-hot-toast"

export default function useActivity({ periodId }: { periodId: string | null }) {
  const [hasAllocated, setHasAllocated] = useState<boolean>(false)
  const [activities, setActivities] = useState<ActivityData[]>([])

  const fetchData = async () => {
    if (!periodId) {
      setActivities([])
      return
    }
    try {
      const result: any = await (await API.get(`/activity/${periodId}`)).data
      setActivities(result.activities)
      setHasAllocated(true)
    } catch (ex) {
      console.error(ex)
    }
  }

  const updateActivity = async ({ day, id, pic, shift }: { id: string, pic: string, day: string, shift: string }) => {
    const result: any = await (await API.put(`/activity/${id}`, {
      pic: pic, day: day, shift: shift
    })).data
    if (result) {
      await fetchData()
      toast.success('Updated!', {
        icon: '😉'
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [periodId])

  useEffect(() => {
    if (activities && activities.length > 0) setHasAllocated(true)
    else setHasAllocated(false)
  }, [activities])

  const saveActivity = async (schedule: ActivityData[]) => {
    try {
      await API.post('/activity', {
        periodId: periodId,
        activities: schedule.map(e => ({
          description: e.description,
          room: e.room,
          day: e.day,
          shift: e.shift,
          pic: e.pic,
          code: e.code
        }))
      })
      setHasAllocated(true)
      await fetchData()
    } catch (ex) {
      console.error(ex)
    }
  }

  return { updateActivity, hasAllocated, setHasAllocated, activities, setActivities, saveActivity }
}