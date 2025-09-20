'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Building, Users, Edit, Trash2, Phone, Mail, AlertTriangle, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
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
  'Individual': 'bg-blue-100 text-blue-800',
  'Dealer': 'bg-green-100 text-green-800',
  'Company': 'bg-purple-100 text-purple-800'
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

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/persons');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setPersons(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch persons:', response.statusText);
        setPersons([]);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
      setPersons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersons = Array.isArray(persons) ? persons.filter(person => {
    if (filter === 'all') return true;
    if (filter === 'blacklisted') return person.isBlacklisted;
    return person.type === filter;
  }) : [];

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
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stylish Filter Button Groups */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Filter People</h2>
            <p className="text-sm text-gray-600">Choose a category to view specific types of contacts</p>
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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
                indigo: isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
                green: isActive
                  ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300',
                purple: isActive
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
                red: isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
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
                    ${isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-700'}
                  `}>
                    {filterItem.count}
                  </span>

                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <div className="h-3 w-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicator */}
        {filter !== 'all' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Showing:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {filter === 'blacklisted' ? 'Blacklisted People' : `${filter} Contacts`}
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredPersons.length} {filteredPersons.length === 1 ? 'result' : 'results'})
                </span>
              </div>
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persons Grid */}
      {filteredPersons.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No people</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Get started by adding a new person.' : `No ${filter.toLowerCase()} found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPersons.map((person) => {
            const Icon = typeIcons[person.type];
            const displayName = person.fullName || person.businessName || 'Unnamed';
            
            return (
              <div key={person.id || (person as any)._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header with type and blacklist warning */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[person.type]}`}>
                        {person.type}
                      </span>
                    </div>
                    {person.isBlacklisted && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {displayName}
                  </h3>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {person.phone.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{person.phone[0]}</span>
                        {person.phone.length > 1 && (
                          <span className="text-gray-400">+{person.phone.length - 1} more</span>
                        )}
                      </div>
                    )}
                    
                    {person.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Identification */}
                  <div className="text-xs text-gray-500 mb-4">
                    {person.nicOrPassport && (
                      <div>ID: {person.nicOrPassport}</div>
                    )}
                    {person.companyRegNo && (
                      <div>Reg: {person.companyRegNo}</div>
                    )}
                  </div>

                  {/* Address */}
                  {person.address && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="truncate" title={person.address}>
                        {person.address}
                      </p>
                    </div>
                  )}

                  {/* Risk Notes */}
                  {person.riskNotes && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Risk:</strong> {person.riskNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/persons/${person.id || (person as any)._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/persons/${person.id || (person as any)._id}`}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/persons/${person.id || (person as any)._id}/edit`}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit Person"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(person.id || (person as any)._id, person.fullName || person.businessName || 'Unknown')}
                        className="p-1 text-gray-400 hover:text-red-600"
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
    </div>
  );
}