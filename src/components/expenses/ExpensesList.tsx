'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import { Receipt, Car, User, Calendar, DollarSign, Edit, Trash2, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import Pagination from '@/components/ui/Pagination';
import ExpenseModal from './ExpenseModal';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';
import { formatCurrencyWithRs } from '@/lib/currency';

interface Expense {
  id: string;
  _id?: string;
  vehicleId?: {
    id: string;
    registrationNumber: string;
    make: string;
    vehicleModel: string;
  };
  category: 'Repair' | 'Service' | 'Transport' | 'Commission' | 'Other';
  description: string;
  amount: number;
  date: string;
  payeeId?: {
    id: string;
    fullName?: string;
    businessName?: string;
    type: string;
  };
  attachments: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  createdAt: string;
}

const categoryColors = {
  'Repair': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Service': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Transport': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Commission': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
};

export interface ExpensesListRef {
  refreshExpenses: () => void;
}

const ExpensesList = forwardRef<ExpensesListRef>((props, ref) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, itemsPerPage, filter, sortBy]);

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refreshExpenses: () => {
      fetchExpenses();
    }
  }));

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        populate: 'vehicleId,payeeId',
      });

      // Add filters to query
      if (filter !== 'all') {
        params.append('category', filter);
      }

      // Add sorting
      if (sortBy === 'date') {
        params.append('sortBy', 'date');
        params.append('sortOrder', 'desc');
      } else if (sortBy === 'amount') {
        params.append('sortBy', 'amount');
        params.append('sortOrder', 'desc');
      } else if (sortBy === 'category') {
        params.append('sortBy', 'category');
        params.append('sortOrder', 'asc');
      }

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        const pagination = result.pagination || {};

        setExpenses(Array.isArray(data) ? data : []);
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.totalPages || 0);
      } else {
        console.error('Failed to fetch expenses:', response.statusText);
        setExpenses([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  // Use expenses directly since filtering and sorting is done server-side
  const filteredExpenses = Array.isArray(expenses) ? expenses : [];

  const handleDelete = async (id: string, description: string) => {
    const result = await confirmDelete(description, 'expense');

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await showDeleteSuccess('Expense');
        setExpenses(expenses.filter(e => (e.id || e._id) !== id));
      } else {
        await showDeleteError('expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      await showDeleteError('expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditExpense(null);
    fetchExpenses(); // Refresh the list
  };


  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="min-w-[160px]">
                <ResponsiveSelect
                  placeholder="All Categories"
                  options={[
                    { value: 'all', label: 'All Categories' },
                    { value: 'Repair', label: 'Repair' },
                    { value: 'Service', label: 'Service' },
                    { value: 'Transport', label: 'Transport' },
                    { value: 'Commission', label: 'Commission' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  selected={{
                    value: filter,
                    label: filter === 'all' ? 'All Categories' : filter
                  }}
                  onChange={(option) => handleFilterChange(option.value)}
                />
              </div>

              <div className="min-w-[150px]">
                <ResponsiveSelect
                  placeholder="Sort Options"
                  options={[
                    { value: 'date', label: 'Sort by Date' },
                    { value: 'amount', label: 'Sort by Amount' },
                    { value: 'category', label: 'Sort by Category' }
                  ]}
                  selected={{
                    value: sortBy,
                    label: sortBy === 'date' ? 'Sort by Date' :
                           sortBy === 'amount' ? 'Sort by Amount' : 'Sort by Category'
                  }}
                  onChange={(option) => handleSortChange(option.value)}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="flex justify-end">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="text-gray-600 dark:text-gray-300">
                  Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> expense{totalItems !== 1 ? 's' : ''} total
                </div>
                <div className="text-gray-400 dark:text-gray-500 hidden sm:block">•</div>
                <div className="text-gray-600 dark:text-gray-300">
                  Page: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredExpenses.length}</span> result{filteredExpenses.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['Repair', 'Service', 'Transport', 'Commission', 'Other'].map(category => {
          const categoryExpenses = filteredExpenses.filter(e => e.category === category);
          const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
          
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">{category}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrencyWithRs(total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {categoryExpenses.length} expense{categoryExpenses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Receipt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No expenses</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'Get started by adding a new expense.' : `No ${filter.toLowerCase()} expenses found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => {
            const payeeName = expense.payeeId?.fullName || expense.payeeId?.businessName;
            
            return (
              <div key={(expense as any)._id || expense.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[expense.category]}`}>
                        {expense.category}
                      </span>
                      
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrencyWithRs(expense.amount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {expense.description}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>

                      {expense.vehicleId && (
                        <div className="flex items-start space-x-3">
                          <Car className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {expense.vehicleId.registrationNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {expense.vehicleId.make} {expense.vehicleId.vehicleModel}
                            </p>
                          </div>
                        </div>
                      )}

                      {payeeName && (
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{payeeName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{expense.payeeId?.type}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {expense.attachments.length > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                              <FileText className="h-4 w-4" />
                              <span>{expense.attachments.length} attachment{expense.attachments.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete((expense as any)._id || expense.id, expense.description)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editExpense ? "Edit Expense" : "Add Expense"}
        expense={editExpense}
      />
    </div>
  );
});

ExpensesList.displayName = 'ExpensesList';

export default ExpensesList;