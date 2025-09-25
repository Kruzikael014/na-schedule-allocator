import type { ChecklistItemProps } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { CheckCircle2 } from "lucide-react";

export function ChecklistItem(props: ChecklistItemProps) {
  const { completed, label, stepNumber, disabled, fileName, onFileUpload, showUpload } = props
  return (
    <div
      className={`relative transition-all duration-700 ease-out ${disabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
    >
      <div
        className={`flex flex-col gap-4 p-4 rounded-xl transition-all duration-700 ease-out transform ${completed
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg scale-[1]"
          : "bg-gradient-to-r from-muted/20 to-muted/10 border-2 border-muted hover:border-muted-foreground/20 scale-100"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 transform ${completed
                ? "bg-green-600 text-white shadow-lg scale-110"
                : "bg-muted-foreground/20 text-muted-foreground scale-100"
                }`}
            >
              {completed ? <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" /> : stepNumber}
            </div>
            {completed && (
              <div className="absolute -inset-1 bg-green-400/20 rounded-full animate-in fade-in zoom-in duration-500" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-semibold transition-all duration-500 ${completed ? "text-green-800" : "text-foreground"
                }`}
            >
              {label}
            </p>
            {completed && fileName && (
              <p className="text-xs text-green-600 font-medium animate-in fade-in slide-in-from-top-1 duration-300 delay-200">
                ✓ {fileName}
              </p>
            )}
          </div>
        </div>

        {showUpload && onFileUpload && !disabled && (
          <div className="ml-11 animate-in fade-in slide-in-from-top-2 duration-300">
            <FileUpload onFileUpload={onFileUpload} />
          </div>
        )}
      </div>
    </div>
  )
}