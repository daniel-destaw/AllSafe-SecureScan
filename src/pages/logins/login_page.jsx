import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    mfaCode: '',
    mfaType: 'authenticator'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
    mfaCode: false
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    router.post('/login', credentials, {
      onFinish: () => setIsSubmitting(false)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-200/30 blur-3xl"></div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo with animation */}
        <div className="text-center transform transition-all duration-500 hover:scale-105 hover:-translate-y-1">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/static/logo/rm-logo.png" 
                alt="Company Logo" 
                className="h-14 w-auto object-contain transition-all duration-300 hover:drop-shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md -z-10"></div>
            </div>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="mt-8 bg-white py-8 px-8 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-200/60 transition-all duration-300 hover:shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 ${isFocused.username ? 'opacity-100 scale-110' : 'opacity-80'}`}>
                  <svg className={`h-5 w-5 ${isFocused.username ? 'text-blue-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  onFocus={() => handleFocus('username')}
                  onBlur={() => handleBlur('username')}
                  className={`block w-full pl-10 pr-4 py-3 border ${isFocused.username ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none transition-all duration-200 bg-white/90`}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 ${isFocused.password ? 'opacity-100 scale-110' : 'opacity-80'}`}>
                  <svg className={`h-5 w-5 ${isFocused.password ? 'text-blue-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  className={`block w-full pl-10 pr-4 py-3 border ${isFocused.password ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none transition-all duration-200 bg-white/90`}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* MFA Section */}
            <div className="pt-6 border-t border-gray-200/70">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`p-1 rounded-lg ${isFocused.mfaCode ? 'bg-blue-100/50' : 'bg-gray-100'}`}>
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Two-Factor Authentication
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Multi-factor Type */}
                <div>
                  <label htmlFor="mfaType" className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    id="mfaType"
                    name="mfaType"
                    value={credentials.mfaType}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 rounded-lg shadow-sm transition-all duration-200 bg-white/90"
                  >
                    <option value="authenticator">Authenticator App</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                {/* Verification Code */}
                <div>
                  <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="mfaCode"
                    name="mfaCode"
                    type="text"
                    value={credentials.mfaCode}
                    onChange={handleChange}
                    onFocus={() => handleFocus('mfaCode')}
                    onBlur={() => handleBlur('mfaCode')}
                    className={`block w-full px-3 py-2.5 border ${isFocused.mfaCode ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none transition-all duration-200 bg-white/90`}
                    placeholder={credentials.mfaType === 'authenticator' ? '6-digit code' : 'Enter code'}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember this device
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${isSubmitting ? 'opacity-90 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>New to our platform? <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline">Request access</a></p>
          <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

Login.isLoginPage = true;
export default Login;