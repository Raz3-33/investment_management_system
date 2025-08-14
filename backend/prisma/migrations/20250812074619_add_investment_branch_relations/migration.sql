-- AlterTable
ALTER TABLE "User" ADD COLUMN     "headId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
