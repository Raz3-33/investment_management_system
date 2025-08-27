/*
  Warnings:

  - You are about to drop the column `leadSuccessCoordinator` on the `BookingFormOfficeDetails` table. All the data in the column will be lost.
  - You are about to drop the column `officeBranch` on the `BookingFormOfficeDetails` table. All the data in the column will be lost.
  - You are about to drop the column `partnerRelationshipExecutive` on the `BookingFormOfficeDetails` table. All the data in the column will be lost.
  - You are about to drop the column `salesOnboardingManager` on the `BookingFormOfficeDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BookingFormOfficeDetails" DROP COLUMN "leadSuccessCoordinator",
DROP COLUMN "officeBranch",
DROP COLUMN "partnerRelationshipExecutive",
DROP COLUMN "salesOnboardingManager",
ADD COLUMN     "leadSuccessCoordinatorId" TEXT,
ADD COLUMN     "officeBranchId" TEXT,
ADD COLUMN     "partnerRelationshipExecutiveId" TEXT,
ADD COLUMN     "salesOnboardingManagerId" TEXT;

-- AddForeignKey
ALTER TABLE "BookingFormPersonalDetails" ADD CONSTRAINT "BookingFormPersonalDetails_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_officeBranchId_fkey" FOREIGN KEY ("officeBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_leadSuccessCoordinatorId_fkey" FOREIGN KEY ("leadSuccessCoordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_partnerRelationshipExecutiveId_fkey" FOREIGN KEY ("partnerRelationshipExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_salesOnboardingManagerId_fkey" FOREIGN KEY ("salesOnboardingManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
