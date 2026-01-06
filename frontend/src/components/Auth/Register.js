import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  role: yup.string().oneOf(['rider', 'driver', 'admin'], 'Invalid role').required('Role is required'),
  profilePicture: yup.mixed().optional()
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'rider'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('role', data.role);

      if (data.profilePicture && data.profilePicture[0]) {
        formData.append('profilePicture', data.profilePicture[0]);
      }

      const response = await authService.register(formData);

      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
        setRegistrationSuccess(true);
        // Redirect to OTP verification page
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: data.email } });
        }, 2000);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setValue('role', role);
  };

  if (registrationSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Registration Successful!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to your email. Please check your inbox and verify your account.
        </p>
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Redirecting to verification page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join CabZee</h2>
        <p className="text-gray-600 mb-8">
          Start your journey today{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            or sign in to existing account
          </Link>
        </p>
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
          I want to join as a
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleRoleChange('rider')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'rider'
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedRole === 'rider' ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm ${selectedRole === 'rider' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                Rider
              </p>
              <p className="text-xs text-gray-500 mt-1">Book rides & travel</p>
            </div>
            {selectedRole === 'rider' && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('driver')}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'driver'
              ? 'border-green-500 bg-green-50 shadow-lg'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedRole === 'driver' ? 'bg-green-500' : 'bg-gray-400'
              }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-center">
              <p className={`font-semibold text-sm ${selectedRole === 'driver' ? 'text-green-600' : 'text-gray-700'
                }`}>
                Driver
              </p>
              <p className="text-xs text-gray-500 mt-1">Earn money driving</p>
            </div>
            {selectedRole === 'driver' && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className={`appearance-none block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${errors.name
                ? 'border-red-300 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`appearance-none block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${errors.email
                ? 'border-red-300 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              className={`appearance-none block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${errors.phone
                ? 'border-red-300 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                }`}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="profilePicture" className="block text-sm font-semibold text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block">
                <span>Upload a file</span>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  {...register('profilePicture', {
                    onChange: (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }
                  })}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP up to 5MB</p>
            </div>
          </div>
          {errors.profilePicture && (
            <p className="mt-1 text-sm text-red-600 font-medium">{errors.profilePicture.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${errors.password
                  ? 'border-red-300 focus:ring-red-200 bg-red-50'
                  : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                  }`}
                placeholder="Password"
              />
              {errors.password && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`appearance-none block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${errors.confirmPassword
                  ? 'border-red-300 focus:ring-red-200 bg-red-50'
                  : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                  }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <input type="hidden" {...register('role')} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </div>
            ) : (
              <div className="flex items-center">
                <span>Get Started</span>
                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
