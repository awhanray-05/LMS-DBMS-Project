import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { membersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await membersAPI.getMemberById(id);
      const member = response.data;
      
      // Set form values
      setValue('first_name', member.firstName);
      setValue('last_name', member.lastName);
      setValue('email', member.email);
      setValue('phone', member.phone);
      setValue('address', member.address);
      setValue('membership_type', member.membershipType);
      setValue('status', member.status);
    } catch (error) {
      console.error('Error fetching member:', error);
      toast.error('Failed to load member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      if (isEdit) {
        await membersAPI.updateMember(id, data);
        toast.success('Member updated successfully');
      } else {
        await membersAPI.createMember(data);
        toast.success('Member created successfully');
      }
      
      navigate('/members');
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} member`);
    } finally {
      setSaving(false);
    }
  };

  const membershipTypes = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'FACULTY', label: 'Faculty' },
    { value: 'STAFF', label: 'Staff' }
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Members
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Member' : 'Add New Member'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update member information' : 'Add a new member to the library'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  {...register('first_name', { 
                    required: 'First name is required',
                    maxLength: { value: 50, message: 'First name must be less than 50 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  {...register('last_name', { 
                    required: 'Last name is required',
                    maxLength: { value: 50, message: 'Last name must be less than 50 characters' }
                  })}
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register('phone', {
                    maxLength: { value: 15, message: 'Phone number must be less than 15 characters' }
                  })}
                  type="tel"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Membership Type */}
              <div>
                <label htmlFor="membership_type" className="block text-sm font-medium text-gray-700">
                  Membership Type *
                </label>
                <select
                  {...register('membership_type', { required: 'Membership type is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {membershipTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.membership_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.membership_type.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  {...register('address', {
                    maxLength: { value: 200, message: 'Address must be less than 200 characters' }
                  })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* Status (only for edit) */}
              {isEdit && (
                <div className="sm:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/members')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : (isEdit ? 'Update Member' : 'Create Member')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
