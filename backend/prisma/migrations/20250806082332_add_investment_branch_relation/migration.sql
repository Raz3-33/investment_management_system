/*
  Warnings:

  - Added the required column `branchId` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "branchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OpportunityBranch" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OpportunityBranches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OpportunityBranches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OpportunityBranches_B_index" ON "_OpportunityBranches"("B");

-- AddForeignKey
ALTER TABLE "OpportunityBranch" ADD CONSTRAINT "OpportunityBranch_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "InvestmentOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBranch" ADD CONSTRAINT "OpportunityBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityBranches" ADD CONSTRAINT "_OpportunityBranches_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityBranches" ADD CONSTRAINT "_OpportunityBranches_B_fkey" FOREIGN KEY ("B") REFERENCES "InvestmentOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
