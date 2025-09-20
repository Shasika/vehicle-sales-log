'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Building, Users, Edit, Trash2, Phone, Mail, AlertTriangle, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { confirmDelete, showDeleteSuccess, showDeleteError } from '@/lib/alerts';

interface Person {
  id: string;
  _id?: string;
  type: 'Individual' | 'Dealer' | 'Company';
  fullName?: string;
  businessName?: string;
  nicOrPassport?: string;
  companyRegNo?: string;
  phone: string[];
  email?: string;
  address?: string;
  isBlacklisted: boolean;
  riskNotes?: string;
  createdAt: string;
}

const typeColors = {
  'Individual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Dealer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Company': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const typeIcons = {
  'Individual': User,
  'Dealer': Users,
  'Company': Building
};

export default function PersonsList() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPersons();
  }, [currentPage, itemsPerPage, filter]);

  const fetchPersons = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Add filters to query
      if (filter !== 'all') {
        if (filter === 'blacklisted') {
          // Note: This would need to be supported by the API
          // For now, we'll handle blacklisted filtering client-side
        } else {
          // Filter by type
          params.append('type', filter);
        }
      }

      const response = await fetch(`/api/persons?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        const pagination = result.pagination || {};

        setPersons(Array.isArray(data) ? data : []);
        setTotalItems(pagination.total || 0);
        setTotalPages(pagination.totalPages || 0);
      } else {
        console.error('Failed to fetch persons:', response.statusText);
        setPersons([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
      setPersons([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Handler for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // For blacklisted filter, we need to filter client-side since API doesn't support it yet
  const filteredPersons = Array.isArray(persons) ?
    filter === 'blacklisted' ? persons.filter(person => person.isBlacklisted) : persons
    : [];

  const handleDelete = async (id: string, name: string) => {
    const result = await confirmDelete(name, 'person');

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/persons/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await showDeleteSuccess('Person');
        setPersons(persons.filter(p => (p.id || p._id) !== id));
      } else {
        await showDeleteError('person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      await showDeleteError('person');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stylish Filter Button Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Filter People</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Choose a category to view specific types of contacts</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                key: 'all',
                label: 'All People',
                count: persons.length,
                icon: Users,
                color: 'blue'
              },
              {
                key: 'Individual',
                label: 'Individuals',
                count: persons.filter(p => p.type === 'Individual').length,
                icon: User,
                color: 'indigo'
              },
              {
                key: 'Dealer',
                label: 'Dealers',
                count: persons.filter(p => p.type === 'Dealer').length,
                icon: Users,
                color: 'green'
              },
              {
                key: 'Company',
                label: 'Companies',
                count: persons.filter(p => p.type === 'Company').length,
                icon: Building,
                color: 'purple'
              },
              {
                key: 'blacklisted',
                label: 'Blacklisted',
                count: persons.filter(p => p.isBlacklisted).length,
                icon: AlertTriangle,
                color: 'red'
              },
            ].map((filterItem) => {
              const IconComponent = filterItem.icon;
              const isActive = filter === filterItem.key;

              const colorClasses = {
                blue: isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/40 hover:border-blue-300 dark:hover:border-blue-600',
                indigo: isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 hover:border-indigo-300 dark:hover:border-indigo-600',
                green: isActive
                  ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200 dark:shadow-green-900/20'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/40 hover:border-green-300 dark:hover:border-green-600',
                purple: isActive
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/20'
                  : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800/40 hover:border-purple-300 dark:hover:border-purple-600',
                red: isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/20'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-800/40 hover:border-red-300 dark:hover:border-red-600'
              };

              return (
                <button
                  key={filterItem.key}
                  onClick={() => setFilter(filterItem.key)}
                  className={`
                    relative inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg border-2 font-medium text-sm
                    transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${colorClasses[filterItem.color as keyof typeof colorClasses]}
                    ${isActive ? 'ring-2 ring-offset-2 ring-opacity-50' : ''}
                  `}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{filterItem.label}</span>
                  <span className="sm:hidden">{filterItem.label.split(' ')[0]}</span>
                  <span className={`
                    inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px]
                    ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}
                  `}>
                    {filterItem.count}
                  </span>

                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <div className="h-3 w-3 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicator */}
        {filter !== 'all' && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Showing:</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {filter === 'blacklisted' ? 'Blacklisted People' : `${filter} Contacts`}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({filteredPersons.length} {filteredPersons.length === 1 ? 'result' : 'results'})
                </span>
              </div>
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Total Count Display */}
      <div className="flex justify-end">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <div className="text-gray-600 dark:text-gray-300">
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalItems}</span> people total
          </div>
          <div className="text-gray-400 dark:text-gray-500 hidden sm:block">•</div>
          <div className="text-gray-600 dark:text-gray-300">
            Page: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredPersons.length}</span> result{filteredPersons.length !== 1 ? 's' : ''}
          </div>
          {(filter !== 'all') && (
            <>
              <div className="text-gray-400 dark:text-gray-500 hidden sm:block">•</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                🔍 Filters applied
              </div>
            </>
          )}
        </div>
      </div>

      {/* Persons Grid */}
      {filteredPersons.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No people</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'Get started by adding a new person.' : `No ${filter.toLowerCase()} found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPersons.map((person) => {
            const Icon = typeIcons[person.type];
            const displayName = person.fullName || person.businessName || 'Unnamed';
            
            return (
              <div key={person.id || (person as any)._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header with type and blacklist warning */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[person.type]}`}>
                        {person.type}
                      </span>
                    </div>
                    {person.isBlacklisted && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                    {displayName}
                  </h3>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {person.phone.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4" />
                        <span>{person.phone[0]}</span>
                        {person.phone.length > 1 && (
                          <span className="text-gray-400 dark:text-gray-500">+{person.phone.length - 1} more</span>
                        )}
                      </div>
                    )}
                    
                    {person.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Identification */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {person.nicOrPassport && (
                      <div>ID: {person.nicOrPassport}</div>
                    )}
                    {person.companyRegNo && (
                      <div>Reg: {person.companyRegNo}</div>
                    )}
                  </div>

                  {/* Address */}
                  {person.address && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <p className="truncate" title={person.address}>
                        {person.address}
                      </p>
                    </div>
                  )}

                  {/* Risk Notes */}
                  {person.riskNotes && (
                    <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Risk:</strong> {person.riskNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/persons/${person.id || (person as any)._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/persons/${person.id || (person as any)._id}`}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/persons/${person.id || (person as any)._id}/edit`}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit Person"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(person.id || (person as any)._id, person.fullName || person.businessName || 'Unknown')}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Person"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}