"use client"
import { useState, useRef, useCallback } from "react"
import { Upload } from "lucide-react"
import type { FileUploadProps } from "@/types/schedule"

const ACCEPTED_FILE_TYPES = [".csv"] as const
const MB = 50
const MAX_FILE_SIZE = MB * 1024 * 1024 // 50MB

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MB}MB`
    }

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension as any)) {
      return `Please upload a ${ACCEPTED_FILE_TYPES.join(', ')} file`
    }

    return null
  }, [])

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      onFileUpload(file)
    },
    [validateFile, onFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="w-full max-w-md">
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/60 hover:bg-muted/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-5 w-5 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <p className="font-medium text-foreground">Click to upload or drag and drop</p>
          <p className="text-sm text-muted-foreground">CSV, Excel, or JSON files</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive mt-2 text-center">{error}</p>}
    </div>
  )
}
