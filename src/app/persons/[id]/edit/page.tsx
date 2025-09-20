import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import { Person } from '@/models';
import PersonEditForm from '@/components/persons/PersonEditForm';

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

export default async function PersonEditPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { id } = await params;
  const person = await getPerson(id);
  
  if (!person) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href={`/persons/${person._id}`}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit Person ✏️
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Update {person.fullName || person.businessName || 'person'} information
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <PersonEditForm person={person} />
        </div>
      </div>
    </div>
  );
}