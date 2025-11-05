import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Library, Eye, EyeOff, Loader, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { memberAuthAPI } from '../services/api';

const MemberChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [member, setMember] = useState(null);

  useEffect(() => {
    // Check if member is logged in
    const memberToken = localStorage.getItem('memberToken');
    const memberData = localStorage.getItem('member');
    
    if (!memberToken || !memberData) {
      navigate('/member-login');
      return;
    }

    try {
      const memberInfo = JSON.parse(memberData);
      setMember(memberInfo);
      
      // If password already changed, redirect to dashboard
      if (memberInfo.passwordChanged) {
        navigate('/member');
      }
    } catch (error) {
      console.error('Error parsing member data:', error);
      navigate('/member-login');
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus
  } = useForm();

  useEffect(() => {
    setFocus('currentPassword');
  }, [setFocus]);

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await memberAuthAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Password changed successfully! Please login again.');
      
      // Clear member session
      localStorage.removeItem('memberToken');
      localStorage.removeItem('member');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/member-login');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Change Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            For security reasons, please change your initial password
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                {...register('currentPassword', { 
                  required: 'Current password is required'
                })}
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your current password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long'
                  }
                })}
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter your new password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your new password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> After changing your password, you will be logged out and need to login again with your new password.
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberChangePassword;

