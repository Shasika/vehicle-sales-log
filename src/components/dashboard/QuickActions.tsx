'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Car, Users, Receipt, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import VehicleModal from '@/components/vehicles/VehicleModal';
import TransactionModal from '@/components/transactions/TransactionModal';
import PersonModal from '@/components/persons/PersonModal';
import ExpenseModal from '@/components/expenses/ExpenseModal';

const actions = [
  {
    id: 'vehicle',
    title: 'Add Vehicle',
    description: 'Register a new vehicle',
    icon: Car,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    id: 'transaction',
    title: 'Record Transaction',
    description: 'Log a buy or sell',
    icon: Receipt,
    color: 'text-green-600 bg-green-100',
  },
  {
    id: 'person',
    title: 'Add Person',
    description: 'Register a customer/dealer',
    icon: Users,
    color: 'text-purple-600 bg-purple-100',
  },
  {
    id: 'expense',
    title: 'Log Expense',
    description: 'Record business expense',
    icon: CreditCard,
    color: 'text-orange-600 bg-orange-100',
  },
];

export default function QuickActions() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.id}
                  onClick={() => openModal(action.id)}
                  className="w-full flex items-center p-3 rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-left group"
                >
                  <div className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Link href="/vehicles?status=InStock">
              <Button variant="outline" className="w-full">
                View Inventory
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <VehicleModal
        isOpen={activeModal === 'vehicle'}
        onClose={closeModal}
        title="Add New Vehicle"
      />

      <TransactionModal
        isOpen={activeModal === 'transaction'}
        onClose={closeModal}
        title="Record New Transaction"
      />

      <PersonModal
        isOpen={activeModal === 'person'}
        onClose={closeModal}
        title="Add New Person"
      />

      <ExpenseModal
        isOpen={activeModal === 'expense'}
        onClose={closeModal}
        title="Log New Expense"
      />
    </>
  );
}