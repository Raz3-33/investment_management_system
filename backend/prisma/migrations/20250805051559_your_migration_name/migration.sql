/*
  Warnings:

  - The `coolOffPeriod` column on the `Investment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "coolOffPeriod",
ADD COLUMN     "coolOffPeriod" TIMESTAMP(3);
