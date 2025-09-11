/*
  Warnings:

  - You are about to drop the column `executiveId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_executiveId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "executiveId";

-- CreateTable
CREATE TABLE "ExecutiveAssignment" (
    "associateId" TEXT NOT NULL,
    "executiveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveAssignment_pkey" PRIMARY KEY ("associateId","executiveId")
);

-- AddForeignKey
ALTER TABLE "ExecutiveAssignment" ADD CONSTRAINT "ExecutiveAssignment_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveAssignment" ADD CONSTRAINT "ExecutiveAssignment_executiveId_fkey" FOREIGN KEY ("executiveId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
