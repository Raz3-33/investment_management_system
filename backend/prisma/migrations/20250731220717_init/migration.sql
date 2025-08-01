-- CreateTable
CREATE TABLE "Sales" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "InvestmentOpportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
