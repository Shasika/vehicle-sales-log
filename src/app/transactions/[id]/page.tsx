import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Calendar, Car, User, DollarSign, CreditCard, ArrowUpRight, ArrowDownLeft, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/models';
import { formatCurrencyWithRs } from '@/lib/currency';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTransaction(id: string) {
  await connectDB();
  
  try {
    const transaction = await Transaction.findById(id)
      .populate('vehicleId', 'registrationNumber make vehicleModel year')
      .populate('counterpartyId', 'fullName businessName type phone email')
      .lean();
    
    if (!transaction || transaction.deletedAt) {
      return null;
    }
    return JSON.parse(JSON.stringify(transaction));
  } catch (error) {
    return null;
  }
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const transaction = await getTransaction(id);
  
  if (!transaction) {
    notFound();
  }

  const getTotalPaid = (payments: any[]) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPaymentStatus = (totalPrice: number, payments: any[]) => {
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


  const totalPaid = getTotalPaid(transaction.payments);
  const paymentStatus = getPaymentStatus(transaction.totalPrice, transaction.payments);
  const counterpartyName = transaction.counterpartyId.fullName || transaction.counterpartyId.businessName;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/transactions"
              className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Transaction Details 📊
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {transaction.direction === 'IN' ? 'Purchase' : 'Sale'} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/transactions/${transaction._id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transaction Overview</h2>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.direction === 'IN'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                  }`}>
                    {transaction.direction === 'IN' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    <span>{transaction.direction === 'IN' ? 'Purchase' : 'Sale'}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paymentStatus)}`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Transaction Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {format(new Date(transaction.date), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.date), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Base Price</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrencyWithRs(transaction.basePrice)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Price</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrencyWithRs(transaction.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Amount Paid</p>
                      <p className="font-medium text-green-600">{formatCurrencyWithRs(totalPaid)}</p>
                      {totalPaid < transaction.totalPrice && (
                        <p className="text-sm text-red-600">
                          Remaining: {formatCurrencyWithRs(transaction.totalPrice - totalPaid)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vehicle Information</h3>
              <div className="flex items-start space-x-4">
                <Car className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {transaction.vehicleId.registrationNumber}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {transaction.vehicleId.make} {transaction.vehicleId.vehicleModel}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Year: {transaction.vehicleId.year}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Counterparty Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {transaction.direction === 'IN' ? 'Seller' : 'Buyer'} Information
              </h3>
              <div className="flex items-start space-x-4">
                <User className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{counterpartyName}</h4>
                  <p className="text-gray-600 dark:text-gray-300 capitalize">{transaction.counterpartyId.type}</p>
                  {transaction.counterpartyId.phone && transaction.counterpartyId.phone.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone: {transaction.counterpartyId.phone[0]}</p>
                  )}
                  {transaction.counterpartyId.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email: {transaction.counterpartyId.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment History</h3>
              {transaction.payments && transaction.payments.length > 0 ? (
                <div className="space-y-3">
                  {transaction.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrencyWithRs(payment.amount)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{payment.method}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(payment.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payments recorded</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          {transaction.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notes</h3>
                <p className="text-gray-600 dark:text-gray-300">{transaction.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}