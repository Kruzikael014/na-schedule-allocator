import { ACTIVITY_LEGENDS } from "@/lib/constants";
import type { ActivityData, ScheduleTableProps } from "@/lib/types";
import { Card } from "../ui/card";
import { useMemo, useState, type MouseEvent } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";

interface ContextMenuProps {
  x: number
  y: number
  data: ActivityData[]
}

export function ScheduleTable({ data, onUpdateCallback }: ScheduleTableProps) {
  const [formData, setFormData] = useState<{ periodId?: string, activityId?: number, pic?: string, day?: number, shift?: number } | undefined>({})
  const [activeActivities, setActiveActivities] = useState<ActivityData[]>([])
  const days = Array.from({ length: 6 }, (_, i) => String(i + 1))
  const shifts = Array.from({ length: 6 }, (_, i) => String(i + 1))
  const pics = useMemo(() => {
    return [...new Set(data.map(t => t.pic))].sort((a, b) => a < b ? -1 : 1)
  }, [data])
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)

  const getCellStyle = (code: number) => {
    const legend = ACTIVITY_LEGENDS.find((l) => l.code === code)
    if (!legend) return "bg-card border border-border"

    return {
      backgroundColor: `var(--chipcolor${legend.code})`,
      color: `var(--chiptext${legend.code})`,
      border: `0.1px solid var(--border)`,
    }
  }

  const onCellRightClicked = (e: MouseEvent<HTMLTableDataCellElement>, props: ContextMenuProps) => {
    e.preventDefault()
    setContextMenu(props)
    setActiveActivities(props.data)
    if (props.data.length > 0) {
      const first = props.data[0]
      setFormData({
        activityId: first.activityId,
        pic: first.pic,
        day: Number(first.day),
        shift: Number(first.shift),
      })
    }
  }

  const cleanup = () => {
    setFormData({})
    setContextMenu(null)
    setIsFormOpen(false)
  }

  const handleUpdateActivity = async () => {

    await onUpdateCallback({
      day: String(formData?.day),
      id: String(formData?.activityId),
      pic: formData?.pic!,
      shift: String(formData?.shift)
    })

    // cleanup
    cleanup()
  }

  return <div className="space-y-8">
    <div className="overflow-x-auto bg-card rounded-xl border border-border p-4">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-3 font-semibold rounded-tl-lg border-r-2 border-border">
              PIC
            </th>
            {days.map((day, index) => (
              <th
                key={day}
                colSpan={6}
                className={`bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-3 font-semibold ${index === days.length - 1 ? "rounded-tr-lg" : ""
                  } ${index < days.length - 1 ? "border-r-2 border-border" : ""}`}
              >
                Day {day}
              </th>
            ))}
          </tr>
          <tr>
            <th className="bg-muted/50 text-muted-foreground p-2 border-r-2 border-border"></th>
            {days.map((day, dayIdx) =>
              shifts.map((shift, shiftIdx) => (
                <th
                  key={`${day}-${shift}`}
                  className={`bg-muted/50 text-muted-foreground p-2 text-xs font-medium ${shiftIdx === shifts.length - 1 && dayIdx < days.length - 1
                    ? "border-r-2 border-border"
                    : shiftIdx < shifts.length - 1
                      ? "border-r border-border/50"
                      : ""
                    }`}
                >
                  {shift}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {
            pics.map((pic, picIdx) => {
              return <tr key={pic}>
                <td className={`bg-secondary/50 text-secondary-foreground p-3 font-semibold text-center border-r-2 border-border ${picIdx === pics.length - 1 ? 'rounded-bl-lg' : ''}`}
                >
                  {pic}
                </td>
                {
                  days.map((day, dayIdx) =>
                    shifts.map((shift, shiftIdx) => {
                      const key = `${day}-${shift}`
                      const activities = data.filter(e => e.pic === pic && e.day === day && e.shift === shift)
                      const totalCode = activities
                        .reduce((sum, curr) => Number(sum) + Number(curr.code), 0);
                      const style = getCellStyle(totalCode)

                      return (
                        <td
                          onContextMenu={(e) => onCellRightClicked(e, { x: e.clientX, y: e.clientY, data: activities })}
                          key={key}
                          className={`cursor-pointer w-12 h-10 text-center text-xs font-medium schedule-cell ${shiftIdx === shifts.length - 1 && dayIdx < days.length - 1
                            ? "border-r-2 border-border"
                            : shiftIdx < shifts.length - 1
                              ? "border-r border-border/50"
                              : ""
                            } ${picIdx === pics.length - 1 &&
                              dayIdx === days.length - 1 &&
                              shiftIdx === shifts.length - 1
                              ? "rounded-br-lg"
                              : ""
                            }`}
                          style={typeof style === "object" ? style : undefined}
                          title={activities.map(e => e.description).join(', ')}
                        >
                          {totalCode === 0 ? '' : totalCode}
                        </td>
                      )

                    })
                  )
                }
              </tr>
            })
          }
        </tbody>
      </table>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <Card className="notion-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
          Activity Legend
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_LEGENDS.map((legend) => (
            <div key={legend.code} className="flex items-center gap-3">
              <div
                className={`w-8 h-6 rounded-md text-xs flex items-center justify-center font-medium border border-border`}
                style={{
                  backgroundColor: `var(--chipcolor${legend.code})`,
                  color: `var(--chiptext${legend.code})`,
                }}
              >
                {legend.code}
              </div>
              <span className="text-sm text-foreground">{legend.description}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="notion-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
          Schedule Guide
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Days:</span> Monday (1) to Saturday (6)
          </div>
          <div>
            <span className="font-medium text-foreground">Shifts:</span>{" "}
            {shifts.map((time, index) => (
              <span key={time}>
                {time} ({index + 1}){index < shifts.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
          <div>
            <span className="font-medium text-foreground">PIC:</span> Person in Charge for each time slot
          </div>
        </div>
      </Card>
    </div>

    {
      contextMenu && (
        <div
          className="fixed z-50 bg-background border border-border rounded-md shadow-md text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={() => setContextMenu(null)}
        >
          <button
            className="px-4 py-2 hover:bg-muted w-full text-left hover:cursor-pointer"
            onClick={() => {
              setIsFormOpen(true)
            }}
          >
            Change to
          </button>
          <button
            className="px-4 py-2 hover:bg-muted w-full text-left hover:cursor-pointer"
            onClick={() => toast.error('Gabisa lol, lu pikir lu siapa', { icon: '😋' })}
          >
            Issue protest
          </button>
        </div>
      )
    }

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Activity</DialogTitle>
          <DialogDescription>Switch some activity to other NA</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* minta pic, day, shift aja */}

          <Field>
            <FieldLabel>Activity</FieldLabel>
            <Select
              value={String(formData!.activityId)}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, activityId: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activeActivities.map(act => (
                    <SelectItem
                      key={act.activityId}
                      value={String(act.activityId)}
                    >
                      {act.code} — {act.description}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>PIC</FieldLabel>
            <Select
              value={formData!.pic}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, pic: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pics.map(pic => (
                    <SelectItem key={pic} value={pic}>
                      {pic}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex gap-6">
            <Field>
              <FieldLabel>Day</FieldLabel>
              <Input
                type="number"
                min={1}
                max={6}
                value={formData!.day ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    day: Number(e.target.value),
                  }))
                }
              />
              <FieldDescription className="text-xs">
                Day between 1–6
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Shift</FieldLabel>
              <Input
                type="number"
                min={1}
                max={6}
                value={formData!.shift ?? ""}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    shift: Number(e.target.value),
                  }))
                }
              />
              <FieldDescription className="text-xs">
                Shift between 1–6
              </FieldDescription>
            </Field>
          </div>
        </div>


        <DialogFooter className="gap-2 sm:gap-0">
          <button
            onClick={() => { cleanup() }}
            className="flex-1 border border-border/40 text-foreground font-medium py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors text-sm hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateActivity}
            className="flex-1 hover:cursor-pointer bg-accent text-accent-foreground font-medium py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors text-sm"
          >
            Update
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
}