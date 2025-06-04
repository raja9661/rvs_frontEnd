import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Combobox } from '@headlessui/react';
import { 
  User, Mail, Phone, Building2, MapPin, 
  ShieldCheck, Key, Lock, Loader2, AlertCircle, Check, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import Layout from '../Layout/Layout';

// Static list of client codes
const CLIENT_CODES = [
  "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", 
  "NTK-2", "NTK-3", "NTK-4", "AC", "HAIER", "OD", 
  "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", 
  "SS", "CCS", "RCA", "UR", "PRA", "JAI", "GL", 
  "AP", "HF", "CV", "VG", "VG-1", "ATT", "CCC"
];

const CreateUser = () => {
  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    address: '',
    role: '',
    clientCode: '',
    createrId: ''
  });
  
  const [generatedData, setGeneratedData] = useState({
    userId: '',
    password: '',
    isPasswordEdited: false,
    isUserIdEdited: false,
    showPassword: false
  });
  
  const [state, setState] = useState({
    showCredentials: false,
    isLoading: false,
    isGenerating: false,
    fieldErrors: {},
    filteredClientCodes: CLIENT_CODES
  });

  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const roles = ['admin', 'client', 'employee', 'vendor'];

  // Fetch creator ID on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loginUser')) || {};
    setFormData(prev => ({ ...prev, createrId: user.userId || '' }));
  }, []);

  // Filter client codes based on input
  const filterClientCodes = (query) => {
    if (!query) return CLIENT_CODES;
    return CLIENT_CODES.filter(code =>
      code.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field errors when typing
    if (state.fieldErrors[name]) {
      setState(prev => ({
        ...prev,
        fieldErrors: { ...prev.fieldErrors, [name]: undefined }
      }));
    }

    // Reset client code when role changes
    if (name === 'role' && value !== 'client') {
      setFormData(prev => ({ ...prev, clientCode: '' }));
    }
  };

  // Handle User ID changes
  const handleUserIdChange = (e) => {
    const newUserId = e.target.value;
    setGeneratedData(prev => ({
      ...prev,
      userId: newUserId,
      isUserIdEdited: true
    }));
  };

  // Handle Password changes
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setGeneratedData(prev => ({
      ...prev,
      password: newPassword,
      isPasswordEdited: true
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setGeneratedData(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  // Regenerate User ID
  const regenerateUserId = () => {
    const randomUserId = `user${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedData(prev => ({
      ...prev,
      userId: randomUserId,
      isUserIdEdited: false
    }));
  };

  // Regenerate Password
  const regeneratePassword = () => {
    setGeneratedData(prev => ({
      ...prev,
      password: Math.random().toString(36).slice(-8),
      isPasswordEdited: false
    }));
  };

  // Generate random credentials
  const generateCredentials = () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isGenerating: true }));
    
    setTimeout(() => {
      // Only generate new User ID if it hasn't been manually edited
      const randomUserId = generatedData.isUserIdEdited 
        ? generatedData.userId
        : `user${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Only generate new password if it hasn't been manually edited
      const randomPassword = generatedData.isPasswordEdited 
        ? generatedData.password
        : Math.random().toString(36).slice(-8);
      
      setGeneratedData({ 
        userId: randomUserId, 
        password: randomPassword,
        isUserIdEdited: false,
        isPasswordEdited: false,
        showPassword: false
      });
      setState(prev => ({
        ...prev,
        showCredentials: true,
        isGenerating: false
      }));
    }, 500);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = ['name', 'email', 'phoneNumber', 'companyName', 'address', 'role'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    // Phone number validation
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
      isValid = false;
    }

    // Client code validation
    if (formData.role === 'client' && !formData.clientCode) {
      errors.clientCode = 'Client code is required';
      isValid = false;
    }

    setState(prev => ({ ...prev, fieldErrors: errors }));
    return isValid;
  };

  // Form submission
  const handleSubmit = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const finalData = {
        ...formData,
        userId: generatedData.userId,
        password: generatedData.password
      };

      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/auth/createUser`,
        finalData
      );
      
      toast.success(response.data.message);
      resetForm();
    } catch (error) {
      handleSubmissionError(error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Reset form after successful submission
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      address: '',
      role: '',
      clientCode: '',
      createrId: formData.createrId
    });
    setGeneratedData({ 
      userId: '', 
      password: '',
      isUserIdEdited: false,
      isPasswordEdited: false,
      showPassword: false
    });
    setState(prev => ({
      ...prev,
      showCredentials: false,
      fieldErrors: {}
    }));
  };

  // Error handling
  const handleSubmissionError = (error) => {
    if (error.response?.data?.field) {
      setState(prev => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [error.response.data.field]: error.response.data.message
        }
      }));
      
      // Scroll to the error field
      setTimeout(() => {
        const element = document.querySelector(`[name="${error.response.data.field}"]`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    toast.error(error.response?.data?.message || 'Failed to create user');
  };

  // Styled components
  const labelClasses = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  const inputClasses = `w-full p-3 rounded-lg shadow-sm transition-all duration-200 ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
      : 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  }`;

  const iconClasses = `absolute left-3 top-[35px] w-5 h-5 ${
    isDarkMode ? 'text-gray-400' : 'text-gray-500'
  }`;

  const errorIconClasses = `absolute right-3 top-[35px] w-5 h-5 text-red-500`;

  return (
    <Layout>
      <div className={`mx-auto py-4  ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      } rounded-xl shadow-xl mt-8 transition-all duration-300 hover:shadow-2xl`}>
        
        {/* Header Section */}
        <div className={`px-8 py-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create New User
          </h2>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="relative">
                <label className={labelClasses}>Full Name *</label>
                <User className={iconClasses} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {state.fieldErrors.name && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
                  </>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <label className={labelClasses}>Email Address *</label>
                <Mail className={iconClasses} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {state.fieldErrors.email && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>
                  </>
                )}
              </div>

              {/* Phone Field */}
              <div className="relative">
                <label className={labelClasses}>Phone Number *</label>
                <Phone className={iconClasses} />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength="10"
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {state.fieldErrors.phoneNumber && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.phoneNumber}</p>
                  </>
                )}
              </div>

              {/* Company Field */}
              <div className="relative">
                <label className={labelClasses}>Company Name *</label>
                <Building2 className={iconClasses} />
                <input
                  type="text"
                  name="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {state.fieldErrors.companyName && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.companyName}</p>
                  </>
                )}
              </div>

              {/* Address Field */}
              <div className="relative">
                <label className={labelClasses}>Address *</label>
                <MapPin className={iconClasses} />
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                />
                {state.fieldErrors.address && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.address}</p>
                  </>
                )}
              </div>

              {/* Role Field */}
              <div className="relative">
                <label className={labelClasses}>User Role *</label>
                <ShieldCheck className={iconClasses} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${
                    state.fieldErrors.role ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role}
                    </option>
                  ))}
                </select>
                {state.fieldErrors.role && (
                  <>
                    <AlertCircle className={errorIconClasses} />
                    <p className="mt-1 text-sm text-red-600">{state.fieldErrors.role}</p>
                  </>
                )}
              </div>

              {/* Client Code Field (Conditional) */}
              {formData.role === 'client' && (
                <div className="relative">
                  <label className={labelClasses}>Client Code *</label>
                  <Combobox 
                    value={formData.clientCode} 
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, clientCode: value }));
                      setState(prev => ({
                        ...prev,
                        fieldErrors: { ...prev.fieldErrors, clientCode: undefined }
                      }));
                    }}
                  >
                    <div className="relative">
                      <Combobox.Input
                        name="clientCode"
                        placeholder="Select or type a client code"
                        className={`${inputClasses} pl-10 ${
                          state.fieldErrors.clientCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                        onChange={(e) => {
                          const query = e.target.value;
                          setFormData(prev => ({ ...prev, clientCode: query }));
                          setState(prev => ({
                            ...prev,
                            filteredClientCodes: filterClientCodes(query)
                          }));
                        }}
                        displayValue={(code) => code}
                      />
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {state.filteredClientCodes.length === 0 ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                            No matching client codes
                          </div>
                        ) : (
                          state.filteredClientCodes.map((code) => (
                            <Combobox.Option
                              key={code}
                              value={code}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {code}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500 dark:text-blue-300">
                                      <Check className="h-5 w-5" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                  {state.fieldErrors.clientCode && (
                    <>
                      <AlertCircle className={errorIconClasses} />
                      <p className="mt-1 text-sm text-red-600">{state.fieldErrors.clientCode}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Generate Credentials Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={generateCredentials}
                disabled={!formData.role || state.isGenerating}
                className={`w-full py-3 rounded-lg text-base font-semibold shadow-md transition-all duration-200 flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800/50'
                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-400/50'
                }`}
              >
                {state.isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Generate Credentials
                  </>
                )}
              </button>
            </div>

            {/* Credentials Section */}
            {state.showCredentials && (
              <div className={`mt-8 p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } mb-4`}>
                  Generated Credentials
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <label className={labelClasses}>User ID</label>
                    <User className={iconClasses} />
                    <input
                      type="text"
                      name="generatedUserId"
                      value={generatedData.userId}
                      onChange={handleUserIdChange}
                      className={`${inputClasses} pl-10 pr-12 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                      }`}
                    />
                    <div className="absolute right-3 top-[35px] flex">
                      <button
                        type="button"
                        onClick={regenerateUserId}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Regenerate User ID"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    {generatedData.isUserIdEdited && (
                      <span className="absolute right-10 top-[35px] text-xs text-yellow-500">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <label className={labelClasses}>Password</label>
                    <Key className={iconClasses} />
                    <input
                      type={generatedData.showPassword ? "text" : "password"}
                      name="generatedPassword"
                      value={generatedData.password}
                      onChange={handlePasswordChange}
                      className={`${inputClasses} pl-10 pr-12 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                      }`}
                    />
                    <div className="absolute right-3 top-[35px] flex space-x-2">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title={generatedData.showPassword ? "Hide Password" : "Show Password"}
                      >
                        {generatedData.showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={regeneratePassword}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Regenerate Password"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                    {generatedData.isPasswordEdited && (
                      <span className="absolute right-16 top-[35px] text-xs text-yellow-500">
                        Custom
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={state.isLoading}
                    className={`w-full py-3 rounded-lg text-base font-semibold shadow-md transition-all duration-200 flex items-center justify-center ${
                      isDarkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800/50'
                        : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-green-400/50'
                    }`}
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Create User Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUser;
