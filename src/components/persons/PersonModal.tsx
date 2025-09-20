'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Camera } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import Textarea from '@/components/ui/Textarea';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import Swal from 'sweetalert2';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  person?: any;
}

export default function PersonModal({ isOpen, onClose, title, person }: PersonModalProps) {
  const [formData, setFormData] = useState({
    type: 'Individual',
    fullName: '',
    businessName: '',
    nicOrPassport: '',
    companyRegNo: '',
    email: '',
    address: '',
    notes: '',
    isBlacklisted: false,
    riskNotes: '',
  });

  const [phones, setPhones] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (person) {
      setFormData({
        type: person.type || 'Individual',
        fullName: person.fullName || '',
        businessName: person.businessName || '',
        nicOrPassport: person.nicOrPassport || '',
        companyRegNo: person.companyRegNo || '',
        email: person.email || '',
        address: person.address || '',
        notes: person.notes || '',
        isBlacklisted: person.isBlacklisted || false,
        riskNotes: person.riskNotes || '',
      });
      setPhones(person.phone || ['']);
    } else {
      setFormData({
        type: 'Individual',
        fullName: '',
        businessName: '',
        nicOrPassport: '',
        companyRegNo: '',
        email: '',
        address: '',
        notes: '',
        isBlacklisted: false,
        riskNotes: '',
      });
      setPhones(['']);
    }
    setImages([]);
  }, [person, isOpen]);

  const addPhone = () => {
    setPhones([...phones, '']);
  };

  const removePhone = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  const updatePhone = (index: number, value: string) => {
    const updatedPhones = [...phones];
    updatedPhones[index] = value;
    setPhones(updatedPhones);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];

      if (images.length > 0) {
        for (const image of images) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', image);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imageUrls.push(uploadData.url);
          }
        }
      }

      // Prepare person data
      const personData = {
        ...formData,
        phone: phones.filter(phone => phone.trim() !== ''),
        images: imageUrls.map(url => ({
          url,
          uploadedAt: new Date(),
        })),
      };

      const url = person ? `/api/persons/${person.id}` : '/api/persons';
      const method = person ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Success!',
          text: `Person ${person ? 'updated' : 'created'} successfully!`,
          icon: 'success',
          confirmButtonColor: '#059669',
          timer: 2000,
          timerProgressBar: true,
        });
        onClose();
        window.location.reload(); // Refresh to show new data
      } else {
        const error = await response.json();
        await Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to save person',
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      console.error('Error saving person:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save person',
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button
        type="submit"
        form="person-form"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {loading ? 'Saving...' : person ? 'Update Person' : 'Add Person'}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
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
      <form id="person-form" onSubmit={handleSubmit} className="space-y-6">
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
          onChange={(option) => setFormData({ ...formData, type: option.value })}
        />

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {formData.type === 'Individual' ? (
            <ResponsiveInput
              label="Full Name"
              type="text"
              required={formData.type === 'Individual'}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
            />
          ) : (
            <ResponsiveInput
              label="Business Name"
              type="text"
              required={formData.type !== 'Individual'}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Enter business name"
            />
          )}
        </div>

        {/* Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <ResponsiveInput
            label={formData.type === 'Individual' ? 'NIC/Passport' : 'Contact Person NIC'}
            type="text"
            value={formData.nicOrPassport}
            onChange={(e) => setFormData({ ...formData, nicOrPassport: e.target.value })}
            placeholder={formData.type === 'Individual' ? 'Enter NIC or passport number' : 'Enter contact person NIC'}
          />

          {formData.type !== 'Individual' && (
            <ResponsiveInput
              label="Company Registration Number"
              type="text"
              value={formData.companyRegNo}
              onChange={(e) => setFormData({ ...formData, companyRegNo: e.target.value })}
              placeholder="Enter company registration number"
            />
          )}
        </div>

        {/* Phone Numbers */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
            <label className="block text-sm font-medium text-gray-700">
              Phone Numbers *
            </label>
            <Button type="button" size="sm" variant="outline" onClick={addPhone} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" />
              Add Phone
            </Button>
          </div>

          <div className="space-y-3">
            {phones.map((phone, index) => (
              <div key={index} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <ResponsiveInput
                  type="tel"
                  required={index === 0}
                  value={phone}
                  onChange={(e) => updatePhone(index, e.target.value)}
                  placeholder={index === 0 ? 'Primary phone number' : 'Additional phone number'}
                  className="flex-1"
                />
                {phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md self-start sm:self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email and Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <ResponsiveInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />

          <ResponsiveInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter address"
          />
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="isBlacklisted"
              checked={formData.isBlacklisted}
              onChange={(e) => setFormData({ ...formData, isBlacklisted: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <div className="flex-1">
              <label htmlFor="isBlacklisted" className="text-sm font-medium text-gray-700">
                Blacklist this person (high risk)
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Mark this person as high risk to prevent future transactions
              </p>
            </div>
          </div>

          {formData.isBlacklisted && (
            <Textarea
              label="Risk Notes"
              rows={3}
              value={formData.riskNotes}
              onChange={(e) => setFormData({ ...formData, riskNotes: e.target.value })}
              placeholder="Describe the risk or reason for blacklisting..."
            />
          )}
        </div>

        {/* Notes */}
        <Textarea
          label="Notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about this person..."
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Images
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG up to 10MB each
              </p>
              {images.length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  {images.length} image(s) selected
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </ResponsiveModal>
  );
}