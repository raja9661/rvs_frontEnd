import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { Edit, Trash2, Search, CheckSquare, UserPlus, Users, AlertCircle, CheckCircle, X, ToggleLeft, ToggleRight } from "lucide-react";

const ManageAccessColumns = () => {
  // State for access type (employee/client)
  const [accessType, setAccessType] = useState("employee");
  
  // Common states
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [editableColumns, setEditableColumns] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [columns, setColumns] = useState([]);
  
  // Default editable columns
  const DEFAULT_EMPLOYEE_EDITABLE = ["remarks", "details", "details1", "requirement"];
  const DEFAULT_CLIENT_EDITABLE = ["priority,remarks"];

  // Utility functions
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const [columnsRes, usersRes, assignedRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/columns`),
        axios.get(`${import.meta.env.VITE_Backend_Base_URL}/access/users/${accessType}`),
        axios.get(`${import.meta.env.VITE_Backend_Base_URL}/access/assigned-${accessType}s`)
      ]);

      console.log("columnsRes:",columnsRes)
      console.log("usersRes:",usersRes)
      console.log("assignedRes:",assignedRes)
      
      setColumns(columnsRes.data);
      setUsers(usersRes.data.data);
      setAssignedUsers(assignedRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Failed to load ${accessType} data`, "error");
    }
  };

  // Effects
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    fetchData();
  }, [accessType]);

  // Handlers
  const handleAssignAccess = async () => {
    try {
      const assignedByAdmin = JSON.parse(localStorage.getItem("loginUser")).name;
      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/access/assign-${accessType}-access`, {
        [`${accessType}Name`]: selectedUser,
        editableColumns,
        assignedByAdmin,
      });
      
      showToast("Access assigned successfully!");
      setSelectedUser("");
      setEditableColumns([]);
      fetchData();
    } catch (error) {
      console.error("Failed to assign access:", error);
      showToast("Failed to assign access", "error");
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setEditableColumns(user.editableColumns);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const assignedByAdmin = JSON.parse(localStorage.getItem("loginUser")).name;
      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/access/assign-${accessType}-access`, {
        [`${accessType}Name`]: currentUser[`${accessType}Name`],
        editableColumns,
        assignedByAdmin,
      });
      
      showToast("Access updated successfully!");
      setIsEditing(false);
      setCurrentUser(null);
      setEditableColumns([]);
      fetchData();
    } catch (error) {
      console.error("Failed to update access:", error);
      showToast("Failed to update access", "error");
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_Backend_Base_URL}/access/delete-${accessType}-access/${userToDelete[`${accessType}Name`]}`
      );
      
      showToast(`${accessType.charAt(0).toUpperCase() + accessType.slice(1)} access deleted successfully!`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete access:", error);
      showToast("Failed to delete access", "error");
      setIsDeleteModalOpen(false);
    }
  };

  // Filtering
  const filteredAssignedUsers = assignedUsers.filter((user) =>
    user?.[`${accessType}Name`]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get default editable columns based on access type
  const getDefaultEditableColumns = () => {
    return accessType === "employee" ? DEFAULT_EMPLOYEE_EDITABLE : DEFAULT_CLIENT_EDITABLE;
  };

  return (
    <Layout>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center animate-fade-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            toast.type === "error" 
              ? (isDarkMode ? 'bg-red-900' : 'bg-red-100')
              : (isDarkMode ? 'bg-green-900' : 'bg-green-100')
          }`}>
            {toast.type === "error" ? (
              <AlertCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
            ) : (
              <CheckCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
            )}
            <span className={`${
              toast.type === "error"
                ? (isDarkMode ? 'text-red-200' : 'text-red-800')
                : (isDarkMode ? 'text-green-200' : 'text-green-800')
            }`}>
              {toast.message}
            </span>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="ml-3"
            >
              <X className={`w-4 h-4 ${
                toast.type === "error"
                  ? (isDarkMode ? 'text-red-300' : 'text-red-600')
                  : (isDarkMode ? 'text-green-300' : 'text-green-600')
              }`} />
            </button>
          </div>
        </div>
      )}

      <div className="w-auto mx-auto space-y-4">
        {/* Access Type Toggle */}
        <div className={`flex items-center justify-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-4 rounded-lg shadow`}>
          <button
            onClick={() => setAccessType("employee")}
            className={`flex items-center px-4 py-2 rounded-l-lg ${
              accessType === "employee" 
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Employee
          </button>
          <button
            onClick={() => setAccessType("client")}
            className={`flex items-center px-4 py-2 rounded-r-lg ${
              accessType === "client" 
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Client
          </button>
        </div>

        {/* Form Section */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg p-6 shadow-xl`}>
          <div className="flex items-center mb-6">
            <UserPlus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {isEditing ? `Edit ${accessType.charAt(0).toUpperCase() + accessType.slice(1)} Access` : 
              `Assign ${accessType.charAt(0).toUpperCase() + accessType.slice(1)} Access`}
            </h3>
          </div>

          {/* User Dropdown */}
          <div className="mb-6">
            <label htmlFor="user" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {isEditing ? `Editing: ${currentUser?.[`${accessType}Name`]}` : `Select ${accessType.charAt(0).toUpperCase() + accessType.slice(1)}:`}
            </label>
            {!isEditing && (
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={isEditing}
              >
                <option value="">Select a {accessType}</option>
                {users.map((user) => (
                  <option key={user._id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Column Selection */}
          <div className="mb-6">
            <div className={`flex items-center mb-4 ${
              isDarkMode ? 
              'text-gray-300' : 'text-gray-700'
            }`}>
              <CheckSquare className={`w-5 h-5 mr-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className="font-medium">Select Editable Columns:</span>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {columns.map((column) => (
                  <div key={column} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${accessType}-${column}`}
                      checked={editableColumns.includes(column)}
                      onChange={() => 
                        setEditableColumns((prev) =>
                          prev.includes(column)
                            ? prev.filter((col) => col !== column)
                            : [...prev, column]
                        )
                      }
                      className={`w-4 h-4 mr-2 rounded ${
                        getDefaultEditableColumns().includes(column) 
                          ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                          : (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                      }`}
                      disabled={getDefaultEditableColumns().includes(column)}
                    />
                    <label htmlFor={`${accessType}-${column}`} className={`text-sm cursor-pointer ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {column}
                      {getDefaultEditableColumns().includes(column) && (
                        <span className="text-xs ml-1 text-gray-500">(default)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <button
              onClick={isEditing ? handleSaveEdit : handleAssignAccess}
              className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
              }`}
              disabled={isEditing ? false : !selectedUser}
            >
              {isEditing ? 'Save Changes' : 'Assign Access'}
            </button>
            
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentUser(null);
                  setEditableColumns([]);
                }}
                className={`py-3 px-6 rounded-lg font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Assigned Users Table */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg p-6 shadow-xl`}>
          <div className="flex items-center mb-6">
            <Users className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Assigned {accessType.charAt(0).toUpperCase() + accessType.slice(1)}s
            </h3>
          </div>
          
          {/* Search Bar */}
          <div className={`relative mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${accessType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className={`w-full ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <thead className={`${
                isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100'
              }`}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-lg">
                    {accessType.charAt(0).toUpperCase() + accessType.slice(1)} Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Editable Columns</th>
                  <th className="px-4 py-3 text-center text-sm font-medium rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssignedUsers.length > 0 ? (
                  filteredAssignedUsers.map((user) => (
                    <tr 
                      key={user[`${accessType}Name`]}
                      className={`${
                        isDarkMode 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        {user[`${accessType}Name`]}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.editableColumns.map((col) => (
                            <span key={col} className={`text-xs px-2 py-1 rounded ${
                              isDarkMode 
                                ? 'bg-gray-700 text-blue-400' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {col}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className={`p-2 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-700 text-green-400 hover:bg-gray-600' 
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            } transition-colors`}
                            title="Edit Access"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className={`p-2 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } transition-colors`}
                            title="Delete Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="3" 
                      className={`px-6 py-8 text-center text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {searchQuery ? `No ${accessType}s found matching your search` : 
                      `No ${accessType}s have been assigned access yet`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Delete Access
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Are you sure you want to delete access for {userToDelete?.[`${accessType}Name`]}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
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
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageAccessColumns;


/////////////////////////////////////////////update confirm message ////////////////////////////////


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Layout from "../Layout/Layout";
// import { Edit, Trash2, Search, CheckSquare, UserPlus, Users, AlertCircle, CheckCircle, X } from "lucide-react";

// const ManageEmployeeColumn = () => {
//   const [employees, setEmployees] = useState([]); // For dropdown
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [editableColumns, setEditableColumns] = useState([]);
//   const [assignedEmployees, setAssignedEmployees] = useState([]); // For main table
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isEditing, setIsEditing] = useState(false); // Track editing state
//   const [currentEmployee, setCurrentEmployee] = useState(null); // Track employee being edited
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   // Delete modal state
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [employeeToDelete, setEmployeeToDelete] = useState(null);
//   // Toast notification state
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
//   const [columns, setColumns] = useState([]);
  
//   // At the top of your Table component
//   const DEFAULT_EMPLOYEE_EDITABLE = ["remarks", "details", "details1", "requirement"];

//   // Define columns
//   // const columns = [
//   //   "caseId",
//   //   "remarks",
//   //   "name",
//   //   "details",
//   //   "details1",
//   //   "priority",
//   //   "correctUPN",
//   //   "product",
//   //   "accountNumber",
//   //   "requirement",
//   //   "bankCode",
//   //   "clientCode",
//   //   "vendorName",
//   //   "dateIn",
//   //   "status",
//   //   "caseStatus",
//   //   "productType",
//   //   "listByEmployee",
//   //   "dateOut",
//   //   "sentBy",
//   //   "autoOrManual",
//   //   "caseDoneBy",
//   //   "clientTAT",
//   //   "customerCare",
//   //   "sentDate",
//   //   "clientType",
//   //   "dedupBy",
//   //   "vendorRate",
//   //   "clientRate",
//   // ];

//   // Toast notification function
//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
//   };

//   // Check for dark mode
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
    
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Function to fetch assigned employees
//   const fetchAssignedEmployees = () => {
//     axios
//       .get(`${import.meta.env.VITE_Backend_Base_URL}/access/assigned-employees`)
//       .then((response) => setAssignedEmployees(response.data))
//       .catch((error) => {
//         console.error("Error fetching assigned employees:", error);
//         showToast("Failed to fetch employee data", "error");
//       });
//   };

//   useEffect(() => {

//         axios
//       .get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/columns`)
//       .then(res => setColumns(res.data))
//       .catch(err => console.error('Failed to load columns:', err));
//     // Fetch all employees for dropdown
//     axios
//       .get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`)
//       .then((response) => setEmployees(response.data))
//       .catch((error) => {
//         console.error("Error fetching employees:", error);
//         showToast("Failed to load employees", "error");
//       });

//     // Fetch all assigned employees for main table
//     fetchAssignedEmployees();
//   }, []);

//   const handleAssignAccess = () => {
//     const assignedByAdmin = JSON.parse(localStorage.getItem("loginUser")).name;
//     axios
//       .post(`${import.meta.env.VITE_Backend_Base_URL}/access/assign-access`, {
//         employeeName: selectedEmployee,
//         editableColumns,
//         assignedByAdmin,
//       })
//       .then(() => {
//         showToast("Access assigned successfully!");
//         setSelectedEmployee("");
//         setEditableColumns([]);
//         // Refresh assigned employees list
//         fetchAssignedEmployees();
//       })
//       .catch((error) => {
//         console.error("Failed to assign/update access:", error);
//         showToast("Failed to assign access", "error");
//       });
//   };

//   const handleEdit = (employee) => {
//     setCurrentEmployee(employee);
//     setEditableColumns(employee.editableColumns);
//     setIsEditing(true);
//   };

//   const handleSaveEdit = () => {
//     const assignedByAdmin = JSON.parse(localStorage.getItem("loginUser")).name;
//     axios
//       .post(`${import.meta.env.VITE_Backend_Base_URL}/access/assign-access`, {
//         employeeName: currentEmployee.employeeName,
//         editableColumns,
//         assignedByAdmin,
//       })
//       .then(() => {
//         showToast("Access updated successfully!");
//         setIsEditing(false);
//         setCurrentEmployee(null);
//         setEditableColumns([]);
//         // Refresh assigned employees list
//         fetchAssignedEmployees();
//       })
//       .catch((error) => {
//         console.error("Failed to update access:", error);
//         showToast("Failed to update access", "error");
//       });
//   };

//   const handleDeleteClick = (employee) => {
//     setEmployeeToDelete(employee);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = () => {
//     axios
//       .delete(`${import.meta.env.VITE_Backend_Base_URL}/access/delete-access/${employeeToDelete.employeeName}`)
//       .then(() => {
//         showToast("Employee access deleted successfully!");
//         setIsDeleteModalOpen(false);
//         setEmployeeToDelete(null);
//         // Refresh assigned employees list
//         fetchAssignedEmployees();
//       })
//       .catch((error) => {
//         console.error("Failed to delete access:", error);
//         showToast("Failed to delete access", "error");
//         setIsDeleteModalOpen(false);
//       });
//   };

//   const filteredAssignedEmployees = assignedEmployees.filter((employee) =>
//     employee?.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Layout>
//       {/* Toast Notification */}
//       {toast.show && (
//         <div className="fixed top-4 right-4 z-50 flex items-center animate-fade-in">
//           <div className={`flex items-center p-4 rounded-lg shadow-lg ${
//             toast.type === "error" 
//               ? (isDarkMode ? 'bg-red-900' : 'bg-red-100')
//               : (isDarkMode ? 'bg-green-900' : 'bg-green-100')
//           }`}>
//             {toast.type === "error" ? (
//               <AlertCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
//             ) : (
//               <CheckCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
//             )}
//             <span className={`${
//               toast.type === "error"
//                 ? (isDarkMode ? 'text-red-200' : 'text-red-800')
//                 : (isDarkMode ? 'text-green-200' : 'text-green-800')
//             }`}>
//               {toast.message}
//             </span>
//             <button 
//               onClick={() => setToast({ ...toast, show: false })}
//               className="ml-3"
//             >
//               <X className={`w-4 h-4 ${
//                 toast.type === "error"
//                   ? (isDarkMode ? 'text-red-300' : 'text-red-600')
//                   : (isDarkMode ? 'text-green-300' : 'text-green-600')
//               }`} />
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto space-y-4">
//         {/* Form Section */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-6 shadow-xl`}>
//           <div className="flex items-center mb-6">
//             <UserPlus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//             <h3 className={`text-lg font-semibold ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             }`}>{isEditing ? 'Edit Employee Access' : 'Assign Employee Access'}</h3>
//           </div>

//           {/* Employee Dropdown */}
//           <div className="mb-6">
//             <label htmlFor="employee" className={`block text-sm font-medium mb-2 ${
//               isDarkMode ? 'text-gray-300' : 'text-gray-700'
//             }`}>
//               {isEditing ? `Editing: ${currentEmployee?.employeeName}` : 'Select Employee:'}
//             </label>
//             {!isEditing && (
//               <select
//                 id="employee"
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//                 className={`w-full p-3 rounded-lg border ${
//                   isDarkMode 
//                     ? 'bg-gray-700 border-gray-600 text-white' 
//                     : 'bg-white border-gray-300 text-gray-900'
//                 } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
//                 disabled={isEditing}
//               >
//                 <option value="">Select an employee</option>
//                 {employees.map((employee) => (
//                   <option key={employee.name} value={employee.name}>
//                     {employee.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {/* Column Selection */}
//           <div className="mb-6">
//             <div className={`flex items-center mb-4 ${
//               isDarkMode ? 
//               'text-gray-300' : 'text-gray-700'
//             }`}>
//               <CheckSquare className={`w-5 h-5 mr-2 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <span className="font-medium">Select Editable Columns:</span>
//             </div>
            
//             <div className={`p-4 rounded-lg border ${
//               isDarkMode 
//                 ? 'bg-gray-700/50 border-gray-600' 
//                 : 'bg-gray-50 border-gray-200'
//             }`}>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                 {columns.map((column) => (
//                   <div key={column} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id={column}
//                       checked={editableColumns.includes(column)}
//                       onChange={() => 
//                         setEditableColumns((prev) =>
//                           prev.includes(column)
//                             ? prev.filter((col) => col !== column)
//                             : [...prev, column]
//                         )
//                       }
//                       className={`w-4 h-4 mr-2 rounded ${
//                         DEFAULT_EMPLOYEE_EDITABLE.includes(column) 
//                           ? (isDarkMode ? 'text-green-400' : 'text-green-600')
//                           : (isDarkMode ? 'text-blue-400' : 'text-blue-600')
//                       }`}
//                       disabled={DEFAULT_EMPLOYEE_EDITABLE.includes(column)}
//                     />
//                     <label htmlFor={column} className={`text-sm cursor-pointer ${
//                       isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                     }`}>
//                       {column}
//                       {DEFAULT_EMPLOYEE_EDITABLE.includes(column) && (
//                         <span className="text-xs ml-1 text-gray-500">(default)</span>
//                       )}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
//             <button
//               onClick={isEditing ? handleSaveEdit : handleAssignAccess}
//               className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
//               }`}
//               disabled={isEditing ? false : !selectedEmployee}
//             >
//               {isEditing ? 'Save Changes' : 'Assign Access'}
//             </button>
            
//             {isEditing && (
//               <button
//                 onClick={() => {
//                   setIsEditing(false);
//                   setCurrentEmployee(null);
//                   setEditableColumns([]);
//                 }}
//                 className={`py-3 px-6 rounded-lg font-medium transition-all ${
//                   isDarkMode
//                     ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                     : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                 }`}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Assigned Employees Table */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-6 shadow-xl`}>
//           <div className="flex items-center mb-6">
//             <Users className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//             <h3 className={`text-lg font-semibold ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             }`}>Assigned Employees</h3>
//           </div>
          
//           {/* Search Bar */}
//           <div className={`relative mb-6 ${
//             isDarkMode ? 'text-gray-300' : 'text-gray-700'
//           }`}>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="w-5 h-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search employees..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
//                 isDarkMode 
//                   ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                   : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
//               } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
//             />
//           </div>
          
//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className={`w-full ${
//               isDarkMode ? 'text-gray-300' : 'text-gray-700'
//             }`}>
//               <thead className={`${
//                 isDarkMode ? 'bg-gray-700/70' : 'bg-gray-100'
//               }`}>
//                 <tr>
//                   <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-lg">Employee Name</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">Editable Columns</th>
//                   <th className="px-4 py-3 text-center text-sm font-medium rounded-tr-lg">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredAssignedEmployees.length > 0 ? (
//                   filteredAssignedEmployees.map((employee, index) => (
//                     <tr 
//                       key={employee.employeeName}
//                       className={`${
//                         isDarkMode 
//                           ? 'hover:bg-gray-700/50' 
//                           : 'hover:bg-gray-50'
//                       } transition-colors`}
//                     >
//                       <td className="px-4 py-4 whitespace-nowrap font-medium">{employee.employeeName}</td>
//                       <td className="px-4 py-4">
//                         <div className="flex flex-wrap gap-1">
//                           {employee.editableColumns.map((col) => (
//                             <span key={col} className={`text-xs px-2 py-1 rounded ${
//                               isDarkMode 
//                                 ? 'bg-gray-700 text-blue-400' 
//                                 : 'bg-blue-100 text-blue-800'
//                             }`}>
//                               {col}
//                             </span>
//                           ))}
//                           {employee.editableColumns.length > 3 && (
//                             <span className={`text-xs px-2 py-1 rounded ${
//                               isDarkMode 
//                                 ? 'bg-gray-700 text-gray-300' 
//                                 : 'bg-gray-200 text-gray-700'
//                             }`}>
//                               {/* +{employee.editableColumns.length - 3} more */}
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-center">
//                         <div className="flex justify-center space-x-2">
//                           <button
//                             onClick={() => handleEdit(employee)}
//                             className={`p-2 rounded-full ${
//                               isDarkMode 
//                                 ? 'bg-gray-700 text-green-400 hover:bg-gray-600' 
//                                 : 'bg-green-100 text-green-600 hover:bg-green-200'
//                             } transition-colors`}
//                             title="Edit Access"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteClick(employee)}
//                             className={`p-2 rounded-full ${
//                               isDarkMode 
//                                 ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
//                                 : 'bg-red-100 text-red-600 hover:bg-red-200'
//                             } transition-colors`}
//                             title="Delete Access"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td 
//                       colSpan="3" 
//                       className={`px-6 py-8 text-center text-sm ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                       }`}
//                     >
//                       {searchQuery ? "No employees found matching your search" : "No employees have been assigned access yet"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {isDeleteModalOpen && (
//         <div className="fixed z-10 inset-0 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
//             </div>
//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//             <div className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
//               <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                     <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                     <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       Delete Access
//                     </h3>
//                     <div className="mt-2">
//                       <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
//                         Are you sure you want to delete access for {employeeToDelete?.employeeName}? This action cannot be undone.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
//                 <button
//                   type="button"
//                   onClick={confirmDelete}
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
//                 >
//                   Delete
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setIsDeleteModalOpen(false)}
//                   className={`mt-3 w-full inline-flex justify-center rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default ManageEmployeeColumn;