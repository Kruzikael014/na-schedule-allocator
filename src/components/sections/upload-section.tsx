"use client"
import { Upload } from "lucide-react"
import type { UploadSectionProps } from "@/types/schedule"
import { CardContent, Card, CardHeader, CardTitle } from "../ui/card"
import { FileUpload } from "../ui/file-upload"
import { Button } from "../ui/button"

export function UploadSection(props: UploadSectionProps) {
  const {
    transactionFile,
    hasAllocated,
    onAllocate,
    onTransactionFileUploaded,
    onScheduleFileUploaded,
    scheduleFile
  } = props

  return (
    <div className="flex justify-center">
      <Card className="notion-card w-full max-w-2xl">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl font-semibold flex items-center justify-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Upload className="h-4 w-4 text-accent" />
            </div>
            Upload Schedule Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed text-center">
            1. Upload schedule data. Only support CSV format.
          </p>

          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload onFileUpload={onScheduleFileUploaded} />
            </div>

            <div className="flex flex-col items-center gap-4">
              {scheduleFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Ready: {scheduleFile.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed text-center">
            2. Upload class transaction data. Only support CSV format.
          </p>

          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload onFileUpload={onTransactionFileUploaded} />
            </div>

            <div className="flex flex-col items-center gap-4">
              {transactionFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Ready: {transactionFile.name}
                </div>
              )}
              <Button
                onClick={onAllocate}
                disabled={!transactionFile || !scheduleFile}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasAllocated ? "Reallocate" : "Allocate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
