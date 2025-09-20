'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, FileText } from 'lucide-react';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import Button from '@/components/ui/Button';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import { showSaveSuccess, showSaveError } from '@/lib/alerts';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  expense?: any;
}

interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
}

interface Person {
  id: string;
  fullName?: string;
  businessName?: string;
  type: string;
}

export default function ExpenseModal({ isOpen, onClose, title, expense }: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'Other',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payeeId: '',
  });
  
  const [attachments, setAttachments] = useState<Array<{
    type: string;
    file: File | null;
    caption: string;
  }>>([]);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      fetchPersons();
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicleId: expense.vehicleId?._id || expense.vehicleId?.id || expense.vehicleId || '',
        category: expense.category || 'Other',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        payeeId: expense.payeeId?._id || expense.payeeId?.id || expense.payeeId || '',
      });
      setAttachments(expense.attachments?.map((attachment: any) => ({
        type: attachment.type,
        file: null, // Existing files can't be re-uploaded
        caption: attachment.filename,
      })) || []);
    } else {
      setFormData({
        vehicleId: '',
        category: 'Other',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payeeId: '',
      });
      setAttachments([]);
    }
  }, [expense, isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setVehicles(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch vehicles:', response.statusText);
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/persons');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setPersons(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch persons:', response.statusText);
        setPersons([]);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
      setPersons([]);
    }
  };

  const addAttachment = () => {
    setAttachments([...attachments, {
      type: 'Receipt',
      file: null,
      caption: '',
    }]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const updateAttachment = (index: number, field: string, value: string | File) => {
    const updatedAttachments = [...attachments];
    updatedAttachments[index] = { ...updatedAttachments[index], [field]: value };
    setAttachments(updatedAttachments);
  };

  const handleAttachmentFileChange = (index: number, file: File | null) => {
    if (file) {
      updateAttachment(index, 'file', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload attachments if any
      const attachmentUrls: Array<{
        type: string;
        url: string;
        filename: string;
        uploadedAt: Date;
      }> = [];
      
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.file) {
            const formDataUpload = new FormData();
            formDataUpload.append('file', attachment.file);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataUpload,
            });
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              attachmentUrls.push({
                type: attachment.type,
                url: uploadData.url,
                filename: attachment.file.name,
                uploadedAt: new Date(),
              });
            }
          }
        }
      }

      const expenseData = {
        vehicleId: formData.vehicleId || undefined,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        payeeId: formData.payeeId || undefined,
        attachments: attachmentUrls,
      };

      const url = expense ? `/api/expenses/${expense._id || expense.id}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        await showSaveSuccess('Expense', !!expense);
        onClose();
      } else {
        const errorData = await response.json();
        await showSaveError('expense', !!expense);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      await showSaveError('expense', !!expense);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button
        type="submit"
        form="expense-form"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-md bg-blue-600 dark:bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-400 disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
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
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ResponsiveSelect
              label="Category"
              placeholder="Select Category"
              options={[
                { value: 'Repair', label: 'Repair' },
                { value: 'Service', label: 'Service' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Commission', label: 'Commission' },
                { value: 'Other', label: 'Other' }
              ]}
              selected={{ value: formData.category, label: formData.category }}
              onChange={(option) => setFormData({ ...formData, category: option.value })}
            />

            <ResponsiveInput
              label="Amount"
              type="number"
              step={0.01}
              min={0}
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter expense amount"
            />

            <div className="sm:col-span-2">
              <ResponsiveInput
                label="Description"
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the expense"
              />
            </div>

            <ResponsiveInput
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <ResponsiveSelect
              label="Related Vehicle"
              placeholder="Not vehicle-specific"
              options={[
                { value: '', label: 'Not vehicle-specific' },
                ...vehicles.map((vehicle) => ({
                  value: (vehicle as any)._id || vehicle.id,
                  label: `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.vehicleModel} (${vehicle.year})`
                }))
              ]}
              selected={formData.vehicleId ? vehicles.find(v => ((v as any)._id || v.id) === formData.vehicleId) ? {
                value: formData.vehicleId,
                label: (() => {
                  const vehicle = vehicles.find(v => ((v as any)._id || v.id) === formData.vehicleId);
                  return vehicle ? `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.vehicleModel} (${vehicle.year})` : 'Unknown Vehicle';
                })()
              } : undefined : { value: '', label: 'Not vehicle-specific' }}
              onChange={(option) => setFormData({ ...formData, vehicleId: option.value })}
            />

            <div className="sm:col-span-2">
              <ResponsiveSelect
                label="Payee"
                placeholder="Select payee (optional)"
                options={[
                  { value: '', label: 'Select payee (optional)' },
                  ...persons.map((person) => ({
                    value: (person as any)._id || person.id,
                    label: `${person.fullName || person.businessName} (${person.type})`
                  }))
                ]}
                selected={formData.payeeId ? persons.find(p => ((p as any)._id || p.id) === formData.payeeId) ? {
                  value: formData.payeeId,
                  label: (() => {
                    const person = persons.find(p => ((p as any)._id || p.id) === formData.payeeId);
                    return person ? `${person.fullName || person.businessName} (${person.type})` : 'Unknown Person';
                  })()
                } : undefined : { value: '', label: 'Select payee (optional)' }}
                onChange={(option) => setFormData({ ...formData, payeeId: option.value })}
              />
            </div>
          </div>

          {/* Attachments Upload */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Attachments (Receipts, Invoices)
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addAttachment} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Attachment
              </Button>
            </div>
            
            <div className="space-y-4">
              {attachments.map((attachment, index) => (
                <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Document Type
                      </label>
                      <select
                        value={attachment.type}
                        onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                        className="w-full px-3 py-2.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm appearance-none cursor-pointer"
                      >
                        <option value="Receipt">Receipt</option>
                        <option value="Invoice">Invoice</option>
                        <option value="Contract">Contract</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Caption/Description
                      </label>
                      <ResponsiveInput
                        type="text"
                        value={attachment.caption}
                        onChange={(e) => updateAttachment(index, 'caption', e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:items-end space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          File
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleAttachmentFileChange(index, e.target.files?.[0] || null)}
                          className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-md self-start sm:self-end flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {attachment.file && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{attachment.file.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({(attachment.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {attachments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm">No attachments added</p>
                  <p className="text-xs">Click "Add Attachment" to upload supporting files</p>
                </div>
              )}
            </div>
          </div>

      </form>
    </ResponsiveModal>
  );
}