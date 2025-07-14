// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [uploadMessage, setUploadMessage] = useState("");
//   const [uploadStatus, setUploadStatus] = useState(null);
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name", "Product", "Account Number", "Requirement"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "numeric" }, 
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId) {
//       toast.error("Please enter Client ID.");
//       return;
//     }
  
//     try {
//       const data = hotInstance.getData();
//       const formattedData = data
//         .map((row) => ({
//           userId: user.userId,
//           name: row[0] || "",
//           product: row[1] || "",
//           accountNumber: row[2] || "",
//           requirement: row[3] || "",
//           ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//         }))
//         .filter((row) => row.name && row.product);

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload.");
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client ID
//                 </label>
//                 <input
//                   type="text"
//                   value={clientId}
//                   onChange={(e) => setClientId(e.target.value)}
//                   placeholder="Enter Client ID"
//                   className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                     isDarkMode 
//                       ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                       : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                   }`}
//                   required
//                 />
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   Enter the client's ID code (e.g., CLIENT123)
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Upload Status Message */}
//           {/* {uploadMessage && (
//             <div className={`mb-6 p-4 rounded-lg flex items-center ${
//               uploadStatus === 'success' 
//                 ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800')
//                 : (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800')
//             }`}>
//               {uploadStatus === 'success' ? (
//                 <Check className="w-5 h-5 mr-2" />
//               ) : (
//                 <AlertCircle className="w-5 h-5 mr-2" />
//               )}
//               <span>{uploadMessage}</span>
//             </div>
//           )} */}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling - UPDATED */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               }`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={(userRole === "employee" || userRole === "admin") && !clientId}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${((userRole === "employee" || userRole === "admin") && !clientId) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Upload className="w-5 h-5 mr-2" />
//               Upload Data
//             </button>
//           </div>
          
//           {/* Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li>Fill in all required fields (Name and Product are mandatory)</li>
//                   <li>Select product from the dropdown for consistent data entry</li>
//                   <li>Account Number should be numeric only</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter the Client ID before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;



//////////////////////////////////////////////////////Client code suggestion//////////////////////////////////////


// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name", "Product", "Account Number", "Requirement"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "numeric" }, 
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId) {
//       toast.error("Please enter Client ID.");
//       return;
//     }
  
//     try {
//       const data = hotInstance.getData();
//       const formattedData = data
//         .map((row) => ({
//           userId: user.userId,
//           name: row[0] || "",
//           product: row[1] || "",
//           accountNumber: row[2] || "",
//           requirement: row[3] || "",
//           ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//         }))
//         .filter((row) => row.name && row.product);

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload.");
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         if (hotInstance && !hotInstance.isDestroyed) {
//           hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//         }
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               }`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={(userRole === "employee" || userRole === "admin") && !clientId}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${((userRole === "employee" || userRole === "admin") && !clientId) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Upload className="w-5 h-5 mr-2" />
//               Upload Data
//             </button>
//           </div>
          
//           {/* Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li>Fill in all required fields (Name and Product are mandatory)</li>
//                   <li>Select product from the dropdown for consistent data entry</li>
//                   <li>Account Number should be numeric only</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;



////////////////////////////////////////////////////////////////////////////updated reset and mendatory fields///////////////////////

// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "numeric" }, 
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   // Function to reset the table and form
//   const resetTable = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//     }
    
//     // Reset client ID for employee/admin
//     if (userRole === "employee" || userRole === "admin") {
//       setClientId("");
//     }
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
//       toast.error("Please enter Client ID.");
//       return;
//     }

//     setIsUploading(true);
  
//     try {
//       const data = hotInstance.getData();
      
//       // Enhanced validation - check all fields are mandatory
//       const formattedData = [];
//       const validationErrors = [];
      
//       data.forEach((row, index) => {
//         const [name, product, accountNumber, requirement] = row;
        
//         // Skip completely empty rows
//         if (!name && !product && !accountNumber && !requirement) {
//           return;
//         }
        
//         // Check if any field is missing for non-empty rows
//         const missingFields = [];
//         if (!name || name.toString().trim() === '') missingFields.push('Name');
//         if (!product || product.toString().trim() === '') missingFields.push('Product');
//         if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
//         if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
//         if (missingFields.length > 0) {
//           validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
//         } else {
//           formattedData.push({
//             userId: user.userId,
//             name: name.toString().trim(),
//             product: product.toString().trim(),
//             accountNumber: accountNumber.toString().trim(),
//             requirement: requirement.toString().trim(),
//             ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//           });
//         }
//       });

//       // Show validation errors if any
//       if (validationErrors.length > 0) {
//         toast.error(
//           <div>
//             <div className="font-semibold">Please fill all required fields:</div>
//             <div className="text-sm mt-1">
//               {validationErrors.slice(0, 3).map((error, index) => (
//                 <div key={index}>• {error}</div>
//               ))}
//               {validationErrors.length > 3 && (
//                 <div>• ...and {validationErrors.length - 3} more errors</div>
//               )}
//             </div>
//           </div>
//         );
//         setIsUploading(false);
//         return;
//       }

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload. Please fill in at least one complete row.");
//         setIsUploading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
      
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         resetTable();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
      
//       // Reset the table on error as well
//       resetTable();
//     } finally {
//       setIsUploading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once (All fields are mandatory)
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code *
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code (Required)"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   This field is mandatory. Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry (All fields marked with * are mandatory)
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={resetTable}
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-gray-600 hover:bg-gray-700 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className="w-5 h-5 mr-2" />
//               Reset Table
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isUploading ? (
//                 <>
//                   <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload Data
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
//                   <li>Account Number should be numeric only</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                   <li>Use "Reset Table" to clear all data manually</li>
//                   <li>Table will reset automatically after successful upload or errors</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;

///////////////////////Validation on swaping of account  or product//////////////////////////////////////////////////////////////////////////


// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw, AlertTriangle } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [validationWarnings, setValidationWarnings] = useState([]);
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Validation helper functions
//   const isNumericMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const numericChars = value.replace(/[^0-9]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (numericChars / totalChars) >= 0.6; // 60% or more numeric
//   };

//   const isAlphabeticMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const alphabeticChars = value.replace(/[^a-zA-Z]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (alphabeticChars / totalChars) >= 0.6; // 60% or more alphabetic
//   };

//   const validateFieldContent = (data) => {
//     const warnings = [];
    
//     data.forEach((row, index) => {
//       const [name, product, accountNumber, requirement] = row;
      
//       // Skip empty rows
//       if (!name && !product && !accountNumber && !requirement) {
//         return;
//       }
      
//       // Check if product seems more numeric than alphabetic
//       if (product && product.toString().trim() !== '' && isNumericMajority(product)) {
//         warnings.push({
//           row: index + 1,
//           type: 'product_numeric',
//           message: `Product field appears to contain mostly numbers. Consider if this should be in Account Number field.`,
//           product: product.toString().trim()
//         });
//       }
      
//       // Check if account number seems more alphabetic than numeric
//       if (accountNumber && accountNumber.toString().trim() !== '' && isAlphabeticMajority(accountNumber)) {
//         warnings.push({
//           row: index + 1,
//           type: 'account_alphabetic',
//           message: `Account Number field appears to contain mostly letters. Consider if this should be in Product field.`,
//           accountNumber: accountNumber.toString().trim()
//         });
//       }
//     });
    
//     return warnings;
//   };

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "text" }, // Changed from numeric to text to allow validation
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Add cell change listener for real-time validation
//       afterChange: (changes) => {
//         if (changes) {
//           // Debounce validation to avoid too frequent updates
//           setTimeout(() => {
//             const currentData = hot.getData();
//             const warnings = validateFieldContent(currentData);
//             setValidationWarnings(warnings);
//           }, 500);
//         }
//       },
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   // Function to reset the table and form
//   const resetTable = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//     }
    
//     // Reset client ID for employee/admin
//     if (userRole === "employee" || userRole === "admin") {
//       setClientId("");
//     }
    
//     // Clear validation warnings
//     setValidationWarnings([]);
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
//       toast.error("Please enter Client ID.");
//       return;
//     }

//     setIsUploading(true);
  
//     try {
//       const data = hotInstance.getData();
      
//       // Validate field content before processing
//       const contentWarnings = validateFieldContent(data);
      
//       // Show validation warnings if any exist
//       if (contentWarnings.length > 0) {
//         const proceed = window.confirm(
//           `⚠️ Field Content Warnings Detected:\n\n` +
//           contentWarnings.slice(0, 5).map(w => `Row ${w.row}: ${w.message}`).join('\n') +
//           (contentWarnings.length > 5 ? `\n...and ${contentWarnings.length - 5} more warnings` : '') +
//           `\n\nDo you want to proceed with upload anyway?`
//         );
        
//         if (!proceed) {
//           setIsUploading(false);
//           return;
//         }
//       }
      
//       // Enhanced validation - check all fields are mandatory
//       const formattedData = [];
//       const validationErrors = [];
      
//       data.forEach((row, index) => {
//         const [name, product, accountNumber, requirement] = row;
        
//         // Skip completely empty rows
//         if (!name && !product && !accountNumber && !requirement) {
//           return;
//         }
        
//         // Check if any field is missing for non-empty rows
//         const missingFields = [];
//         if (!name || name.toString().trim() === '') missingFields.push('Name');
//         if (!product || product.toString().trim() === '') missingFields.push('Product');
//         if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
//         if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
//         if (missingFields.length > 0) {
//           validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
//         } else {
//           formattedData.push({
//             userId: user.userId,
//             name: name.toString().trim(),
//             product: product.toString().trim(),
//             accountNumber: accountNumber.toString().trim(),
//             requirement: requirement.toString().trim(),
//             ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//           });
//         }
//       });

//       // Show validation errors if any
//       if (validationErrors.length > 0) {
//         toast.error(
//           <div>
//             <div className="font-semibold">Please fill all required fields:</div>
//             <div className="text-sm mt-1">
//               {validationErrors.slice(0, 3).map((error, index) => (
//                 <div key={index}>• {error}</div>
//               ))}
//               {validationErrors.length > 3 && (
//                 <div>• ...and {validationErrors.length - 3} more errors</div>
//               )}
//             </div>
//           </div>
//         );
//         setIsUploading(false);
//         return;
//       }

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload. Please fill in at least one complete row.");
//         setIsUploading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
      
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         resetTable();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
      
//       // Reset the table on error as well
//       resetTable();
//     } finally {
//       setIsUploading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once (All fields are mandatory)
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code *
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code (Required)"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   This field is mandatory. Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Validation Warnings */}
//           {validationWarnings.length > 0 && (
//             <div className={`mb-6 p-4 rounded-lg border-l-4 ${
//               isDarkMode 
//                 ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300' 
//                 : 'bg-yellow-50 border-yellow-400 text-yellow-800'
//             }`}>
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h4 className="font-medium mb-2">Field Content Warnings</h4>
//                   <div className="space-y-1 text-sm">
//                     {validationWarnings.slice(0, 5).map((warning, index) => (
//                       <div key={index} className="flex items-start">
//                         <span className="font-medium mr-2">Row {warning.row}:</span>
//                         <span>{warning.message}</span>
//                       </div>
//                     ))}
//                     {validationWarnings.length > 5 && (
//                       <div className="text-xs opacity-75">
//                         ...and {validationWarnings.length - 5} more warnings
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-xs mt-2 opacity-75">
//                     These are suggestions to help prevent data entry errors. You can still proceed with upload.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry (All fields marked with * are mandatory)
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={resetTable}
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-gray-600 hover:bg-gray-700 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className="w-5 h-5 mr-2" />
//               Reset Table
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isUploading ? (
//                 <>
//                   <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload Data
//                   {validationWarnings.length > 0 && (
//                     <AlertTriangle className="w-4 h-4 ml-2 text-yellow-400" />
//                   )}
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
//                   <li><strong>Smart validation:</strong> System will warn if Product contains mostly numbers or Account Number contains mostly letters</li>
//                   <li>Account Number can be alphanumeric, but should primarily contain numbers</li>
//                   <li>Product should primarily contain letters/text</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                   <li>Use "Reset Table" to clear all data manually</li>
//                   <li>Table will reset automatically after successful upload or errors</li>
//                   <li>You can proceed with upload even if warnings are shown (warnings are just suggestions)</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;








//////////////////////////////////////////////////////////////////////add swapping funtionality//////////////////////////////



// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw, AlertTriangle, ArrowLeftRight } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [validationWarnings, setValidationWarnings] = useState([]);
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Validation helper functions
//   const isNumericMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const numericChars = value.replace(/[^0-9]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (numericChars / totalChars) >= 0.6; // 60% or more numeric
//   };

//   const isAlphabeticMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const alphabeticChars = value.replace(/[^a-zA-Z]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (alphabeticChars / totalChars) >= 0.6; // 60% or more alphabetic
//   };

//   const validateFieldContent = (data) => {
//     const warnings = [];
    
//     data.forEach((row, index) => {
//       const [name, product, accountNumber, requirement] = row;
      
//       // Skip empty rows
//       if (!name && !product && !accountNumber && !requirement) {
//         return;
//       }
      
//       // Check if product seems more numeric than alphabetic
//       if (product && product.toString().trim() !== '' && isNumericMajority(product)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'product_numeric',
//           message: `Product field appears to contain mostly numbers. Consider if this should be in Account Number field.`,
//           product: product.toString().trim(),
//           accountNumber: accountNumber ? accountNumber.toString().trim() : '',
//           canSwap: true
//         });
//       }
      
//       // Check if account number seems more alphabetic than numeric
//       if (accountNumber && accountNumber.toString().trim() !== '' && isAlphabeticMajority(accountNumber)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'account_alphabetic',
//           message: `Account Number field appears to contain mostly letters. Consider if this should be in Product field.`,
//           accountNumber: accountNumber.toString().trim(),
//           product: product ? product.toString().trim() : '',
//           canSwap: true
//         });
//       }
//     });
    
//     return warnings;
//   };

//   // New swap function
//   const swapProductAndAccountNumber = (rowIndex) => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     try {
//       const currentData = hotInstance.getData();
//       const row = currentData[rowIndex];
      
//       if (!row) return;
      
//       // Swap product (index 1) and account number (index 2)
//       const product = row[1];
//       const accountNumber = row[2];
      
//       // Update the table data
//       hotInstance.setDataAtCell(rowIndex, 1, accountNumber || '');
//       hotInstance.setDataAtCell(rowIndex, 2, product || '');
      
//       // Show success message
//       toast.success(`Row ${rowIndex + 1}: Product and Account Number swapped successfully!`);
      
//       // Re-validate after swap to update warnings
//       setTimeout(() => {
//         const updatedData = hotInstance.getData();
//         const warnings = validateFieldContent(updatedData);
//         setValidationWarnings(warnings);
//       }, 100);
      
//     } catch (error) {
//       console.error("Error swapping fields:", error);
//       toast.error("Failed to swap fields. Please try again.");
//     }
//   };

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "text" }, // Changed from numeric to text to allow validation
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Add cell change listener for real-time validation
//       afterChange: (changes) => {
//         if (changes) {
//           // Debounce validation to avoid too frequent updates
//           setTimeout(() => {
//             const currentData = hot.getData();
//             const warnings = validateFieldContent(currentData);
//             setValidationWarnings(warnings);
//           }, 500);
//         }
//       },
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   // Function to reset the table and form
//   const resetTable = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//     }
    
//     // Reset client ID for employee/admin
//     if (userRole === "employee" || userRole === "admin") {
//       setClientId("");
//     }
    
//     // Clear validation warnings
//     setValidationWarnings([]);
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
//       toast.error("Please enter Client ID.");
//       return;
//     }

//     setIsUploading(true);
  
//     try {
//       const data = hotInstance.getData();
      
//       // Validate field content before processing
//       const contentWarnings = validateFieldContent(data);
      
//       // Show validation warnings if any exist
//       if (contentWarnings.length > 0) {
//         const proceed = window.confirm(
//           `⚠️ Field Content Warnings Detected:\n\n` +
//           contentWarnings.slice(0, 5).map(w => `Row ${w.row}: ${w.message}`).join('\n') +
//           (contentWarnings.length > 5 ? `\n...and ${contentWarnings.length - 5} more warnings` : '') +
//           `\n\nDo you want to proceed with upload anyway?`
//         );
        
//         if (!proceed) {
//           setIsUploading(false);
//           return;
//         }
//       }
      
//       // Enhanced validation - check all fields are mandatory
//       const formattedData = [];
//       const validationErrors = [];
      
//       data.forEach((row, index) => {
//         const [name, product, accountNumber, requirement] = row;
        
//         // Skip completely empty rows
//         if (!name && !product && !accountNumber && !requirement) {
//           return;
//         }
        
//         // Check if any field is missing for non-empty rows
//         const missingFields = [];
//         if (!name || name.toString().trim() === '') missingFields.push('Name');
//         if (!product || product.toString().trim() === '') missingFields.push('Product');
//         if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
//         if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
//         if (missingFields.length > 0) {
//           validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
//         } else {
//           formattedData.push({
//             userId: user.userId,
//             name: name.toString().trim(),
//             product: product.toString().trim(),
//             accountNumber: accountNumber.toString().trim(),
//             requirement: requirement.toString().trim(),
//             ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//           });
//         }
//       });

//       // Show validation errors if any
//       if (validationErrors.length > 0) {
//         toast.error(
//           <div>
//             <div className="font-semibold">Please fill all required fields:</div>
//             <div className="text-sm mt-1">
//               {validationErrors.slice(0, 3).map((error, index) => (
//                 <div key={index}>• {error}</div>
//               ))}
//               {validationErrors.length > 3 && (
//                 <div>• ...and {validationErrors.length - 3} more errors</div>
//               )}
//             </div>
//           </div>
//         );
//         setIsUploading(false);
//         return;
//       }

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload. Please fill in at least one complete row.");
//         setIsUploading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
      
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         resetTable();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
      
//       // Reset the table on error as well
//       resetTable();
//     } finally {
//       setIsUploading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once (All fields are mandatory)
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code *
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code (Required)"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   This field is mandatory. Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Enhanced Validation Warnings with Swap Functionality */}
//           {validationWarnings.length > 0 && (
//             <div className={`mb-6 p-4 rounded-lg border-l-4 ${
//               isDarkMode 
//                 ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300' 
//                 : 'bg-yellow-50 border-yellow-400 text-yellow-800'
//             }`}>
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h4 className="font-medium mb-3">Field Content Warnings</h4>
//                   <div className="space-y-3">
//                     {validationWarnings.slice(0, 5).map((warning, index) => (
//                       <div key={index} className={`p-3 rounded-md ${
//                         isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
//                       } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center mb-2">
//                               <span className="font-medium mr-2">Row {warning.row}:</span>
//                               <span className="text-sm">{warning.message}</span>
//                             </div>
//                             <div className="text-xs space-y-1">
//                               <div><strong>Product:</strong> "{warning.product}"</div>
//                               <div><strong>Account Number:</strong> "{warning.accountNumber}"</div>
//                             </div>
//                           </div>
//                           {warning.canSwap && (
//                             <button
//                               onClick={() => swapProductAndAccountNumber(warning.rowIndex)}
//                               disabled={isUploading}
//                               className={`flex items-center px-3 py-1.5 ml-3 rounded-md text-xs font-medium transition-all ${
//                                 isDarkMode
//                                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//                               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                               title="Swap Product and Account Number for this row"
//                             >
//                               <ArrowLeftRight className="w-3 h-3 mr-1" />
//                               Swap
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                     {validationWarnings.length > 5 && (
//                       <div className="text-xs opacity-75">
//                         ...and {validationWarnings.length - 5} more warnings
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-xs mt-3 opacity-75">
//                     These are suggestions to help prevent data entry errors. Use the "Swap" button to quickly exchange Product and Account Number values, or proceed with upload as-is.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry (All fields marked with * are mandatory)
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={resetTable}
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-gray-600 hover:bg-gray-700 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className="w-5 h-5 mr-2" />
//               Reset Table
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isUploading ? (
//                 <>
//                   <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload Data
//                   {validationWarnings.length > 0 && (
//                     <AlertTriangle className="w-4 h-4 ml-2 text-yellow-400" />
//                   )}
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Enhanced Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
//                   <li><strong>Smart validation with swap functionality:</strong> System will warn if Product contains mostly numbers or Account Number contains mostly letters</li>
//                   <li><strong>New Swap Feature:</strong> Click the "Swap" button next to warnings to automatically exchange Product and Account Number values</li>
//                   <li>Account Number can be alphanumeric, but should primarily contain numbers</li>
//                   <li>Product should primarily contain letters/text</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                   <li>Use "Reset Table" to clear all data manually</li>
//                  <li>Table will reset automatically after successful upload or errors</li>
//                  <li>You can proceed with upload even if warnings are shown (warnings are just suggestions)</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;





























///////////////////////////////////swap show in down//////////////////////////////////work fine //////////////////////////////////////////////



// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw, AlertTriangle, ArrowLeftRight } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [validationWarnings, setValidationWarnings] = useState([]);
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Validation helper functions
//   const isNumericMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const numericChars = value.replace(/[^0-9]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (numericChars / totalChars) >= 0.6; // 60% or more numeric
//   };

//   const isAlphabeticMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const alphabeticChars = value.replace(/[^a-zA-Z]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (alphabeticChars / totalChars) >= 0.6; // 60% or more alphabetic
//   };

//   const validateFieldContent = (data) => {
//     const warnings = [];
    
//     data.forEach((row, index) => {
//       const [name, product, accountNumber, requirement] = row;
      
//       // Skip empty rows
//       if (!name && !product && !accountNumber && !requirement) {
//         return;
//       }
      
//       // Check if product seems more numeric than alphabetic
//       if (product && product.toString().trim() !== '' && isNumericMajority(product)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'product_numeric',
//           message: `Product field appears to contain mostly numbers. Consider if this should be in Account Number field.`,
//           product: product.toString().trim(),
//           accountNumber: accountNumber ? accountNumber.toString().trim() : '',
//           canSwap: true
//         });
//       }
      
//       // Check if account number seems more alphabetic than numeric
//       if (accountNumber && accountNumber.toString().trim() !== '' && isAlphabeticMajority(accountNumber)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'account_alphabetic',
//           message: `Account Number field appears to contain mostly letters. Consider if this should be in Product field.`,
//           accountNumber: accountNumber.toString().trim(),
//           product: product ? product.toString().trim() : '',
//           canSwap: true
//         });
//       }
//     });
    
//     return warnings;
//   };

//   // New swap function
//   const swapProductAndAccountNumber = (rowIndex) => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     try {
//       const currentData = hotInstance.getData();
//       const row = currentData[rowIndex];
      
//       if (!row) return;
      
//       // Swap product (index 1) and account number (index 2)
//       const product = row[1];
//       const accountNumber = row[2];
      
//       // Update the table data
//       hotInstance.setDataAtCell(rowIndex, 1, accountNumber || '');
//       hotInstance.setDataAtCell(rowIndex, 2, product || '');
      
//       // Show success message
//       toast.success(`Row ${rowIndex + 1}: Product and Account Number swapped successfully!`);
      
//       // Re-validate after swap to update warnings
//       setTimeout(() => {
//         const updatedData = hotInstance.getData();
//         const warnings = validateFieldContent(updatedData);
//         setValidationWarnings(warnings);
//       }, 100);
      
//     } catch (error) {
//       console.error("Error swapping fields:", error);
//       toast.error("Failed to swap fields. Please try again.");
//     }
//   };

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "text" }, // Changed from numeric to text to allow validation
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Add cell change listener for real-time validation
//       afterChange: (changes) => {
//         if (changes) {
//           // Debounce validation to avoid too frequent updates
//           setTimeout(() => {
//             const currentData = hot.getData();
//             const warnings = validateFieldContent(currentData);
//             setValidationWarnings(warnings);
//           }, 500);
//         }
//       },
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   // Function to reset the table and form
//   const resetTable = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//     }
    
//     // Reset client ID for employee/admin
//     if (userRole === "employee" || userRole === "admin") {
//       setClientId("");
//     }
    
//     // Clear validation warnings
//     setValidationWarnings([]);
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
//       toast.error("Please enter Client ID.");
//       return;
//     }

//     setIsUploading(true);
  
//     try {
//       const data = hotInstance.getData();
      
//       // Validate field content before processing
//       const contentWarnings = validateFieldContent(data);
      
//       // Show validation warnings if any exist
//       if (contentWarnings.length > 0) {
//         const proceed = window.confirm(
//           `⚠️ Field Content Warnings Detected:\n\n` +
//           contentWarnings.slice(0, 5).map(w => `Row ${w.row}: ${w.message}`).join('\n') +
//           (contentWarnings.length > 5 ? `\n...and ${contentWarnings.length - 5} more warnings` : '') +
//           `\n\nDo you want to proceed with upload anyway?`
//         );
        
//         if (!proceed) {
//           setIsUploading(false);
//           return;
//         }
//       }
      
//       // Enhanced validation - check all fields are mandatory
//       const formattedData = [];
//       const validationErrors = [];
      
//       data.forEach((row, index) => {
//         const [name, product, accountNumber, requirement] = row;
        
//         // Skip completely empty rows
//         if (!name && !product && !accountNumber && !requirement) {
//           return;
//         }
        
//         // Check if any field is missing for non-empty rows
//         const missingFields = [];
//         if (!name || name.toString().trim() === '') missingFields.push('Name');
//         if (!product || product.toString().trim() === '') missingFields.push('Product');
//         if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
//         if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
//         if (missingFields.length > 0) {
//           validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
//         } else {
//           formattedData.push({
//             userId: user.userId,
//             name: name.toString().trim(),
//             product: product.toString().trim(),
//             accountNumber: accountNumber.toString().trim(),
//             requirement: requirement.toString().trim(),
//             ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//           });
//         }
//       });

//       // Show validation errors if any
//       if (validationErrors.length > 0) {
//         toast.error(
//           <div>
//             <div className="font-semibold">Please fill all required fields:</div>
//             <div className="text-sm mt-1">
//               {validationErrors.slice(0, 3).map((error, index) => (
//                 <div key={index}>• {error}</div>
//               ))}
//               {validationErrors.length > 3 && (
//                 <div>• ...and {validationErrors.length - 3} more errors</div>
//               )}
//             </div>
//           </div>
//         );
//         setIsUploading(false);
//         return;
//       }

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload. Please fill in at least one complete row.");
//         setIsUploading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
      
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         resetTable();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
      
//       // Reset the table on error as well
//       resetTable();
//     } finally {
//       setIsUploading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once (All fields are mandatory)
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code *
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code (Required)"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   This field is mandatory. Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry (All fields marked with * are mandatory)
//                 </h4>
//               </div>
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
//             `}</style>
//           </div>

//           {/* Enhanced Validation Warnings with Swap Functionality */}
//           {validationWarnings.length > 0 && (
//             <div className={`mb-6 p-4 rounded-lg border-l-4 ${
//               isDarkMode 
//                 ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300' 
//                 : 'bg-yellow-50 border-yellow-400 text-yellow-800'
//             }`}>
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h4 className="font-medium mb-3">Field Content Warnings</h4>
//                   <div className="space-y-3">
//                     {validationWarnings.map((warning, index) => (
//                       <div key={index} className={`p-3 rounded-md ${
//                         isDarkMode ? 'bg-gray-800/50' : 'bg-white/70'
//                       } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center mb-2">
//                               <span className="font-medium mr-2">Row {warning.row}:</span>
//                               <span className="text-sm">{warning.message}</span>
//                             </div>
//                             <div className="text-xs space-y-1">
//                               <div><strong>Product:</strong> "{warning.product}"</div>
//                               <div><strong>Account Number:</strong> "{warning.accountNumber}"</div>
//                             </div>
//                           </div>
//                           {warning.canSwap && (
//                             <button
//                               onClick={() => swapProductAndAccountNumber(warning.rowIndex)}
//                               disabled={isUploading}
//                               className={`flex items-center px-3 py-1.5 ml-3 rounded-md text-xs font-medium transition-all ${
//                                 isDarkMode
//                                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//                               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                               title="Swap Product and Account Number for this row"
//                             >
//                               <ArrowLeftRight className="w-3 h-3 mr-1" />
//                               Swap
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <p className="text-xs mt-3 opacity-75">
//                     These are suggestions to help prevent data entry errors. Use the "Swap" button to quickly exchange Product and Account Number values, or proceed with upload as-is.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={resetTable}
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-gray-600 hover:bg-gray-700 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className="w-5 h-5 mr-2" />
//               Reset Table
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isUploading ? (
//                 <>
//                   <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload Data
//                   {validationWarnings.length > 0 && (
//                     <AlertTriangle className="w-4 h-4 ml-2 text-yellow-400" />
//                   )}
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Enhanced Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
//                   <li><strong>Smart validation with swap functionality:</strong> System will warn if Product contains mostly numbers or Account Number contains mostly letters</li>
//                   <li><strong>New Swap Feature:</strong> Click the "Swap" button next to warnings to automatically exchange Product and Account Number values</li>
//                   <li>Account Number can be alphanumeric, but should primarily contain numbers</li>
//                   <li>Product should primarily contain letters/text</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                   <li>Use "Reset Table" to clear all data manually</li>
//                  <li>Table will reset automatically after successful upload or errors</li>
//                  <li>You can proceed with upload even if warnings are shown (warnings are just suggestions)</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;



















//////////////////////////////////////////////////////////////////////////////////////////////////////swapping inline /////////////////////////



// import { useRef, useEffect, useState } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// import axios from "axios";
// import Layout from "../../Layout/Layout";
// import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw, AlertTriangle, ArrowLeftRight } from "lucide-react";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ExcelTable() {
//   const hotRef = useRef(null);
//   const clientCodeRef = useRef(null);
//   const [hotInstance, setHotInstance] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [validationWarnings, setValidationWarnings] = useState([]);
//   const [swapIconsVisible, setSwapIconsVisible] = useState(new Set());
  
//   // Client code dropdown states
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
  
//   // Get theme from localStorage
//   useEffect(() => {
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Get user data and role
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data); 
//     }
//   }, []);

//   // Fetch client codes
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         toast.error("Failed to load client codes");
//       }
//     };
    
//     if (userRole === "employee" || userRole === "admin") {
//       fetchClientCodes();
//     }
//   }, [userRole]);

//   // Handle outside clicks for client codes dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Validation helper functions
//   const isNumericMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const numericChars = value.replace(/[^0-9]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (numericChars / totalChars) >= 0.6; // 60% or more numeric
//   };

//   const isAlphabeticMajority = (str) => {
//     if (!str || str.toString().trim() === '') return false;
//     const value = str.toString().trim();
//     const alphabeticChars = value.replace(/[^a-zA-Z]/g, '').length;
//     const totalChars = value.replace(/\s/g, '').length;
//     return totalChars > 0 && (alphabeticChars / totalChars) >= 0.6; // 60% or more alphabetic
//   };

//   const validateFieldContent = (data) => {
//     const warnings = [];
//     const newSwapIconsVisible = new Set();
    
//     data.forEach((row, index) => {
//       const [name, product, accountNumber, requirement] = row;
      
//       // Skip empty rows
//       if (!name && !product && !accountNumber && !requirement) {
//         return;
//       }
      
//       let shouldShowSwapIcon = false;
      
//       // Check if product seems more numeric than alphabetic
//       if (product && product.toString().trim() !== '' && isNumericMajority(product)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'product_numeric',
//           message: `Product field appears to contain mostly numbers. Consider if this should be in Account Number field.`,
//           product: product.toString().trim(),
//           accountNumber: accountNumber ? accountNumber.toString().trim() : '',
//           canSwap: true
//         });
//         shouldShowSwapIcon = true;
//       }
      
//       // Check if account number seems more alphabetic than numeric
//       if (accountNumber && accountNumber.toString().trim() !== '' && isAlphabeticMajority(accountNumber)) {
//         warnings.push({
//           row: index + 1,
//           rowIndex: index,
//           type: 'account_alphabetic',
//           message: `Account Number field appears to contain mostly letters. Consider if this should be in Product field.`,
//           accountNumber: accountNumber.toString().trim(),
//           product: product ? product.toString().trim() : '',
//           canSwap: true
//         });
//         shouldShowSwapIcon = true;
//       }
      
//       if (shouldShowSwapIcon) {
//         newSwapIconsVisible.add(index);
//       }
//     });
    
//     setSwapIconsVisible(newSwapIconsVisible);
//     return warnings;
//   };

//   // Function to create and position swap icons
//   const createSwapIcons = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove existing swap icons
//     document.querySelectorAll('.swap-icon-container').forEach(el => el.remove());
    
//     swapIconsVisible.forEach(rowIndex => {
//       // Get the cell element for the account number column (index 2)
//       const accountCell = hotInstance.getCell(rowIndex, 2);
//       if (!accountCell) return;
      
//       // Create swap icon container
//       const swapContainer = document.createElement('div');
//       swapContainer.className = 'swap-icon-container';
//       swapContainer.style.cssText = `
//         position: absolute;
//         right: 2px;
//         top: 50%;
//         transform: translateY(-50%);
//         z-index: 1000;
//         cursor: pointer;
//         padding: 2px;
//         border-radius: 3px;
//         background-color: ${isDarkMode ? '#3B82F6' : '#2563EB'};
//         color: white;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         width: 20px;
//         height: 20px;
//         font-size: 12px;
//         transition: all 0.2s ease;
//         opacity: 0.8;
//       `;
      
//       // Add hover effects
//       swapContainer.onmouseenter = () => {
//         swapContainer.style.opacity = '1';
//         swapContainer.style.transform = 'translateY(-50%) scale(1.1)';
//       };
      
//       swapContainer.onmouseleave = () => {
//         swapContainer.style.opacity = '0.8';
//         swapContainer.style.transform = 'translateY(-50%) scale(1)';
//       };
      
//       // Create the swap icon (using Unicode arrows)
//       swapContainer.innerHTML = '⇄';
//       swapContainer.title = `Swap Product and Account Number for Row ${rowIndex + 1}`;
      
//       // Add click handler
//       swapContainer.onclick = (e) => {
//         e.stopPropagation();
//         swapProductAndAccountNumber(rowIndex);
//       };
      
//       // Position the container relative to the cell
//       accountCell.style.position = 'relative';
//       accountCell.appendChild(swapContainer);
//     });
//   };

//   // Enhanced swap function with icon management
//   const swapProductAndAccountNumber = (rowIndex) => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     try {
//       const currentData = hotInstance.getData();
//       const row = currentData[rowIndex];
      
//       if (!row) return;
      
//       // Swap product (index 1) and account number (index 2)
//       const product = row[1];
//       const accountNumber = row[2];
      
//       // Update the table data
//       hotInstance.setDataAtCell(rowIndex, 1, accountNumber || '');
//       hotInstance.setDataAtCell(rowIndex, 2, product || '');
      
//       // Show success message
//       toast.success(`Row ${rowIndex + 1}: Product and Account Number swapped successfully!`);
      
//       // Re-validate after swap to update warnings and icons
//       setTimeout(() => {
//         const updatedData = hotInstance.getData();
//         const warnings = validateFieldContent(updatedData);
//         setValidationWarnings(warnings);
//         // Recreate icons after validation
//         setTimeout(() => createSwapIcons(), 100);
//       }, 100);
      
//     } catch (error) {
//       console.error("Error swapping fields:", error);
//       toast.error("Failed to swap fields. Please try again.");
//     }
//   };

//   // Initialize Handsontable with dark mode awareness
//   useEffect(() => {
//     if (!hotRef.current) return;

//     const hot = new Handsontable(hotRef.current, {
//       data: Array.from({ length: 16 }, () => ["", "", "", ""]),
//       colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
//       rowHeaders: true,
//       minSpareRows: 1,
//       columns: [
//         { type: "text" }, 
//         { type: "text" },
//         { type: "text" }, // Changed from numeric to text to allow validation
//         { type: "text" }
//       ],
//       stretchH: "all",
//       width: "100%",
//       height: 400,
//       licenseKey: "non-commercial-and-evaluation",
//       // Add cell change listener for real-time validation
//       afterChange: (changes) => {
//         if (changes) {
//           // Debounce validation to avoid too frequent updates
//           setTimeout(() => {
//             const currentData = hot.getData();
//             const warnings = validateFieldContent(currentData);
//             setValidationWarnings(warnings);
//             // Recreate icons after validation
//             setTimeout(() => createSwapIcons(), 100);
//           }, 500);
//         }
//       },
//       // Add render hook to maintain icons
//       afterRender: () => {
//         setTimeout(() => createSwapIcons(), 50);
//       },
//       // Apply initial dark mode settings if needed
//       ...(isDarkMode && {
//         className: 'dark-mode-table'
//       })
//     });

//     setHotInstance(hot);

//     // Update table theme when dark mode changes
//     if (isDarkMode) {
//       applyDarkModeStyles();
//     } else {
//       applyLightModeStyles();
//     }

//     // Cleanup function
//     return () => {
//       if (hot && !hot.isDestroyed) {
//         hot.destroy();
//       }
//     };
//   }, [isDarkMode]); // Re-initialize when dark mode changes

//   // Create icons when hotInstance is ready
//   useEffect(() => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       setTimeout(() => createSwapIcons(), 100);
//     }
//   }, [hotInstance, swapIconsVisible, isDarkMode]);

//   // Helper functions for client ID search
//   const normalizeInput = (input) => {
//     return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   // Function to apply dark mode styles to Handsontable
//   const applyDarkModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Add a CSS class to the container for dark mode styling
//     hotRef.current.classList.add('dark-mode-table');
    
//     // Force re-render of the table with updated styles
//     hotInstance.render();
//   };

//   // Function to apply light mode styles to Handsontable
//   const applyLightModeStyles = () => {
//     if (!hotInstance || hotInstance.isDestroyed) return;
    
//     // Remove dark mode class
//     hotRef.current.classList.remove('dark-mode-table');
    
//     // Force re-render of the table
//     hotInstance.render();
//   };

//   // Function to reset the table and form
//   const resetTable = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
//     }
    
//     // Reset client ID for employee/admin
//     if (userRole === "employee" || userRole === "admin") {
//       setClientId("");
//     }
    
//     // Clear validation warnings and swap icons
//     setValidationWarnings([]);
//     setSwapIconsVisible(new Set());
//   };

//   const addRow = () => {
//     if (hotInstance && !hotInstance.isDestroyed) {
//       hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
//     }
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleHandsontableUpload = async () => {
//     if (!hotInstance || hotInstance.isDestroyed) {
//       toast.error("Table instance not ready");
//       return;
//     }
  
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return;
//     }

//     // For employee/admin, require client ID
//     if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
//       toast.error("Please enter Client ID.");
//       return;
//     }

//     setIsUploading(true);
  
//     try {
//       const data = hotInstance.getData();
      
//       // Validate field content before processing
//       const contentWarnings = validateFieldContent(data);
      
//       // Show validation warnings if any exist
//       if (contentWarnings.length > 0) {
//         const proceed = window.confirm(
//           `⚠️ Field Content Warnings Detected:\n\n` +
//           contentWarnings.slice(0, 5).map(w => `Row ${w.row}: ${w.message}`).join('\n') +
//           (contentWarnings.length > 5 ? `\n...and ${contentWarnings.length - 5} more warnings` : '') +
//           `\n\nDo you want to proceed with upload anyway?`
//         );
        
//         if (!proceed) {
//           setIsUploading(false);
//           return;
//         }
//       }
      
//       // Enhanced validation - check all fields are mandatory
//       const formattedData = [];
//       const validationErrors = [];
      
//       data.forEach((row, index) => {
//         const [name, product, accountNumber, requirement] = row;
        
//         // Skip completely empty rows
//         if (!name && !product && !accountNumber && !requirement) {
//           return;
//         }
        
//         // Check if any field is missing for non-empty rows
//         const missingFields = [];
//         if (!name || name.toString().trim() === '') missingFields.push('Name');
//         if (!product || product.toString().trim() === '') missingFields.push('Product');
//         if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
//         if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
//         if (missingFields.length > 0) {
//           validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
//         } else {
//           formattedData.push({
//             userId: user.userId,
//             name: name.toString().trim(),
//             product: product.toString().trim(),
//             accountNumber: accountNumber.toString().trim(),
//             requirement: requirement.toString().trim(),
//             ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
//           });
//         }
//       });

//       // Show validation errors if any
//       if (validationErrors.length > 0) {
//         toast.error(
//           <div>
//             <div className="font-semibold">Please fill all required fields:</div>
//             <div className="text-sm mt-1">
//               {validationErrors.slice(0, 3).map((error, index) => (
//                 <div key={index}>• {error}</div>
//               ))}
//               {validationErrors.length > 3 && (
//                 <div>• ...and {validationErrors.length - 3} more errors</div>
//               )}
//             </div>
//           </div>
//         );
//         setIsUploading(false);
//         return;
//       }

//       if (formattedData.length === 0) {
//         toast.error("No valid data to upload. Please fill in at least one complete row.");
//         setIsUploading(false);
//         return;
//       }

//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
//         { data: formattedData },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
      
//       if (response.status === 200) {
//         const { stats } = response.data;
//         toast.success(
//           <div>
//             <div>Data uploaded successfully!</div>
//             <div className="text-sm mt-1">
//               {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
//               {stats.dbDuplicates} DB duplicates, {stats.failed} failed
//             </div>
//             {stats.failed > 0 && (
//               <div className="text-xs mt-1">
//                 Some records failed to upload. Check console for details.
//               </div>
//             )}
//           </div>
//         );
        
//         // Reset the table after successful upload
//         resetTable();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(
//         <div>
//           <div>Upload failed!</div>
//           <div className="text-sm mt-1">
//             {error.response?.data?.message || "An error occurred during upload"}
//           </div>
//         </div>
//       );
      
//       // Reset the table on error as well
//       resetTable();
//     } finally {
//       setIsUploading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
//               KYC Bulk Upload
//             </h3>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               Upload multiple KYC applications at once (All fields are mandatory)
//             </p>
//           </div>
          
//           {/* User Info */}
//           <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//             {user ? (
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
//                   Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
//                 </div>
//                 <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                   {user.email}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center text-red-500">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <span>User not found. Please log in.</span>
//               </div>
//             )}
//           </div>

//           {/* Client ID input for employee/admin */}
//           {(userRole === "employee" || userRole === "admin") && (
//             <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
//               <div className="space-y-2">
//                 <label className={`block text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Client Code *
//                 </label>
//                 <div className="relative" ref={clientCodeRef}>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={handleClientIdChange}
//                     onFocus={() => setShowClientCodes(true)}
//                     placeholder="Enter the Client Code (Required)"
//                     className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//                       isDarkMode 
//                         ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
//                         : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
//                     }`}
//                     required
//                   />
//                   {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//                     <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
//                       isDarkMode 
//                         ? "bg-gray-800 border border-gray-700" 
//                         : "bg-white border border-gray-200"
//                     }`}>
//                       {filteredClientCodes.map((code, index) => (
//                         <div
//                           key={index}
//                           onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                           onClick={() => handleClientCodeSelect(code)}
//                           className={`p-2 cursor-pointer ${
//                             isDarkMode 
//                               ? "text-white hover:bg-gray-700" 
//                               : "text-gray-900 hover:bg-blue-50"
//                           }`}
//                         >
//                           {code}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                   This field is mandatory. Enter or select the client's ID code from the dropdown
//                 </p>
//               </div>
//             </div>
//           )}


//                     {/* Simplified Validation Summary (without individual swap buttons) */}
//           {validationWarnings.length > 0 && (
//             <div className={`mb-6 p-4 rounded-lg border-l-4 ${
//               isDarkMode 
//                 ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300' 
//                 : 'bg-yellow-50 border-yellow-400 text-yellow-800'
//             }`}>
//               <div className="flex items-start">
//                 <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h4 className="font-medium mb-2">Field Content Warnings ({validationWarnings.length})</h4>
//                   <p className="text-sm mb-2">
//                     Some fields may need attention. Look for ⇄ icons next to affected rows in the table above to swap Product and Account Number values quickly.
//                   </p>
//                   <div className="text-xs opacity-75">
//                     <div>• Product fields with mostly numbers: {validationWarnings.filter(w => w.type === 'product_numeric').length}</div>
//                     <div>• Account Number fields with mostly letters: {validationWarnings.filter(w => w.type === 'account_alphabetic').length}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Table Container */}
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
//             <div className="mb-4 flex justify-between items-center">
//               <div className="flex items-center">
//                 <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   KYC Data Entry (All fields marked with * are mandatory)
//                 </h4>
//               </div>
//               {swapIconsVisible.size > 0 && (
//                 <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
//                   <ArrowLeftRight className="w-3 h-3 mr-1" />
//                   Click ⇄ icons to swap fields
//                 </div>
//               )}
//             </div>
            
//             <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
//             {/* Dark mode styling */}
//             <style jsx global>{`
//               /* Dark mode table styling */
//               .hot-dark .handsontable {
//                 background: #1F2937;
//               }
//               .hot-dark .handsontable th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_top th,
//               .hot-dark .handsontable .ht_clone_left th {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//               }
//               .hot-dark .handsontable td {
//                 background-color: #4B5563 !important;
//                 color: #F3F4F6 !important;
//                 border-color: #6B7280 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner .wtBorder,
//               .hot-dark .handsontable .wtBorder {
//                 background-color: #60A5FA !important;
//               }
//               .hot-dark .handsontable .htDimmed {
//                 color: #9CA3AF !important;
//               }
//               /* Fix for corner overlap */
//               .hot-dark .handsontable .ht_clone_corner {
//                 background-color: #374151 !important;
//                 color: #e5e7eb !important;
//                 border-color: #4B5563 !important;
//               }
//               .hot-dark .handsontable .ht_clone_corner th {
//                 border-color: #4B5563 !important;
//               }
//               /* Ensure text input is readable */
//               .hot-dark .handsontable .handsontableInput {
//                 background-color: #374151 !important;
//                 color: #F3F4F6 !important;
//                 border: 1px solid #4B5563 !important;
//               }
              
//               /* Swap icon styling */
//               .swap-icon-container {
//                 font-weight: bold;
//                 box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
//               }
              
//               .swap-icon-container:hover {
//                 box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
//               }
//             `}</style>
//           </div>



//           {/* Action Buttons */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <button 
//               onClick={addRow} 
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-green-600 hover:bg-green-700 text-white'
//                   : 'bg-green-500 hover:bg-green-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Add Row
//             </button>
            
//             <button 
//               onClick={resetTable}
//               disabled={isUploading}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-gray-600 hover:bg-gray-700 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//               } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <RefreshCw className="w-5 h-5 mr-2" />
//               Reset Table
//             </button>
            
//             <button 
//               onClick={handleHandsontableUpload} 
//               disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
//                 isDarkMode
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-blue-500 hover:bg-blue-600 text-white'
//               } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isUploading ? (
//                 <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="w-5 h-5 mr-2" />
//                   Upload Data
//                   {validationWarnings.length > 0 && (
//                     <AlertTriangle className="w-4 h-4 ml-2 text-yellow-400" />
//                   )}
//                 </>
//               )}
//             </button>
//           </div>
          
//           {/* Enhanced Instructions */}
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
//           } mb-6`}>
//             <div className="flex items-start">
//               <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`} />
//               <div>
//                 <p className={`font-medium ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   Instructions
//                 </p>
//                 <ul className={`mt-2 space-y-1 list-disc list-inside ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 } text-sm`}>
//                   <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
//                   <li><strong>Smart validation with swap functionality:</strong> System will warn if Product contains mostly numbers or Account Number contains mostly letters</li>
//                   <li><strong>New Swap Feature:</strong> Click the "Swap" button next to warnings to automatically exchange Product and Account Number values</li>
//                   <li>Account Number can be alphanumeric, but should primarily contain numbers</li>
//                   <li>Product should primarily contain letters/text</li>
//                   {(userRole === "employee" || userRole === "admin") && (
//                     <li>Enter or select the Client code from the dropdown before uploading</li>
//                   )}
//                   <li>Add additional rows if needed using the "Add Row" button</li>
//                   <li>Use "Reset Table" to clear all data manually</li>
//                  <li>Table will reset automatically after successful upload or errors</li>
//                  <li>You can proceed with upload even if warnings are shown (warnings are just suggestions)</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default ExcelTable;





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////toaster//////////


import { useRef, useEffect, useState } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import axios from "axios";
import Layout from "../../Layout/Layout";
import { FileText, Plus, Upload, AlertCircle, Check, X, RefreshCw, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ExcelTable() {
  const hotRef = useRef(null);
  const clientCodeRef = useRef(null);
  const [hotInstance, setHotInstance] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clientId, setClientId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [swapIconsVisible, setSwapIconsVisible] = useState(new Set());
  
  // Client code dropdown states
  const [clientCodes, setClientCodes] = useState([]);
  const [ReferBy,setReferBy] = useState("")
  const [showClientCodes, setShowClientCodes] = useState(false);

  // 1. Add new state variable after existing useState declarations
const [uploadResults, setUploadResults] = useState(null);
const [totalRecordCount, setTotalRecordCount] = useState(0);
  
  // Get theme from localStorage
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get user data and role
  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    const role = sessionStorage.getItem("role");
    setUserRole(role);
    
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data); 
    }
  }, []);

  // Fetch client codes
  useEffect(() => {
    const fetchClientCodes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
        setClientCodes(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch client codes:", error);
        toast.error("Failed to load client codes");
      }
    };
    
    if (userRole === "employee" || userRole === "admin") {
      fetchClientCodes();
    }
  }, [userRole]);

  // Handle outside clicks for client codes dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
        setShowClientCodes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Validation helper functions
  const isNumericMajority = (str) => {
    if (!str || str.toString().trim() === '') return false;
    const value = str.toString().trim();
    const numericChars = value.replace(/[^0-9]/g, '').length;
    const totalChars = value.replace(/\s/g, '').length;
    return totalChars > 0 && (numericChars / totalChars) >= 0.6; // 60% or more numeric
  };

  const isAlphabeticMajority = (str) => {
    if (!str || str.toString().trim() === '') return false;
    const value = str.toString().trim();
    const alphabeticChars = value.replace(/[^a-zA-Z]/g, '').length;
    const totalChars = value.replace(/\s/g, '').length;
    return totalChars > 0 && (alphabeticChars / totalChars) >= 0.6; // 60% or more alphabetic
  };

  const validateFieldContent = (data) => {
    const warnings = [];
    const newSwapIconsVisible = new Set();
    
    data.forEach((row, index) => {
      const [name, product, accountNumber, requirement] = row;
      
      // Skip empty rows
      if (!name && !product && !accountNumber && !requirement) {
        return;
      }
      
      let shouldShowSwapIcon = false;
      
      // Check if product seems more numeric than alphabetic
      if (product && product.toString().trim() !== '' && isNumericMajority(product)) {
        warnings.push({
          row: index + 1,
          rowIndex: index,
          type: 'product_numeric',
          message: `Product field appears to contain mostly numbers. Consider if this should be in Account Number field.`,
          product: product.toString().trim(),
          accountNumber: accountNumber ? accountNumber.toString().trim() : '',
          canSwap: true
        });
        shouldShowSwapIcon = true;
      }
      
      // Check if account number seems more alphabetic than numeric
      if (accountNumber && accountNumber.toString().trim() !== '' && isAlphabeticMajority(accountNumber)) {
        warnings.push({
          row: index + 1,
          rowIndex: index,
          type: 'account_alphabetic',
          message: `Account Number field appears to contain mostly letters. Consider if this should be in Product field.`,
          accountNumber: accountNumber.toString().trim(),
          product: product ? product.toString().trim() : '',
          canSwap: true
        });
        shouldShowSwapIcon = true;
      }
      
      if (shouldShowSwapIcon) {
        newSwapIconsVisible.add(index);
      }
    });
    
    setSwapIconsVisible(newSwapIconsVisible);
    return warnings;
  };

  // Function to create and position swap icons
  const createSwapIcons = () => {
    if (!hotInstance || hotInstance.isDestroyed) return;
    
    // Remove existing swap icons
    document.querySelectorAll('.swap-icon-container').forEach(el => el.remove());
    
    swapIconsVisible.forEach(rowIndex => {
      // Get the cell element for the account number column (index 2)
      const accountCell = hotInstance.getCell(rowIndex, 2);
      if (!accountCell) return;
      
      // Create swap icon container
      const swapContainer = document.createElement('div');
      swapContainer.className = 'swap-icon-container';
      swapContainer.style.cssText = `
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1000;
        cursor: pointer;
        padding: 2px;
        border-radius: 3px;
        background-color: ${isDarkMode ? '#3B82F6' : '#2563EB'};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        font-size: 12px;
        transition: all 0.2s ease;
        opacity: 0.8;
      `;
      
      // Add hover effects
      swapContainer.onmouseenter = () => {
        swapContainer.style.opacity = '1';
        swapContainer.style.transform = 'translateY(-50%) scale(1.1)';
      };
      
      swapContainer.onmouseleave = () => {
        swapContainer.style.opacity = '0.8';
        swapContainer.style.transform = 'translateY(-50%) scale(1)';
      };
      
      // Create the swap icon (using Unicode arrows)
      swapContainer.innerHTML = '⇄';
      swapContainer.title = `Swap Product and Account Number for Row ${rowIndex + 1}`;
      
      // Add click handler
      swapContainer.onclick = (e) => {
        e.stopPropagation();
        swapProductAndAccountNumber(rowIndex);
      };
      
      // Position the container relative to the cell
      accountCell.style.position = 'relative';
      accountCell.appendChild(swapContainer);
    });
  };

  // Enhanced swap function with icon management
  const swapProductAndAccountNumber = (rowIndex) => {
    if (!hotInstance || hotInstance.isDestroyed) return;
    
    try {
      const currentData = hotInstance.getData();
      const row = currentData[rowIndex];
      
      if (!row) return;
      
      // Swap product (index 1) and account number (index 2)
      const product = row[1];
      const accountNumber = row[2];
      
      // Update the table data
      hotInstance.setDataAtCell(rowIndex, 1, accountNumber || '');
      hotInstance.setDataAtCell(rowIndex, 2, product || '');
      
      // Show success message
      toast.success(`Row ${rowIndex + 1}: Product and Account Number swapped successfully!`);
      
      // Re-validate after swap to update warnings and icons
      setTimeout(() => {
        const updatedData = hotInstance.getData();
        const warnings = validateFieldContent(updatedData);
        setValidationWarnings(warnings);
        // Recreate icons after validation
        setTimeout(() => createSwapIcons(), 100);
      }, 100);
      
    } catch (error) {
      console.error("Error swapping fields:", error);
      toast.error("Failed to swap fields. Please try again.");
    }
  };

  // Initialize Handsontable with dark mode awareness
  useEffect(() => {
    if (!hotRef.current) return;

    const hot = new Handsontable(hotRef.current, {
      data: Array.from({ length: 16 }, () => ["", "", "", ""]),
      colHeaders: ["Name *", "Product *", "Account Number *", "Requirement *"],
      rowHeaders: true,
      minSpareRows: 1,
      columns: [
        { type: "text" }, 
        { type: "text" },
        { type: "text" }, // Changed from numeric to text to allow validation
        { type: "text" }
      ],
      stretchH: "all",
      width: "100%",
      height: 400,
      licenseKey: "non-commercial-and-evaluation",
      // Add cell change listener for real-time validation
      afterChange: (changes) => {
        if (changes) {
          // Debounce validation to avoid too frequent updates
          setTimeout(() => {
            const currentData = hot.getData();
            const warnings = validateFieldContent(currentData);
            setValidationWarnings(warnings);
            // Recreate icons after validation
            setTimeout(() => createSwapIcons(), 100);
          }, 500);
        }
      },
      // Add render hook to maintain icons
      afterRender: () => {
        setTimeout(() => createSwapIcons(), 50);
      },
      // Apply initial dark mode settings if needed
      ...(isDarkMode && {
        className: 'dark-mode-table'
      })
    });

    setHotInstance(hot);

    // Update table theme when dark mode changes
    if (isDarkMode) {
      applyDarkModeStyles();
    } else {
      applyLightModeStyles();
    }

    // Cleanup function
    return () => {
      if (hot && !hot.isDestroyed) {
        hot.destroy();
      }
    };
  }, [isDarkMode]); // Re-initialize when dark mode changes

  // Create icons when hotInstance is ready
  useEffect(() => {
    if (hotInstance && !hotInstance.isDestroyed) {
      setTimeout(() => createSwapIcons(), 100);
    }
  }, [hotInstance, swapIconsVisible, isDarkMode]);

  // Helper functions for client ID search
  const normalizeInput = (input) => {
    return input?.trim().toUpperCase().replace(/\s+/g, "") || "";
  };
  
  const filteredClientCodes = clientCodes.filter(code => 
    normalizeInput(code).includes(normalizeInput(clientId))
  );

  // Function to apply dark mode styles to Handsontable
  const applyDarkModeStyles = () => {
    if (!hotInstance || hotInstance.isDestroyed) return;
    
    // Add a CSS class to the container for dark mode styling
    hotRef.current.classList.add('dark-mode-table');
    
    // Force re-render of the table with updated styles
    hotInstance.render();
  };

  // Function to apply light mode styles to Handsontable
  const applyLightModeStyles = () => {
    if (!hotInstance || hotInstance.isDestroyed) return;
    
    // Remove dark mode class
    hotRef.current.classList.remove('dark-mode-table');
    
    // Force re-render of the table
    hotInstance.render();
  };

  // Function to reset the table and form
  // const resetTable = () => {
  //   if (hotInstance && !hotInstance.isDestroyed) {
  //     hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
  //   }
    
  //   // Reset client ID for employee/admin
  //   if (userRole === "employee" || userRole === "admin") {
  //     setClientId("");
  //   }
    
  //   // Clear validation warnings and swap icons
  //   setValidationWarnings([]);
  //   setSwapIconsVisible(new Set());
  // };
  // 3. Update the resetTable function to also clear results
const resetTable = () => {
  if (hotInstance && !hotInstance.isDestroyed) {
    hotInstance.loadData(Array.from({ length: 16 }, () => ["", "", "", ""]));
  }
  
  // Reset client ID for employee/admin
  if (userRole === "employee" || userRole === "admin") {
    setClientId("");
  }
  
  // Clear validation warnings and swap icons
  setValidationWarnings([]);
  setSwapIconsVisible(new Set());
  
  // Clear upload results
  setUploadResults(null);
  setTotalRecordCount(0);
};

  const addRow = () => {
    if (hotInstance && !hotInstance.isDestroyed) {
      hotInstance.alter("insert_row_below", hotInstance.countRows() - 1);
    }
  };

  const handleClientIdChange = (e) => {
    setClientId(e.target.value);
    setShowClientCodes(true);
  };

  const handleInputChange = (e) => {
    setReferBy(e.target.value);
  };

  const handleClientCodeSelect = (code) => {
    setClientId(code);
    setShowClientCodes(false);
    // Focus back on the input after selection
    setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
  };

  const handleHandsontableUpload = async () => {
    if (!hotInstance || hotInstance.isDestroyed) {
      toast.error("Table instance not ready");
      return;
    }
  
    if (!user) {
      toast.error("User details not found. Please log in.");
      return;
    }

    // For employee/admin, require client ID
    if ((userRole === "employee" || userRole === "admin") && !clientId.trim()) {
      toast.error("Please enter Client ID.");
      return;
    }

    setIsUploading(true);
  
    try {
      const data = hotInstance.getData();
      
      // Validate field content before processing
      const contentWarnings = validateFieldContent(data);
      
      // Show validation warnings if any exist
      if (contentWarnings.length > 0) {
        const proceed = window.confirm(
          `⚠️ Field Content Warnings Detected:\n\n` +
          contentWarnings.slice(0, 5).map(w => `Row ${w.row}: ${w.message}`).join('\n') +
          (contentWarnings.length > 5 ? `\n...and ${contentWarnings.length - 5} more warnings` : '') +
          `\n\nDo you want to proceed with upload anyway?`
        );
        
        if (!proceed) {
          setIsUploading(false);
          return;
        }
      }
      
      // Enhanced validation - check all fields are mandatory
      const formattedData = [];
      const validationErrors = [];
      
      data.forEach((row, index) => {
        const [name, product, accountNumber, requirement] = row;
        
        // Skip completely empty rows
        if (!name && !product && !accountNumber && !requirement) {
          return;
        }
        
        // Check if any field is missing for non-empty rows
        const missingFields = [];
        if (!name || name.toString().trim() === '') missingFields.push('Name');
        if (!product || product.toString().trim() === '') missingFields.push('Product');
        if (!accountNumber || accountNumber.toString().trim() === '') missingFields.push('Account Number');
        if (!requirement || requirement.toString().trim() === '') missingFields.push('Requirement');
        
        if (missingFields.length > 0) {
          validationErrors.push(`Row ${index + 1}: Missing ${missingFields.join(', ')}`);
        } else {
          formattedData.push({
            userId: user.userId,
            name: name.toString().trim(),
            product: product.toString().trim(),
            accountNumber: accountNumber.toString().trim(),
            requirement: requirement.toString().trim(),
            ReferBy:ReferBy,
            ...(userRole === "employee" || userRole === "admin" ? { clientId } : {})
          });
        }
      });

      // Show validation errors if any
      if (validationErrors.length > 0) {
        toast.error(
          <div>
            <div className="font-semibold">Please fill all required fields:</div>
            <div className="text-sm mt-1">
              {validationErrors.slice(0, 3).map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
              {validationErrors.length > 3 && (
                <div>• ...and {validationErrors.length - 3} more errors</div>
              )}
            </div>
          </div>
        );
        setIsUploading(false);
        return;
      }

      if (formattedData.length === 0) {
        toast.error("No valid data to upload. Please fill in at least one complete row.");
        setIsUploading(false);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/bulk-upload`,
        { data: formattedData },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      // if (response.status === 200) {
      //   const { stats } = response.data;
      //   toast.success(
      //     <div>
      //       <div>Data uploaded successfully!</div>
      //       <div className="text-sm mt-1">
      //         {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
      //         {stats.dbDuplicates} DB duplicates, {stats.failed} failed
      //       </div>
      //       {stats.failed > 0 && (
      //         <div className="text-xs mt-1">
      //           Some records failed to upload. Check console for details.
      //         </div>
      //       )}
      //     </div>
      //   );

      // 2. Update the handleHandsontableUpload function - Replace the success handling section
// Find this section in your existing code and replace it:

if (response.status === 200) {
  const { stats } = response.data;
  
  // Set results for display
  setUploadResults({
    inserted: stats.inserted || 0,
    duplicates: (stats.fileDuplicates || 0) + (stats.dbDuplicates || 0),
    failed: stats.failed || 0
  });
  setTotalRecordCount(formattedData.length);
  
  toast.success(
    <div>
      <div>Data uploaded successfully!</div>
      <div className="text-sm mt-1">
        {stats.inserted} inserted, {stats.fileDuplicates} file duplicates, 
        {stats.dbDuplicates} DB duplicates, {stats.failed} failed
      </div>
      {stats.failed > 0 && (
        <div className="text-xs mt-1">
          Some records failed to upload. Check console for details.
        </div>
      )}
    </div>
  );
        
        // Reset the table after successful upload
        // resetTable();
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Clear any existing results on error
  setUploadResults(null);
  setTotalRecordCount(0);

      toast.error(
        <div>
          <div>Upload failed!</div>
          <div className="text-sm mt-1">
            {error.response?.data?.message || "An error occurred during upload"}
          </div>
        </div>
      );
      
      // Reset the table on error as well
      resetTable();
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Layout>
      <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              KYC Bulk Upload
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload multiple KYC applications at once (All fields are mandatory)
            </p>
          </div>
          
          {/* User Info */}
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            {user ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                  Logged in as: <span className="font-semibold">{user.name}</span> <span className="text-sm opacity-75">({userRole})</span>
                </div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  {user.email}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>User not found. Please log in.</span>
              </div>
            )}
          </div>

          {/* Client ID input for employee/admin */}
          {(userRole === "employee" || userRole === "admin") && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Client Code *
                </label>
                <div className="relative" ref={clientCodeRef}>
                  <input
                    type="text"
                    value={clientId}
                    onChange={handleClientIdChange}
                    onFocus={() => setShowClientCodes(true)}
                    placeholder="Enter the Client Code (Required)"
                    className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
                    }`}
                    required
                  />
                  {showClientCodes && clientId && filteredClientCodes.length > 0 && (
                    <div className={`absolute z-20 w-full mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md ${
                      isDarkMode 
                        ? "bg-gray-800 border border-gray-700" 
                        : "bg-white border border-gray-200"
                    }`}>
                      {filteredClientCodes.map((code, index) => (
                        <div
                          key={index}
                          onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                          onClick={() => handleClientCodeSelect(code)}
                          className={`p-2 cursor-pointer ${
                            isDarkMode 
                              ? "text-white hover:bg-gray-700" 
                              : "text-gray-900 hover:bg-blue-50"
                          }`}
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  This field is mandatory. Enter or select the client's ID code from the dropdown
                </p>
              </div>
            </div>
          )}
          <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Refer By
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ReferBy}
                    onChange={handleInputChange}
                    
                    placeholder="ReferBy"
                    className={`w-full px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500' 
                        : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400'
                    }`}
                  />
                  
                </div>
              </div>
            </div>


                    {/* Simplified Validation Summary (without individual swap buttons) */}
          {validationWarnings.length > 0 && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              isDarkMode 
                ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300' 
                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
            }`}>
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Field Content Warnings ({validationWarnings.length})</h4>
                  <p className="text-sm mb-2">
                    Some fields may need attention. Look for ⇄ icons next to affected rows in the table above to swap Product and Account Number values quickly.
                  </p>
                  <div className="text-xs opacity-75">
                    <div>• Product fields with mostly numbers: {validationWarnings.filter(w => w.type === 'product_numeric').length}</div>
                    <div>• Account Number fields with mostly letters: {validationWarnings.filter(w => w.type === 'account_alphabetic').length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  KYC Data Entry (All fields marked with * are mandatory)
                </h4>
              </div>
              {swapIconsVisible.size > 0 && (
                <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                  <ArrowLeftRight className="w-3 h-3 mr-1" />
                  Click ⇄ icons to swap fields
                </div>
              )}
            </div>
            
            <div ref={hotRef} className={`${isDarkMode ? 'hot-dark' : ''} border rounded overflow-hidden`} />
            
            {/* Dark mode styling */}
            <style jsx global>{`
              /* Dark mode table styling */
              .hot-dark .handsontable {
                background: #1F2937;
              }
              .hot-dark .handsontable th {
                background-color: #374151 !important;
                color: #e5e7eb !important;
                border-color: #4B5563 !important;
              }
              .hot-dark .handsontable .ht_clone_top th,
              .hot-dark .handsontable .ht_clone_left th {
                background-color: #374151 !important;
                color: #e5e7eb !important;
              }
              .hot-dark .handsontable td {
                background-color: #4B5563 !important;
                color: #F3F4F6 !important;
                border-color: #6B7280 !important;
              }
              .hot-dark .handsontable .ht_clone_corner .wtBorder,
              .hot-dark .handsontable .wtBorder {
                background-color: #60A5FA !important;
              }
              .hot-dark .handsontable .htDimmed {
                color: #9CA3AF !important;
              }
              /* Fix for corner overlap */
              .hot-dark .handsontable .ht_clone_corner {
                background-color: #374151 !important;
                color: #e5e7eb !important;
                border-color: #4B5563 !important;
              }
              .hot-dark .handsontable .ht_clone_corner th {
                border-color: #4B5563 !important;
              }
              /* Ensure text input is readable */
              .hot-dark .handsontable .handsontableInput {
                background-color: #374151 !important;
                color: #F3F4F6 !important;
                border: 1px solid #4B5563 !important;
              }
              
              /* Swap icon styling */
              .swap-icon-container {
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              }
              
              .swap-icon-container:hover {
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              }
            `}</style>
          </div>



          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={addRow} 
              disabled={isUploading}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Row
            </button>
            
            <button 
              onClick={resetTable}
              disabled={isUploading}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset Table
            </button>
            
            <button 
              onClick={handleHandsontableUpload} 
              disabled={isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${(isUploading || ((userRole === "employee" || userRole === "admin") && !clientId.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Data
                  {validationWarnings.length > 0 && (
                    <AlertTriangle className="w-4 h-4 ml-2 text-yellow-400" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* Upload Results Display */}
{uploadResults && (
  <div className={`mb-6 p-4 rounded-lg ${
    isDarkMode ? 'bg-gray-700' : 'bg-green-50'
  } border ${isDarkMode ? 'border-gray-600' : 'border-green-200'}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className={`font-medium ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Processing Results:
      </h4>
      <button
        onClick={() => setUploadResults(null)}
        className={`text-xs px-2 py-1 rounded ${
          isDarkMode 
            ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Total Records: <span className="font-medium text-blue-600">{totalRecordCount}</span>
      </div>
      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className="text-green-600">Inserted: <span className="font-medium">{uploadResults.inserted}</span></span>
      </div>
      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className="text-yellow-600">Duplicates: <span className="font-medium">{uploadResults.duplicates}</span></span>
      </div>
      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className="text-red-600">Failed: <span className="font-medium">{uploadResults.failed}</span></span>
      </div>
    </div>
    {uploadResults.failed > 0 && (
      <div className={`mt-3 p-2 rounded text-xs ${
        isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'
      }`}>
        Some records failed to upload. Check the console for detailed error information.
      </div>
    )}
  </div>
)}

{/* {uploadResults && (
  <div
    className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-700' : 'bg-green-50'
    }`}
  >
    <h4 className={`font-medium mb-2 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      Processing Results:
    </h4>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
        Total Records: <span className="font-medium">{totalRecordCount}</span>
      </div>
      <div className="text-green-600">
        Inserted: <span className="font-medium">{uploadResults.inserted}</span>
      </div>
      <div className="text-yellow-600">
        Duplicates: <span className="font-medium">{uploadResults.duplicates}</span>
      </div>
      <div className="text-red-600">
        Failed: <span className="font-medium">{uploadResults.failed}</span>
      </div>
    </div>
  </div>
)} */}

          
          {/* Enhanced Instructions */}
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          } mb-6`}>
            <div className="flex items-start">
              <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Instructions
                </p>
                <ul className={`mt-2 space-y-1 list-disc list-inside ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                } text-sm`}>
                  <li><strong>All fields are now mandatory:</strong> Name, Product, Account Number, and Requirement must be filled</li>
                  <li><strong>Smart validation with swap functionality:</strong> System will warn if Product contains mostly numbers or Account Number contains mostly letters</li>
                  <li><strong>New Swap Feature:</strong> Click the "Swap" button next to warnings to automatically exchange Product and Account Number values</li>
                  <li>Account Number can be alphanumeric, but should primarily contain numbers</li>
                  <li>Product should primarily contain letters/text</li>
                  {(userRole === "employee" || userRole === "admin") && (
                    <li>Enter or select the Client code from the dropdown before uploading</li>
                  )}
                  <li>Add additional rows if needed using the "Add Row" button</li>
                  <li>Use "Reset Table" to clear all data manually</li>
                 <li>Table will reset automatically after successful upload or errors</li>
                 <li>You can proceed with upload even if warnings are shown (warnings are just suggestions)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ExcelTable;



