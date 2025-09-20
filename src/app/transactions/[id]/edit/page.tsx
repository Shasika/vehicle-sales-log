'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TransactionModal from '@/components/transactions/TransactionModal';

export default function TransactionEditPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await fetch(`/api/transactions/${id}`);
      if (response.ok) {
        const result = await response.json();
        setTransaction(result.data);
      } else {
        console.error('Failed to fetch transaction');
        router.push('/transactions');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      router.push('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push(`/transactions/${id}`);
  };

  const handleSuccess = () => {
    // Navigate back to transaction details after success message is shown
    router.push(`/transactions/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Transaction not found
          </h3>
          <p className="text-gray-600 mb-4">
            The transaction you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/transactions"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href={`/transactions/${id}`}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit Transaction ✏️
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update transaction information
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Modal (used as edit form) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Transaction"
        transaction={transaction}
        onSuccess={handleSuccess}
      />

      {/* Placeholder content when modal is closed */}
      {!isModalOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Edit Transaction
              </h3>
              <p className="text-gray-600 mb-4">
                Click the button below to open the edit form.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Edit Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}