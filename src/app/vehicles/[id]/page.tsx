import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Camera, FileText, Calendar, MapPin, DollarSign, History } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import { Vehicle } from '@/models';
import DeleteVehicleButton from '@/components/vehicles/DeleteVehicleButton';
import { formatCurrencyWithRs } from '@/lib/currency';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVehicle(id: string) {
  await connectDB();

  try {
    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle || vehicle.deletedAt) {
      return null;
    }
    return JSON.parse(JSON.stringify(vehicle));
  } catch (error) {
    return null;
  }
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const vehicle = await getVehicle(id);
  
  if (!vehicle) {
    notFound();
  }

  const statusColors = {
    NotOwned: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    InStock: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
    Booked: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    Sold: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  };

  return (
    <div className="max-w-full xl:max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                href="/vehicles"
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vehicles
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {vehicle.registrationNumber} 🚗
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {vehicle.make} {vehicle.vehicleModel} ({vehicle.year})
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/vehicles/${vehicle._id}/history`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </Link>
              <Link
                href={`/vehicles/${vehicle._id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Vehicle
              </Link>
              <DeleteVehicleButton
                vehicleId={vehicle._id}
                registrationNumber={vehicle.registrationNumber}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Images</h2>
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicle.images.map((image: any, index: number) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={`${vehicle.make} ${vehicle.vehicleModel} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-md">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Make', value: vehicle.make },
                  { label: 'Model', value: vehicle.vehicleModel },
                  { label: 'Year', value: vehicle.year },
                  { label: 'Color', value: vehicle.color },
                  { label: 'Transmission', value: vehicle.transmission },
                  { label: 'Fuel Type', value: vehicle.fuelType },
                  { label: 'Engine Capacity', value: vehicle.engineCapacity },
                  { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A' },
                  { label: 'VIN', value: vehicle.vin || 'N/A' },
                ].map((spec) => (
                  <div key={spec.label} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {spec.value || 'N/A'}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Status and Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status & Info</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[vehicle.ownershipStatus as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {vehicle.ownershipStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Registration Number</span>
                  <div className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {vehicle.registrationNumber}
                  </div>
                </div>

                {vehicle.purchasePrice && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</span>
                    <div className="mt-1 text-base font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyWithRs(vehicle.purchasePrice)}
                    </div>
                  </div>
                )}

                {vehicle.salePrice && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sale Price</span>
                    <div className="mt-1 text-base font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrencyWithRs(vehicle.salePrice)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h2>
              {vehicle.documents && vehicle.documents.length > 0 ? (
                <div className="space-y-3">
                  {vehicle.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.filename}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{doc.type}</div>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No documents available</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Info</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Added {new Date(vehicle.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <Camera className="h-4 w-4" />
                  <span>{vehicle.images?.length || 0} photos</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  <span>{vehicle.documents?.length || 0} documents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}