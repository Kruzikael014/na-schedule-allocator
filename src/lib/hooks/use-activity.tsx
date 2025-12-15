import { useEffect, useState } from "react"
import type { ActivityData } from "../types"
import { API } from "../constants"

export default function useActivity({ periodId }: { periodId: string | null }) {
  const [hasAllocated, setHasAllocated] = useState<boolean>(false)
  const [activities, setActivities] = useState<ActivityData[]>([])

  const fetchData = async () => {
    if (!periodId) {
      setActivities([])
      return
    }
    try {
      const result = await (await API.get(`/activity/${periodId}`)).data
      setActivities(result.activities)
      setHasAllocated(true)
    } catch (ex) {
      console.error(ex)
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

  return { hasAllocated, setHasAllocated, activities, setActivities, saveActivity }
}