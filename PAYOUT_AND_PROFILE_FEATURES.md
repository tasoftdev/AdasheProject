# Adashe Cooperative - Payout System and Enhanced Profiles

This document outlines the newly added Payout System and Enhanced Profile features in the Adashe Cooperative Management System.

## 🚀 Features Added

### 1. Enhanced Profile System

The profile system has been significantly enhanced to capture comprehensive member information:

#### **Profile Categories:**

- **Personal Information**
  - Middle name, gender, marital status
  - Nationality, state of origin, local government
  - Religion, blood group
  - Preferred communication method

- **Contact Information**
  - Alternate phone and email
  - Residential and permanent addresses
  - City, state, postal code, country

- **Professional Information**
  - Employer, job title, work contact details
  - Monthly income, years of experience
  - Work address

- **Emergency Contact**
  - Emergency contact person details
  - Relationship and contact information

- **Next of Kin**
  - Next of kin details with full contact information
  - Date of birth for next of kin

- **Banking Information**
  - Bank details including name, account information
  - BVN (Bank Verification Number)
  - Sort code and branch information

- **Document Management**
  - Upload and manage various document types
  - Document verification system
  - Status tracking (Pending, Verified, Rejected, Expired)

#### **Document Types Supported:**
- National ID, Driver's License, Passport
- Voter's Card, Birth Certificate
- Utility Bills, Bank Statements
- Employment Letters, Salary Slips
- Tax Certificates, BVN Slips
- Passport Photos, Signature Specimens

### 2. Comprehensive Payout System

A complete payout management system for handling various types of member payouts:

#### **Payout Types:**
- **DIVIDEND** - Member dividend payments
- **REFUND** - Refund payments
- **LOAN_DISBURSEMENT** - Loan disbursements
- **SAVINGS_WITHDRAWAL** - Savings withdrawals
- **EMERGENCY_ASSISTANCE** - Emergency financial assistance
- **WELFARE_PAYMENT** - Welfare payments
- **BONUS** - Bonus payments
- **COMMISSION** - Commission payments
- **EXPENSE_REIMBURSEMENT** - Expense reimbursements
- **OTHER** - Other payout types

#### **Payout Categories:**
- **MEMBER_BENEFIT** - Direct member benefits
- **OPERATIONAL** - Operational payments
- **EMERGENCY** - Emergency payments
- **STATUTORY** - Statutory payments
- **VOLUNTARY** - Voluntary payments

#### **Payout Features:**
- **Multi-level Approval System**
  - Configurable approval levels (1, 2, or 3 levels)
  - Role-based approval permissions
  - Approval history tracking

- **Payment Methods**
  - Cash, Bank Transfer, Mobile Money
  - Credit/Debit Cards, Cheques

- **Status Tracking**
  - Pending, Approved, Rejected
  - Processing, Completed, Cancelled
  - Failed, On Hold

- **Scheduling**
  - Immediate or scheduled payouts
  - Bulk processing capabilities

## 🔧 API Endpoints

### Profile Management
```
GET    /api/profiles/[memberId]                    # Get member profile
PUT    /api/profiles/[memberId]                    # Update member profile
GET    /api/profiles/[memberId]/documents          # Get profile documents
POST   /api/profiles/[memberId]/documents         # Upload document
PUT    /api/profiles/[memberId]/documents/[id]    # Update document status
DELETE /api/profiles/[memberId]/documents/[id]    # Delete document
```

### Payout Management
```
GET    /api/payouts                               # Get all payouts (with filters)
POST   /api/payouts                               # Create new payout request
GET    /api/payouts/[id]                          # Get specific payout
PUT    /api/payouts/[id]                          # Update payout (approve/reject/process)
DELETE /api/payouts/[id]                          # Delete payout (if pending)
GET    /api/payouts/templates                     # Get payout templates
POST   /api/payouts/templates                     # Create payout template
```

## 🏗️ Database Schema

### New Models Added:

#### **Profile Model**
- Comprehensive member profile information
- Links to Member model
- Stores personal, contact, professional information
- Emergency contacts and next of kin details
- Banking information

#### **ProfileDocument Model**
- Document management for profiles
- Support for various document types
- Verification status tracking
- File metadata storage

#### **Payout Model**
- Payout request management
- Multi-level approval system
- Payment method and banking details
- Status and date tracking

#### **PayoutApproval Model**
- Approval workflow management
- Level-based approvals
- Approval history and comments

#### **PayoutTemplate Model**
- Predefined payout templates
- Configuration for common payout types
- Approval requirements and limits

## 🎨 UI Components

### Profile Management
- **ProfileManagement Component**
  - Tabbed interface for different profile sections
  - Form validation with Zod schemas
  - Document upload and management
  - Completion percentage tracking
  - Real-time profile updates

### Payout System
- **PayoutDashboard Component**
  - Comprehensive payout overview
  - Statistics and metrics
  - Filtering and search capabilities
  - Payout request creation
  - Approval workflow management

## 🛡️ Security & Permissions

### Profile Access Control:
- Users can view/edit their own profiles
- Admins and Managers can view/edit all profiles
- Document verification restricted to Admins/Managers

### Payout Access Control:
- Members can create payout requests for themselves
- Admins/Managers can create requests for any member
- Multi-level approval system based on amount thresholds
- Role-based action permissions

## 📊 Business Logic

### Profile Completion Tracking:
- Automatic calculation of profile completion percentage
- Essential fields identification
- Progress visualization

### Payout Approval Logic:
- Amount-based approval level determination:
  - < ₦100,000: Level 1 approval
  - ₦100,000 - ₦500,000: Level 2 approval
  - > ₦500,000: Level 3 approval
- Sequential approval process
- Automatic status updates

## 🚀 Getting Started

1. **Database Migration**
   ```bash
   npx prisma migrate dev --name "add-payout-system-and-profiles"
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Access Features**
   - Navigate to `/profile` for profile management
   - Navigate to `/payouts` for payout system
   - Features accessible via updated sidebar navigation

## 🔮 Future Enhancements

### Profile System:
- Profile photo upload integration
- Social media integration
- Skills and certifications tracking
- Performance metrics integration

### Payout System:
- Automated payout processing
- Integration with payment gateways
- Bulk payout processing
- Advanced reporting and analytics
- SMS/Email notifications for status changes

## 📝 Notes

- All forms include comprehensive validation
- Real-time updates and notifications
- Mobile-responsive design
- Accessibility features included
- Error handling and user feedback
- Optimistic UI updates for better UX

This implementation provides a solid foundation for member profile management and payout processing, with room for future enhancements and integrations.