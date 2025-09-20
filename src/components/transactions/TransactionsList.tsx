'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Calendar, Car, User, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import Pagination from '@/components/ui/Pagination';
import TransactionModal from './TransactionModal';
import { formatCurrencyWithRs } from '@/lib/currency';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';

interface Transaction {
  _id?: string;
  id?: string;
  vehicleId: {
    _id?: string;
    id?: string;
    registrationNumber: string;
    make: string;
    vehicleModel: string;
    year?: number;
  };
  direction: 'IN' | 'OUT';
  counterpartyId: {
    _id?: string;
    id?: string;
    fullName?: string;
    businessName?: string;
    type: string;
  };
  date: string;
  basePrice: number;
  totalPrice: number;
  payments: Array<{
    method: string;
    amount: number;
    date: string;
  }>;
  createdAt: string;
}

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, filter, sortBy]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        populate: 'vehicleId,counterpartyId',
      });

      // Add filters to query
      if (filter !== 'all') params.append('direction', filter);

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        const pagination = result.pagination || {};

        setTransactions(Array.isArray(data) ? data : []);
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.pages || 0);
      } else {
        console.error('Failed to fetch transactions:', response.statusText);
        setTransactions([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handler for filter changes that should reset pagination
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Use transactions directly since filtering is done server-side
  const filteredTransactions = Array.isArray(transactions) ? transactions : [];

  const handleDelete = async (transactionId: string) => {
    const transaction = transactions.find(t => (t.id || t._id) === transactionId);
    const vehicleInfo = transaction ? `${transaction.vehicleId.registrationNumber} - ${transaction.vehicleId.make} ${transaction.vehicleId.vehicleModel}` : 'Unknown Vehicle';

    const result = await confirmDelete(vehicleInfo, 'transaction');
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions(transactions.filter(t => (t.id || t._id) !== transactionId));
        await showDeleteSuccess('Transaction');
      } else {
        await showDeleteError('transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      await showDeleteError('transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTransaction(null);
    fetchTransactions(); // Refresh the list
  };

  const handleTransactionSuccess = () => {
    // Close modal and refresh list
    handleCloseModal();
  };

  const getTotalPaid = (payments: Transaction['payments']) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPaymentStatus = (totalPrice: number, payments: Transaction['payments']) => {
    const totalPaid = getTotalPaid(payments);
    if (totalPaid >= totalPrice) return 'Paid';
    if (totalPaid > 0) return 'Partial';
    return 'Unpaid';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <ResponsiveSelect
            placeholder="Filter Transactions"
            options={[
              { value: 'all', label: 'All Transactions' },
              { value: 'IN', label: 'Purchases (IN)' },
              { value: 'OUT', label: 'Sales (OUT)' }
            ]}
            selected={{ value: filter, label: filter === 'all' ? 'All Transactions' : filter === 'IN' ? 'Purchases (IN)' : 'Sales (OUT)' }}
            onChange={(option) => handleFilterChange(option.value)}
          />

          <ResponsiveSelect
            placeholder="Sort Options"
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'amount', label: 'Sort by Amount' }
            ]}
            selected={{ value: sortBy, label: sortBy === 'date' ? 'Sort by Date' : 'Sort by Amount' }}
            onChange={(option) => handleSortChange(option.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <div className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{totalItems}</span> transaction{totalItems !== 1 ? 's' : ''} total
          </div>
          <div className="text-gray-400 hidden sm:block">•</div>
          <div className="text-gray-600">
            Page: <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> result{filteredTransactions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrencyWithRs(
                  filteredTransactions
                    .filter(t => t.direction === 'IN')
                    .reduce((sum, t) => sum + t.totalPrice, 0)
                )}
              </p>
            </div>
            <ArrowDownLeft className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrencyWithRs(
                  filteredTransactions
                    .filter(t => t.direction === 'OUT')
                    .reduce((sum, t) => sum + t.totalPrice, 0)
                )}
              </p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-xl font-semibold text-blue-600">
                {formatCurrencyWithRs(
                  filteredTransactions.filter(t => t.direction === 'OUT').reduce((sum, t) => sum + t.totalPrice, 0) -
                  filteredTransactions.filter(t => t.direction === 'IN').reduce((sum, t) => sum + t.totalPrice, 0)
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Get started by adding a new transaction.' : `No ${filter === 'IN' ? 'purchase' : 'sale'} transactions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const paymentStatus = getPaymentStatus(transaction.totalPrice, transaction.payments);
            const totalPaid = getTotalPaid(transaction.payments);
            const counterpartyName = transaction.counterpartyId?.fullName || transaction.counterpartyId?.businessName || 'Unknown';
            
            return (
              <div key={transaction._id || transaction.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.direction === 'IN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.direction === 'IN' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                        <span>{transaction.direction === 'IN' ? 'Purchase' : 'Sale'}</span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paymentStatus)}`}>
                        {paymentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start space-x-3">
                        <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.vehicleId?.registrationNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.vehicleId?.make} {transaction.vehicleId?.vehicleModel} {transaction.vehicleId?.year ? `(${transaction.vehicleId.year})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{counterpartyName}</p>
                          <p className="text-sm text-gray-600 capitalize">{transaction.counterpartyId?.type || 'Unknown'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(transaction.date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            Total: <span className="font-semibold text-gray-900">{formatCurrencyWithRs(transaction.totalPrice)}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Paid: <span className="font-semibold text-green-600">{formatCurrencyWithRs(totalPaid)}</span>
                            {totalPaid < transaction.totalPrice && (
                              <span className="ml-2 text-red-600">
                                (Remaining: {formatCurrencyWithRs(transaction.totalPrice - totalPaid)})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/transactions/${transaction._id || transaction.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(transaction.id || (transaction as any)._id || '')}
                            className="text-red-600 hover:text-red-800"
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

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editTransaction ? "Edit Transaction" : "Add Transaction"}
        transaction={editTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}