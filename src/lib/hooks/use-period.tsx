import { useCallback, useEffect, useState } from "react"
import type { Period } from "../types"
import { API } from "../constants"
import toast from "react-hot-toast"

export default function usePeriod() {
  const [periods, setPeriods] = useState<Period[]>([])

  const fetchData = async () => {
    try {
      const result = (await API.get('/period')).data as Period[]
      setPeriods(result)
    } catch (ex) {
      console.error(ex)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createPeriod = async (periodName: string, isPresent: boolean) => {
    const result = await (await API.post('/period', { periodName, isPresent })).data
    toast(result ? 'Period successfully created!' : 'Failed to create period!', {
      duration: 2000
    })
    await fetchData()
  }

  const updatePeriod = async (periodId: string, periodName: string, isPresent: boolean) => {
    const result = await (await API.patch('/period', { periodId, periodName, isPresent })).data
    toast(result ? 'Period successfully updated!' : 'Failed to update period!', { duration: 2000 })
    await fetchData()
  }

  const getPagination = useCallback((ITEMS_PER_PAGE: number, currentPage: number = 1) => ({
    totalPages: Math.ceil(periods.length / ITEMS_PER_PAGE),
    start: (currentPage - 1) * ITEMS_PER_PAGE,
  }), [periods])

  return { periods, createPeriod, updatePeriod, getPagination }
}