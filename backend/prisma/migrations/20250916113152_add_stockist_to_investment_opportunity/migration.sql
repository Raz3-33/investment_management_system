-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('ADMINISTRATE', 'HEAD', 'MANAGER', 'EXECUTIVE', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('MANUALLY', 'AUTOMATICALLY', 'USER');

-- CreateTable
CREATE TABLE "ExecutiveAssignment" (
    "associateId" TEXT NOT NULL,
    "executiveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveAssignment_pkey" PRIMARY KEY ("associateId","executiveId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "UserID" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "image_url" TEXT,
    "designation" TEXT,
    "countryCode" TEXT,
    "roleId" TEXT,
    "branchId" TEXT,
    "userLevel" "UserLevel" NOT NULL DEFAULT 'ASSOCIATE',
    "administrateId" TEXT,
    "headId" TEXT,
    "managerId" TEXT,
    "salesTarget" DOUBLE PRECISION DEFAULT 0,
    "salesAchieved" DOUBLE PRECISION DEFAULT 0,
    "incentive" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isLogin" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "access" TEXT,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "gstNumber" TEXT,
    "referredBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "password" TEXT NOT NULL,
    "relationshipManagerId" TEXT,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "InvestmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "BusinessCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_opportunities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
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
    "isStockist" BOOLEAN NOT NULL DEFAULT false,
    "signatureStoreLocation" TEXT,

    CONSTRAINT "investment_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerritoryMaster" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "territoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerritoryMaster_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "createdById" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "roiPercent" DOUBLE PRECISION,
    "payoutMode" TEXT NOT NULL,
    "coolOffPeriod" TIMESTAMP(3),
    "contractStart" TIMESTAMP(3) NOT NULL,
    "contractEnd" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "agreementSigned" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Ongoing',

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION,
    "paidDate" TIMESTAMP(3),
    "paymentMode" TEXT,
    "receiptRef" TEXT,
    "notes" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sales" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "territories" (
    "id" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "location" TEXT,
    "pincode" TEXT,
    "city" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "investmentOpportunityId" TEXT,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "territories_pkey" PRIMARY KEY ("id")
);

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
    "aadharFrontIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "aadharBack" TEXT,
    "aadharBackIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "panCard" TEXT,
    "panCardIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "companyPan" TEXT,
    "companyPanIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "gstNumber" TEXT,
    "addressProof" TEXT,
    "addressProofIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "attachedImage" TEXT,
    "attachedImageIsApproved" BOOLEAN NOT NULL DEFAULT false,
    "oppurtunity" TEXT,
    "isPaymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingFormPersonalDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingFormOfficeDetails" (
    "id" TEXT NOT NULL,
    "officeBranchId" TEXT,
    "leadSuccessCoordinatorId" TEXT,
    "partnerRelationshipExecutiveId" TEXT,
    "salesOnboardingManagerId" TEXT,
    "leadSource" TEXT,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "BookingFormOfficeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingFormPaymentDetails" (
    "id" TEXT NOT NULL,
    "dealAmount" DOUBLE PRECISION,
    "tokenReceived" DOUBLE PRECISION,
    "isTokenApproved" BOOLEAN NOT NULL DEFAULT false,
    "tokenDate" TIMESTAMP(3),
    "balanceDue" DOUBLE PRECISION,
    "paymentProof" TEXT,
    "modeOfPayment" TEXT,
    "additionalCommitment" TEXT,
    "remarks" TEXT,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "BookingFormPaymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSceduledDetails" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "isAmountApproved" BOOLEAN NOT NULL DEFAULT false,
    "paymentProof" TEXT NOT NULL,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "PaymentSceduledDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpectedPaymentSceduledDetails" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "personalDetailsId" TEXT NOT NULL,

    CONSTRAINT "ExpectedPaymentSceduledDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OpportunityBranches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OpportunityBranches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_UserID_key" ON "User"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_access_key" ON "RolePermission"("roleId", "permissionId", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_email_key" ON "Investor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentType_name_key" ON "InvestmentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCategory_name_key" ON "BusinessCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BookingFormOfficeDetails_personalDetailsId_key" ON "BookingFormOfficeDetails"("personalDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingFormPaymentDetails_personalDetailsId_key" ON "BookingFormPaymentDetails"("personalDetailsId");

-- CreateIndex
CREATE INDEX "_OpportunityBranches_B_index" ON "_OpportunityBranches"("B");

-- AddForeignKey
ALTER TABLE "ExecutiveAssignment" ADD CONSTRAINT "ExecutiveAssignment_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveAssignment" ADD CONSTRAINT "ExecutiveAssignment_executiveId_fkey" FOREIGN KEY ("executiveId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_administrateId_fkey" FOREIGN KEY ("administrateId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investor" ADD CONSTRAINT "Investor_relationshipManagerId_fkey" FOREIGN KEY ("relationshipManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_businessCategoryId_fkey" FOREIGN KEY ("businessCategoryId") REFERENCES "BusinessCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_investmentTypeId_fkey" FOREIGN KEY ("investmentTypeId") REFERENCES "InvestmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryMaster" ADD CONSTRAINT "TerritoryMaster_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryMaster" ADD CONSTRAINT "TerritoryMaster_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBranch" ADD CONSTRAINT "OpportunityBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityBranch" ADD CONSTRAINT "OpportunityBranch_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "Investor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "investment_opportunities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "territories" ADD CONSTRAINT "territories_investmentOpportunityId_fkey" FOREIGN KEY ("investmentOpportunityId") REFERENCES "investment_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormPersonalDetails" ADD CONSTRAINT "BookingFormPersonalDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormPersonalDetails" ADD CONSTRAINT "BookingFormPersonalDetails_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_leadSuccessCoordinatorId_fkey" FOREIGN KEY ("leadSuccessCoordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_officeBranchId_fkey" FOREIGN KEY ("officeBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_partnerRelationshipExecutiveId_fkey" FOREIGN KEY ("partnerRelationshipExecutiveId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormOfficeDetails" ADD CONSTRAINT "BookingFormOfficeDetails_salesOnboardingManagerId_fkey" FOREIGN KEY ("salesOnboardingManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingFormPaymentDetails" ADD CONSTRAINT "BookingFormPaymentDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSceduledDetails" ADD CONSTRAINT "PaymentSceduledDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedPaymentSceduledDetails" ADD CONSTRAINT "ExpectedPaymentSceduledDetails_personalDetailsId_fkey" FOREIGN KEY ("personalDetailsId") REFERENCES "BookingFormPersonalDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityBranches" ADD CONSTRAINT "_OpportunityBranches_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OpportunityBranches" ADD CONSTRAINT "_OpportunityBranches_B_fkey" FOREIGN KEY ("B") REFERENCES "investment_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
