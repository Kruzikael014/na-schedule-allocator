import type { ActivityLegend } from "@/lib/types";
import axios from "axios";

export const ACTIVITY_LEGENDS: ActivityLegend[] = [
  { code: 21, description: "Class", color: "#fef9e7", textColor: "#a16207" },
  { code: 22, description: "Teaching", color: "#faf5ff", textColor: "#9333ea" },
  { code: 99, description: "Working", color: "#f0f9ff", textColor: "#0369a1" },
  { code: 120, description: "Class", color: "#fef9e7", textColor: "#a16207" },
  { code: 121, description: "Teaching", color: "#faf5ff", textColor: "#9333ea" },
  { code: 122, description: "Calibration", color: "#f0fdf4", textColor: "#16a34a" },
  { code: 123, description: "Standby", color: "#fef2f2", textColor: "#dc2626" },
]

const API = axios.create({
  baseURL: window.configs?.VITE_BACKEND_URL || 'http://localhost:3000',

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
});

export { API }