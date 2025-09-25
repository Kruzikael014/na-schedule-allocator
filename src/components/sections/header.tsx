"use client"
import { Calendar, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PERIODS } from "@/lib/constants"
import type { HeaderProps } from "@/lib/types"

export function Header({ selectedPeriod, onPeriodChange }: HeaderProps) {
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
              value={selectedPeriod}
              onValueChange={onPeriodChange}
            >
              <SelectTrigger className="w-48 bg-card border-border rounded-lg">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((period) => (
                  <SelectItem
                    key={period}
                    value={period}
                  >
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
