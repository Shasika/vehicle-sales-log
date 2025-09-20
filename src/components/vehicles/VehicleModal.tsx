'use client';

import { useState } from 'react';
import VehicleForm from './VehicleForm';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import Swal from 'sweetalert2';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  vehicle?: any;
}

export default function VehicleModal({ isOpen, onClose, title, vehicle }: VehicleModalProps) {
  const [loading, setLoading] = useState(false);

  const footer = (
    <>
      <button
        type="submit"
        form="vehicle-form"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
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

  const handleSubmit = async (formData: any) => {
    setLoading(true);

    try {
      const url = vehicle ? `/api/vehicles/${vehicle._id || vehicle.id}` : '/api/vehicles';
      const method = vehicle ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Stop loading before showing success message
        setLoading(false);

        const responseData = await response.json();

        if (responseData.reactivated) {
          await Swal.fire({
            title: 'Vehicle Reactivated!',
            text: 'Previously sold vehicle has been reactivated and is now back in stock.',
            icon: 'success',
            confirmButtonColor: '#059669',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } else {
          await Swal.fire({
            title: 'Success!',
            text: `Vehicle ${vehicle ? 'updated' : 'created'} successfully!`,
            icon: 'success',
            confirmButtonColor: '#059669',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        }

        onClose();
        window.location.reload();
      } else {
        setLoading(false);
        const errorData = await response.json();
        await Swal.fire({
          title: 'Error!',
          text: errorData.error || `Failed to ${vehicle ? 'update' : 'create'} vehicle`,
          icon: 'error',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Submit error:', error);
      await Swal.fire({
        title: 'Error!',
        text: `Failed to ${vehicle ? 'update' : 'create'} vehicle. Please try again.`,
        icon: 'error',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="2xl"
    >
      <VehicleForm
        vehicle={vehicle}
        onSubmit={handleSubmit}
        onCancel={() => {}} // Don't use VehicleForm's cancel
        isLoading={loading}
        submitLabel={vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        showActions={false} // Hide internal buttons, use modal buttons instead
      />
    </ResponsiveModal>
  );
}