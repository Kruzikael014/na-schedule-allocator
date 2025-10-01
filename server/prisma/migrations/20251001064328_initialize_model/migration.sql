-- CreateTable
CREATE TABLE "public"."Period" (
    "periodId" TEXT NOT NULL,
    "periodName" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("periodId")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "activityId" BIGSERIAL NOT NULL,
    "periodId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "room" TEXT,
    "day" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "pic" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("activityId")
);

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."Period"("periodId") ON DELETE RESTRICT ON UPDATE CASCADE;
