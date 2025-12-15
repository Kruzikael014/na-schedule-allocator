import type { RoomPicData } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card } from "../ui/card";

export default function RoomPicTable({ roomPic }: { roomPic: RoomPicData[] }) {
  roomPic.sort((a, b) => (Number(a.room) - Number(b.room)))
  return <div className="flex justify-center">
    <Card className="notion-card w-full max-w-2xl flex justify-center items-center">
      <Table>
        <TableHeader>
          <TableRow >
            <TableHead className="">Room</TableHead>
            <TableHead className="">PIC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            roomPic.map(r => <TableRow key={r.pic + r.room}>
              <TableCell>{r.room}</TableCell>
              <TableCell>{r.pic}</TableCell>
            </TableRow>
            )
          }
        </TableBody>
      </Table>
    </Card>
  </div>
}