-- CreateTable
CREATE TABLE "RoomPic" (
    "roomPicId" BIGSERIAL NOT NULL,
    "periodId" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "room" TEXT NOT NULL,

    CONSTRAINT "RoomPic_pkey" PRIMARY KEY ("roomPicId")
);

-- AddForeignKey
ALTER TABLE "RoomPic" ADD CONSTRAINT "RoomPic_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("periodId") ON DELETE RESTRICT ON UPDATE CASCADE;
