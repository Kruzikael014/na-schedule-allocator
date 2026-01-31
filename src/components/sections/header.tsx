"use client"
import { Sparkles, Menu, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { Period } from "@/lib/types"
import { useState } from "react"
import { Link } from "react-router"

interface HeaderProps {
  selectedPeriod: string | null
  onPeriodChange: (period: string) => void
  periods: Period[] | null
}

export default function Header({ selectedPeriod, onPeriodChange, periods }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-border/20 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to={'/'}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Schedule Manager</h1>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-wrap justify-end">
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Manage Schedule
              </Link>
              <Link
                to="/period"
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Manage Periods
              </Link>
            </nav>

            {/* Period selector - only on schedule page */}
            {(selectedPeriod !== undefined && periods) && (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Select value={selectedPeriod ?? ""} onValueChange={onPeriodChange}>
                  <SelectTrigger className="w-40 sm:w-48 bg-card border-border/40 rounded-lg text-sm">
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Current</SelectLabel>
                      {periods
                        ?.filter((e) => e.isPresent === true)
                        .map((e) => (
                          <SelectItem key={e.periodId} value={e.periodId}>
                            {e.periodName}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Other</SelectLabel>
                      {periods
                        ?.filter((e) => e.isPresent === false)
                        .map((e) => (
                          <SelectItem key={e.periodId} value={e.periodId}>
                            {e.periodName}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-3 pb-3 border-t border-border/20 pt-3">
            <div className="flex gap-2">
              <Link
                to="/"
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border border-border/40 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Schedule
              </Link>
              <Link
                to="/period"
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border border-border/40 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Periods
              </Link>
            </div>

            {selectedPeriod !== undefined && (
              <Select value={selectedPeriod ?? ""} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-full bg-card border-border/40 rounded-lg text-sm">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Current</SelectLabel>
                    {periods
                      ?.filter((e) => e.isPresent === true)
                      .map((e) => (
                        <SelectItem key={e.periodId} value={e.periodId}>
                          {e.periodName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    {periods
                      ?.filter((e) => e.isPresent === false)
                      .map((e) => (
                        <SelectItem key={e.periodId} value={e.periodId}>
                          {e.periodName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}

            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}