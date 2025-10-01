# Overview

Currency Business (CyB) is a comprehensive financial services platform built with React, TypeScript, Express, and PostgreSQL. The application provides digital wallet management, currency exchange, international transfers, loan services, and KYC verification. The platform features both client-facing functionality and administrative tools for managing users, verifying documents, and controlling system settings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast builds and HMR
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui design system with "new-york" style preset
- Tailwind CSS for utility-first styling with custom CSS variables for theming
- Dark mode theme with custom color palette (primary: gold/yellow, accent: blue)
- Form handling with React Hook Form and Zod validation

**Application Structure**
- `/client/src/pages/`: Main route components (Landing, Dashboard, Admin, NotFound)
- `/client/src/components/`: Reusable UI components and modals
- `/client/src/components/ui/`: Shadcn UI component library
- Path aliases configured for clean imports (@/, @shared/, @assets/)

## Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- Session-based authentication using express-session
- RESTful API design with route handlers in `/server/routes.ts`
- Middleware for request logging, JSON parsing, and session management

**Database Layer**
- PostgreSQL as the primary database
- Neon serverless PostgreSQL for cloud deployment
- Drizzle ORM for type-safe database operations
- Schema-first approach with migrations in `/migrations/`
- Storage abstraction layer in `/server/storage.ts` for database operations

**Data Model**
- Users with role-based access (client/admin)
- KYC documents with verification status workflow
- Digital wallets supporting multiple providers
- Transactions for deposits, withdrawals, exchanges, and loan operations
- Loans with application, approval, and repayment tracking
- Currency rates for exchange calculations
- System settings for configurable parameters

**Authentication & Authorization**
- Session-based authentication with secure cookies
- Password hashing using bcryptjs
- Role-based access control (client vs admin)
- Protected routes requiring authentication

**File Upload System**
- Multer for multipart/form-data handling
- Local file storage in `/uploads/` directory
- File size limits (5MB) and validation
- Document types: ID cards, selfies, proof of address, salary proof

## External Dependencies

**Email Service**
- Nodemailer for transactional emails
- SMTP configuration for sending verification emails, deposit references, and status notifications
- Email templates for deposit references, KYC status, and loan status updates
- Default SMTP: Gmail (configurable via environment variables)

**Database Service**
- Neon Serverless PostgreSQL
- WebSocket connection support for serverless environments
- Connection pooling for efficient database access
- DATABASE_URL environment variable for connection string

**Third-Party UI Libraries**
- Radix UI: Complete set of accessible component primitives
- Font Awesome: Icon library for visual elements
- Lucide React: Additional icon set
- Google Fonts: Custom typography (DM Sans, Fira Code, Geist Mono)

**Development Tools**
- Replit-specific plugins for development experience:
  - Runtime error modal overlay
  - Cartographer for code navigation
  - Development banner
- TypeScript for static type checking
- ESBuild for production builds

**Payment & Wallet Integrations** (Configured but not directly integrated)
- Support for multiple digital wallet providers:
  - Binance, Wise, PayPal, Redotpay
  - Mastercard Baybit, PYYPL, Myfim
  - AdvCash, Revolut, Jeton
- Angolan bank integrations for local transfers

**Currency Exchange**
- Currency rate management system
- Support for EUR, USD, and KZ (Angolan Kwanza)
- Real-time rate updates via admin panel
- Exchange calculation engine

**Environment Configuration**
- SESSION_SECRET: Session encryption key
- DATABASE_URL: PostgreSQL connection string
- SMTP credentials: Email service configuration
- NODE_ENV: Environment detection (development/production)