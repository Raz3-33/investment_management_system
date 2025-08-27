-- CreateTable
CREATE TABLE "BookingFormPersonalDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "altPhoneNumber" TEXT,
    "territoryId" TEXT NOT NULL,
    "state" TEXT,
    "district" TEXT,
    "city" TEXT,
    "streetAddress" TEXT,
    "pincode" TEXT,
    "aadharFront" TEXT,
    "aadharBack" TEXT,
    "panCard" TEXT,
    "companyPan" TEXT,
    "gstNumber" TEXT,
    "addressProof" TEXT,
    "attachedImage" TEXT,
    "oppurtunity" TEXT,
    "isPaymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingFormPersonalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingFormOfficeDetails" (
    "id" TEXT NOT NULL,
    "officeBranch" TEXT,
    "leadSuccessCoordinator" TEXT,
    "partnerRelationshipExecutive" TEXT,
    "salesOnboardingManager" TEXT,
    "leadSource" TEXT,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "BookingFormOfficeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingFormPaymentDetails" (
    "id" TEXT NOT NULL,
    "dealAmount" DOUBLE PRECISION,
    "tokenReceived" DOUBLE PRECISION,
    "tokenDate" TIMESTAMP(3),
    "balanceDue" DOUBLE PRECISION,
    "paymentProof" TEXT,
    "modeOfPayment" TEXT,
    "date1" TIMESTAMP(3),
    "amount1" DOUBLE PRECISION,
    "date2" TIMESTAMP(3),
    "amount2" DOUBLE PRECISION,
    "date3" TIMESTAMP(3),
    "amount3" DOUBLE PRECISION,
    "date4" TIMESTAMP(3),
    "amount4" DOUBLE PRECISION,
    "additionalCommitment" TEXT,
    "remarks" TEXT,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "BookingFormPaymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingFormOfficeDetails_personalDetailsId_key" ON "BookingFormOfficeDetails"("personalDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingFormPaymentDetails_personalDetailsId_key" ON "BookingFormPaymentDetails"("personalDetailsId");

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormPaymentDetails" ADD CONSTRAINT "BookingFormPaymentDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
