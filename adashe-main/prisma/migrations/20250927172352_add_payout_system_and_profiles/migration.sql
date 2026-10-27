-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "public"."PreferredCommunication" AS ENUM ('EMAIL', 'SMS', 'PHONE', 'WHATSAPP', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('NATIONAL_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'VOTERS_CARD', 'BIRTH_CERTIFICATE', 'UTILITY_BILL', 'BANK_STATEMENT', 'EMPLOYMENT_LETTER', 'SALARY_SLIP', 'TAX_CERTIFICATE', 'BVN_SLIP', 'PASSPORT_PHOTO', 'SIGNATURE_SPECIMEN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_UPDATE');

-- CreateEnum
CREATE TYPE "public"."PayoutType" AS ENUM ('DIVIDEND', 'REFUND', 'LOAN_DISBURSEMENT', 'SAVINGS_WITHDRAWAL', 'EMERGENCY_ASSISTANCE', 'WELFARE_PAYMENT', 'BONUS', 'COMMISSION', 'EXPENSE_REIMBURSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PayoutCategory" AS ENUM ('MEMBER_BENEFIT', 'OPERATIONAL', 'EMERGENCY', 'STATUTORY', 'VOLUNTARY');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "middleName" TEXT,
    "gender" "public"."Gender",
    "maritalStatus" "public"."MaritalStatus",
    "nationality" TEXT,
    "stateOfOrigin" TEXT,
    "localGovernment" TEXT,
    "religion" TEXT,
    "bloodGroup" TEXT,
    "alternatePhone" TEXT,
    "alternateEmail" TEXT,
    "residentialAddress" TEXT,
    "permanentAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "employer" TEXT,
    "jobTitle" TEXT,
    "workAddress" TEXT,
    "workPhone" TEXT,
    "workEmail" TEXT,
    "monthlyIncome" DECIMAL(10,2),
    "yearsOfExperience" INTEGER,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactEmail" TEXT,
    "emergencyContactRelation" TEXT,
    "emergencyContactAddress" TEXT,
    "nextOfKinName" TEXT,
    "nextOfKinPhone" TEXT,
    "nextOfKinEmail" TEXT,
    "nextOfKinRelation" TEXT,
    "nextOfKinAddress" TEXT,
    "nextOfKinDateOfBirth" TIMESTAMP(3),
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankBranch" TEXT,
    "bankSortCode" TEXT,
    "bvn" TEXT,
    "languages" TEXT,
    "skills" TEXT,
    "hobbies" TEXT,
    "socialMedia" TEXT,
    "preferredCommunication" "public"."PreferredCommunication" NOT NULL DEFAULT 'EMAIL',

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_documents" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payouts" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "public"."PayoutType" NOT NULL,
    "category" "public"."PayoutCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "processedBy" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "processedDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "reference" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvalLevel" INTEGER NOT NULL DEFAULT 1,
    "attachments" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payout_approvals" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL,
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payout_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PayoutType" NOT NULL,
    "category" "public"."PayoutCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultAmount" DECIMAL(10,2),
    "defaultMethod" "public"."PaymentMethod",
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvalLevels" INTEGER NOT NULL DEFAULT 1,
    "allowMemberRequest" BOOLEAN NOT NULL DEFAULT false,
    "maxAmount" DECIMAL(10,2),
    "minAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_memberId_key" ON "public"."profiles"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_reference_key" ON "public"."payouts"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "payout_approvals_payoutId_level_key" ON "public"."payout_approvals"("payoutId", "level");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_documents" ADD CONSTRAINT "profile_documents_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payouts" ADD CONSTRAINT "payouts_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payout_approvals" ADD CONSTRAINT "payout_approvals_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "public"."payouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
