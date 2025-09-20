export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Clerk';
  isActive: boolean;
  lastLoginAt?: Date;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  _id: string;
  type: 'Individual' | 'Dealer' | 'Company';
  fullName?: string;
  businessName?: string;
  nicOrPassport?: string;
  companyRegNo?: string;
  phone: string[];
  email?: string;
  address?: string;
  images: FileReference[];
  notes?: string;
  isBlacklisted: boolean;
  riskNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  vin?: string;
  make: string;
  vehicleModel: string;
  year: number;
  engineCapacity?: number;
  color?: string;
  mileage?: number;
  transmission?: 'Manual' | 'Automatic' | 'CVT';
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  bodyType?: string;
  ownershipStatus: 'NotOwned' | 'InStock' | 'Booked' | 'Sold';
  images: ImageReference[];
  documents: DocumentReference[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}

export interface Transaction {
  _id: string;
  vehicleId: string;
  direction: 'IN' | 'OUT';
  counterpartyId: string;
  date: Date;
  location?: string;
  basePrice: number;
  taxes: TaxFee[];
  fees: TaxFee[];
  discount: number;
  totalPrice: number;
  payments: Payment[];
  documents: DocumentReference[];
  notes?: string;
  previousTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}

export interface Expense {
  _id: string;
  vehicleId?: string;
  category: 'Repair' | 'Service' | 'Transport' | 'Commission' | 'Other';
  description: string;
  amount: number;
  date: Date;
  payeeId?: string;
  attachments: DocumentReference[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}

export interface ActivityLog {
  _id: string;
  actorId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT';
  entity: {
    type: 'User' | 'Person' | 'Vehicle' | 'Transaction' | 'Expense';
    id: string;
  };
  diff?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  at: Date;
}

export interface FileReference {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface ImageReference extends FileReference {
  isPrimary?: boolean;
  thumbnailUrl?: string;
}

export interface DocumentReference {
  type: 'Contract' | 'Invoice' | 'Receipt' | 'Registration' | 'Insurance' | 'Other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface TaxFee {
  name: string;
  amount: number;
  percentage?: number;
}

export interface Payment {
  method: 'Cash' | 'Bank Transfer' | 'Check' | 'Card' | 'Other';
  amount: number;
  date: Date;
  reference?: string;
}

export interface ProfitCalculation {
  vehicleId: string;
  cycles: VehicleCycle[];
  totalProfit: number;
  unrealizedValue?: number;
}

export interface VehicleCycle {
  acquisitionTransaction: Transaction;
  saleTransaction?: Transaction;
  expenses: Expense[];
  profit?: number;
  isComplete: boolean;
}

export interface DashboardStats {
  totalBuys: number;
  totalSells: number;
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  inventoryCount: number;
  inventoryValue: number;
}