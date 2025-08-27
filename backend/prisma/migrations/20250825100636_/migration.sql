-- AlterTable
ALTER TABLE "BookingFormPersonalDetails" ADD COLUMN     "aadharBackIsApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aadharFrontIsApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "addressProofIsApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attachedImageIsApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "companyPanIsApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panCardIsApproved" BOOLEAN NOT NULL DEFAULT false;
