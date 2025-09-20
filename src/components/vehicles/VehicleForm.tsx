'use client';

import { useState, useEffect } from 'react';
import { Camera, FileText, X, Upload, Trash2, Eye, Download, Image } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ImageViewer from '@/components/ui/ImageViewer';
import DocumentViewer from '@/components/ui/DocumentViewer';
import Swal from 'sweetalert2';
import { showConfirm } from '@/lib/alerts';

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

interface VehicleFormProps {
  vehicle?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: React.ReactNode;
  showActions?: boolean; // Controls whether to show internal form buttons
}

interface FormData {
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  color: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  ownershipStatus: string;
}

interface ExistingFile {
  url: string;
  isPrimary?: boolean;
  uploadedAt?: string;
  type: string;
  filename: string;
}

export default function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Vehicle',
  showActions = true
}: VehicleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    registrationNumber: '',
    make: '',
    vehicleModel: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    transmission: '',
    fuelType: '',
    ownershipStatus: 'InStock',
  });

  const [existingImages, setExistingImages] = useState<ExistingFile[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<ExistingFile[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);


  // Populate form when vehicle is provided (edit mode)
  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || '',
        make: vehicle.make || '',
        vehicleModel: vehicle.vehicleModel || '',
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color || '',
        mileage: vehicle.mileage || 0,
        transmission: vehicle.transmission || '',
        fuelType: vehicle.fuelType || '',
        ownershipStatus: vehicle.ownershipStatus || 'InStock',
      });

      if (vehicle.images) {
        setExistingImages(vehicle.images);
      }

      if (vehicle.documents) {
        setExistingDocuments(vehicle.documents);
      }
    } else {
      // Reset form for new vehicle
      setFormData({
        registrationNumber: '',
        make: '',
        vehicleModel: '',
        year: new Date().getFullYear(),
        color: '',
        mileage: 0,
        transmission: '',
        fuelType: '',
        ownershipStatus: 'InStock',
      });
      setExistingImages([]);
      setExistingDocuments([]);
    }
  }, [vehicle]);

  // Keep for file uploads and other non-responsive inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? (value ? parseInt(value) : 0) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewDocuments(Array.from(e.target.files));
    }
  };

  const removeExistingImage = async (index: number) => {
    const result = await showConfirm(
      'Remove Image?',
      'Are you sure you want to remove this image from the vehicle?',
      'Yes, remove it!'
    );
    if (result.isConfirmed) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeExistingDocument = async (index: number) => {
    const result = await showConfirm(
      'Remove Document?',
      'Are you sure you want to remove this document from the vehicle?',
      'Yes, remove it!'
    );
    if (result.isConfirmed) {
      setExistingDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeNewImage = async (index: number) => {
    const result = await showConfirm(
      'Remove Image?',
      'Are you sure you want to remove this image?',
      'Yes, remove it!'
    );
    if (result.isConfirmed) {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeNewDocument = async (index: number) => {
    const result = await showConfirm(
      'Remove Document?',
      'Are you sure you want to remove this document?',
      'Yes, remove it!'
    );
    if (result.isConfirmed) {
      setNewDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Download functionality for documents and images
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      await Swal.fire({
        title: 'Download Error',
        text: 'Failed to download file. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        ...getDarkModeConfig(),
      });
    }
  };

  // Helper function to determine if file is an image
  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const uploadFiles = async (files: File[], type: 'image' | 'document') => {
    if (files.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', 'vehicles');
        formData.append('entityId', vehicle?._id || vehicle?.id || 'temp');
        formData.append('generateThumbnail', type === 'image' ? 'true' : 'false');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Upload response:', result);
          uploadedUrls.push(result.data.url);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.registrationNumber.trim()) {
      await Swal.fire({
        title: 'Validation Error',
        text: 'Registration number is required',
        icon: 'warning',
        confirmButtonColor: '#dc2626',
        ...getDarkModeConfig(),
      });
      return;
    }


    try {
      let imageUrls: string[] = [];
      let documentUrls: string[] = [];

      // Upload files
      if (newImages.length > 0) {
        imageUrls = await uploadFiles(newImages, 'image');
      }

      if (newDocuments.length > 0) {
        documentUrls = await uploadFiles(newDocuments, 'document');
      }

      const submitData = {
        ...formData,
        images: [
          ...existingImages,
          ...imageUrls.map((url, index) => ({
            url,
            isPrimary: existingImages.length === 0 && index === 0,
            uploadedAt: new Date(),
          }))
        ],
        documents: [
          ...existingDocuments,
          ...documentUrls.map((url, index) => ({
            type: 'Other',
            url,
            filename: newDocuments[index]?.name || `Document ${index + 1}`,
            uploadedAt: new Date(),
          }))
        ],
      };

      onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save vehicle. Please check your data and try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        ...getDarkModeConfig(),
      });
    }
  };

  return (
    <div>

      <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <ResponsiveInput
            label="Registration Number"
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
            required
          />

          <ResponsiveInput
            label="Make"
            type="text"
            value={formData.make}
            onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            required
          />

          <ResponsiveInput
            label="Model"
            type="text"
            value={formData.vehicleModel}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
            required
          />

          <ResponsiveInput
            label="Year"
            type="number"
            value={formData.year.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : new Date().getFullYear() }))}
            min={1900}
            max={new Date().getFullYear() + 5}
            required
          />

          <ResponsiveInput
            label="Color"
            type="text"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />

          <ResponsiveInput
            label="Mileage (km)"
            type="number"
            value={formData.mileage.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value ? parseInt(e.target.value) : 0 }))}
            min={0}
          />

          <ResponsiveSelect
            label="Transmission"
            placeholder="Select Transmission"
            options={[
              { value: 'Manual', label: 'Manual' },
              { value: 'Automatic', label: 'Automatic' },
              { value: 'CVT', label: 'CVT' }
            ]}
            selected={formData.transmission ? { value: formData.transmission, label: formData.transmission } : undefined}
            onChange={(option) => setFormData(prev => ({ ...prev, transmission: option.value }))}
          />

          <ResponsiveSelect
            label="Fuel Type"
            placeholder="Select Fuel Type"
            options={[
              { value: 'Petrol', label: 'Petrol' },
              { value: 'Diesel', label: 'Diesel' },
              { value: 'Electric', label: 'Electric' },
              { value: 'Hybrid', label: 'Hybrid' }
            ]}
            selected={formData.fuelType ? { value: formData.fuelType, label: formData.fuelType } : undefined}
            onChange={(option) => setFormData(prev => ({ ...prev, fuelType: option.value }))}
          />

          <ResponsiveSelect
            label="Ownership Status"
            placeholder="Select Status"
            options={[
              { value: 'NotOwned', label: 'Not Owned' },
              { value: 'InStock', label: 'In Stock' },
              { value: 'Booked', label: 'Booked' },
              { value: 'Sold', label: 'Sold' }
            ]}
            selected={formData.ownershipStatus ? { value: formData.ownershipStatus, label: formData.ownershipStatus === 'NotOwned' ? 'Not Owned' : formData.ownershipStatus === 'InStock' ? 'In Stock' : formData.ownershipStatus } : undefined}
            onChange={(option) => setFormData(prev => ({ ...prev, ownershipStatus: option.value }))}
          />
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Images
          </h3>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      <img
                        src={image.url}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setShowImageViewer(true)}
                      />
                    </div>
                    {image.isPrimary && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add New Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                    <span>Upload images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG up to 10MB each</p>
              </div>
            </div>
            {newImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Images ({newImages.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {existingImages.length === 0 && index === 0 && (
                        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Documents
          </h3>

          {/* Existing Documents */}
          {existingDocuments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Documents & Supporting Images</h4>
              <div className="space-y-2">
                {existingDocuments.map((doc, index) => {
                  const filename = doc.filename || `Document ${index + 1}`;
                  const isImage = isImageFile(filename);

                  return (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        {isImage ? (
                          <Image className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{filename}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {isImage ? 'Supporting Image' : 'Document'}
                            {doc.type && doc.type !== 'Other' && ` • ${doc.type}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => downloadFile(doc.url, filename)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDocumentViewer(true)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingDocument(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Documents Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Supporting Documents & Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <Image className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                    <span>Upload documents & images</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                      onChange={handleDocumentUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Documents: PDF, DOC, DOCX, TXT</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Images: JPG, PNG, GIF, BMP, WEBP</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Up to 10MB each</p>
              </div>
            </div>
            {newDocuments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Files ({newDocuments.length})</h4>
                <div className="space-y-2">
                  {newDocuments.map((file, index) => {
                    const isImage = isImageFile(file.name);

                    return (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-3">
                          {isImage ? (
                            <div className="flex items-center space-x-2">
                              <Image className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {isImage ? 'Supporting Image' : 'Document'} • {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewDocument(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        {showActions && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploading}
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Image Viewer */}
      <ImageViewer
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        images={existingImages as any}
        title="Vehicle Images"
      />

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        documents={existingDocuments}
        title="Vehicle Documents"
      />
    </div>
  );
}