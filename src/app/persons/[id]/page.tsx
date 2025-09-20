import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, User, Building, Users, Phone, Mail, AlertTriangle } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import { Person } from '@/models';
import DeletePersonButton from '@/components/persons/DeletePersonButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPerson(id: string) {
  await connectDB();
  
  try {
    const person = await Person.findById(id).lean();
    if (!person || person.deletedAt) {
      return null;
    }
    return JSON.parse(JSON.stringify(person));
  } catch (error) {
    return null;
  }
}

export default async function PersonDetailsPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const person = await getPerson(id);
  
  if (!person) {
    notFound();
  }

  const typeColors = {
    Individual: 'bg-blue-100 text-blue-800 border-blue-200',
    Dealer: 'bg-green-100 text-green-800 border-green-200',
    Company: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const typeIcons = {
    Individual: User,
    Dealer: Users,
    Company: Building
  };

  const TypeIcon = typeIcons[person.type as keyof typeof typeIcons];

  return (
    <div className="max-w-full xl:max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                href="/persons"
                className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to People
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {person.fullName || person.businessName} 👤
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {person.type} Contact
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/persons/${person._id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Person
              </Link>
              <DeletePersonButton 
                personId={person._id} 
                personName={person.fullName || person.businessName || 'Unknown'}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Person Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {person.type === 'Individual' ? (
                  <>
                    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Full Name
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {person.fullName || 'N/A'}
                      </dd>
                    </div>
                    {person.nicOrPassport && (
                      <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          NIC/Passport
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {person.nicOrPassport}
                        </dd>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Business Name
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {person.businessName || 'N/A'}
                      </dd>
                    </div>
                    {person.companyRegNo && (
                      <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Registration Number
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {person.companyRegNo}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone Numbers
                  </dt>
                  <dd className="mt-1 space-y-1">
                    {person.phone.map((phoneNumber: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{phoneNumber}</span>
                      </div>
                    ))}
                  </dd>
                </div>

                {person.email && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </dt>
                    <dd className="mt-1 flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{person.email}</span>
                    </dd>
                  </div>
                )}

                {person.address && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {person.address}
                    </dd>
                  </div>
                )}

                {person.notes && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notes
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {person.notes}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status and Meta */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status & Type</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <TypeIcon className="h-4 w-4 text-gray-500" />
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${typeColors[person.type as keyof typeof typeColors]}`}>
                      {person.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <div className="mt-1">
                    {person.isBlacklisted ? (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200">
                          Blacklisted
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {person.isBlacklisted && person.riskNotes && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <dt className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                      Risk Notes
                    </dt>
                    <dd className="mt-1 text-sm text-red-800 dark:text-red-300">
                      {person.riskNotes}
                    </dd>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                  <div className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(person.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}