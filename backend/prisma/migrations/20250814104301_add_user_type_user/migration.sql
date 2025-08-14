-- AlterTable
ALTER TABLE "InvestmentOpportunity" ADD COLUMN     "isMasterFranchise" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSignature" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatureStoreLocation" TEXT;

-- CreateTable
CREATE TABLE "TerritoryMaster" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryMaster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TerritoryMaster" ADD CONSTRAINT "TerritoryMaster_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "InvestmentOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryMaster" ADD CONSTRAINT "TerritoryMaster_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
