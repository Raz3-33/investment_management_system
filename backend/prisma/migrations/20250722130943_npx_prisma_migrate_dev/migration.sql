/*
  Warnings:

  - Added the required column `password` to the `Investor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investor" ADD COLUMN     "password" TEXT NOT NULL;
