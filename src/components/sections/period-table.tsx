"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useCallback, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Checkbox } from "../ui/checkbox"
import usePeriod from "@/lib/hooks/use-period"
import toast from "react-hot-toast"

const ITEMS_PER_PAGE = 4

interface FormData {
  periodId: string
  periodName: string
  isPresent: boolean
}

export default function PeriodTable() {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const def = { periodId: '', periodName: '', isPresent: false }
  const [formData, setFormData] = useState<FormData>(def)
  const [currentPage, setCurrentPage] = useState(1)
  const { updatePeriod, periods, getPagination } = usePeriod()
  const { start, totalPages } = getPagination(ITEMS_PER_PAGE, currentPage)
  const paginatedPeriods = periods.slice(start, start + ITEMS_PER_PAGE)

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }, [])

  const handleUpdatePeriod = async () => {
    if (!formData.periodName.trim()) {
      toast('Please fill the periodName!', {
        icon: '🥺🙏',
        duration: 2000
      })
      return
    }
    await updatePeriod(formData.periodId, formData.periodName, formData.isPresent)

    // lastly clear formData 
    setFormData(def)
    setIsFormOpen(false)
  }

  return (
    <>
      <Table className="">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/20">
            <TableHead className="font-semibold px-6 py-4 text-foreground">Period Name</TableHead>
            <TableHead className="font-semibold px-6 py-4 text-foreground">Status</TableHead>
            <TableHead className="font-semibold px-6 py-4 text-foreground">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPeriods.length > 0 ? (
            paginatedPeriods.map((period) => (
              <TableRow key={period.periodId} className="border-border/20 hover:bg-muted/20">
                <TableCell className="font-medium px-6 py-4 text-foreground">{period.periodName}</TableCell>
                <TableCell className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${period.isPresent
                      ? "bg-emerald-100/40 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100/40 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300"
                      }`}
                  >
                    {period.isPresent ? "Present" : "Past"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant={"default"} className="hover:cursor-pointer" onClick={() => { setIsFormOpen(true); setFormData({ ...period }) }}>
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                No periods yet. Create one to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="border-t border-border/20 px-6 py-4 bg-card/20">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  isActive={currentPage === 1}
                  className="cursor-pointer"
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  isActive={currentPage === totalPages}
                  className="cursor-pointer"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-sm text-muted-foreground text-center mt-2">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Period</DialogTitle>
            <DialogDescription>Update period name or status</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Period Name</label>
              <input
                type="text"
                value={formData.periodName}
                onChange={(e) => setFormData({ ...formData, periodName: e.target.value })}
                placeholder="e.g., Fall 2024"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
              <Checkbox
                id="isPresent"
                checked={formData.isPresent}
                onCheckedChange={(checked) => setFormData({ ...formData, isPresent: checked as boolean })}
              />
              <label htmlFor="isPresent" className="text-sm font-medium text-foreground cursor-pointer flex-1">
                Mark as current periods
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => { setIsFormOpen(false); setFormData(def) }}
              className="flex-1 border border-border/40 text-foreground font-medium py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePeriod}
              className="flex-1 bg-accent text-accent-foreground font-medium py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors text-sm"
            >
              Update
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}