'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';

interface DeleteVehicleButtonProps {
  vehicleId: string;
  registrationNumber: string;
}

export default function DeleteVehicleButton({ vehicleId, registrationNumber }: DeleteVehicleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await confirmDelete(registrationNumber, 'vehicle');

    if (!result.isConfirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await showDeleteSuccess('Vehicle');
        router.push('/vehicles');
      } else {
        const errorData = await response.json();
        await showDeleteError('vehicle');
      }
    } catch (error) {
      console.error('Delete error:', error);
      await showDeleteError('vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-600 border-red-300 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}