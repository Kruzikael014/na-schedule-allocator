'use client'
import { useState } from "react"
import { Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import usePeriod from "@/lib/hooks/use-period"
import PeriodTable from "./period-table"
import { Button } from "../ui/button"

interface FormData {
  periodName: string
  isPresent: boolean
}

export default function PeriodSection() {
  const { createPeriod } = usePeriod()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({ periodName: '', isPresent: false })

  const handleCreatePeriod = async () => {
    if (!formData.periodName.trim()) return

    await createPeriod(formData.periodName, formData.isPresent)
    setFormData({ periodName: "", isPresent: false })
    setIsFormOpen(false)
  }

  return <div className="max-w-full">
    <div className="bg-card/50 rounded-lg border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border/20">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Manage Periods</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage academic periods</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild className="hover:cursor-pointer">
            <Button variant='outline' size='sm'>
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Period</DialogTitle>
              <DialogDescription>Add a new academic period to your schedule</DialogDescription>
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
                  Mark as current period
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex-1 border border-border/40 text-foreground font-medium py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePeriod}
                disabled={!formData.periodName.trim()}
                className="flex-1 bg-accent text-accent-foreground font-medium py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors text-sm"
              >
                Create
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Component */}
      <PeriodTable />
    </div>
  </div>
}






