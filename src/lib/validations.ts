import { z } from 'zod';

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1).max(20),
  vin: z.string().max(17).optional(),
  make: z.string().min(1).max(50),
  vehicleModel: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  engineCapacity: z.number().positive().optional(),
  color: z.string().max(30).optional(),
  mileage: z.number().min(0).optional(),
  transmission: z.enum(['Manual', 'Automatic', 'CVT']).optional(),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']).optional(),
  bodyType: z.string().max(50).optional(),
  ownershipStatus: z.enum(['NotOwned', 'InStock', 'Booked', 'Sold']).optional(),
  tags: z.array(z.string().max(50)).default([]),
  images: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    isPrimary: z.boolean().optional(),
    thumbnailUrl: z.string().optional(),
    uploadedAt: z.coerce.date(),
  })).default([]),
  documents: z.array(z.object({
    type: z.enum(['Contract', 'Invoice', 'Receipt', 'Registration', 'Insurance', 'Other']),
    url: z.string(),
    filename: z.string(),
    uploadedAt: z.coerce.date(),
  })).default([]),
});

export const personSchema = z.object({
  type: z.enum(['Individual', 'Dealer', 'Company']),
  fullName: z.string().max(200).optional(),
  businessName: z.string().max(200).optional(),
  nicOrPassport: z.string().optional(),
  companyRegNo: z.string().optional(),
  phone: z.array(z.string()).min(1),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isBlacklisted: z.boolean().default(false),
  riskNotes: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.type === 'Individual') {
      return !!data.fullName;
    } else {
      return !!data.businessName;
    }
  },
  {
    message: 'Full name required for individuals, business name for dealers/companies',
    path: ['fullName'],
  }
);

export const transactionSchema = z.object({
  vehicleId: z.string().min(1),
  direction: z.enum(['IN', 'OUT']),
  counterpartyId: z.string().min(1),
  date: z.coerce.date(),
  location: z.string().max(200).optional(),
  basePrice: z.number().min(0),
  taxes: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
  })).default([]),
  fees: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
  })).default([]),
  discount: z.number().min(0).default(0),
  payments: z.array(z.object({
    method: z.enum(['Cash', 'Bank Transfer', 'Check', 'Card', 'Other']),
    amount: z.number().min(0),
    date: z.coerce.date(),
    reference: z.string().optional(),
  })).default([]),
  notes: z.string().max(1000).optional(),
});

export const expenseSchema = z.object({
  vehicleId: z.string().optional(),
  category: z.enum(['Repair', 'Service', 'Transport', 'Commission', 'Other']),
  description: z.string().min(1).max(500),
  amount: z.number().min(0),
  date: z.coerce.date(),
  payeeId: z.string().optional(),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const vehicleSearchSchema = searchSchema.extend({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
  status: z.string().optional().transform((val) => {
    if (!val) return undefined;
    if (val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(s => ['NotOwned', 'InStock', 'Booked', 'Sold'].includes(s));
    }
    return ['NotOwned', 'InStock', 'Booked', 'Sold'].includes(val) ? [val] : undefined;
  }),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
});

export const transactionSearchSchema = searchSchema.extend({
  vehicleId: z.string().optional(),
  direction: z.enum(['IN', 'OUT']).optional(),
  counterpartyId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  populate: z.string().default(''),
});

export const expenseSearchSchema = searchSchema.extend({
  vehicleId: z.string().optional(),
  category: z.enum(['Repair', 'Service', 'Transport', 'Commission', 'Other']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});