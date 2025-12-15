"use client"
import { Upload } from "lucide-react"
import { CardContent, Card, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import type { ChecklistItemProps, UploadSectionProps } from "@/lib/types"
import { memo, useEffect, useState } from "react"
import { ChecklistItem } from "../ui/checklist-item"

export function UploadSection({ files, setFiles, hasAllocated, onAllocate }: UploadSectionProps) {
  const { shiftFile, teachingCollegeFile, transactionFile } = files
  const [setShiftFile, setTeachingCollegeFile, setTransactionFile] = setFiles
  const [forceSequential, setForceSequential] = useState(true)
  const [checklistState, setChecklistState] = useState<{
    _1: boolean,
    _2: boolean,
    _3: boolean,
  }>({
    _1: false,
    _2: false,
    _3: false,
  })

  useEffect(() => {
    if (shiftFile && teachingCollegeFile && transactionFile) {
      setForceSequential(false);
    }
  }, [shiftFile, teachingCollegeFile, transactionFile]);

  function toggleChecklist(step: keyof typeof checklistState) {
    if (!forceSequential) {
      setChecklistState(prev => ({ ...prev, [step]: !prev[step] }))
    }
  }

  const MemoizedChecklistItem = memo((props: ChecklistItemProps) => (<ChecklistItem {...props} />))

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
          <div className="space-y-4">
            <MemoizedChecklistItem
              stepNumber={1}
              label="Upload Working Shift data. Only support csv."
              completed={!!shiftFile}
              fileName={shiftFile?.name}
              showUpload={forceSequential ? !shiftFile : checklistState._1}
              onFileUpload={setShiftFile}
              onClick={() => toggleChecklist("_1")}
            />
            <MemoizedChecklistItem
              stepNumber={2}
              label="Upload Teaching-College data. Only support csv."
              completed={!!teachingCollegeFile}
              fileName={teachingCollegeFile?.name}
              onFileUpload={setTeachingCollegeFile}
              showUpload={forceSequential ? !!shiftFile && !teachingCollegeFile : checklistState._2}
              onClick={() => toggleChecklist("_2")}
            />
            <MemoizedChecklistItem
              stepNumber={3}
              label="Upload Class Transaction data. Only support csv."
              completed={!!transactionFile}
              fileName={transactionFile?.name}
              onFileUpload={setTransactionFile}
              showUpload={forceSequential ? !!shiftFile && !!teachingCollegeFile && !transactionFile : checklistState._3}
              onClick={() => toggleChecklist("_3")}
            />
            <ChecklistItem
              stepNumber={4}
              completed={!!shiftFile && !!teachingCollegeFile && !!transactionFile}
              label="Ready to Allocate"
              disabled={!shiftFile || !teachingCollegeFile || !transactionFile}
            />
          </div>
        </CardContent>
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={onAllocate}
            disabled={!shiftFile}
            className="hover:cursor-pointer bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasAllocated ? "Reallocate" : "Allocate"}
          </Button>
        </div>

      </Card>
    </div>
  )
}
