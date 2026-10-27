-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ContributionType" AS ENUM ('MONTHLY', 'SPECIAL', 'EMERGENCY', 'PENALTY');

-- CreateEnum
CREATE TYPE "public"."ContributionStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SavingType" AS ENUM ('REGULAR', 'FIXED_DEPOSIT', 'TARGET', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."SavingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."SavingTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'PENALTY', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "occupation" TEXT,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberCode" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contributions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "public"."ContributionType" NOT NULL,
    "status" "public"."ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."loans" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "term" INTEGER NOT NULL,
    "status" "public"."LoanStatus" NOT NULL DEFAULT 'PENDING',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "purpose" TEXT NOT NULL,
    "collateral" TEXT,
    "guarantor" TEXT,
    "monthlyPayment" DECIMAL(10,2),
    "totalPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."loan_payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "principal" DECIMAL(10,2) NOT NULL,
    "interest" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."savings" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" "public"."SavingType" NOT NULL DEFAULT 'REGULAR',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "status" "public"."SavingStatus" NOT NULL DEFAULT 'ACTIVE',
    "openedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saving_transactions" (
    "id" TEXT NOT NULL,
    "savingId" TEXT NOT NULL,
    "type" "public"."SavingTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saving_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "type" "public"."TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cooperative_settings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationName" TEXT NOT NULL DEFAULT 'Adashe Cooperative',
    "registrationNumber" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "establishedDate" TIMESTAMP(3),
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "minimumSavingsBalance" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "monthlyContribution" DOUBLE PRECISION NOT NULL DEFAULT 5000.0,
    "loanInterestRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "maxLoanAmount" DOUBLE PRECISION NOT NULL DEFAULT 500000.0,
    "loanTerm" INTEGER NOT NULL DEFAULT 12,
    "lateFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "withdrawalFee" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "allowAutoLoans" BOOLEAN NOT NULL DEFAULT true,
    "requireLoanGuarantors" BOOLEAN NOT NULL DEFAULT false,
    "maxGuarantors" INTEGER NOT NULL DEFAULT 2,
    "autoCalculateInterest" BOOLEAN NOT NULL DEFAULT true,
    "allowEarlyLoanPayment" BOOLEAN NOT NULL DEFAULT true,
    "enableMemberSelfService" BOOLEAN NOT NULL DEFAULT true,
    "maxSavingsWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 100000.0,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "notifyLoanDue" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentReceived" BOOLEAN NOT NULL DEFAULT true,
    "notifyContributionDue" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cooperative_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_key" ON "public"."members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "members_phone_key" ON "public"."members"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "public"."members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_memberCode_key" ON "public"."members"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_reference_key" ON "public"."contributions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "loan_payments_reference_key" ON "public"."loan_payments"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "savings_accountNumber_key" ON "public"."savings"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "saving_transactions_reference_key" ON "public"."saving_transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "public"."transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "public"."settings"("key");

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loans" ADD CONSTRAINT "loans_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."loan_payments" ADD CONSTRAINT "loan_payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "public"."loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."savings" ADD CONSTRAINT "savings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saving_transactions" ADD CONSTRAINT "saving_transactions_savingId_fkey" FOREIGN KEY ("savingId") REFERENCES "public"."savings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
