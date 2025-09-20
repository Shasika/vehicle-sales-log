'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import PersonModal from './PersonModal';

export default function AddPersonButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Person
      </Button>
      
      <PersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Person"
      />
    </>
  );
}