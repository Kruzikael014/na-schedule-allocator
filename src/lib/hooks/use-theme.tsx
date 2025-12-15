'use client'
import { useEffect, useState } from "react"

type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('system')

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as ThemeMode) || "system"
    setTheme(stored)
    setMounted(true)
    applyTheme(stored)
  }, [])

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement
    let targetTheme: "light" | "dark"

    if (mode === "system") {
      targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } else {
      targetTheme = mode
    }

    if (targetTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode)
    localStorage.setItem("theme", mode)
    applyTheme(mode)
  }

  return { theme, setTheme: setThemeMode, mounted }
}
