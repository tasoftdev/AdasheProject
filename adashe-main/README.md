# Adashe Cooperative Management System

<div align="center">
  <h3>🏛️ Modern Cooperative Management Platform</h3>
  <p>A comprehensive digital solution for managing cooperative societies, members, finances, and operations</p>
  
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Schema](#-database-schema)
- [UI Components](#-ui-components)
- [Streak System & Gamification](#-streak-system--gamification)
- [Mobile Responsiveness](#-mobile-responsiveness)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 👥 **Member Management**
- Complete member registration and onboarding
- Enhanced member profiles with comprehensive information
- Document management and verification system
- Member status tracking and management
- Profile completion tracking with visual indicators

### 💰 **Financial Management**
- **Contributions**: Monthly, special, emergency, and penalty contributions
- **Savings**: Multiple account types (Regular, Fixed Deposit, Target, Emergency)
- **Loans**: Complete loan lifecycle management with approval workflow
- **Payouts**: Comprehensive payout system with multi-level approvals

### 📊 **Advanced Payout System**
- **10 Payout Types**: Dividend, refunds, loan disbursements, welfare payments, etc.
- **Multi-level Approval Workflow**: Configurable 1-3 level approvals based on amount
- **Payment Methods**: Bank transfer, mobile money, cash, cards, cheques
- **Status Tracking**: Complete audit trail from request to completion
- **Templates**: Predefined payout templates for common transactions

### 👤 **Enhanced Profile System**
- **Personal Information**: Demographics, contact details, preferences
- **Professional Details**: Employment information, income data
- **Emergency Contacts**: Multiple emergency contact management
- **Banking Information**: Account details, BVN integration
- **Document Management**: 14+ document types with verification workflow

### 📈 **Reports & Analytics**
- Financial summaries and member reports
- Transaction history and analytics
- Monthly and custom date range reports
- Member performance tracking

### 🔐 **Security & Compliance**
- Role-based access control (Admin, Manager, Member)
- Secure authentication with NextAuth.js
- Data encryption and protection
- Audit trails for all transactions

### � **User Engagement & Gamification**
- **Streak System**: Track daily login, contribution, and savings streaks
- **Achievement System**: Unlock milestones and rewards for consistent activity
- **Leaderboards**: Daily, weekly, monthly, and all-time rankings
- **Points & Levels**: Gamified progression system with experience points
- **Activity Tracking**: Comprehensive logging of user engagement

### �📱 **Modern User Experience**
- Fully responsive mobile-first design for all devices
- Real-time notifications and updates
- Progressive Web App capabilities
- Intuitive dashboard and navigation
- Touch-friendly interfaces with optimized mobile layouts

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: React hooks + Context API
- **Authentication**: NextAuth.js

### **Backend**
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with credentials provider
- **Password Hashing**: bcryptjs

### **Development Tools**
- **Language**: TypeScript
- **Linting**: ESLint
- **Code Formatting**: Prettier (via ESLint config)
- **Git Hooks**: Husky (if configured)
- **Package Manager**: npm/yarn

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Syipmong/adashe.git
   cd adashe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then configure your environment variables (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Using Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE adashe_db;
   ```
3. Update your `.env.local` with the connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/adashe_db"
   ```

### Using Cloud Database (Recommended)

The app is configured to work with cloud databases like:
- **Supabase** (Recommended for development)
- **Railway**
- **PlanetScale**
- **Neon**

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_key"

# Optional: External Services
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASSWORD=""

# Optional: File Upload
# CLOUDINARY_URL=""
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
```

### Required Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your app's URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Random secret for JWT signing

Generate a secure secret:
```bash
openssl rand -base64 32
```

## 📁 Project Structure

```
adashe/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── members/            # Member management
│   │   ├── contributions/      # Contributions API
│   │   ├── loans/              # Loan management
│   │   ├── savings/            # Savings management
│   │   ├── payouts/            # Payout system API
│   │   ├── profiles/           # Profile management
│   │   ├── reports/            # Reports and analytics
│   │   └── streaks/            # Streak system API
│   ├── auth/                   # Auth pages (signin, signup)
│   ├── dashboard/              # Dashboard page
│   ├── members/                # Member pages
│   ├── contributions/          # Contributions pages
│   ├── loans/                  # Loan pages
│   ├── savings/                # Savings pages
│   ├── payouts/                # Payout pages
│   ├── profile/                # Profile pages
│   ├── reports/                # Reports pages
│   ├── settings/               # Settings pages
│   ├── streaks/                # Streak & gamification pages
│   └── layout.tsx              # Root layout
├── components/                  # React Components
│   ├── ui/                     # Base UI components (Shadcn)
│   ├── layout/                 # Layout components
│   ├── charts/                 # Chart components
│   ├── notifications/          # Notification components
│   ├── payouts/                # Payout-specific components
│   ├── profiles/               # Profile-specific components
│   └── providers/              # Context providers
├── lib/                        # Utilities and configurations
│   ├── auth/                   # Auth configuration
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Utility functions
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/                     # Static assets
├── types/                      # TypeScript type definitions
├── hooks/                      # Custom React hooks
└── middleware.ts              # Next.js middleware
```

## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register        # User registration
POST   /api/auth/signin          # User sign in
POST   /api/auth/signout         # User sign out
```

### Member Management
```
GET    /api/members              # Get all members
POST   /api/members              # Create new member
GET    /api/members/[id]         # Get specific member
PUT    /api/members/[id]         # Update member
DELETE /api/members/[id]         # Delete member
```

### Financial Management
```
# Contributions
GET    /api/contributions        # Get contributions
POST   /api/contributions        # Create contribution
PUT    /api/contributions/[id]   # Update contribution

# Loans
GET    /api/loans               # Get loans
POST   /api/loans               # Create loan application
PUT    /api/loans/[id]          # Update loan
GET    /api/loans/[id]/payments # Get loan payments

# Savings
GET    /api/savings             # Get savings accounts
POST   /api/savings             # Create savings account
GET    /api/savings/transactions # Get savings transactions
```

### Payout System
```
GET    /api/payouts                    # Get all payouts
POST   /api/payouts                    # Create payout request
GET    /api/payouts/[id]               # Get specific payout
PUT    /api/payouts/[id]               # Update payout (approve/reject)
DELETE /api/payouts/[id]               # Delete payout
GET    /api/payouts/templates          # Get payout templates
POST   /api/payouts/templates          # Create payout template
```

### Profile Management
```
GET    /api/profiles/[memberId]                    # Get member profile
PUT    /api/profiles/[memberId]                    # Update profile
GET    /api/profiles/[memberId]/documents          # Get documents
POST   /api/profiles/[memberId]/documents         # Upload document
PUT    /api/profiles/[memberId]/documents/[id]    # Update document
DELETE /api/profiles/[memberId]/documents/[id]    # Delete document
```

### Reports
```
GET    /api/reports/financial-summary   # Financial summary
GET    /api/reports/member-summary      # Member summary
GET    /api/reports/monthly            # Monthly reports
GET    /api/reports/transactions       # Transaction reports
```

### Streak System
```
GET    /api/streaks                    # Get user streaks and stats
POST   /api/streaks                    # Record streak activity
GET    /api/streaks/leaderboard        # Get leaderboard rankings
GET    /api/streaks/achievements       # Get user achievements
POST   /api/streaks/achievements       # Unlock achievement
```

## 🔐 Authentication & Authorization

### User Roles
- **ADMIN**: Full system access, user management, system configuration
- **MANAGER**: Member management, financial operations, reports
- **MEMBER**: Personal profile, contributions, loans, savings

### Access Control
- **Route Protection**: Middleware-based route protection
- **API Security**: Role-based API endpoint protection
- **Component-level**: Conditional rendering based on user roles

### Session Management
- JWT-based sessions with NextAuth.js
- Secure token storage and rotation
- Automatic session refresh

## 🗃️ Database Schema

### Core Models

#### **User & Authentication**
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  username String   @unique
  password String
  role     UserRole @default(MEMBER)
  member   Member?
}
```

#### **Member Management**
```prisma
model Member {
  id          String       @id @default(cuid())
  firstName   String
  lastName    String
  phone       String       @unique
  email       String       @unique
  memberCode  String       @unique
  status      MemberStatus @default(ACTIVE)
  profile     Profile?
  // ... relations
}
```

#### **Enhanced Profiles**
```prisma
model Profile {
  id                    String   @id @default(cuid())
  memberId              String   @unique
  // Personal Information
  gender                Gender?
  maritalStatus         MaritalStatus?
  nationality           String?
  // Professional Information
  employer              String?
  monthlyIncome         Decimal?
  // Emergency Contacts
  emergencyContactName  String?
  emergencyContactPhone String?
  // Banking Information
  bankName              String?
  bankAccountNumber     String?
  bvn                   String?
  // ... more fields
}
```

#### **Payout System**
```prisma
model Payout {
  id              String        @id @default(cuid())
  type            PayoutType
  category        PayoutCategory
  amount          Decimal
  status          PayoutStatus  @default(PENDING)
  paymentMethod   PaymentMethod
  requiresApproval Boolean      @default(true)
  approvalLevel   Int          @default(1)
  approvals       PayoutApproval[]
  // ... more fields
}
```

#### **Streak System**
```prisma
model MemberStreak {
  id            String     @id @default(cuid())
  memberId      String
  type          StreakType
  currentStreak Int        @default(0)
  longestStreak Int        @default(0)
  lastActivity  DateTime?
  totalPoints   Int        @default(0)
  level         Int        @default(1)
  member        Member     @relation(fields: [memberId], references: [id])
  activities    StreakActivity[]
}

model StreakActivity {
  id        String      @id @default(cuid())
  streakId  String
  type      StreakType
  points    Int
  createdAt DateTime    @default(now())
  streak    MemberStreak @relation(fields: [streakId], references: [id])
}

model StreakAchievement {
  id          String          @id @default(cuid())
  memberId    String
  type        AchievementType
  title       String
  description String
  points      Int
  unlockedAt  DateTime        @default(now())
  metadata    Json?
  member      Member          @relation(fields: [memberId], references: [id])
}
```

### Key Relationships
- User → Member (One-to-One)
- Member → Profile (One-to-One)
- Member → Contributions (One-to-Many)
- Member → Loans (One-to-Many)
- Member → Savings (One-to-Many)
- Member → Payouts (One-to-Many)
- Member → MemberStreaks (One-to-Many)
- Member → StreakAchievements (One-to-Many)
- MemberStreak → StreakActivities (One-to-Many)
- Payout → PayoutApprovals (One-to-Many)

## 🎨 UI Components

### Design System
Built with **Shadcn/ui** components providing:
- Consistent design language
- Accessible components
- Dark/light mode support
- Customizable theming

### Key Components
- **Dashboard**: Overview cards, charts, recent activities
- **Data Tables**: Sortable, filterable tables with pagination
- **Forms**: Validated forms with error handling
- **Modals**: Responsive dialogs for actions
- **Navigation**: Sidebar navigation with role-based visibility

### Custom Components
- **PayoutDashboard**: Complete payout management interface
- **ProfileManagement**: Comprehensive profile editor
- **FinancialCharts**: Interactive financial visualizations
- **MemberCards**: Member information display
- **StreakDashboard**: Comprehensive gamification interface with streaks, leaderboards, and achievements

## 🔥 Streak System & Gamification

### Gamification Features
- **Multi-Type Streaks**: Login, Contribution, Savings, and General activity tracking
- **Dynamic Point System**: Configurable points for different activities (Login: 5pts, Contribution: 20pts, Savings: 15pts)
- **Level Progression**: Automatic level calculation based on total earned points
- **Achievement System**: Milestone-based rewards with rich metadata and descriptions
- **Competitive Leaderboards**: Rankings across multiple time periods

### Streak Types
```typescript
enum StreakType {
  LOGIN       // Daily login streak
  CONTRIBUTION // Regular contribution streak  
  SAVINGS     // Savings deposit streak
  GENERAL     // General platform activity
}
```

### Achievement Categories
```typescript
enum AchievementType {
  STREAK_MILESTONE    // Streak length achievements
  POINTS_MILESTONE    // Total points achievements
  ACTIVITY_MILESTONE  // Activity count achievements
  SPECIAL            // Special event achievements
}
```

### Leaderboard Periods
- **Daily**: Today's top performers
- **Weekly**: This week's leaders
- **Monthly**: Monthly champions
- **All Time**: Hall of fame

### Gamification Dashboard
The StreakDashboard provides:
- **Overview Tab**: Personal streak stats, current streaks, total points, and level
- **Leaderboard Tab**: Competitive rankings with user positioning
- **Achievements Tab**: Unlocked and available achievements with progress tracking
- **Mobile Responsive**: Fully optimized for all device sizes with touch-friendly interactions

### Integration Points
Streak activities are automatically tracked for:
- User login sessions
- Contribution submissions
- Savings deposits
- Profile completions
- Financial transactions

## 📱 Mobile Responsiveness

### Responsive Design Features
- **Breakpoint System**: Mobile-first responsive design
  - `sm`: 640px and up
  - `md`: 768px and up
  - `lg`: 1024px and up
  - `xl`: 1280px and up

### Mobile Optimizations
- **Navigation**: Collapsible sidebar with touch-friendly interactions
- **Tables**: Responsive card-based layouts on mobile devices
- **Forms**: Stacked form layouts optimized for mobile input
- **Dialogs**: Full-screen modals with mobile-specific transitions
- **Touch Targets**: Appropriately sized buttons and interactive elements
- **Dashboard Cards**: Mobile-first responsive grid layouts
- **Streak Interface**: Touch-optimized tabbed navigation and progress indicators
- **Profile Management**: Mobile-friendly multi-step forms with persistent progress

### Cross-Device Testing
- Responsive across all device sizes
- Touch-friendly interfaces
- Optimized loading performance
- Progressive Web App features

## 🚀 Deployment

### Platform Options

#### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### **Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production
1. Set up production database
2. Configure environment variables
3. Run database migrations
4. Set up monitoring and logging

## 🧪 Testing

### Test Structure
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing
- **Database Tests**: Schema and migration testing

## 🔍 Monitoring & Analytics

### Logging
- Application logs with structured format
- Error tracking and reporting
- Performance monitoring
- User activity tracking

### Metrics
- Response time monitoring
- Database query performance
- User engagement metrics
- Financial transaction tracking

## 🛡️ Security

### Security Measures
- **Password Security**: bcrypt hashing
- **Session Security**: Secure JWT tokens
- **Data Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: API request limiting

### Best Practices
- Regular security updates
- Environment variable protection
- Secure headers configuration
- Data encryption at rest and in transit

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Convention**: Consistent naming and structure

### Development Guidelines
- Write tests for new features
- Update documentation
- Follow existing code patterns
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

### Contact
- **Project Maintainer**: [Syipmong](https://github.com/Syipmong)
- **Repository**: [https://github.com/Syipmong/adashe](https://github.com/Syipmong/adashe)

---

<div align="center">
  <p>Built with ❤️ for cooperative societies worldwide</p>
  <p>© 2025 Adashe Cooperative Management System</p>
</div>
