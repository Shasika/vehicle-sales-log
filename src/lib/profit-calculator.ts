import { ITransaction, IExpense } from '@/models';
import { VehicleCycle, ProfitCalculation } from '@/types';

export interface TransactionWithExpenses extends ITransaction {
  expenses?: IExpense[];
}

export class ProfitCalculator {
  static calculateVehicleProfit(
    vehicleId: string,
    transactions: ITransaction[],
    expenses: IExpense[]
  ): ProfitCalculation {
    const vehicleTransactions = transactions
      .filter(t => t.vehicleId.toString() === vehicleId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const vehicleExpenses = expenses.filter(e => 
      e.vehicleId?.toString() === vehicleId
    );

    const cycles = this.buildCycles(vehicleTransactions, vehicleExpenses);
    const totalProfit = cycles
      .filter(cycle => cycle.isComplete)
      .reduce((sum, cycle) => sum + (cycle.profit || 0), 0);

    const unrealizedValue = this.calculateUnrealizedValue(cycles);

    return {
      vehicleId,
      cycles,
      totalProfit,
      unrealizedValue,
    };
  }

  private static buildCycles(
    transactions: ITransaction[],
    expenses: IExpense[]
  ): VehicleCycle[] {
    const cycles: VehicleCycle[] = [];
    let currentCycle: Partial<VehicleCycle> | null = null;

    for (const transaction of transactions) {
      if (transaction.direction === 'IN') {
        if (currentCycle && !currentCycle.saleTransaction) {
          cycles.push({
            acquisitionTransaction: currentCycle.acquisitionTransaction!,
            expenses: currentCycle.expenses || [],
            isComplete: false,
          });
        }

        currentCycle = {
          acquisitionTransaction: transaction as any,
          expenses: [],
          isComplete: false,
        };
      } else if (transaction.direction === 'OUT' && currentCycle) {
        const cycleExpenses = this.getExpensesForCycle(
          expenses,
          currentCycle.acquisitionTransaction!,
          transaction
        );

        const profit = this.calculateCycleProfit(
          currentCycle.acquisitionTransaction!,
          transaction,
          cycleExpenses
        );

        cycles.push({
          acquisitionTransaction: currentCycle.acquisitionTransaction! as any,
          saleTransaction: transaction as any,
          expenses: cycleExpenses as any,
          profit,
          isComplete: true,
        });

        currentCycle = null;
      }
    }

    if (currentCycle && !currentCycle.saleTransaction) {
      const cycleExpenses = this.getExpensesForCycle(
        expenses,
        currentCycle.acquisitionTransaction!
      );

      cycles.push({
        acquisitionTransaction: currentCycle.acquisitionTransaction! as any,
        expenses: cycleExpenses as any,
        isComplete: false,
      });
    }

    return cycles;
  }

  private static getExpensesForCycle(
    expenses: IExpense[],
    acquisitionTransaction: any,
    saleTransaction?: any
  ): IExpense[] {
    const startDate = new Date(acquisitionTransaction.date);
    const endDate = saleTransaction ? new Date(saleTransaction.date) : new Date();

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  private static calculateCycleProfit(
    acquisitionTransaction: any,
    saleTransaction: any,
    expenses: IExpense[]
  ): number {
    const revenue = saleTransaction.totalPrice;
    const cost = acquisitionTransaction.totalPrice;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return revenue - cost - totalExpenses;
  }

  private static calculateUnrealizedValue(cycles: VehicleCycle[]): number {
    const incompleteCycles = cycles.filter(cycle => !cycle.isComplete);
    
    return incompleteCycles.reduce((sum, cycle) => {
      const cost = cycle.acquisitionTransaction.totalPrice;
      const expenses = cycle.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return sum + cost + expenses;
    }, 0);
  }

  static calculatePortfolioProfit(
    vehicles: string[],
    transactions: ITransaction[],
    expenses: IExpense[]
  ): {
    totalProfit: number;
    totalUnrealizedValue: number;
    vehicleProfits: ProfitCalculation[];
  } {
    const vehicleProfits = vehicles.map(vehicleId =>
      this.calculateVehicleProfit(vehicleId, transactions, expenses)
    );

    const totalProfit = vehicleProfits.reduce(
      (sum, vp) => sum + vp.totalProfit, 0
    );

    const totalUnrealizedValue = vehicleProfits.reduce(
      (sum, vp) => sum + (vp.unrealizedValue || 0), 0
    );

    return {
      totalProfit,
      totalUnrealizedValue,
      vehicleProfits,
    };
  }

  static calculatePeriodProfit(
    transactions: ITransaction[],
    expenses: IExpense[],
    startDate: Date,
    endDate: Date
  ): {
    revenue: number;
    costs: number;
    expenses: number;
    netProfit: number;
    transactionCount: { in: number; out: number };
  } {
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const periodExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate >= startDate && eDate <= endDate;
    });

    const inTransactions = periodTransactions.filter(t => t.direction === 'IN');
    const outTransactions = periodTransactions.filter(t => t.direction === 'OUT');

    const revenue = outTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
    const costs = inTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
    const expenseTotal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue,
      costs,
      expenses: expenseTotal,
      netProfit: revenue - costs - expenseTotal,
      transactionCount: {
        in: inTransactions.length,
        out: outTransactions.length,
      },
    };
  }

  static calculateInventoryValue(
    transactions: ITransaction[],
    expenses: IExpense[]
  ): {
    totalValue: number;
    vehicleCount: number;
    details: Array<{
      vehicleId: string;
      acquisitionCost: number;
      expenses: number;
      totalValue: number;
    }>;
  } {
    const vehicleMap = new Map<string, {
      acquisitionCost: number;
      expenses: number;
      isOwned: boolean;
    }>();

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const transaction of sortedTransactions) {
      const vehicleId = transaction.vehicleId.toString();
      
      if (transaction.direction === 'IN') {
        vehicleMap.set(vehicleId, {
          acquisitionCost: transaction.totalPrice,
          expenses: 0,
          isOwned: true,
        });
      } else if (transaction.direction === 'OUT') {
        const vehicle = vehicleMap.get(vehicleId);
        if (vehicle) {
          vehicle.isOwned = false;
        }
      }
    }

    for (const expense of expenses) {
      if (expense.vehicleId) {
        const vehicleId = expense.vehicleId.toString();
        const vehicle = vehicleMap.get(vehicleId);
        if (vehicle && vehicle.isOwned) {
          vehicle.expenses += expense.amount;
        }
      }
    }

    const ownedVehicles = Array.from(vehicleMap.entries())
      .filter(([, vehicle]) => vehicle.isOwned)
      .map(([vehicleId, vehicle]) => ({
        vehicleId,
        acquisitionCost: vehicle.acquisitionCost,
        expenses: vehicle.expenses,
        totalValue: vehicle.acquisitionCost + vehicle.expenses,
      }));

    return {
      totalValue: ownedVehicles.reduce((sum, v) => sum + v.totalValue, 0),
      vehicleCount: ownedVehicles.length,
      details: ownedVehicles,
    };
  }
}