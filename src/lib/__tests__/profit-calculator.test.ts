import { ProfitCalculator } from '../profit-calculator';
import { ITransaction, IExpense } from '@/models';
import mongoose from 'mongoose';

const createMockTransaction = (
  direction: 'IN' | 'OUT',
  vehicleId: string,
  totalPrice: number,
  date: Date
): ITransaction => ({
  _id: new mongoose.Types.ObjectId(),
  vehicleId: new mongoose.Types.ObjectId(vehicleId),
  direction,
  counterpartyId: new mongoose.Types.ObjectId(),
  date,
  totalPrice,
  basePrice: totalPrice * 0.9,
  taxes: [{ name: 'VAT', amount: totalPrice * 0.1 }],
  fees: [],
  discount: 0,
  payments: [{ method: 'Cash', amount: totalPrice, date, reference: '' }],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
} as any);

const createMockExpense = (
  vehicleId: string,
  amount: number,
  date: Date,
  category: 'Repair' | 'Service' | 'Transport' | 'Commission' | 'Other' = 'Repair'
): IExpense => ({
  _id: new mongoose.Types.ObjectId(),
  vehicleId: new mongoose.Types.ObjectId(vehicleId),
  category,
  description: 'Test expense',
  amount,
  date,
  attachments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: new mongoose.Types.ObjectId(),
  updatedBy: new mongoose.Types.ObjectId(),
} as any);

describe('ProfitCalculator', () => {
  const vehicleId = '507f1f77bcf86cd799439011';

  describe('calculateVehicleProfit', () => {
    it('should calculate profit for a complete cycle (buy-sell)', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
        createMockTransaction('OUT', vehicleId, 15000, new Date('2024-02-01')),
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2024-01-15')),
      ];

      const result = ProfitCalculator.calculateVehicleProfit(vehicleId, transactions, expenses);

      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].isComplete).toBe(true);
      expect(result.cycles[0].profit).toBe(4500); // 15000 - 10000 - 500
      expect(result.totalProfit).toBe(4500);
      expect(result.unrealizedValue).toBe(0);
    });

    it('should handle incomplete cycles (buy without sell)', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2024-01-15')),
      ];

      const result = ProfitCalculator.calculateVehicleProfit(vehicleId, transactions, expenses);

      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].isComplete).toBe(false);
      expect(result.cycles[0].profit).toBeUndefined();
      expect(result.totalProfit).toBe(0);
      expect(result.unrealizedValue).toBe(10500); // 10000 + 500
    });

    it('should handle multiple cycles', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
        createMockTransaction('OUT', vehicleId, 15000, new Date('2024-02-01')),
        createMockTransaction('IN', vehicleId, 12000, new Date('2024-03-01')),
        createMockTransaction('OUT', vehicleId, 18000, new Date('2024-04-01')),
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2024-01-15')),
        createMockExpense(vehicleId, 700, new Date('2024-03-15')),
      ];

      const result = ProfitCalculator.calculateVehicleProfit(vehicleId, transactions, expenses);

      expect(result.cycles).toHaveLength(2);
      expect(result.cycles[0].profit).toBe(4500); // 15000 - 10000 - 500
      expect(result.cycles[1].profit).toBe(5300); // 18000 - 12000 - 700
      expect(result.totalProfit).toBe(9800);
      expect(result.unrealizedValue).toBe(0);
    });

    it('should only include expenses within cycle dates', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
        createMockTransaction('OUT', vehicleId, 15000, new Date('2024-02-01')),
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2023-12-15')), // Before cycle
        createMockExpense(vehicleId, 300, new Date('2024-01-15')), // During cycle
        createMockExpense(vehicleId, 200, new Date('2024-02-15')), // After cycle
      ];

      const result = ProfitCalculator.calculateVehicleProfit(vehicleId, transactions, expenses);

      expect(result.cycles[0].expenses).toHaveLength(1);
      expect(result.cycles[0].expenses[0].amount).toBe(300);
      expect(result.cycles[0].profit).toBe(4700); // 15000 - 10000 - 300
    });
  });

  describe('calculatePeriodProfit', () => {
    it('should calculate profit for a specific period', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
        createMockTransaction('OUT', vehicleId, 15000, new Date('2024-01-15')),
        createMockTransaction('IN', vehicleId, 12000, new Date('2024-02-01')), // Outside period
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2024-01-10')),
        createMockExpense(vehicleId, 300, new Date('2024-02-10')), // Outside period
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = ProfitCalculator.calculatePeriodProfit(
        transactions,
        expenses,
        startDate,
        endDate
      );

      expect(result.revenue).toBe(15000);
      expect(result.costs).toBe(10000);
      expect(result.expenses).toBe(500);
      expect(result.netProfit).toBe(4500);
      expect(result.transactionCount.in).toBe(1);
      expect(result.transactionCount.out).toBe(1);
    });
  });

  describe('calculateInventoryValue', () => {
    it('should calculate inventory value for owned vehicles', () => {
      const transactions = [
        createMockTransaction('IN', vehicleId, 10000, new Date('2024-01-01')),
        createMockTransaction('IN', 'another-vehicle-id', 15000, new Date('2024-01-02')),
        createMockTransaction('OUT', vehicleId, 12000, new Date('2024-01-15')), // Sold
      ];

      const expenses = [
        createMockExpense(vehicleId, 500, new Date('2024-01-10')), // Should not count (vehicle sold)
        createMockExpense('another-vehicle-id', 800, new Date('2024-01-10')), // Should count
      ];

      const result = ProfitCalculator.calculateInventoryValue(transactions, expenses);

      expect(result.vehicleCount).toBe(1);
      expect(result.totalValue).toBe(15800); // 15000 + 800
      expect(result.details).toHaveLength(1);
      expect(result.details[0].vehicleId).toBe('another-vehicle-id');
      expect(result.details[0].totalValue).toBe(15800);
    });
  });
});