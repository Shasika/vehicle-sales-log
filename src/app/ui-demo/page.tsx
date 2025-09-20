'use client';

import React, { useState } from 'react';
import ResponsiveModal from '@/components/ui/ResponsiveModal';
import ResponsiveDropdown from '@/components/ui/ResponsiveDropdown';
import DatePicker, { DateTimePicker } from '@/components/ui/DatePicker';
import ResponsiveSelect from '@/components/ui/ResponsiveSelect';
import ResponsiveInput from '@/components/ui/ResponsiveInput';
import ResponsiveTextarea from '@/components/ui/ResponsiveTextarea';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function UIDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLongModalOpen, setIsLongModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const countryOptions = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Australia', value: 'au' },
    { label: 'Germany', value: 'de' },
    { label: 'France', value: 'fr' },
    { label: 'Japan', value: 'jp' },
  ];

  const categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Vehicles', value: 'vehicles' },
    { label: 'Real Estate', value: 'real-estate' },
    { label: 'Sports & Recreation', value: 'sports' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Books & Media', value: 'books' },
    { label: 'Health & Beauty', value: 'health' },
    { label: 'Food & Beverages', value: 'food' },
    { label: 'Toys & Games', value: 'toys' },
    { label: 'Arts & Crafts', value: 'arts' },
    { label: 'Music & Instruments', value: 'music' },
    { label: 'Pet Supplies', value: 'pets' },
    { label: 'Office Supplies', value: 'office' },
    { label: 'Garden & Outdoor', value: 'garden' },
    { label: 'Tools & Hardware', value: 'tools' },
    { label: 'Travel & Luggage', value: 'travel' },
    { label: 'Jewelry & Accessories', value: 'jewelry' },
    { label: 'Baby & Kids', value: 'baby' },
    { label: 'Collectibles', value: 'collectibles' },
    { label: 'Home & Garden', value: 'home-garden', disabled: true },
  ];

  const dropdownItems = [
    {
      label: 'Edit Profile',
      value: 'edit',
      icon: <PencilIcon className="h-4 w-4" />,
      onClick: () => alert('Edit Profile clicked!'),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <CogIcon className="h-4 w-4" />,
      onClick: () => alert('Settings clicked!'),
    },
    {
      label: 'Account Details',
      value: 'account',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => alert('Account Details clicked!'),
    },
    {
      label: 'Privacy Settings',
      value: 'privacy',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => alert('Privacy Settings clicked!'),
    },
    {
      label: 'Notification Preferences',
      value: 'notifications',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => alert('Notifications clicked!'),
    },
    {
      label: 'Security Options',
      value: 'security',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => alert('Security clicked!'),
    },
    {
      label: 'Billing & Payments',
      value: 'billing',
      icon: <CurrencyDollarIcon className="h-4 w-4" />,
      onClick: () => alert('Billing clicked!'),
    },
    {
      label: 'Help & Support',
      value: 'help',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => alert('Help clicked!'),
    },
    {
      label: 'Delete Account',
      value: 'delete',
      icon: <TrashIcon className="h-4 w-4" />,
      onClick: () => alert('Delete Account clicked!'),
      disabled: true,
    },
    {
      label: 'Sign Out',
      value: 'signout',
      icon: <ArrowRightOnRectangleIcon className="h-4 w-4" />,
      onClick: () => alert('Sign Out clicked!'),
    },
  ];

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          UI Components Demo 🎨
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Responsive components that work perfectly on mobile and desktop
        </p>
      </div>

      <div className="space-y-8">
        {/* Modal Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Modal</h2>
          <p className="text-gray-600 mb-4">
            Modal that adapts to mobile and desktop screens with proper backdrop and animations.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Simple Modal
            </button>
            <button
              onClick={() => setIsLongModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Long Content Modal
            </button>
          </div>
        </div>

        {/* Dropdown Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Dropdown</h2>
          <p className="text-gray-600 mb-4">
            Dropdown menu with proper positioning, touch-friendly on mobile, and keyboard navigation.
          </p>
          <div className="flex flex-wrap gap-3">
            <ResponsiveDropdown
              label="User Actions"
              items={dropdownItems}
              position="left"
            />
            <ResponsiveDropdown
              label="More Options"
              items={dropdownItems.slice(0, 2)}
              position="left"
              buttonClassName="bg-green-600 text-gray-900 hover:bg-green-700 border-green-600"
            />
          </div>
        </div>

        {/* Date Picker Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Date Picker</h2>
          <p className="text-gray-600 mb-4">
            Date and time picker that works well on mobile with proper touch interactions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Choose a date"
            />
            <DateTimePicker
              label="Select Date & Time"
              value={selectedDateTime}
              onChange={setSelectedDateTime}
              placeholder="Choose date and time"
            />
            <DatePicker
              label="With Min/Max Date"
              value={null}
              onChange={() => {}}
              placeholder="Restricted range"
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            />
          </div>
        </div>

        {/* Select Dropdown Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Select</h2>
          <p className="text-gray-600 mb-4">
            Custom select dropdowns with search functionality and disabled options.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ResponsiveSelect
              label="Country"
              options={countryOptions}
              selected={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Select a country"
            />
            <ResponsiveSelect
              label="Category"
              options={categoryOptions}
              selected={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Choose category"
            />
            <ResponsiveSelect
              label="Disabled Select"
              options={[]}
              selected={undefined}
              onChange={() => {}}
              placeholder="This is disabled"
              disabled
            />
          </div>
        </div>

        {/* Input Fields Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Input Fields</h2>
          <p className="text-gray-600 mb-4">
            Various input types with icons, validation states, and mobile-optimized touch targets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ResponsiveInput
              label="Search"
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
            <ResponsiveInput
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<EnvelopeIcon className="h-4 w-4" />}
            />
            <ResponsiveInput
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<PhoneIcon className="h-4 w-4" />}
            />
            <ResponsiveInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              rightIcon={showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              onRightIconClick={() => setShowPassword(!showPassword)}
            />
            <ResponsiveInput
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<CurrencyDollarIcon className="h-4 w-4" />}
            />
            <ResponsiveInput
              label="Disabled Input"
              type="text"
              placeholder="This is disabled"
              disabled
              value="Read only value"
            />
          </div>
        </div>

        {/* Textarea Demo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsive Textarea</h2>
          <p className="text-gray-600 mb-4">
            Multi-line text input that adapts to mobile with proper keyboard handling.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResponsiveTextarea
              label="Description"
              placeholder="Enter a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <ResponsiveTextarea
              label="Comments (with error)"
              placeholder="This field has an error state"
              error="This field is required"
              rows={4}
            />
          </div>
        </div>

        {/* Mobile vs Desktop Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📱 Mobile & Desktop Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Mobile Optimizations</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Touch-friendly interactions</li>
                <li>✓ Proper viewport handling</li>
                <li>✓ Gesture support</li>
                <li>✓ Larger tap targets</li>
                <li>✓ Responsive text sizes</li>
                <li>✓ Mobile-first animations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Desktop Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Keyboard navigation</li>
                <li>✓ Hover states</li>
                <li>✓ Focus management</li>
                <li>✓ Accessibility support</li>
                <li>✓ Smooth animations</li>
                <li>✓ Proper positioning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 How to Use</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 mb-4">
              These components are ready to use in your application. Here&apos;s how to import them:
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200 font-mono text-sm">
              <div className="text-gray-800">
                <div className="text-green-600">{`// Import the components`}</div>
                <div>import ResponsiveModal from &apos;@/components/ui/ResponsiveModal&apos;;</div>
                <div>import ResponsiveDropdown from &apos;@/components/ui/ResponsiveDropdown&apos;;</div>
                <div>import DatePicker, &#123; DateTimePicker &#125; from &apos;@/components/ui/DatePicker&apos;;</div>
                <div>import ResponsiveSelect from &apos;@/components/ui/ResponsiveSelect&apos;;</div>
                <div>import ResponsiveInput from &apos;@/components/ui/ResponsiveInput&apos;;</div>
                <div>import ResponsiveTextarea from &apos;@/components/ui/ResponsiveTextarea&apos;;</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Long Content Modal */}
      <ResponsiveModal
        isOpen={isLongModalOpen}
        onClose={() => setIsLongModalOpen(false)}
        title="📋 Vehicle Registration Form - Complete Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to Vehicle Registration</h3>
            <p className="text-blue-800 text-sm">
              Please fill out this comprehensive form to register your vehicle. This modal demonstrates
              how our responsive modal handles lengthy content with proper scrolling behavior on both
              mobile and desktop devices. All form elements are fully functional and demonstrate
              real-world usage scenarios.
            </p>
          </div>

          {/* Vehicle Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🚗 Vehicle Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResponsiveInput
                label="Vehicle Make"
                placeholder="e.g., Toyota, Ford, BMW"
                leftIcon={<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>}
              />
              <ResponsiveInput
                label="Vehicle Model"
                placeholder="e.g., Camry, F-150, X3"
              />
              <ResponsiveInput
                label="Year"
                type="number"
                placeholder="2020"
                min="1900"
                max="2025"
              />
              <ResponsiveSelect
                label="Vehicle Type"
                options={[
                  { label: 'Sedan', value: 'sedan' },
                  { label: 'SUV', value: 'suv' },
                  { label: 'Truck', value: 'truck' },
                  { label: 'Hatchback', value: 'hatchback' },
                  { label: 'Coupe', value: 'coupe' },
                  { label: 'Convertible', value: 'convertible' },
                ]}
                selected={undefined}
                onChange={() => {}}
                placeholder="Select vehicle type"
              />
              <ResponsiveInput
                label="VIN Number"
                placeholder="17-character VIN"
                maxLength={17}
              />
              <ResponsiveInput
                label="License Plate"
                placeholder="ABC-1234"
              />
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">👤 Owner Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResponsiveInput
                label="First Name"
                placeholder="John"
                leftIcon={<UserIcon className="h-4 w-4" />}
              />
              <ResponsiveInput
                label="Last Name"
                placeholder="Doe"
              />
              <ResponsiveInput
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                leftIcon={<EnvelopeIcon className="h-4 w-4" />}
              />
              <ResponsiveInput
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
              />
              <div className="sm:col-span-2">
                <ResponsiveTextarea
                  label="Address"
                  placeholder="Enter complete address including street, city, state, and ZIP code"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResponsiveInput
                label="Purchase Price"
                type="number"
                placeholder="25000"
                leftIcon={<CurrencyDollarIcon className="h-4 w-4" />}
              />
              <DatePicker
                label="Purchase Date"
                value={null}
                onChange={() => {}}
                placeholder="Select purchase date"
              />
              <ResponsiveSelect
                label="Financing Type"
                options={[
                  { label: 'Cash Purchase', value: 'cash' },
                  { label: 'Bank Loan', value: 'loan' },
                  { label: 'Dealer Financing', value: 'dealer' },
                  { label: 'Lease', value: 'lease' },
                ]}
                selected={undefined}
                onChange={() => {}}
                placeholder="How was this vehicle financed?"
              />
              <ResponsiveInput
                label="Monthly Payment"
                type="number"
                placeholder="450"
                leftIcon={<CurrencyDollarIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Insurance Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Insurance Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResponsiveInput
                label="Insurance Company"
                placeholder="State Farm, Geico, etc."
              />
              <ResponsiveInput
                label="Policy Number"
                placeholder="Policy #123456789"
              />
              <DatePicker
                label="Policy Start Date"
                value={null}
                onChange={() => {}}
                placeholder="When does coverage begin?"
              />
              <DatePicker
                label="Policy End Date"
                value={null}
                onChange={() => {}}
                placeholder="When does coverage end?"
              />
              <ResponsiveInput
                label="Agent Name"
                placeholder="Agent full name"
              />
              <ResponsiveInput
                label="Agent Phone"
                type="tel"
                placeholder="+1 (555) 987-6543"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 Additional Information</h4>
            <div className="space-y-4">
              <ResponsiveTextarea
                label="Vehicle Description"
                placeholder="Describe any special features, modifications, or notable characteristics of the vehicle..."
                rows={4}
              />
              <ResponsiveTextarea
                label="Maintenance Notes"
                placeholder="Any existing maintenance records, known issues, or upcoming service requirements..."
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResponsiveInput
                  label="Odometer Reading"
                  type="number"
                  placeholder="85000"
                  rightIcon={<span className="text-xs">miles</span>}
                />
                <ResponsiveSelect
                  label="Condition"
                  options={[
                    { label: 'Excellent', value: 'excellent' },
                    { label: 'Very Good', value: 'very-good' },
                    { label: 'Good', value: 'good' },
                    { label: 'Fair', value: 'fair' },
                    { label: 'Poor', value: 'poor' },
                  ]}
                  selected={undefined}
                  onChange={() => {}}
                  placeholder="Overall condition"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🚨 Emergency Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResponsiveInput
                label="Contact Name"
                placeholder="Emergency contact full name"
              />
              <ResponsiveInput
                label="Relationship"
                placeholder="Spouse, Parent, Sibling, etc."
              />
              <ResponsiveInput
                label="Emergency Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
              />
              <ResponsiveInput
                label="Alternative Phone"
                type="tel"
                placeholder="+1 (555) 111-1111"
                leftIcon={<PhoneIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Terms and Conditions</h4>
            <div className="text-sm text-gray-700 space-y-2 max-h-32 overflow-y-auto border border-gray-200 bg-white p-3 rounded">
              <p>By submitting this vehicle registration form, you acknowledge and agree to the following terms:</p>
              <p>1. All information provided is accurate and complete to the best of your knowledge.</p>
              <p>2. You understand that false information may result in rejection of registration or legal consequences.</p>
              <p>3. You consent to the collection and processing of your personal data for registration purposes.</p>
              <p>4. You agree to notify us of any changes to the provided information within 30 days.</p>
              <p>5. Registration fees are non-refundable once processing begins.</p>
              <p>6. You acknowledge responsibility for maintaining valid insurance coverage.</p>
              <p>7. Regular vehicle inspections may be required based on local regulations.</p>
              <p>8. This registration must be renewed annually or as required by law.</p>
            </div>
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                I have read and agree to the terms and conditions
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsLongModalOpen(false)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Registration
            </button>
            <button
              onClick={() => setIsLongModalOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Save as Draft
            </button>
            <button
              onClick={() => setIsLongModalOpen(false)}
              className="sm:flex-initial px-6 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Simple Demo Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a responsive modal that works great on both mobile and desktop devices.
            It includes proper backdrop handling, animations, and accessibility features.
          </p>

          <div className="space-y-3">
            <DatePicker
              label="Event Date"
              value={null}
              onChange={() => {}}
              placeholder="Select event date"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter description..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}