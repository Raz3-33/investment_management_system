/*
  Warnings:

  - Made the column `name` on table `Brand` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
