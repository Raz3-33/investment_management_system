/*
  Warnings:

  - You are about to drop the `InvestmentOpportunity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assignmentType` to the `territories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `territories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('MANUALLY', 'AUTOMATICALLY', 'USER');

-- DropForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT "Investment_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "InvestmentOpportunity" DROP CONSTRAINT "InvestmentOpportunity_businessCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "InvestmentOpportunity" DROP CONSTRAINT "InvestmentOpportunity_investmentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "OpportunityBranch" DROP CONSTRAINT "OpportunityBranch_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "TerritoryMaster" DROP CONSTRAINT "TerritoryMaster_opportunityId_fkey";

-- DropForeignKey
ALTER TABLE "_OpportunityBranches" DROP CONSTRAINT "_OpportunityBranches_B_fkey";

-- AlterTable
ALTER TABLE "territories" ADD COLUMN     "assignmentType" TEXT NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "investmentOpportunityId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "InvestmentOpportunity";

-- CreateTable
CREATE TABLE "investment_opportunities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minAmount" DOUBLE PRECISION NOT NULL,
    "maxAmount" DOUBLE PRECISION,
    "roiPercent" DOUBLE PRECISION NOT NULL,
    "turnOverPercentage" DOUBLE PRECISION,
    "turnOverAmount" DOUBLE PRECISION,
    "renewalFee" DOUBLE PRECISION,
    "lockInMonths" INTEGER NOT NULL,
    "exitOptions" TEXT,
    "payoutMode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "documents" TEXT[],
    "investmentTypeId" TEXT NOT NULL,
    "businessCategoryId" TEXT NOT NULL,
    "isMasterFranchise" BOOLEAN NOT NULL DEFAULT false,
    "isSignature" BOOLEAN NOT NULL DEFAULT false,
    "signatureStoreLocation" TEXT,

    CONSTRAINT "investment_opportunities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_investmentTypeId_fkey" FOREIGN KEY ("investmentTypeId") REFERENCES "InvestmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_businessCategoryId_fkey" FOREIGN KEY ("businessCategoryId") REFERENCES "BusinessCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryMaster" ADD CONSTRAINT "TerritoryMaster_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBranch" ADD CONSTRAINT "OpportunityBranch_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_investmentOpportunityId_fkey" FOREIGN KEY ("investmentOpportunityId") REFERENCES "investment_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityBranches" ADD CONSTRAINT "_OpportunityBranches_B_fkey" FOREIGN KEY ("B") REFERENCES "investment_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
