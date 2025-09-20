# 🚗 Vehicle Sales Log App

A comprehensive, production-ready web application designed for used-vehicle buy/sell businesses to track complete transaction history, documents, images, and finances with real-time profit analysis.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.8.4-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📱 Mobile Features](#-mobile-features)
- [🏗️ Architecture](#-architecture)
- [📊 Business Logic](#-business-logic)
- [🔧 Development](#-development)
- [📚 Documentation](#-documentation)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🌟 Features

### 🚗 Comprehensive Vehicle Management
- **Complete Vehicle Registry**: Store detailed metadata, multiple images, and documents
- **VIN & Registration Tracking**: Unique identification with search capabilities
- **Smart Ownership Status**: Dynamic status management (NotOwned, InStock, Booked, Sold)
- **Timeline View**: Visual transaction history and profit cycle tracking
- **Advanced Search**: Filter by registration number, VIN, make, model, year, and status
- **Image Gallery**: Multiple high-quality images with thumbnail generation

### 💰 Advanced Transaction System
- **Contextual Recording**: Smart UI that shows "Record Acquisition" or "Record Sale" based on vehicle status
- **Automated Profit Calculation**: Real-time profit analysis for complete buy-sell cycles
- **Payment Methods**: Support for cash, check, bank transfer, and installment plans
- **Tax & Fee Management**: Customizable breakdown of additional costs
- **Document Attachments**: Upload contracts, receipts, and legal documents
- **Transaction Timeline**: Complete audit trail of all vehicle-related transactions

### 👥 Customer Relationship Management
- **Multi-Entity Support**: Handle individuals, dealers, and companies
- **KYC Information**: Store detailed customer information and risk assessment
- **Contact Management**: Multiple phone numbers, addresses, and communication preferences
- **Transaction History**: Complete customer transaction timeline
- **Blacklist Functionality**: Flag problematic customers with notes
- **Customer Analytics**: Track customer lifetime value and transaction patterns

### 📊 Financial Intelligence & Reporting
- **Real-Time P&L**: Live profit/loss calculations with drill-down capabilities
- **Inventory Valuation**: Current market value of stock with depreciation tracking
- **Advanced Reports**: Monthly, quarterly, and yearly financial analysis
- **Expense Management**: Categorized expense tracking with vehicle association
- **Export Capabilities**: CSV, Excel, and PDF report generation
- **Dashboard Analytics**: Visual charts and KPIs for business insights

### 🔒 Enterprise Security & Access Control
- **Role-Based Permissions**: Admin, Manager, and Clerk roles with granular permissions
- **Secure Authentication**: NextAuth.js with bcrypt password hashing
- **Activity Logging**: Comprehensive audit trail for all system changes
- **Session Management**: Secure session handling with automatic timeouts
- **Data Validation**: Input sanitization and validation at all levels
- **CSRF Protection**: Built-in protection against cross-site request forgery

### 📱 Mobile-First Experience
- **Responsive Design**: Optimized for all screen sizes from mobile to desktop
- **Touch-Friendly Interface**: Large tap targets and gesture-friendly navigation
- **Progressive Web App**: App-like experience with offline capabilities
- **Smart Modals**: Mobile-optimized popup dialogs with proper scrolling
- **Adaptive Dropdowns**: Smart positioning based on screen space
- **Mobile Navigation**: Intuitive bottom navigation bar for mobile users

## 🛠️ Tech Stack

### Frontend Architecture
- **Next.js 15.5.3** - React framework with App Router for modern development
- **React 18** - Latest React with Concurrent Features and TypeScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework with custom design system
- **Headless UI** - Unstyled, accessible UI components
- **React Hook Form** - Performant forms with minimal re-renders
- **SWR** - Data fetching with caching, revalidation, and real-time updates
- **Lucide React** - Beautiful, customizable icons

### Backend & Database
- **Next.js API Routes** - Server-side API with TypeScript support
- **MongoDB 8.8.4** - NoSQL database with Mongoose ODM for data modeling
- **NextAuth.js** - Complete authentication solution with multiple providers
- **Sharp** - High-performance image processing and optimization
- **Multer** - Secure file upload handling with validation

### Development Tools & Quality
- **TypeScript 5.0** - Full type safety across the entire application
- **ESLint & Prettier** - Code quality and consistent formatting
- **Husky & lint-staged** - Git hooks for quality assurance
- **Jest & Testing Library** - Comprehensive unit and integration testing
- **Playwright** - End-to-end testing across multiple browsers

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicle-sales-log-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/vehicle-sales-log

   # Authentication (generate a secure 32+ character secret)
   NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
   NEXTAUTH_URL=http://localhost:3000

   # File Upload Settings
   UPLOAD_DIR=./public/uploads
   MAX_FILE_SIZE=10485760  # 10MB in bytes
   ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

   # Application Settings
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # For local MongoDB
   mongod

   # For MongoDB Atlas, ensure your connection string is correct in .env
   ```

5. **Initialize with Demo Data** (Recommended)
   ```bash
   npm run seed
   ```

   This creates sample data and user accounts:
   - **Admin**: admin@example.com / password123
   - **Manager**: manager@example.com / password123
   - **Clerk**: clerk@example.com / password123

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Mobile Features

### Responsive Design Excellence
- **Mobile-First Architecture**: Designed primarily for mobile with desktop enhancements
- **Touch Optimization**: Large buttons, swipe gestures, and touch-friendly interactions
- **Smart Modal System**: Full-screen modals on mobile with proper scroll handling
- **Adaptive Navigation**: Bottom navigation bar on mobile, sidebar on desktop
- **Intelligent Dropdowns**: Auto-positioning based on screen space and keyboard presence

### Mobile-Specific Optimizations
- **iOS Safari Compatibility**: Proper viewport handling and address bar adjustments
- **Android Optimization**: Keyboard handling and back button integration
- **Performance**: Optimized images, lazy loading, and minimal JavaScript bundle
- **Offline Support**: Service worker for basic offline functionality
- **App-Like Experience**: PWA capabilities with home screen installation

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login/register)
│   ├── api/               # API routes and endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── vehicles/      # Vehicle CRUD operations
│   │   ├── transactions/  # Transaction management
│   │   ├── persons/       # Customer management
│   │   ├── expenses/      # Expense tracking
│   │   ├── reports/       # Financial reporting
│   │   └── upload/        # File upload handling
│   ├── vehicles/          # Vehicle management pages
│   ├── transactions/      # Transaction pages
│   ├── persons/          # Customer management pages
│   ├── expenses/         # Expense management pages
│   ├── reports/          # Reporting and analytics
│   ├── globals.css       # Global styles and Tailwind imports
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Dashboard home page
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (buttons, inputs, modals)
│   ├── layout/           # Layout components (navigation, headers)
│   ├── dashboard/        # Dashboard-specific components
│   ├── vehicles/         # Vehicle-related components
│   ├── transactions/     # Transaction components
│   ├── persons/          # Customer management components
│   └── forms/            # Form components and validation
├── lib/                  # Utility libraries and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── mongodb.ts       # Database connection and utilities
│   ├── profit-calculator.ts # Business logic for profit calculations
│   ├── validations.ts   # Zod schemas for data validation
│   ├── utils.ts         # General utility functions
│   └── alerts.ts        # SweetAlert2 configurations
├── models/               # Mongoose data models
│   ├── User.ts          # User authentication model
│   ├── Vehicle.ts       # Vehicle information model
│   ├── Transaction.ts   # Transaction records model
│   ├── Person.ts        # Customer/contact model
│   ├── Expense.ts       # Business expense model
│   └── ActivityLog.ts   # Audit trail model
├── types/                # TypeScript type definitions
│   ├── vehicle.ts       # Vehicle-related types
│   ├── transaction.ts   # Transaction types
│   ├── person.ts        # Customer types
│   └── index.ts         # Shared types
└── hooks/                # Custom React hooks
    ├── useVehicles.ts   # Vehicle data fetching
    ├── useTransactions.ts # Transaction management
    └── useAuth.ts       # Authentication state
```

### Database Schema Design

#### Core Collections
- **Users**: Role-based authentication with security features
- **Vehicles**: Complete vehicle information with status tracking
- **Transactions**: Buy/sell records with profit calculations
- **Persons**: Customer and contact management
- **Expenses**: Business expense tracking with categorization
- **ActivityLog**: Comprehensive audit trail

#### Optimized Indexing
- Vehicle registration numbers (unique, searchable)
- Transaction dates and amounts (range queries)
- Person names and contact information (text search)
- Compound indexes for complex queries
- Geographic indexes for location-based features

## 📊 Business Logic

### Intelligent Profit Calculation System
The application implements sophisticated profit tracking using complete transaction cycles:

1. **Acquisition Phase**: Vehicle purchase creates an "IN" transaction
2. **Expense Accumulation**: All expenses between acquisition and sale are tracked
3. **Sale Completion**: Vehicle sale creates an "OUT" transaction
4. **Profit Calculation**: Automated calculation considering all associated costs

```
Profit = Sale Price - Acquisition Cost - Associated Expenses - Taxes - Fees
```

### Contextual User Interface
- **Smart Action Buttons**: UI adapts based on vehicle ownership status
- **Guided Workflows**: Step-by-step processes for complex operations
- **Validation Rules**: Business logic enforcement at the UI level
- **Audit Trail**: Complete change tracking for compliance

### File Management System
- **Organized Storage**: Files categorized by entity type and date
- **Security**: Protected file serving with authentication
- **Image Processing**: Automatic thumbnail generation and optimization
- **Cleanup**: Automated removal of orphaned files

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build production-ready application
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run typecheck    # TypeScript type checking

# Database Management
npm run seed         # Populate database with sample data

# Testing
npm run test         # Run Jest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright end-to-end tests

# Code Quality
npm run prepare      # Set up Git hooks
```

### Development Guidelines

#### Code Standards
- **TypeScript First**: All new code must be written in TypeScript
- **Component Patterns**: Follow established component structure and naming
- **Error Handling**: Implement comprehensive error boundaries and validation
- **Performance**: Use React.memo, useMemo, and useCallback appropriately
- **Accessibility**: Ensure WCAG 2.1 AA compliance

#### Testing Strategy
- **Unit Tests**: Cover all business logic and utility functions
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Verify critical user journeys and workflows
- **Visual Testing**: Ensure UI consistency across devices

#### Git Workflow
- **Conventional Commits**: Use semantic commit messages
- **Feature Branches**: Develop features in isolated branches
- **Code Review**: All changes require review before merging
- **Pre-commit Hooks**: Automated linting and testing

## 📚 Documentation

### API Documentation
Comprehensive API documentation is available covering:
- Authentication endpoints and security
- Vehicle management operations
- Transaction recording and retrieval
- Customer management features
- Financial reporting endpoints
- File upload and management

### Component Library
Detailed documentation of all UI components:
- Usage examples and props
- Accessibility features
- Mobile responsiveness
- Theming and customization

### Business Process Documentation
- Vehicle acquisition workflow
- Sales process management
- Financial reporting procedures
- User role management
- Data backup and recovery

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production
   NEXTAUTH_SECRET=production-secret-key-minimum-32-characters
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm run start
   ```

3. **File Storage Configuration**
   - Ensure write permissions for uploads directory
   - Set up regular backups of uploads folder
   - Configure log rotation and monitoring
   - Implement health checks for file system

### Performance Optimization
- **Database Indexing**: Optimized for common query patterns
- **Image Optimization**: Automatic compression and WebP conversion
- **CDN Integration**: Ready for static asset delivery
- **Caching Strategy**: Multiple levels of caching for optimal performance

### Monitoring & Maintenance
- **Error Tracking**: Integration-ready for error monitoring services
- **Performance Monitoring**: Built-in metrics and logging
- **Health Checks**: Endpoint monitoring and alerting
- **Backup Strategy**: Automated database and file backups

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add comprehensive tests for new functionality
5. Update documentation as needed
6. Run the full test suite (`npm run test && npm run test:e2e`)
7. Commit with conventional commit format
8. Push to your branch and create a Pull Request

### Development Standards
- **Code Quality**: Maintain high code quality with TypeScript and ESLint
- **Testing**: Include unit and integration tests for new features
- **Documentation**: Update relevant documentation for any changes
- **Performance**: Consider performance implications of changes
- **Security**: Follow security best practices for all code

### Issue Reporting
When reporting issues, please include:
- Detailed description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots or videos if applicable
- Environment information (browser, OS, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Help

### Getting Help
- **Documentation**: Check this README and the user manual
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions and ideas

### Troubleshooting
Common issues and solutions are documented in the [User Manual](USER_MANUAL.md).

### Community
Join our community for support, feature requests, and general discussion about the Vehicle Sales Log App.

---

**Built with ❤️ for vehicle dealers worldwide**

*This application is designed for single-server deployment with local file storage. For enterprise deployments requiring multiple servers or cloud storage, please refer to the deployment documentation for cloud integration options.*