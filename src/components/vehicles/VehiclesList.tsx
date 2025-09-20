'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Edit, Trash2, Eye, Camera, FileText, Search, Filter, SortAsc, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import DocumentViewer from '@/components/ui/DocumentViewer';
import ImageViewer from '@/components/ui/ImageViewer';
import Pagination from '@/components/ui/Pagination';
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
  'NotOwned': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'InStock': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Booked': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Sold': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Status counts for filter tabs
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    InStock: 0,
    Booked: 0,
    Sold: 0,
    NotOwned: 0,
  });

  useEffect(() => {
    fetchVehicles();
    fetchStatusCounts();
  }, [currentPage, itemsPerPage, filter, searchTerm, makeFilter, yearFilter, sortBy]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy === 'newest' ? 'updatedAt' :
                sortBy === 'oldest' ? 'updatedAt' :
                sortBy === 'year-desc' ? 'year' :
                sortBy === 'year-asc' ? 'year' :
                sortBy === 'make' ? 'make' :
                sortBy === 'registration' ? 'registrationNumber' : 'updatedAt',
        sortOrder: sortBy === 'oldest' || sortBy === 'year-asc' ? 'asc' : 'desc',
      });

      // Add filters to query
      if (searchTerm) params.append('q', searchTerm);
      if (filter !== 'all') params.append('status', filter);
      if (makeFilter !== 'all') params.append('make', makeFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);

      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        const pagination = result.pagination || {};

        setVehicles(Array.isArray(data) ? data : []);
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.totalPages || 0);
      } else {
        console.error('Failed to fetch vehicles:', response.statusText);
        setVehicles([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      // Fetch counts for each status with current search/filter context (but not status filter)
      const baseParams = new URLSearchParams();
      if (searchTerm) baseParams.append('q', searchTerm);
      if (makeFilter !== 'all') baseParams.append('make', makeFilter);
      if (yearFilter !== 'all') baseParams.append('year', yearFilter);

      const counts = {
        all: 0,
        InStock: 0,
        Booked: 0,
        Sold: 0,
        NotOwned: 0,
      };

      // Fetch total count
      const allResponse = await fetch(`/api/vehicles?${baseParams.toString()}&limit=1&page=1`);
      if (allResponse.ok) {
        const allResult = await allResponse.json();
        counts.all = allResult.pagination?.total || 0;
      }

      // Fetch counts for each status
      const statuses = ['InStock', 'Booked', 'Sold', 'NotOwned'];
      await Promise.all(
        statuses.map(async (status) => {
          const statusParams = new URLSearchParams(baseParams);
          statusParams.append('status', status);
          statusParams.append('limit', '1');
          statusParams.append('page', '1');

          const response = await fetch(`/api/vehicles?${statusParams.toString()}`);
          if (response.ok) {
            const result = await response.json();
            counts[status as keyof typeof counts] = result.pagination?.total || 0;
          }
        })
      );

      setStatusCounts(counts);
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  // Get unique makes and years for filters (we'll need to fetch these separately for filters)
  const uniqueMakes = [...new Set(vehicles.map(v => v.make).filter(Boolean))].sort();
  const uniqueYears = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a, b) => b - a);

  // Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handler for filter changes that should reset pagination
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleMakeFilterChange = (make: string) => {
    setMakeFilter(make);
    setCurrentPage(1);
  };

  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Use vehicles directly since filtering is done server-side
  const filteredVehicles = Array.isArray(vehicles) ? vehicles : [];

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
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Search and Filter Controls */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <ResponsiveInput
                type="text"
                placeholder="Search vehicles by registration, make, model, or color..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
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
                    onChange={(option) => handleMakeFilterChange(option.value)}
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
                    onChange={(option) => handleYearFilterChange(option.value)}
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
                    onChange={(option) => handleSortChange(option.value)}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || makeFilter !== 'all' || yearFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={() => {
                    handleSearchChange('');
                    handleMakeFilterChange('all');
                    handleYearFilterChange('all');
                    handleSortChange('newest');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 whitespace-nowrap"
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
              { key: 'all', label: 'All Vehicles', count: statusCounts.all },
              { key: 'InStock', label: 'In Stock', count: statusCounts.InStock },
              { key: 'Booked', label: 'Booked', count: statusCounts.Booked },
              { key: 'Sold', label: 'Sold', count: statusCounts.Sold },
              { key: 'NotOwned', label: 'Not Owned', count: statusCounts.NotOwned },
            ].map((tab) => {
              const isActive = filter === tab.key;
              let buttonClasses = 'flex items-center space-x-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ';
              let countClasses = 'px-2 py-1 rounded-full text-xs font-bold ';

              if (tab.key === 'all') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
              } else if (tab.key === 'InStock') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-700';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200';
              } else if (tab.key === 'Booked') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                  : 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
              } else if (tab.key === 'Sold') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-700';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200';
              } else if (tab.key === 'NotOwned') {
                buttonClasses += isActive
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600';
                countClasses += isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
              }

              return (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
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
      <div className="flex justify-end">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <div className="text-gray-600 dark:text-gray-300">
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> vehicle{totalItems !== 1 ? 's' : ''} total
          </div>
          <div className="text-gray-400 dark:text-gray-500 hidden sm:block">•</div>
          <div className="text-gray-600 dark:text-gray-300">
            Page: <span className="font-semibold text-gray-900 dark:text-gray-100">{vehicles.length}</span> result{vehicles.length !== 1 ? 's' : ''}
          </div>
          {(searchTerm || makeFilter !== 'all' || yearFilter !== 'all' || filter !== 'all') && (
            <>
              <div className="text-gray-400 dark:text-gray-500 hidden sm:block">•</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <Filter className="inline h-4 w-4 mr-1" />
                Filters applied
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No vehicles</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'Get started by adding a new vehicle.' : `No vehicles with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={(vehicle as any)._id || vehicle.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
              {/* Vehicle Image */}
              <div 
                className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
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
                    <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500" />
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
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {vehicle.registrationNumber}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {vehicle.make} {vehicle.vehicleModel} ({vehicle.year})
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
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
                    className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                    className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium text-center sm:text-left py-1 sm:py-0"
                  >
                    View Details
                  </Link>
                  
                  <div className="flex justify-center sm:justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete((vehicle as any)._id || vehicle.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
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