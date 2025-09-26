import { ACTIVITY_LEGENDS } from "@/lib/constants";
import type { ScheduleTableProps } from "@/lib/types";
import { Card } from "../ui/card";

export function ScheduleTable({ data }: ScheduleTableProps) {
  const days = Array.from({ length: 6 }, (_, i) => String(i + 1))
  const shifts = Array.from({ length: 6 }, (_, i) => String(i + 1))
  const pics = [...new Set(data.map(t => t.pic))].sort((a, b) => a < b ? -1 : 1)
  const getCellStyle = (code: number) => {
    const legend = ACTIVITY_LEGENDS.find((l) => l.code === code)
    if (!legend) return "bg-card border border-border/30"

    return {
      backgroundColor: legend.color,
      color: legend.textColor,
      border: `1px solid ${legend.textColor}20`,
    }
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
                          key={key}
                          className={`w-12 h-10 text-center text-xs font-medium schedule-cell ${shiftIdx === shifts.length - 1 && dayIdx < days.length - 1
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
                className="w-8 h-6 rounded-md text-xs flex items-center justify-center font-medium border border-border"
                style={{
                  backgroundColor: legend.color,
                  color: legend.textColor,
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

  </div>
}