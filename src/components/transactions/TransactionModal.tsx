'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, FileText } from 'lucide-react';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import Button from '@/components/ui/Button';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import Textarea from '@/components/ui/Textarea';
import { formatCurrencyWithRs } from '@/lib/currency';
import Swal from 'sweetalert2';

// Function to detect if dark mode is active
const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return false;
};

// Get dark mode theme configuration
const getDarkModeConfig = () => {
  if (!isDarkMode()) return {};

  return {
    background: '#1f2937', // gray-800
    color: '#f9fafb', // gray-50
    customClass: {
      popup: 'dark-mode-popup',
      title: 'dark-mode-title',
      htmlContainer: 'dark-mode-html',
      confirmButton: 'dark-mode-confirm-button',
      cancelButton: 'dark-mode-cancel-button',
    },
  };
};
import { showSaveSuccess } from '@/lib/alerts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transaction?: any;
  onSuccess?: () => void;
}

interface Vehicle {
  id: string;
  _id?: string;
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
}

interface Person {
  id: string;
  _id?: string;
  fullName?: string;
  businessName?: string;
  type: string;
}

export default function TransactionModal({ isOpen, onClose, title, transaction, onSuccess }: TransactionModalProps) {

  console.log('🔥 TRANSACTION MODAL RENDERED - VERSION 2.0 - TEXT FIXED!!!');

  const [formData, setFormData] = useState({
    vehicleId: '',
    direction: 'IN',
    counterpartyId: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    basePrice: '',
    discount: '',
    notes: '',
  });

  const [taxes, setTaxes] = useState<Array<{name: string; amount: string; percentage?: string}>>([]);
  const [fees, setFees] = useState<Array<{name: string; amount: string; percentage?: string}>>([]);
  const [payments, setPayments] = useState<Array<{method: string; amount: string; date: string; reference?: string}>>([]);
  const [documents, setDocuments] = useState<Array<{
    type: string;
    file?: File;
    url?: string;
    filename?: string;
  }>>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form data when transaction prop changes
  useEffect(() => {
    if (transaction && isOpen) {
      console.log('🔍 SETTING FORM DATA:', {
        transaction,
        vehicleId: transaction.vehicleId?._id || transaction.vehicleId?.id || transaction.vehicleId || '',
        counterpartyId: transaction.counterpartyId?._id || transaction.counterpartyId?.id || transaction.counterpartyId || ''
      });
      setFormData({
        vehicleId: transaction.vehicleId?._id || transaction.vehicleId?.id || transaction.vehicleId || '',
        direction: transaction.direction || 'IN',
        counterpartyId: transaction.counterpartyId?._id || transaction.counterpartyId?.id || transaction.counterpartyId || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        location: transaction.location || '',
        basePrice: transaction.basePrice?.toString() || '',
        discount: transaction.discount?.toString() || '',
        notes: transaction.notes || '',
      });

      setTaxes(transaction.taxes || []);
      setFees(transaction.fees || []);
      setPayments((transaction.payments || []).map((p: any) => ({
        ...p,
        date: p.date ? new Date(p.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })));
      setDocuments(transaction.documents || []);
    } else if (!transaction && isOpen) {
      // Reset form for new transaction
      setFormData({
        vehicleId: '',
        direction: 'IN',
        counterpartyId: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        basePrice: '',
        discount: '',
        notes: '',
      });
      setTaxes([]);
      setFees([]);
      setPayments([]);
      setDocuments([]);
    }
  }, [transaction, isOpen]);

  // Fetch vehicles and persons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      fetchPersons();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?status=NotOwned,InStock,Booked');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setVehicles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/persons');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setPersons(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch persons:', error);
    }
  };

  const calculateTotal = () => {
    const base = parseFloat(formData.basePrice) || 0;
    const taxTotal = taxes.reduce((sum, tax) => sum + (parseFloat(tax.amount) || 0), 0);
    const feeTotal = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    const discount = parseFloat(formData.discount) || 0;
    return base + taxTotal + feeTotal - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    try {
      const transactionData = {
        vehicleId: formData.vehicleId,
        direction: formData.direction,
        counterpartyId: formData.counterpartyId,
        date: new Date(formData.date),
        location: formData.location,
        basePrice: parseFloat(formData.basePrice),
        taxes: taxes
          .filter(tax => tax.name && tax.amount)
          .map(tax => ({
            name: tax.name,
            amount: parseFloat(tax.amount),
            percentage: tax.percentage ? parseFloat(tax.percentage) : undefined,
          })),
        fees: fees
          .filter(fee => fee.name && fee.amount)
          .map(fee => ({
            name: fee.name,
            amount: parseFloat(fee.amount),
            percentage: fee.percentage ? parseFloat(fee.percentage) : undefined,
          })),
        discount: parseFloat(formData.discount) || 0,
        payments: payments
          .filter(payment => payment.method && payment.amount)
          .map(payment => ({
            method: payment.method,
            amount: parseFloat(payment.amount),
            date: new Date(payment.date),
            reference: payment.reference || undefined,
          })),
        documents: [],
        notes: formData.notes,
      };

      const url = transaction ? `/api/transactions/${transaction._id || transaction.id}` : '/api/transactions';
      const method = transaction ? 'PATCH' : 'POST';

      console.log('📤 SENDING REQUEST:', { url, method, transactionData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      console.log('📥 RESPONSE STATUS:', response.status, response.statusText);

      // Get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('📄 RESPONSE TEXT:', responseText);

      if (response.ok) {
        setLoading(false);

        // Try to parse as JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('✅ PARSED RESPONSE:', responseData);
        } catch (parseError) {
          console.error('❌ JSON PARSE ERROR:', parseError);
          console.log('Raw response was:', responseText);
        }

        await Swal.fire({
          title: 'Success!',
          text: `Transaction ${transaction ? 'updated' : 'created'} successfully!`,
          icon: 'success',
          confirmButtonColor: '#059669',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
          allowEscapeKey: false,
          ...getDarkModeConfig(),
        });

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setLoading(false);

        // Try to parse error response
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ ERROR RESPONSE PARSE ERROR:', parseError);
          errorData = { error: 'Server returned invalid response' };
        }

        console.log('❌ ERROR DATA:', errorData);

        await Swal.fire({
          title: 'Error!',
          text: errorData.error || `Failed to ${transaction ? 'update' : 'create'} transaction`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
          ...getDarkModeConfig(),
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Submit error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save transaction. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        ...getDarkModeConfig(),
      });
    }
  };

  const footer = (
    <>
      <button
        type="submit"
        form="transaction-form"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Create Transaction'}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 sm:mt-0 sm:w-auto"
      >
        Cancel
      </button>
    </>
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="2xl"
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ResponsiveSelect
              label="Vehicle"
              placeholder="Select Vehicle"
              options={[
                { value: "", label: "Select Vehicle" },
                ...vehicles.map(vehicle => ({
                  value: vehicle.id || vehicle._id || '',
                  label: `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.vehicleModel}`
                }))
              ]}
              selected={vehicles.find(v => (v.id || v._id) === formData.vehicleId) ? {
                value: formData.vehicleId,
                label: `${vehicles.find(v => (v.id || v._id) === formData.vehicleId)?.registrationNumber} - ${vehicles.find(v => (v.id || v._id) === formData.vehicleId)?.make} ${vehicles.find(v => (v.id || v._id) === formData.vehicleId)?.vehicleModel}`
              } : undefined}
              onChange={(option) => setFormData({ ...formData, vehicleId: option.value })}
            />

            <ResponsiveSelect
              label="Transaction Type"
              placeholder="Select Transaction Type"
              options={[
                { value: "IN", label: "Purchase (IN)" },
                { value: "OUT", label: "Sale (OUT)" }
              ]}
              selected={{ value: formData.direction, label: formData.direction === "IN" ? "Purchase (IN)" : "Sale (OUT)" }}
              onChange={(option) => setFormData({ ...formData, direction: option.value })}
            />

            <ResponsiveSelect
              label="Counterparty"
              placeholder="Select Person/Company"
              options={[
                { value: "", label: "Select Person/Company" },
                ...persons.map(person => ({
                  value: person.id || person._id || '',
                  label: `${person.fullName || person.businessName} (${person.type})`
                }))
              ]}
              selected={persons.find(p => (p.id || p._id) === formData.counterpartyId) ? {
                value: formData.counterpartyId,
                label: `${persons.find(p => (p.id || p._id) === formData.counterpartyId)?.fullName || persons.find(p => (p.id || p._id) === formData.counterpartyId)?.businessName} (${persons.find(p => (p.id || p._id) === formData.counterpartyId)?.type})`
              } : undefined}
              onChange={(option) => setFormData({ ...formData, counterpartyId: option.value })}
            />

            <ResponsiveInput
              type="date"
              label="Transaction Date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <ResponsiveInput
              type="text"
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Transaction location"
            />

            <ResponsiveInput
              type="number"
              label="Base Price (Rs.)"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Total Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                Total: {formatCurrencyWithRs(calculateTotal())}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the transaction..."
              rows={3}
            />
          </div>

        </form>
    </ResponsiveModal>
  );
}