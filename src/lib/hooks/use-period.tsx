import { useEffect, useState } from "react"
import type { Period } from "../types"
import { API } from "../constants"

export default function usePeriod() {
  const [periods, setPeriods] = useState<Period[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await (await API.get('/period')).data as Period[]
        setPeriods(result)
      } catch (ex) {
        console.error(ex)
      }
    }
    fetchData()
  }, [periods])

  return { periods }
}