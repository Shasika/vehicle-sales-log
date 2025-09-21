'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import ExpenseModal from './ExpenseModal';

interface AddExpenseButtonProps {
  onSuccess?: () => void;
}

export default function AddExpenseButton({ onSuccess }: AddExpenseButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Expense
      </Button>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        title="Add New Expense"
      />
    </>
  );
}