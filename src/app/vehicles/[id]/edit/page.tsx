'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-context';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  color?: string;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  ownershipStatus: 'NotOwned' | 'InStock' | 'Booked' | 'Sold';
  images: Array<{
    url: string;
    isPrimary?: boolean;
    uploadedAt?: Date;
  }>;
  documents: Array<{
    type: string;
    url: string;
    filename: string;
    uploadedAt?: Date;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleId = params.id as string;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchVehicle();
  }, [status, session, vehicleId, router]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const result = await response.json();
        setVehicle(result.data);
      } else if (response.status === 404) {
        setError('Vehicle not found');
      } else {
        setError('Failed to load vehicle');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Show success message briefly before redirect
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.textContent = 'Vehicle updated successfully!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
          router.push(`/vehicles/${vehicleId}?updated=true`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setError('Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/vehicles"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Vehicle Not Found</h1>
          <Link
            href="/vehicles"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/vehicles/${vehicleId}`}
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Vehicle
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit {vehicle.registrationNumber}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/vehicles/${vehicleId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <VehicleForm
              vehicle={vehicle}
              onSubmit={handleSave}
              onCancel={() => router.push(`/vehicles/${vehicleId}`)}
              isLoading={saving}
              submitLabel={
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}