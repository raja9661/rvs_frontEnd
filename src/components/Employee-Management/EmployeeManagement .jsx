import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { Users, Plus, X, Settings, AlertCircle, CheckCircle, Trash2, FolderX } from "lucide-react";

const EmployeeManagement = () => {
  // State for employee management
  const [mappings, setMappings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedClientCodes, setSelectedClientCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for client code management
  const [showManageModal, setShowManageModal] = useState(false);
  const [newClientCode, setNewClientCode] = useState("");
  const [newClientType, setNewClientType] = useState("");
  const [clientCodes, setClientCodes] = useState([]);
  const [isLoadingClientCodes, setIsLoadingClientCodes] = useState(false);

  // Theme detection
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchMappings(), fetchEmployeeNames(),fetchClientCodes()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch employee mappings
  const fetchMappings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/Empcode`);
      setMappings(response.data);
    } catch (error) {
      console.error("Error fetching mappings:", error);
      showNotification("Failed to fetch employee mappings", "error");
    }
  };

  // Fetch employee names
  const fetchEmployeeNames = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employee names:", error);
      showNotification("Failed to fetch employee names", "error");
    }
  };

  // Fetch client codes
  const fetchClientCodes = async () => {
    setIsLoadingClientCodes(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getcode`);
      setClientCodes(response.data);
    } catch (error) {
      console.error("Error fetching client codes:", error);
      showNotification("Failed to fetch client codes", "error");
    } finally {
      setIsLoadingClientCodes(false);
    }
  };

  // Assign client codes to employee
  const assignClientCodes = async () => {
    if (!selectedEmployee || selectedClientCodes.length === 0) {
      return showNotification("Please select an employee and at least one client code", "error");
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addClientCode`, {
        employeeName: selectedEmployee,
        clientCodes: selectedClientCodes,
      });
      showNotification("Client codes assigned successfully!", "success");
      setSelectedClientCodes([]);
      fetchMappings();
    } catch (error) {
      console.error("Error assigning client codes:", error);
      showNotification(error.response?.data?.message || "Failed to assign client codes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Remove client code from employee
  const removeClientCode = async (employeeName, clientCode) => {
    if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
    
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/removeClientCode`, {
        data: { employeeName, clientCode },
      });
      fetchMappings();
      showNotification(`Removed ${clientCode} from ${employeeName}`, "success");
    } catch (error) {
      console.error("Error removing client code:", error);
      showNotification(error.response?.data?.message || "Failed to remove client code", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle client code selection
  const handleClientCodeSelection = (e) => {
    const selectedCode = e.target.value;
    if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
      setSelectedClientCodes([...selectedClientCodes, selectedCode]);
    }
  };

  // Remove selected client code
  const removeSelectedClientCode = (code) => {
    setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
  };

  // Add new client code
  const addNewClientCode = async () => {
    if (!newClientCode.trim() || !newClientType.trim()) {
      return showNotification("Both client code and type are required", "error");
    }

    try {
      setIsLoadingClientCodes(true);
      const response = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addcode`, {
        clientCode: newClientCode.trim().toUpperCase(),
        clientType: newClientType.trim()
      });
      
      setClientCodes([...clientCodes, response.data]);
      setNewClientCode("");
      setNewClientType("");
      showNotification("Client code added successfully", "success");
    } catch (error) {
      console.error("Error adding client code:", error);
      showNotification(error.response?.data?.message || "Failed to add client code", "error");
    } finally {
      setIsLoadingClientCodes(false);
    }
  };

  // Delete client code
  const removeClientCodeFromList = async (id) => {
    console.log("id",id)
    if (!window.confirm("Are you sure you want to delete this client code?")) return;

    try {
      setIsLoadingClientCodes(true);
      await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/deletecode/${id}`);
      setClientCodes(clientCodes.filter(code => code._id !== id));
      showNotification("Client code deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting client code:", error);
      showNotification("Failed to delete client code", "error");
    } finally {
      setIsLoadingClientCodes(false);
    }
  };

  // Load client codes when modal opens
  useEffect(() => {
    if (showManageModal) {
      fetchClientCodes();
    }
  }, [showManageModal]);

  // Notification helper
  const showNotification = (message, type) => {
    alert(`${type === "error" ? "Error" : "Success"}: ${message}`);
  };

  return (
    <Layout>
      <div className="w-auto mx-auto space-y-4">
        {isLoading ? (
          <div className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded p-6 shadow-xl flex justify-center items-center h-64`}>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Assign Client Codes Section */}
            <div className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded p-6 shadow-xl`}>
              <div className="flex items-center mb-4">
                <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Assign Client Codes</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Select Employee:</label>
                  <select
                    className={`w-full p-3 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Select an Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Select Client Codes:</label>
                  <select
                    className={`w-full p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 ${!selectedEmployee ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onChange={handleClientCodeSelection}
                    disabled={!selectedEmployee}
                  >
                    <option value="">Select a Client Code</option>
                    {clientCodes.map((code) => (
                      <option key={code.clientCode || code} value={code.clientCode || code}>
                        {code.clientCode || code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Selected Client Codes:</label>
                <div className={`flex flex-wrap gap-2 min-h-16 p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                }`}>
                  {selectedClientCodes.length > 0 ? (
                    selectedClientCodes.map((code) => (
                      <span key={code} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {code}
                        <button
                          className={`ml-2 rounded-full p-0.5 ${
                            isDarkMode ? 'hover:bg-blue-800 text-blue-300' : 'hover:bg-blue-200 text-blue-700'
                          }`}
                          onClick={() => removeSelectedClientCode(code)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No client codes selected
                    </span>
                  )}
                </div>
              </div>

              <button
                className={`px-5 py-2.5 rounded-lg font-medium text-white ${
                  loading || !selectedEmployee || selectedClientCodes.length === 0
                    ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed')
                    : (isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                }`}
                onClick={assignClientCodes}
                disabled={loading || !selectedEmployee || selectedClientCodes.length === 0}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assign Client Codes
                  </span>
                )}
              </button>
            </div>

            {/* Mappings Table */}
            <div className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded p-6 shadow-xl`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Users className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Current Assignments</h2>
                </div>
                <button
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setShowManageModal(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Client Codes
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-lg border overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <th className={`p-4 text-left font-semibold ${
                        isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
                      }`}>Employee</th>
                      <th className={`p-4 text-left font-semibold ${
                        isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
                      }`}>Assigned Client Codes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.length > 0 ? (
                      mappings.map((mapping) => (
                        <tr key={mapping._id} className={`${
                          isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'hover:bg-gray-50 border-gray-200'
                        }`}>
                          <td className={`p-4 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>{mapping.name || mapping.EmployeeName}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {(mapping.clientCodes || mapping.clientCode || []).map((code) => (
                                <span 
                                  key={code} 
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-800 hover:bg-green-900/50' : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  } cursor-pointer`}
                                  onClick={() => removeClientCode(mapping.name || mapping.EmployeeName, code)}
                                  title={`Click to remove ${code}`}
                                >
                                  {code}
                                  <X className={`w-3 h-3 ml-1.5 ${
                                    isDarkMode ? 'text-green-400' : 'text-green-700'
                                  }`} />
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className={`p-6 text-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                            <p>No assignments found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Manage Client Codes Modal */}
        {showManageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center">
                  <Settings className={`w-6 h-6 mr-3 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Manage Client Codes</h2>
                </div>
                <button
                  className={`rounded-full p-2 ${
                    isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setShowManageModal(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Add New Client Code</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Client Code</label>
                      <input
                        type="text"
                        className={`w-full p-3.5 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter client code (e.g., BK, SATNAM)"
                        value={newClientCode}
                        onChange={(e) => setNewClientCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Client Type</label>
                      <input
                        type="text"
                        className={`w-full p-3.5 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter client type (e.g., VIP, Regular)"
                        value={newClientType}
                        onChange={(e) => setNewClientType(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button
                    className={`mt-4 w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center ${
                      isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                    } ${(!newClientCode || !newClientType) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={addNewClientCode}
                    disabled={!newClientCode || !newClientType || isLoadingClientCodes}
                  >
                    {isLoadingClientCodes ? (
                      <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Plus className="w-5 h-5 mr-2" />
                    )}
                    Add Client Code
                  </button>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Available Client Codes</h3>
                  
                  <div className={`border rounded-lg max-h-[50vh] overflow-y-auto ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    {isLoadingClientCodes ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-blue-500"></div>
                      </div>
                    ) : clientCodes.length > 0 ? (
                      <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th className={`p-4 text-left font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Code</th>
                            <th className={`p-4 text-left font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Type</th>
                            <th className={`p-4 text-right font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientCodes.map((code) => (
                            <tr key={code._id} className={`border-b ${
                              isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                            }`}>
                              <td className={`p-4 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                <span className="font-medium">{code.clientCode}</span>
                              </td>
                              <td className={`p-4 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {code.clientType}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  className={`rounded-lg p-2 ${
                                    isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                                  }`}
                                  onClick={() => removeClientCodeFromList(code._id)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className={`p-8 text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <div className="flex flex-col items-center justify-center">
                          <FolderX className="w-12 h-12 mb-4 opacity-50" />
                          <p className="text-lg">No client codes available</p>
                          <p className="text-sm mt-1">Add your first client code above</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end sticky bottom-0 bg-inherit py-4">
                  <button
                    className={`px-6 py-3 rounded-lg font-medium text-white ${
                      isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    onClick={() => setShowManageModal(false)}
                  >
                    Save Changes
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

export default EmployeeManagement;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Layout from "../Layout/Layout";
// import { Users, Plus, X, Settings, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

// const EmployeeManagement = () => {
//   const [mappings, setMappings] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedClientCodes, setSelectedClientCodes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newClientCode, setNewClientCode] = useState("");
//   const [clientCodes, setClientCodes] = useState([
//     "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", "NTK-2", "NTK-3", "NTK-4", 
//     "AC", "HAIER", "OD", "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", "SS", 
//     "CCS", "RCA", "UR", "PRA", "JAI", "GL", "AP", "HF", "CV", "VG", "VG-1", 
//     "ATT", "CCC"
//   ]);
//   const [showManageModal, setShowManageModal] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check localStorage for theme
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
    
//     // Listen for theme changes
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   useEffect(() => {
//     const loadData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([fetchMappings(), fetchEmployeeNames()]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadData();
//   }, []);

//   const fetchMappings = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/Empcode`);
//       setMappings(response.data);
//       return response;
//     } catch (error) {
//       console.error("Error fetching mappings:", error);
//       return Promise.reject(error);
//     }
//   };

//   const fetchEmployeeNames = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
//       setEmployees(response.data);
//       return response;
//     } catch (error) {
//       console.error("Error fetching employee names:", error);
//       return Promise.reject(error);
//     }
//   };

//   const assignClientCodes = async () => {
//     if (!selectedEmployee || selectedClientCodes.length === 0) {
//       return showNotification("Please select an employee and at least one client code", "error");
//     }

//     try {
//       setLoading(true);
//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addClientCode`, {
//         employeeName: selectedEmployee,
//         clientCodes: selectedClientCodes,
//       });
//       showNotification("Client codes assigned successfully!", "success");
//       setSelectedClientCodes([]);
//       fetchMappings();
//     } catch (error) {
//       console.error("Error assigning client codes:", error);
//       showNotification(error.response?.data?.message || "Failed to assign client codes", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeClientCode = async (employeeName, clientCode) => {
//     if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
    
//     try {
//       setLoading(true);
//       await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/removeClientCode`, {
//         data: { employeeName, clientCode },
//       });
//       fetchMappings();
//       showNotification(`Removed ${clientCode} from ${employeeName}`, "success");
//     } catch (error) {
//       console.error("Error removing client code:", error);
//       showNotification(error.response?.data?.message || "Failed to remove client code", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClientCodeSelection = (e) => {
//     const selectedCode = e.target.value;
//     if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
//       setSelectedClientCodes([...selectedClientCodes, selectedCode]);
//     }
//   };

//   const removeSelectedClientCode = (code) => {
//     setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
//   };

//   const addNewClientCode = () => {
//     const trimmedCode = newClientCode.trim();
//     if (!trimmedCode) return;
    
//     if (!clientCodes.includes(trimmedCode)) {
//       setClientCodes([...clientCodes, trimmedCode]);
//       setNewClientCode("");
//       showNotification(`Added new client code: ${trimmedCode}`, "success");
//     } else {
//       showNotification("Client code already exists", "error");
//     }
//   };

//   const removeClientCodeFromList = (code) => {
//     if (window.confirm(`Are you sure you want to remove ${code} from the global list?`)) {
//       setClientCodes(clientCodes.filter(c => c !== code));
//       showNotification(`Removed ${code} from client code list`, "success");
//     }
//   };

//   const showNotification = (message, type) => {
//     // In a real app, you might use a toast library
//     alert(message);
//   };

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto space-y-4">
//         {/* Header */}
//         {/* <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded p-6 shadow-xl transition-colors duration-200`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className={`text-2xl md:text-3xl font-bold ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`}>Employee Management</h2>
//               <p className={`mt-2 ${
//                 isDarkMode ? 'text-gray-400' : 'text-gray-600'
//               }`}>Assign and manage client codes for your team</p>
//             </div>
//             <div className="mt-4 md:mt-0">
//               <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
//                 isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
//               }`}>
//                 <Users className={`w-5 h-5 mr-2 ${
//                   isDarkMode ? 'text-blue-400' : 'text-blue-500'
//                 }`} />
//                 <span className={`text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>Management Portal</span>
//               </div>
//             </div>
//           </div>
//         </div> */}

//         {isLoading ? (
//           <div className={`${
//             isDarkMode 
//               ? 'bg-gray-800 border-gray-700' 
//               : 'bg-white/95 backdrop-blur-sm'
//           } rounded p-6 shadow-xl flex justify-center items-center h-64`}>
//             <div className="flex flex-col items-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
//               <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading data...</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Assign Client Codes Section */}
//             <div className={`${
//               isDarkMode 
//                 ? 'bg-gray-800 border-gray-700' 
//                 : 'bg-white/95 backdrop-blur-sm'
//             } rounded p-6 shadow-xl transition-colors duration-200`}>
//               <div className="flex items-center mb-4">
//                 <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h2 className={`text-xl font-semibold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>Assign Client Codes</h2>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <label className={`block font-medium mb-2 ${
//                     isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>Select Employee:</label>
//                   <select
//                     className={`w-full p-3 rounded-lg transition-colors border ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                         : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                     } focus:ring-2 focus:ring-blue-500`}
//                     value={selectedEmployee}
//                     onChange={(e) => setSelectedEmployee(e.target.value)}
//                   >
//                     <option value="">Select an Employee</option>
//                     {employees.map((emp) => (
//                       <option key={emp._id} value={emp.name}>
//                         {emp.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className={`block font-medium mb-2 ${
//                     isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>Select Client Codes:</label>
//                   <select
//                     className={`w-full p-3 rounded-lg transition-colors ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                         : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                     } focus:ring-2 focus:ring-blue-500 ${!selectedEmployee ? 'opacity-60 cursor-not-allowed' : ''}`}
//                     onChange={handleClientCodeSelection}
//                     disabled={!selectedEmployee}
//                   >
//                     <option value="">Select a Client Code</option>
//                     {clientCodes.map((code) => (
//                       <option key={code} value={code}>
//                         {code}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="mb-6">
//                 <label className={`block font-medium mb-2 ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>Selected Client Codes:</label>
//                 <div className={`flex flex-wrap gap-2 min-h-16 p-3 rounded-lg transition-colors ${
//                   isDarkMode 
//                     ? 'bg-gray-700 border border-gray-600' 
//                     : 'bg-gray-50 border border-gray-200'
//                 }`}>
//                   {selectedClientCodes.length > 0 ? (
//                     selectedClientCodes.map((code) => (
//                       <span key={code} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
//                         isDarkMode 
//                           ? 'bg-blue-900/40 text-blue-300 border border-blue-800' 
//                           : 'bg-blue-100 text-blue-800'
//                       }`}>
//                         {code}
//                         <button
//                           className={`ml-2 rounded-full p-0.5 ${
//                             isDarkMode 
//                               ? 'hover:bg-blue-800 text-blue-300' 
//                               : 'hover:bg-blue-200 text-blue-700'
//                           }`}
//                           onClick={() => removeSelectedClientCode(code)}
//                         >
//                           <X className="w-3.5 h-3.5" />
//                         </button>
//                       </span>
//                     ))
//                   ) : (
//                     <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                       No client codes selected
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <button
//                 className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all ${
//                   loading || !selectedEmployee || selectedClientCodes.length === 0
//                     ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed')
//                     : (isDarkMode 
//                         ? 'bg-blue-600 hover:bg-blue-700' 
//                         : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700')
//                 }`}
//                 onClick={assignClientCodes}
//                 disabled={loading || !selectedEmployee || selectedClientCodes.length === 0}
//               >
//                 {loading ? (
//                   <span className="flex items-center">
//                     <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                     Processing...
//                   </span>
//                 ) : (
//                   <span className="flex items-center">
//                     <CheckCircle className="w-4 h-4 mr-2" />
//                     Assign Client Codes
//                   </span>
//                 )}
//               </button>
//             </div>

//             {/* Mappings Table */}
//             <div className={`${
//               isDarkMode 
//                 ? 'bg-gray-800 border-gray-700' 
//                 : 'bg-white/95 backdrop-blur-sm'
//             } rounded p-6 shadow-xl transition-colors duration-200`}>
//               <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center">
//                   <Users className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                   <h2 className={`text-xl font-semibold ${
//                     isDarkMode ? 'text-white' : 'text-gray-900'
//                   }`}>Current Assignments</h2>
//                 </div>
//                 <button
//                   className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
//                     isDarkMode 
//                       ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                       : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
//                   }`}
//                   onClick={() => setShowManageModal(true)}
//                 >
//                   <Settings className="w-4 h-4 mr-2" />
//                   Manage Client Codes
//                 </button>
//               </div>
              
//               <div className="overflow-x-auto rounded-lg border overflow-hidden">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className={`${
//                       isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
//                     }`}>
//                       <th className={`p-4 text-left font-semibold ${
//                         isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
//                       }`}>Employee</th>
//                       <th className={`p-4 text-left font-semibold ${
//                         isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
//                       }`}>Assigned Client Codes</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {mappings.length > 0 ? (
//                       mappings.map((mapping, index) => (
//                         <tr key={mapping._id} className={`${
//                           isDarkMode 
//                             ? 'border-gray-700 hover:bg-gray-700/50' 
//                             : 'hover:bg-gray-50 border-gray-200'
//                         } ${index !== mappings.length - 1 ? 'border-b' : ''}`}>
//                           <td className={`p-4 ${
//                             isDarkMode ? 'text-gray-200' : 'text-gray-800'
//                           }`}>{mapping.name || mapping.EmployeeName}</td>
//                           <td className="p-4">
//                             <div className="flex flex-wrap gap-2">
//                               {(mapping.clientCodes || mapping.clientCode || []).map((code) => (
//                                 <span 
//                                   key={code} 
//                                   className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
//                                     isDarkMode 
//                                       ? 'bg-green-900/30 text-green-300 border border-green-800 hover:bg-green-900/50' 
//                                       : 'bg-green-100 text-green-800 hover:bg-green-200'
//                                   } cursor-pointer`}
//                                   onClick={() => removeClientCode(mapping.name || mapping.EmployeeName, code)}
//                                   title={`Click to remove ${code}`}
//                                 >
//                                   {code}
//                                   <X className={`w-3 h-3 ml-1.5 ${
//                                     isDarkMode ? 'text-green-400' : 'text-green-700'
//                                   }`} />
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="2" className={`p-6 text-center ${
//                           isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                         }`}>
//                           <div className="flex flex-col items-center">
//                             <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
//                             <p>No assignments found</p>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Manage Client Codes Modal */}
//       {showManageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl shadow-2xl w-full max-w-md transition-colors ${
//             isDarkMode ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <div className={`flex justify-between items-center p-6 border-b ${
//               isDarkMode ? 'border-gray-700' : 'border-gray-200'
//             }`}>
//               <div className="flex items-center">
//                 <Settings className={`w-5 h-5 mr-2 ${
//                   isDarkMode ? 'text-blue-400' : 'text-blue-600'
//                 }`} />
//                 <h2 className={`text-xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>Manage Client Codes</h2>
//               </div>
//               <button
//                 className={`rounded-full p-1 transition-colors ${
//                   isDarkMode 
//                     ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
//                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
//                 }`}
//                 onClick={() => setShowManageModal(false)}
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6">
//               <div className="mb-6">
//                 <label className={`block font-medium mb-2 ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>Add New Client Code:</label>
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     className={`flex-grow p-3 rounded-lg transition-colors ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                         : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                     } focus:ring-2 focus:ring-blue-500`}
//                     placeholder="Enter new code"
//                     value={newClientCode}
//                     onChange={(e) => setNewClientCode(e.target.value.toUpperCase())}
//                     onKeyPress={(e) => e.key === 'Enter' && addNewClientCode()}
//                   />
//                   <button
//                     className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
//                       isDarkMode 
//                         ? 'bg-green-600 hover:bg-green-700' 
//                         : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
//                     }`}
//                     onClick={addNewClientCode}
//                   >
//                     <Plus className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className={`block font-medium mb-2 ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>Available Client Codes:</label>
//                 <div className={`border rounded-lg max-h-60 overflow-y-auto ${
//                   isDarkMode ? 'border-gray-700' : 'border-gray-200'
//                 }`}>
//                   {clientCodes.length > 0 ? (
//                     <div className="grid grid-cols-2 gap-2 p-3">
//                       {clientCodes.sort().map((code) => (
//                         <div key={code} className={`flex justify-between items-center p-2 rounded ${
//                           isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
//                         }`}>
//                           <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
//                             {code}
//                           </span>
//                           <button
//                             className={`rounded-full p-1 transition-colors ${
//                               isDarkMode 
//                                 ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
//                                 : 'text-red-500 hover:text-red-700 hover:bg-red-100'
//                             }`}
//                             onClick={() => removeClientCodeFromList(code)}
//                             title={`Remove ${code}`}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className={`text-center py-6 ${
//                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                     }`}>No client codes available</p>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end">
//                 <button
//                   className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
//                     isDarkMode 
//                       ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                       : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
//                   }`}
//                   onClick={() => setShowManageModal(false)}
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default EmployeeManagement;