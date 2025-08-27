-- AlterTable
ALTER TABLE "BookingFormPaymentDetails" ADD COLUMN     "isAmount1Approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAmount2Approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAmount3Approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAmount4Approved" BOOLEAN NOT NULL DEFAULT false;
