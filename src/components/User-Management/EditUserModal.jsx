import React, { useEffect,useState } from 'react';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const EditUserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave,
  isDarkMode 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "client",
    userId: "",
    password: "",
    companyName: "",
    address: "",
    clientCode: "",
    isEnable: "enable"
  });

  // Add this useEffect to update formData when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "client",
        userId: user.userId || "",
        password: "", // Always empty for security
        companyName: user.companyName || "",
        address: user.address || "",
        clientCode: user.clientCode || "",
        isEnable: user.isEnable || "enable"
      });
    }
  }, [user]);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(user._id, formData);
      onClose();
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.response?.data?.message || "Error saving user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className={`px-6 pt-6 pb-4 sm:p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex justify-between items-start">
              <h3 className={`text-xl leading-6 font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Edit User
              </h3>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                {/* Login Access */}
                <div>
                  <label htmlFor="isEnable" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Login Access <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="isEnable"
                    id="isEnable"
                    value={formData.isEnable}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="enable">Enable</option>
                    <option value="disable">Disable</option>
                  </select>
                </div>

                {/* User ID */}
                <div>
                  <label htmlFor="userId" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userId"
                    id="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Client Code (conditional) */}
                {formData.role === "client" && (
                  <div className="md:col-span-3">
                    <label htmlFor="clientCode" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Client Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientCode"
                      id="clientCode"
                      value={formData.clientCode}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                      }`}
                      required={formData.role === "client"}
                    />
                  </div>
                )}

                {/* Company Name */}
                <div className="md:col-span-3">
                  <label htmlFor="companyName" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="curr-password" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="curr-password"
                        id="curr-password"
                        value="••••••••"
                        readOnly
                        className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
                          isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      New Password
                      <span className="text-gray-400 ml-1 text-xs">(leave blank to keep current)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
                          isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-3">
                  <label htmlFor="address" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Readonly Fields */}
                <div>
                  <label htmlFor="createdBy" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Created By
                  </label>
                  <input
                    type="text"
                    name="createdBy"
                    id="createdBy"
                    value={user?.createdBy || "admin"}
                    readOnly
                    className={`w-full rounded-md border py-2 px-3 ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="createdAt" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Created At
                  </label>
                  <input
                    type="text"
                    name="createdAt"
                    id="createdAt"
                    value={user?.createdAt || ""}
                    readOnly
                    className={`w-full rounded-md border py-2 px-3 ${
                      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;