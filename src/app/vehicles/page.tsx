import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import VehiclesList from '@/components/vehicles/VehiclesList';
import AddVehicleButton from '@/components/vehicles/AddVehicleButton';

export default async function VehiclesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Vehicle Inventory 🚗
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Manage and track your complete vehicle inventory with detailed information.
              </p>
            </div>
            <div className="flex-shrink-0">
              <AddVehicleButton />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        }>
          <VehiclesList />
        </Suspense>
    </div>
  );
}