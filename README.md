# Vehicle Sales Log App

A production-ready web application for used-vehicle buy/sell businesses to track complete transaction history, documents, images, and finances.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.8.4-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)

## Features

### 🚗 Vehicle Management
- Complete vehicle registry with metadata, images, and documents
- VIN and registration number tracking
- Ownership status management (NotOwned, InStock, Booked, Sold)
- Vehicle search by registration number and VIN
- Timeline view showing transaction history and profit cycles

### 💰 Transaction Tracking
- Contextual transaction recording (acquisition/sale based on vehicle status)
- Automated profit calculation for complete cycles
- Support for multiple payment methods and installments
- Tax and fee tracking with customizable breakdowns
- Document attachment and management

### 👥 Customer Management
- Support for individuals, dealers, and companies
- KYC information and risk assessment
- Contact management with multiple phone numbers
- Transaction history per customer
- Blacklist functionality

### 📊 Financial Reporting
- Real-time profit/loss calculations
- Inventory valuation
- Monthly/quarterly/yearly P&L reports
- Expense categorization and tracking
- CSV/Excel export functionality

### 🔒 Security & Access Control
- Role-based access control (Admin, Manager, Clerk)
- Secure authentication with NextAuth
- Activity logging and audit trails
- CSRF protection and input validation

### 📱 Mobile-First Design
- Responsive design that works on all devices
- Touch-friendly interface
- Optimized for mobile data usage
- Progressive Web App capabilities

## Tech Stack

### Frontend
- **Next.js 15.5.3** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **SWR** for data fetching and caching
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (Route Handlers)
- **MongoDB** with Mongoose ODM
- **NextAuth** for authentication
- **bcryptjs** for password hashing
- **Sharp** for image processing

### Development Tools
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Husky** and **lint-staged** for pre-commit hooks
- **Jest** and **Testing Library** for unit tests
- **Playwright** for end-to-end tests

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vehicle-sales-log
   
   # NextAuth (generate a secure secret)
   NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
   NEXTAUTH_URL=http://localhost:3000
   
   # File Uploads
   UPLOAD_DIR=./public/uploads
   MAX_FILE_SIZE=10485760
   
   # Other settings...
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```
   
   This creates demo data with the following login credentials:
   - **Admin**: admin@example.com / password123
   - **Manager**: manager@example.com / password123  
   - **Clerk**: clerk@example.com / password123

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## File Upload Configuration

This application uses **local file storage only** for documents and images. Files are stored in the `/public/uploads` directory with the following structure:

```
public/uploads/
├── vehicles/
│   ├── 2024/
│   │   ├── 01/
│   │   └── 02/
├── persons/
├── deals/
└── expenses/
```

### Upload Features
- Automatic thumbnail generation for images
- Secure file serving with authentication checks
- Support for PDF, DOCX, and image files
- File size limits and type validation
- Orphaned file cleanup

## Database Schema

### Core Entities
- **Users**: Admin, Manager, Clerk roles with secure authentication
- **Persons**: Customers, dealers, companies with KYC information
- **Vehicles**: Complete vehicle registry with ownership tracking
- **Transactions**: Buy/sell records with payment details
- **Expenses**: Business expenses with categorization
- **ActivityLog**: Audit trail for all system changes

### Key Indexes
- Vehicle registration numbers (unique)
- Transaction dates and directions
- Person names and contact information
- Text search on vehicle make/model
- Compound indexes for performance

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Vehicles
- `GET /api/vehicles` - List vehicles with filtering
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PATCH /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Soft delete vehicle

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get transaction details

### Reports
- `GET /api/reports/profit-per-vehicle` - Profit analysis
- `GET /api/reports/pnl` - P&L reports by period
- `GET /api/reports/expenses` - Expense breakdowns

### File Management
- `POST /api/upload` - Upload files
- `DELETE /api/upload` - Delete files
- `GET /api/files/[...path]` - Serve protected files

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run seed         # Populate with demo data

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright E2E tests
```

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── dashboard/         # Dashboard components
│   └── forms/             # Form components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── mongodb.ts         # Database connection
│   ├── profit-calculator.ts # Business logic
│   └── validations.ts     # Zod schemas
├── models/                # Mongoose models
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks
```

### Key Design Patterns

#### Contextual Actions
The app uses contextual UI patterns instead of explicit buy/sell toggles:
- **NotOwned vehicles**: Show "Record Acquisition" button
- **InStock vehicles**: Show "Record Sale" button
- Global quick actions provide large tiles for "We acquired" vs "We sold"

#### Profit Calculation
Vehicle profit is calculated using complete cycles:
1. **Acquisition** (IN transaction) starts a cycle
2. **Expenses** between IN and OUT dates are included
3. **Sale** (OUT transaction) completes the cycle
4. **Profit** = Sale Price - Acquisition Cost - Cycle Expenses

#### File Management
Local file storage with security:
- Files organized by entity type and date
- Thumbnail generation for images
- Protected serving through API routes
- Automatic cleanup of orphaned files

## Testing

### Unit Tests
```bash
npm run test
```
Tests cover core business logic, especially profit calculations and data validation.

### E2E Tests
```bash
npm run test:e2e
```
Playwright tests verify critical user journeys across different browsers.

### Test Structure
```
tests/
├── unit/                  # Jest unit tests
│   └── lib/               # Business logic tests
└── e2e/                   # Playwright E2E tests
    ├── auth.spec.ts       # Authentication flows
    ├── vehicles.spec.ts   # Vehicle management
    └── transactions.spec.ts # Transaction recording
```

## Deployment

### Environment Variables
Ensure these are set in production:
```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-url>
NEXTAUTH_SECRET=<secure-random-string>
NEXTAUTH_URL=<production-domain>
```

### Build Steps
```bash
npm run build
npm run start
```

### File Storage Setup
1. Ensure `/public/uploads` directory exists with write permissions
2. Set up regular backups of the uploads directory
3. Configure log rotation for application logs
4. Set up monitoring for disk space usage

### Performance Considerations
- MongoDB indexes are optimized for common queries
- Images are automatically compressed and thumbnailed
- API responses use pagination for large datasets
- Client-side caching with SWR reduces server load

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test && npm run test:e2e`)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing component patterns
- Add tests for new business logic
- Update documentation for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

**Note**: This application is designed for single-server deployment with local file storage. For multi-server or cloud deployment, consider implementing cloud storage integration for the file service.