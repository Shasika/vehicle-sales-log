'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Edit, Trash2, Eye, Camera, FileText, Search, Filter, SortAsc, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import DocumentViewer from '@/components/ui/DocumentViewer';
import ImageViewer from '@/components/ui/ImageViewer';
import VehicleModal from './VehicleModal';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';

interface Vehicle {
  id: string;
  _id?: string;
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
    caption?: string;
  }>;
  documents: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  createdAt: string;
}

const statusColors = {
  'NotOwned': 'bg-gray-100 text-gray-800',
  'InStock': 'bg-green-100 text-green-800',
  'Booked': 'bg-yellow-100 text-yellow-800',
  'Sold': 'bg-red-100 text-red-800'
};

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [makeFilter, setMakeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setVehicles(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch vehicles:', response.statusText);
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique makes and years for filters
  const uniqueMakes = [...new Set(vehicles.map(v => v.make).filter(Boolean))].sort();
  const uniqueYears = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a, b) => b - a);

  const filteredVehicles = Array.isArray(vehicles) ? vehicles
    .filter(vehicle => {
      // Status filter
      if (filter !== 'all' && vehicle.ownershipStatus !== filter) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = `${vehicle.registrationNumber} ${vehicle.make} ${vehicle.vehicleModel} ${vehicle.color}`.toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }
      
      // Make filter
      if (makeFilter !== 'all' && vehicle.make !== makeFilter) return false;
      
      // Year filter
      if (yearFilter !== 'all' && vehicle.year.toString() !== yearFilter) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'year-desc':
          return b.year - a.year;
        case 'year-asc':
          return a.year - b.year;
        case 'make':
          return a.make.localeCompare(b.make);
        case 'registration':
          return a.registrationNumber.localeCompare(b.registrationNumber);
        default:
          return 0;
      }
    }) : [];

  const handleDelete = async (id: string) => {
    const vehicle = vehicles.find(v => (v._id || v.id) === id);
    const vehicleInfo = vehicle ? `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.vehicleModel}` : 'Unknown Vehicle';

    const result = await confirmDelete(vehicleInfo, 'vehicle');
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVehicles(vehicles.filter(v => (v._id || v.id) !== id));
        await showDeleteSuccess('Vehicle');
        fetchVehicles();
      } else {
        await showDeleteError('vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      await showDeleteError('vehicle');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditVehicle(null);
    fetchVehicles(); // Refresh the list after editing
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Search and Filter Controls */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <ResponsiveInput
                type="text"
                placeholder="Search vehicles by registration, make, model, or color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400" />}
                iconPosition="left"
                className="w-full"
              />
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:gap-4">
              <div className="flex flex-wrap gap-3">
                {/* Make Filter */}
                <div className="min-w-[140px]">
                  <ResponsiveSelect
                    placeholder="All Makes"
                    options={[
                      { value: 'all', label: 'All Makes' },
                      ...uniqueMakes.map(make => ({ value: make, label: make }))
                    ]}
                    selected={{ value: makeFilter, label: makeFilter === 'all' ? 'All Makes' : makeFilter }}
                    onChange={(option) => setMakeFilter(option.value)}
                  />
                </div>

                {/* Year Filter */}
                <div className="min-w-[120px]">
                  <ResponsiveSelect
                    placeholder="All Years"
                    options={[
                      { value: 'all', label: 'All Years' },
                      ...uniqueYears.map(year => ({ value: year.toString(), label: year.toString() }))
                    ]}
                    selected={{ value: yearFilter, label: yearFilter === 'all' ? 'All Years' : yearFilter }}
                    onChange={(option) => setYearFilter(option.value)}
                  />
                </div>

                {/* Sort Options */}
                <div className="min-w-[140px]">
                  <ResponsiveSelect
                    placeholder="Sort Options"
                    options={[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                      { value: 'year-desc', label: 'Year (Newest)' },
                      { value: 'year-asc', label: 'Year (Oldest)' },
                      { value: 'make', label: 'Make (A-Z)' },
                      { value: 'registration', label: 'Registration' }
                    ]}
                    selected={{
                      value: sortBy,
                      label: sortBy === 'newest' ? 'Newest First' :
                             sortBy === 'oldest' ? 'Oldest First' :
                             sortBy === 'year-desc' ? 'Year (Newest)' :
                             sortBy === 'year-asc' ? 'Year (Oldest)' :
                             sortBy === 'make' ? 'Make (A-Z)' : 'Registration'
                    }}
                    onChange={(option) => setSortBy(option.value)}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || makeFilter !== 'all' || yearFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMakeFilter('all');
                    setYearFilter('all');
                    setSortBy('newest');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="p-4 lg:p-6">
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {[
              { key: 'all', label: 'All Vehicles', count: vehicles.length },
              { key: 'InStock', label: 'In Stock', count: vehicles.filter(v => v.ownershipStatus === 'InStock').length },
              { key: 'Booked', label: 'Booked', count: vehicles.filter(v => v.ownershipStatus === 'Booked').length },
              { key: 'Sold', label: 'Sold', count: vehicles.filter(v => v.ownershipStatus === 'Sold').length },
              { key: 'NotOwned', label: 'Not Owned', count: vehicles.filter(v => v.ownershipStatus === 'NotOwned').length },
            ].map((tab) => {
              const isActive = filter === tab.key;
              let buttonClasses = 'flex items-center space-x-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ';
              let countClasses = 'px-2 py-1 rounded-full text-xs font-bold ';

              if (tab.key === 'all') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-200 text-blue-800';
              } else if (tab.key === 'InStock') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-green-200 text-green-800';
              } else if (tab.key === 'Booked') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                  : 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-yellow-200 text-yellow-800';
              } else if (tab.key === 'Sold') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-red-200 text-red-800';
              } else if (tab.key === 'NotOwned') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-800';
              }

              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={buttonClasses}
                >
                  <span>{tab.label}</span>
                  <span className={countClasses}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> of <span className="font-semibold text-gray-900">{vehicles.length}</span> vehicles
        </p>
        {(searchTerm || makeFilter !== 'all' || yearFilter !== 'all' || filter !== 'all') && (
          <p className="text-sm text-blue-600">
            <Filter className="inline h-4 w-4 mr-1" />
            Filters applied
          </p>
        )}
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Get started by adding a new vehicle.' : `No vehicles with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={(vehicle as any)._id || vehicle.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Vehicle Image */}
              <div 
                className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (vehicle.images && vehicle.images.length > 0) {
                    setSelectedVehicle(vehicle);
                    setShowImages(true);
                  }
                }}
              >
                {vehicle.images.find(img => img.isPrimary) || vehicle.images[0] ? (
                  <>
                    <img
                      src={(vehicle.images.find(img => img.isPrimary) || vehicle.images[0]).url}
                      alt={`${vehicle.make} ${vehicle.vehicleModel}`}
                      className="w-full h-full object-cover"
                    />
                    {vehicle.images.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        +{vehicle.images.length - 1} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[vehicle.ownershipStatus]}`}>
                    {vehicle.ownershipStatus}
                  </span>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {vehicle.registrationNumber}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {vehicle.make} {vehicle.vehicleModel} ({vehicle.year})
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  {vehicle.color && <span>{vehicle.color}</span>}
                  {vehicle.transmission && <span>{vehicle.transmission}</span>}
                  {vehicle.fuelType && <span>{vehicle.fuelType}</span>}
                  {vehicle.mileage != null && vehicle.mileage > 0 && <span>{vehicle.mileage.toLocaleString()} km</span>}
                </div>

                {/* Document indicators */}
                <div className="flex items-center space-x-3 mb-3">
                  <button
                    onClick={() => {
                      if (vehicle.images && vehicle.images.length > 0) {
                        setSelectedVehicle(vehicle);
                        setShowImages(true);
                      }
                    }}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    disabled={!vehicle.images?.length}
                  >
                    <Camera className="h-3 w-3" />
                    <span>{vehicle.images?.length || 0} photos</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDocuments(true);
                    }}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                    disabled={!vehicle.documents?.length}
                  >
                    <FileText className="h-3 w-3" />
                    <span>{vehicle.documents?.length || 0} docs</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <Link
                    href={`/vehicles/${(vehicle as any)._id || vehicle.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium text-center sm:text-left py-1 sm:py-0"
                  >
                    View Details
                  </Link>
                  
                  <div className="flex justify-center sm:justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete((vehicle as any)._id || vehicle.id)}
                      className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer */}
      {selectedVehicle && (
        <DocumentViewer
          documents={selectedVehicle.documents || []}
          title={`Documents - ${selectedVehicle.registrationNumber}`}
          isOpen={showDocuments}
          onClose={() => {
            setShowDocuments(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* Image Viewer */}
      {selectedVehicle && (
        <ImageViewer
          isOpen={showImages}
          onClose={() => {
            setShowImages(false);
            setSelectedVehicle(null);
          }}
          images={selectedVehicle.images || []}
          title={`${selectedVehicle.registrationNumber} Images`}
        />
      )}

      {/* Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        title="Edit Vehicle"
        vehicle={editVehicle}
      />
    </div>
  );
}