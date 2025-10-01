"use client"
import { Calendar, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select"
import type { HeaderProps } from "@/lib/types"

export function Header({ selectedPeriod, onPeriodChange, periods }: HeaderProps) {
  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-accent-foreground">
              NASchedule Allocator
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Period:</span>
            <Select
              value={selectedPeriod ?? 'Select a period'}
              onValueChange={onPeriodChange}
            >
              <SelectTrigger className="w-48 bg-card border-border rounded-lg">
                <SelectValue placeholder={"Select a period"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Current Period</SelectLabel>
                  {
                    periods?.filter(e => e.isPresent === true).map(e => (
                      <SelectItem key={e.periodId} value={e.periodId}>
                        {e.periodName}
                      </SelectItem>)
                    )
                  }
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other Period</SelectLabel>
                  <SelectItem value="Select a period" disabled hidden>Select a period</SelectItem>

                  {
                    periods?.filter(e => e.isPresent === false).map(e => (
                      <SelectItem key={e.periodId} value={e.periodId}>
                        {e.periodName}
                      </SelectItem>)
                    )
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
