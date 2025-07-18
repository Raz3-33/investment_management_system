/*
  Warnings:

  - A unique constraint covering the columns `[UserID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "UserID" TEXT,
ADD COLUMN     "incentive" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "salesAchieved" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "salesTarget" DOUBLE PRECISION DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "User_UserID_key" ON "User"("UserID");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
