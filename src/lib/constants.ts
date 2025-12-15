import type { ActivityLegend } from "@/lib/types";
import axios from "axios";

export const ACTIVITY_LEGENDS: ActivityLegend[] = [
  // Class: Yellow/Orange (Warm) - Lebih keemasan biar gak pucat
  { code: 21, description: "Class", color: "#fef9c3", textColor: "#854d0e" }, 
  
  // Teaching: Purple (Cool) - Ungu yang lebih jelas bedanya dari biru
  { code: 22, description: "Teaching", color: "#f3e8ff", textColor: "#6b21a8" }, 
  
  // Working: Blue (Sky) - Biru langit yang lebih saturated (Blue-100/200 style)
  { code: 99, description: "Working", color: "#dbeafe", textColor: "#1e40af" }, 

  // --- DUPLICATES FOR OTHER CODES ---
  { code: 120, description: "Class", color: "#fef9c3", textColor: "#854d0e" },
  { code: 121, description: "Teaching", color: "#f3e8ff", textColor: "#6b21a8" },
  
  { code: 122, description: "Calibration", color: "#d1fae5", textColor: "#065f46" }, 
  
  { code: 123, description: "Standby", color: "#ffe4e6", textColor: "#9f1239" }, 
]

const API = axios.create({
  baseURL: window.configs?.VITE_BACKEND_URL || 'http://localhost:7070',

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
});

export { API } 