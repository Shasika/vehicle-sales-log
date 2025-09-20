'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import Textarea from '@/components/ui/Textarea';
import { showSaveSuccess, showSaveError, showWarning } from '@/lib/alerts';

interface PersonEditFormProps {
  person?: any;
}

export default function PersonEditForm({ person }: PersonEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: person?.type || 'Individual',
    fullName: person?.fullName || '',
    businessName: person?.businessName || '',
    nicOrPassport: person?.nicOrPassport || '',
    companyRegNo: person?.companyRegNo || '',
    email: person?.email || '',
    address: person?.address || '',
    notes: person?.notes || '',
    isBlacklisted: person?.isBlacklisted || false,
    riskNotes: person?.riskNotes || '',
  });

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    person?.phone || ['']
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    setPhoneNumbers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.type === 'Individual' && !formData.fullName.trim()) {
      await showWarning('Validation Error', 'Full name is required for individuals');
      return;
    }
    
    if ((formData.type === 'Dealer' || formData.type === 'Company') && !formData.businessName.trim()) {
      await showWarning('Validation Error', 'Business name is required for dealers and companies');
      return;
    }

    const validPhones = phoneNumbers.filter(phone => phone.trim());
    if (validPhones.length === 0) {
      await showWarning('Validation Error', 'At least one phone number is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/persons/${person._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: validPhones,
        }),
      });

      if (response.ok) {
        await showSaveSuccess('Person', true);
        router.push(`/persons/${person._id}`);
      } else {
        const errorData = await response.json();
        await showSaveError('person', true);
      }
    } catch (error) {
      console.error('Update error:', error);
      await showSaveError('person', true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/persons/${person._id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Person Type */}
      <ResponsiveSelect
        label="Type"
        placeholder="Select Type"
        options={[
          { value: 'Individual', label: 'Individual' },
          { value: 'Dealer', label: 'Dealer' },
          { value: 'Company', label: 'Company' }
        ]}
        selected={{ value: formData.type, label: formData.type }}
        onChange={(option) => setFormData(prev => ({ ...prev, type: option.value }))}
      />

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.type === 'Individual' ? (
          <>
            <ResponsiveInput
              label="Full Name"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <ResponsiveInput
              label="NIC/Passport"
              type="text"
              value={formData.nicOrPassport}
              onChange={(e) => setFormData(prev => ({ ...prev, nicOrPassport: e.target.value }))}
            />
          </>
        ) : (
          <>
            <ResponsiveInput
              label="Business Name"
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              required
            />
            <ResponsiveInput
              label="Registration Number"
              type="text"
              value={formData.companyRegNo}
              onChange={(e) => setFormData(prev => ({ ...prev, companyRegNo: e.target.value }))}
            />
          </>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      {/* Phone Numbers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Numbers *
        </label>
        <div className="space-y-2">
          {phoneNumbers.map((phone, index) => (
            <div key={index} className="flex space-x-2">
              <ResponsiveInput
                type="tel"
                value={phone}
                onChange={(e) => updatePhoneNumber(index, e.target.value)}
                placeholder="Enter phone number"
                className="flex-1"
                required={index === 0}
              />
              {phoneNumbers.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePhoneNumber(index)}
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhoneNumber}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Phone Number
          </Button>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address
        </label>
        <Textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className="w-full"
        />
      </div>

      {/* Blacklist Status */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            name="isBlacklisted"
            checked={formData.isBlacklisted}
            onChange={handleInputChange}
            className="h-4 w-4 text-red-600 dark:text-red-500 focus:ring-red-500 dark:focus:ring-red-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Mark as blacklisted
          </label>
        </div>
        
        {formData.isBlacklisted && (
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
              Risk Notes
            </label>
            <Textarea
              name="riskNotes"
              value={formData.riskNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full"
              placeholder="Explain why this person is blacklisted..."
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          className="w-full"
          placeholder="Additional notes..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400"
        >
          {loading ? 'Updating...' : 'Update Person'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}