import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../Layout/Layout";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize form data with all required fields
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
    createdBy: "admin",
    isEnable: "enable",
    showPassword: "",
    createdAt: ""
  });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_Backend_Base_URL;

  // Check theme from localStorage
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    });
    return () => window.removeEventListener("storage", () => {});
  }, []);

  // Fetch users with pagination and search
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/auth/getUsers`, {
        params: { page: currentPage, limit: 50, search: searchTerm },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Toggle user status (enable/disable)
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "enable" ? "disable" : "enable";
      await axios.patch(`${baseUrl}/auth/${userId}/status`, {
        isEnable: newStatus,
      });
      fetchUsers();
      toast.success(`User ${newStatus}d successfully`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Error updating user status");
    }
  };

  // Open modal for editing user with proper initial values
  const openUserModal = (user = null) => {
    setCurrentUser(user);
    setFormData(
      user
        ? {
            name: user.name || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            role: user.role || "client",
            userId: user.userId || "",
            password: "", // Always empty for security
            companyName: user.companyName || "",
            address: user.address || "",
            clientCode: user.clientCode || "",
            createdBy: user.createdBy || "admin",
            isEnable: user.isEnable || "enable",
            showPassword: user.showPassword || "",
            createdAt: user.createdAt || ""
          }
        : {
            name: "",
            email: "",
            phoneNumber: "",
            role: "client",
            userId: "",
            password: "",
            companyName: "",
            address: "",
            clientCode: "",
            createdBy: "admin",
            isEnable: "enable",
            showPassword: "",
            createdAt: ""
          }
    );
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit user form (update only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${baseUrl}/auth/users/${currentUser._id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setIsModalOpen(false);
      fetchUsers();
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Error saving user");
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm user deletion
  const confirmDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/auth/users/${userToDelete._id}`);
      setIsDeleteModalOpen(false);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  // Role badge style helper
  const getRoleBadgeClass = (role) => {
    const baseDarkClasses = {
      admin: "bg-purple-900/30 text-purple-300",
      client: "bg-blue-900/30 text-blue-300",
      employee: "bg-green-900/30 text-green-300",
      default: "bg-yellow-900/30 text-yellow-300",
    };

    const baseLightClasses = {
      admin: "bg-purple-100 text-purple-800",
      client: "bg-blue-100 text-blue-800",
      employee: "bg-green-100 text-green-800",
      default: "bg-yellow-100 text-yellow-800",
    };

    return isDarkMode
      ? baseDarkClasses[role] || baseDarkClasses.default
      : baseLightClasses[role] || baseLightClasses.default;
  };

  // Status badge style helper
  const getStatusBadgeClass = (status) => {
    return status === "enable"
      ? isDarkMode
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-800"
      : isDarkMode
      ? "bg-red-900/30 text-red-300"
      : "bg-red-100 text-red-800";
  };

  // Pagination helpers
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  };

  return (
    <Layout>
      <div className={`mx-auto py-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} mb-4 md:mb-0`}>
            User Management
          </h1>
          <button
            onClick={() => navigate("/newuser")}
            className={`${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            } text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full p-3 pl-10 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white/95 backdrop-blur-sm border-gray-300 text-gray-800"
              } focus:outline-none focus:ring-2 ${
                isDarkMode ? "focus:ring-blue-500" : "focus:ring-indigo-500"
              } transition-colors`}
            />
            <div className={`absolute left-3 top-3.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={`rounded-lg shadow-xl overflow-hidden ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white/95 backdrop-blur-sm"}`}>
          {loading ? (
            <div className={`p-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Loading users...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        User ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Role
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                              {user.userId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.isEnable)}`}>
                              {user.isEnable || "enable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isEnable)}
                              className={`px-2 py-1 rounded text-xs ${
                                user.isEnable === "enable"
                                  ? isDarkMode
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-100 hover:bg-red-200 text-red-800"
                                  : isDarkMode
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-green-100 hover:bg-green-200 text-green-800"
                              }`}
                            >
                              {user.isEnable === "enable" ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => openUserModal(user)}
                              className={isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className={isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className={`px-6 py-4 text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} sm:px-6`}>
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-400 border-gray-600"
                            : "bg-gray-100 text-gray-400 border-gray-300"
                          : isDarkMode
                          ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? isDarkMode
                            ? "bg-gray-700 text-gray-400 border-gray-600"
                            : "bg-gray-100 text-gray-400 border-gray-300"
                          : isDarkMode
                          ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Showing <span className="font-medium">{(currentPage - 1) * 50 + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * 50, users.length + (currentPage - 1) * 50)}</span> of{" "}
                        <span className="font-medium">{users.length + (currentPage - 1) * 50}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                            isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
                          } text-sm font-medium ${
                            currentPage === 1
                              ? isDarkMode ? "text-gray-500" : "text-gray-300"
                              : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">First</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 border ${
                            isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
                          } text-sm font-medium ${
                            currentPage === 1
                              ? isDarkMode ? "text-gray-500" : "text-gray-300"
                              : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {getPageNumbers().map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? isDarkMode
                                  ? "z-10 bg-blue-900/30 border-blue-500 text-blue-300"
                                  : "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : isDarkMode
                                ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 border ${
                            isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
                          } text-sm font-medium ${
                            currentPage === totalPages
                              ? isDarkMode ? "text-gray-500" : "text-gray-300"
                              : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                            isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
                          } text-sm font-medium ${
                            currentPage === totalPages
                              ? isDarkMode ? "text-gray-500" : "text-gray-300"
                              : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Last</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit User Modal */}
        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed  transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-black opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div className={`px-6 pt-6 pb-4 sm:p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl leading-6 font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {currentUser ? "Edit User" : "Add User"}
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className={`p-1 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Row 1 */}
                      <div>
                        <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          id="phoneNumber"
                          value={formData.phoneNumber || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Row 2 */}
                      <div>
                        <label htmlFor="role" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="role"
                          id="role"
                          value={formData.role || "client"}
                          onChange={handleInputChange}
                          disabled={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="admin">Admin</option>
                          <option value="client">Client</option>
                          <option value="employee">Employee</option>
                          <option value="vendor">Vendor</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="isEnable" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Login Access <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="isEnable"
                          id="isEnable"
                          value={formData.isEnable || "enable"}
                          onChange={handleInputChange}
                          disabled={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="enable">Enable</option>
                          <option value="disable">Disable</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="userId" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          User ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="userId"
                          id="userId"
                          value={formData.userId || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Row 3 - Conditional Client Code */}
                      {formData.role === "client" && (
                        <div className="md:col-span-3">
                          <label htmlFor="clientCode" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Client Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="clientCode"
                            id="clientCode"
                            value={formData.clientCode || ""}
                            onChange={handleInputChange}
                            disabled={false}
                            readOnly={false}
                            className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                            }`}
                            required={formData.role === "client"}
                          />
                        </div>
                      )}

                      {/* Row 4 */}
                      <div className="md:col-span-3">
                        <label htmlFor="companyName" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          id="companyName"
                          value={formData.companyName || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Row 5 - Password Fields */}
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
                              value={formData.showPassword || ""}
                              readOnly={true}
                              onChange={handleInputChange}
                              className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
                                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                              }`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
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
                            {currentUser && (
                              <span className="text-gray-400 ml-1 text-xs">(leave blank to keep current)</span>
                            )}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              id="password"
                              value={formData.password || ""}
                              onChange={handleInputChange}
                              className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
                                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                              }`}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
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

                      {/* Row 6 - Address */}
                      <div className="md:col-span-3">
                        <label htmlFor="address" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          id="address"
                          rows={3}
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          disabled={false}
                          readOnly={false}
                          className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Row 7 - Readonly Fields */}
                      <div>
                        <label htmlFor="createdBy" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Created By
                        </label>
                        <input
                          type="text"
                          name="createdBy"
                          id="createdBy"
                          value={formData.createdBy || ""}
                          readOnly={true}
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
                          value={formData.createdAt || ""}
                          readOnly={true}
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
                        onClick={() => setIsModalOpen(false)}
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
                        {currentUser ? "Update User" : "Create User"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete user
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete {userToDelete?.name}?
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;



// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Layout from "../Layout/Layout";
// import { toast } from "react-toastify";
// import { EyeIcon, EyeSlashIcon as EyeOffIcon } from '@heroicons/react/24/outline';


// const UserManagement = () => {
//   // State management
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const navigate = useNavigate();
//   const baseUrl = import.meta.env.VITE_Backend_Base_URL;

//   // Check theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     window.addEventListener("storage", () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     });
//     return () => window.removeEventListener("storage", () => {});
//   }, []);

//   // Fetch users with pagination and search
//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${baseUrl}/auth/getUsers`, {
//         params: { page: currentPage, limit: 50, search: searchTerm },
//       });
//       setUsers(response.data.data);
//       setTotalPages(response.data.totalPages);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [currentPage, searchTerm]);

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };

//   // Toggle user status (enable/disable)
//   const toggleUserStatus = async (userId, currentStatus) => {
//     try {
//       const newStatus = currentStatus === "enable" ? "disable" : "enable";
//       await axios.patch(`${baseUrl}/auth/${userId}/status`, {
//         isEnable: newStatus,
//       });
//       fetchUsers();
//       toast.success(`User ${newStatus}d successfully`);
//     } catch (error) {
//       console.error("Error toggling user status:", error);
//       toast.error("Error updating user status");
//     }
//   };

//   // Open modal for editing user
//   // const openUserModal = (user = null) => {
//   //   setCurrentUser(user);
//   //   setFormData(
//   //     user
//   //       ? {
//   //           ...user,
//   //           showPassword:user.showPassword || "",
//   //           password: "",
//   //           clientCode: user.clientCode || "",
//   //         }
//   //       : {
//   //           name: "",
//   //           email: "",
//   //           phoneNumber: "",
//   //           role: "client",
//   //           userId: "",
//   //           password: "",
//   //           companyName: "",
//   //           address: "",
//   //           clientCode: "",
//   //           createdBy: "admin",
//   //           isEnable: "enable",
//   //         }
//   //   );
//   //   setIsModalOpen(true);
//   // };
//   const openUserModal = (user = null) => {
//   setCurrentUser(user);
//   setFormData(
//     user
//       ? {
//           name: user.name || "",
//           email: user.email || "",
//           phoneNumber: user.phoneNumber || "",
//           role: user.role || "client",
//           userId: user.userId || "",
//           password: "", // Always empty for security
//           companyName: user.companyName || "",
//           address: user.address || "",
//           clientCode: user.clientCode || "",
//           createdBy: user.createdBy || "admin",
//           isEnable: user.isEnable || "enable",
//           showPassword: user.showPassword || "",
//           createdAt: user.createdAt || ""
//         }
//       : {
//           name: "",
//           email: "",
//           phoneNumber: "",
//           role: "client",
//           userId: "",
//           password: "",
//           companyName: "",
//           address: "",
//           clientCode: "",
//           createdBy: "admin",
//           isEnable: "enable",
//           showPassword: "",
//           createdAt: ""
//         }
//   );
//   setIsModalOpen(true);
// };
//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phoneNumber: "",
//     role: "client",
//     userId: "",
//     password: "",
//     companyName: "",
//     address: "",
//     clientCode: "",
//     createdBy: "admin",
//     isEnable: "enable",
//     showPassword:"",
//     createdAt: ""
//   });

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Submit user form (update only)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.put(`${baseUrl}/auth/users/${currentUser._id}`, formData, {
//         headers: { "Content-Type": "application/json" },
//       });
//       setIsModalOpen(false);
//       fetchUsers();
//       toast.success("User updated successfully");
//     } catch (error) {
//       console.error("Error saving user:", error);
//       toast.error("Error saving user");
//     }
//   };

//   // Open delete confirmation modal
//   const openDeleteModal = (user) => {
//     setUserToDelete(user);
//     setIsDeleteModalOpen(true);
//   };

//   // Confirm user deletion
//   const confirmDelete = async () => {
//     try {
//       await axios.delete(`${baseUrl}/auth/users/${userToDelete._id}`);
//       setIsDeleteModalOpen(false);
//       fetchUsers();
//       toast.success("User deleted successfully");
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       toast.error("Error deleting user");
//     }
//   };

//   // Role badge style helper
//   const getRoleBadgeClass = (role) => {
//     const baseDarkClasses = {
//       admin: "bg-purple-900/30 text-purple-300",
//       client: "bg-blue-900/30 text-blue-300",
//       employee: "bg-green-900/30 text-green-300",
//       default: "bg-yellow-900/30 text-yellow-300",
//     };

//     const baseLightClasses = {
//       admin: "bg-purple-100 text-purple-800",
//       client: "bg-blue-100 text-blue-800",
//       employee: "bg-green-100 text-green-800",
//       default: "bg-yellow-100 text-yellow-800",
//     };

//     return isDarkMode
//       ? baseDarkClasses[role] || baseDarkClasses.default
//       : baseLightClasses[role] || baseLightClasses.default;
//   };

//   // Status badge style helper
//   const getStatusBadgeClass = (status) => {
//     return status === "enable"
//       ? isDarkMode
//         ? "bg-green-900/30 text-green-300"
//         : "bg-green-100 text-green-800"
//       : isDarkMode
//       ? "bg-red-900/30 text-red-300"
//       : "bg-red-100 text-red-800";
//   };

//   // Pagination helpers
//   const getPageNumbers = () => {
//     if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
//     if (currentPage <= 3) return [1, 2, 3, 4, 5];
//     if (currentPage >= totalPages - 2) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
//     return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
//   };

//   return (
//     <Layout>
//       <div className={` mx-auto py-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6">
//           <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"} mb-4 md:mb-0`}>
//             User Management
//           </h1>
//           <button
//             onClick={() => navigate("/newuser")}
//             className={`${
//               isDarkMode
//                 ? "bg-blue-600 hover:bg-blue-700"
//                 : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
//             } text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all`}
//           >
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//             Add User
//           </button>
//         </div>

//         {/* Search Bar */}
//         <div className="mb-6">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search users..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className={`w-full p-3 pl-10 rounded-lg border ${
//                 isDarkMode
//                   ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
//                   : "bg-white/95 backdrop-blur-sm border-gray-300 text-gray-800"
//               } focus:outline-none focus:ring-2 ${
//                 isDarkMode ? "focus:ring-blue-500" : "focus:ring-indigo-500"
//               } transition-colors`}
//             />
//             <div className={`absolute left-3 top-3.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Users Table */}
//         <div className={`rounded-lg shadow-xl overflow-hidden ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white/95 backdrop-blur-sm"}`}>
//           {loading ? (
//             <div className={`p-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
//               Loading users...
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
//                     <tr>
//                       <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
//                         Name
//                       </th>
//                       <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
//                         Email
//                       </th>
//                       <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
//                         Role
//                       </th>
//                       <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
//                         Status
//                       </th>
//                       <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
//                     {users.length > 0 ? (
//                       users.map((user) => (
//                         <tr key={user._id} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
//                               {user.name}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
//                               {user.email}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
//                               {user.role}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.isEnable)}`}>
//                               {user.isEnable || "enable"}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                             <button
//                               onClick={() => toggleUserStatus(user._id, user.isEnable)}
//                               className={`px-2 py-1 rounded text-xs ${
//                                 user.isEnable === "enable"
//                                   ? isDarkMode
//                                     ? "bg-red-600 hover:bg-red-700 text-white"
//                                     : "bg-red-100 hover:bg-red-200 text-red-800"
//                                   : isDarkMode
//                                   ? "bg-green-600 hover:bg-green-700 text-white"
//                                   : "bg-green-100 hover:bg-green-200 text-green-800"
//                               }`}
//                             >
//                               {user.isEnable === "enable" ? "Disable" : "Enable"}
//                             </button>
//                             <button
//                               onClick={() => openUserModal(user)}
//                               className={isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"}
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => openDeleteModal(user)}
//                               className={isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className={`px-6 py-4 text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
//                           No users found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination - unchanged from your original code */}
//               {totalPages > 1 && (
//                 <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} sm:px-6`}>
//                   <div className="flex-1 flex justify-between sm:hidden">
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.max(prev - 1, 1))
//               }
//               disabled={currentPage === 1}
//               className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
//                 currentPage === 1
//                   ? isDarkMode
//                     ? "bg-gray-700 text-gray-400 border-gray-600"
//                     : "bg-gray-100 text-gray-400 border-gray-300"
//                   : isDarkMode
//                   ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
//                   : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               Previous
//             </button>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
//                 currentPage === totalPages
//                   ? isDarkMode
//                     ? "bg-gray-700 text-gray-400 border-gray-600"
//                     : "bg-gray-100 text-gray-400 border-gray-300"
//                   : isDarkMode
//                   ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
//                   : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//               }`}
//             >
//               Next
//             </button>
//           </div>
//           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//             <div>
//               <p
//                 className={`text-sm ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}
//               >
//                 Showing{" "}
//                 <span className="font-medium">
//                   {(currentPage - 1) * 50 + 1}
//                 </span>{" "}
//                 to{" "}
//                 <span className="font-medium">
//                   {Math.min(
//                     currentPage * 50,
//                     users.length + (currentPage - 1) * 50
//                   )}
//                 </span>{" "}
//                 of{" "}
//                 <span className="font-medium">
//                   {users.length + (currentPage - 1) * 50}
//                 </span>{" "}
//                 results
//               </p>
//             </div>
//             <div>
//               <nav
//                 className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
//                 aria-label="Pagination"
//               >
//                 <button
//                   onClick={() => setCurrentPage(1)}
//                   disabled={currentPage === 1}
//                   className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
//                     isDarkMode
//                       ? "border-gray-600 bg-gray-800"
//                       : "border-gray-300 bg-white"
//                   } text-sm font-medium ${
//                     currentPage === 1
//                       ? isDarkMode
//                         ? "text-gray-500"
//                         : "text-gray-300"
//                       : isDarkMode
//                       ? "text-gray-300 hover:bg-gray-700"
//                       : "text-gray-500 hover:bg-gray-50"
//                   }`}
//                 >
//                   <span className="sr-only">First</span>
//                   <svg
//                     className="h-5 w-5"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                     <path
//                       fillRule="evenodd"
//                       d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                   className={`relative inline-flex items-center px-2 py-2 border ${
//                     isDarkMode
//                       ? "border-gray-600 bg-gray-800"
//                       : "border-gray-300 bg-white"
//                   } text-sm font-medium ${
//                     currentPage === 1
//                       ? isDarkMode
//                         ? "text-gray-500"
//                         : "text-gray-300"
//                       : isDarkMode
//                       ? "text-gray-300 hover:bg-gray-700"
//                       : "text-gray-500 hover:bg-gray-50"
//                   }`}
//                 >
//                   <span className="sr-only">Previous</span>
//                   <svg
//                     className="h-5 w-5"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//                 {getPageNumbers().map((pageNum) => (
//                   <button
//                     key={pageNum}
//                     onClick={() => setCurrentPage(pageNum)}
//                     className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                       currentPage === pageNum
//                         ? isDarkMode
//                           ? "z-10 bg-blue-900/30 border-blue-500 text-blue-300"
//                           : "z-10 bg-blue-50 border-blue-500 text-blue-600"
//                         : isDarkMode
//                         ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
//                         : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
//                     }`}
//                   >
//                     {pageNum}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) =>
//                       Math.min(prev + 1, totalPages)
//                     )
//                   }
//                   disabled={currentPage === totalPages}
//                   className={`relative inline-flex items-center px-2 py-2 border ${
//                     isDarkMode
//                       ? "border-gray-600 bg-gray-800"
//                       : "border-gray-300 bg-white"
//                   } text-sm font-medium ${
//                     currentPage === totalPages
//                       ? isDarkMode
//                         ? "text-gray-500"
//                         : "text-gray-300"
//                       : isDarkMode
//                       ? "text-gray-300 hover:bg-gray-700"
//                       : "text-gray-500 hover:bg-gray-50"
//                   }`}
//                 >
//                   <span className="sr-only">Next</span>
//                   <svg
//                     className="h-5 w-5"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage(totalPages)}
//                   disabled={currentPage === totalPages}
//                   className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
//                     isDarkMode
//                       ? "border-gray-600 bg-gray-800"
//                       : "border-gray-300 bg-white"
//                   } text-sm font-medium ${
//                     currentPage === totalPages
//                       ? isDarkMode
//                         ? "text-gray-500"
//                         : "text-gray-300"
//                       : isDarkMode
//                       ? "text-gray-300 hover:bg-gray-700"
//                       : "text-gray-500 hover:bg-gray-50"
//                   }`}
//                 >
//                   <span className="sr-only">Last</span>
//                   <svg
//                     className="h-5 w-5"
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                       clipRule="evenodd"
//                     />
//                     <path
//                       fillRule="evenodd"
//                       d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </nav>
//             </div>
//           </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {isModalOpen && (
//   <div className="fixed z-50 inset-0 overflow-y-auto">
//     <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//         <div className="absolute inset-0 bg-black opacity-75"></div>
//       </div>
//       <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
//         &#8203;
//       </span>
//       <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
//         <div className={`px-6 pt-6 pb-4 sm:p-8 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
//           <div className="flex justify-between items-start">
//             <h3 className={`text-xl leading-6 font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
//               Edit User
//             </h3>
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className={`p-1 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
          
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//               {/* Row 1 */}
//               <div>
//                 <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   id="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   id="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               <div>
//                 <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   id="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Row 2 */}
//               <div>
//                 <label htmlFor="role" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Role <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="role"
//                   id="role"
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 >
//                   <option value="admin">Admin</option>
//                   <option value="client">Client</option>
//                   <option value="employee">Employee</option>
//                   <option value="vendor">Vendor</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="isEnable" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Login Access <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="isEnable"
//                   id="isEnable"
//                   value={formData.isEnable}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 >
//                   <option value="enable">Enable</option>
//                   <option value="disable">Disable</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="userId" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   User ID <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="userId"
//                   id="userId"
//                   value={formData.userId}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Row 3 - Conditional Client Code */}
//               {formData.role === "client" && (
//                 <div className="md:col-span-3">
//                   <label htmlFor="clientCode" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                     Client Code <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="clientCode"
//                     id="clientCode"
//                     value={formData.clientCode}
//                     onChange={handleInputChange}
//                     className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                       isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                     }`}
//                     required={formData.role === "client"}
//                   />
//                 </div>
//               )}

//               {/* Row 4 */}
//               <div className="md:col-span-3">
//                 <label htmlFor="companyName" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   id="companyName"
//                   value={formData.companyName}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Row 5 - Password Fields */}
//               <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="curr-password" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                     Current Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="curr-password"
//                       id="curr-password"
//                       value={formData.showPassword}
//                       onChange={handleInputChange}
//                       className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
//                         isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                       }`}
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOffIcon className="h-5 w-5 text-gray-400" />
//                       ) : (
//                         <EyeIcon className="h-5 w-5 text-gray-400" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                     New Password
//                     {currentUser && (
//                       <span className="text-gray-400 ml-1 text-xs">(leave blank to keep current)</span>
//                     )}
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       id="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10 ${
//                         isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                       }`}
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOffIcon className="h-5 w-5 text-gray-400" />
//                       ) : (
//                         <EyeIcon className="h-5 w-5 text-gray-400" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Row 6 - Address */}
//               <div className="md:col-span-3">
//                 <label htmlFor="address" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Address <span className="text-red-500">*</span>
//                 </label>
//                 <textarea
//                   name="address"
//                   id="address"
//                   rows={3}
//                   value={formData.address}
//                   onChange={handleInputChange}
//                   className={`w-full rounded-md border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
//                     isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 text-gray-900"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Row 7 - Readonly Fields */}
//               <div>
//                 <label htmlFor="createdBy" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Created By
//                 </label>
//                 <input
//                   type="text"
//                   name="createdBy"
//                   id="createdBy"
//                   value={formData.createdBy}
//                   className={`w-full rounded-md border py-2 px-3 bg-gray-100 ${
//                     isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-500"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="createdAt" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//                   Created At
//                 </label>
//                 <input
//                   type="text"
//                   name="createdAt"
//                   id="createdAt"
//                   value={formData.createdAt}
//                   className={`w-full rounded-md border py-2 px-3 bg-gray-100 ${
//                     isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-500"
//                   }`}
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-8 flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setIsModalOpen(false)}
//                 className={`px-4 py-2 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
//                   isDarkMode
//                     ? "border-gray-600 text-gray-300 hover:bg-gray-700"
//                     : "border-gray-300 text-gray-700 hover:bg-gray-50"
//                 }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 rounded-md border border-transparent bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
//               >
//                 Update User
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

//         {/* Delete Confirmation Modal - unchanged */}
//         {isDeleteModalOpen && (
//           <div className="fixed z-10 inset-0 overflow-y-auto">
//            <div className="fixed z-10 inset-0 overflow-y-auto">
//     <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div
//         className="fixed inset-0 transition-opacity"
//         aria-hidden="true"
//       >
//         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//       </div>
//       <span
//         className="hidden sm:inline-block sm:align-middle sm:h-screen"
//         aria-hidden="true"
//       >
//         &#8203;
//       </span>
//       <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//         <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//           <div className="sm:flex sm:items-start">
//             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//               <svg
//                 className="h-6 w-6 text-red-600"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 aria-hidden="true"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//             </div>
//             <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">
//                 Delete user
//               </h3>
//               <div className="mt-2">
//                 <p className="text-sm text-gray-500">
//                   Are you sure you want to delete {userToDelete?.name}?
//                   This action cannot be undone.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//           <button
//             type="button"
//             onClick={confirmDelete}
//             className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             Delete
//           </button>
//           <button
//             type="button"
//             onClick={() => setIsDeleteModalOpen(false)}
//             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default UserManagement;  
