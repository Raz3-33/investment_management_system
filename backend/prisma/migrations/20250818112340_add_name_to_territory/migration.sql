/*
  Warnings:

  - You are about to drop the column `name` on the `territories` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `territories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "territories_name_key";

-- AlterTable
ALTER TABLE "territories" DROP COLUMN "name",
DROP COLUMN "region";
