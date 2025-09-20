'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';

interface DeletePersonButtonProps {
  personId: string;
  personName: string;
}

export default function DeletePersonButton({ personId, personName }: DeletePersonButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await confirmDelete(personName, 'person');

    if (!result.isConfirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/persons/${personId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await showDeleteSuccess('Person');
        router.push('/persons');
      } else {
        const errorData = await response.json();
        await showDeleteError('person');
      }
    } catch (error) {
      console.error('Delete error:', error);
      await showDeleteError('person');
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