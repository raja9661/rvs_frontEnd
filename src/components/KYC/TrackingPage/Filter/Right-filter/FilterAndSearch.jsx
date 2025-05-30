
// import React, { useState, useEffect, useRef } from 'react';
// import axios from "axios";

// const FilterAndSearch = ({ 
//   setSearchQuery, 
//   onRecordAdded, 
//   rowData,
//   onRecheck,
//   onFilterTypeChange,
//   filters,
//   setFilters,
//   filterType
// }) => {
//   const [newRecord, setNewRecord] = useState(false);
//   const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false);
//   const [requirement, setRequirement] = useState('');
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [productOption, setProductOption] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [showProducts, setShowProducts] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     product: "",
//     accountNumber: "",
//     requirement: "",
//   });
//   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
//   // Ref for product dropdown
//   const productRef = useRef(null);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
    
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   useEffect(() => {
//     const fetchProductName = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//         setProductOption(response.data);
//         setFilteredProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       }
//     };
//     fetchProductName();
//   }, []);

//   // Add click outside listener to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (productRef.current && !productRef.current.contains(event.target)) {
//         setShowProducts(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     if (name === "product") {
//       const filtered = productOption.filter(product => 
//         product.productName.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//       setShowProducts(true);
//     }
//   };

//   const handleProductSelect = (product) => {
//     setFormData(prev => ({ ...prev, product: product.productName }));
//     setShowProducts(false);
//     // Focus back on the input after selection
//     setTimeout(() => productRef.current.querySelector('input').focus(), 0);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // For employee/admin, validate clientId
//     if ((userRole === "employee" || userRole === "admin") && !clientId) {
//       alert("Client ID is required!");
//       return;
//     }

//     try {
//       const payload = {
//         ...formData,userId: user.userId,clientId
//       };

//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`, payload);
//       setNewRecord(false);
//       setFormData({
//         name: "",
//         product: "",
//         accountNumber: "",
//         requirement: "",
//       });
//       setClientId("");
//       if (onRecordAdded) onRecordAdded();
//     } catch (error) {
//       console.error("Error adding record:", error);
//       alert(error.response?.data?.message || "Failed to add record");
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       name: "",
//       product: "",
//       accountNumber: "",
//       requirement: "",
//     });
//     setClientId("");
//   };

//   const handleCloseModal = () => {
//     setNewRecord(false);
//     setIsRecheckModalOpen(false);
//   };

//   const handleFilterChange = (e) => {
//     const newFilterType = e.target.value === "deleted" ? "deleted" : "active";
//     if (onFilterTypeChange) {
//       onFilterTypeChange(newFilterType);
//     }
//   };

//   const handleAddRecheckedRecord = () => {
//     if (onRecheck) onRecheck();
//     if (rowData) setIsRecheckModalOpen(true);
//   };

//   const handleRecheckSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         caseId: rowData.caseId,
//         name: rowData.name,
//         product: rowData.product,
//         accountNumber: rowData.accountNumber,
//         requirement,
//         ...(userRole === "employee" || userRole === "admin" ? { clientId: rowData.clientCode } : {})
//       };
  
//       const response = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/recheck`, payload);
//       setIsRecheckModalOpen(false);
//       setRequirement('');
//       if (onRecordAdded) {
//         // Clear the selection before refreshing
//         if (typeof onRecordAdded === 'function') {
//           onRecordAdded(null, true); // Pass a flag to indicate we should clear selection
//         }
//       }
//     } catch (error) {
//       console.error("Recheck error:", error);
//       alert(error.response?.data?.message || "Failed to recheck record");
//     }
//   };
  
//   const modalBackdropStyle = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     padding: '5% 0',
//     zIndex: 9999,
//   };

//   const inputStyle = "w-full border p-2 rounded";
//   const darkInputStyle = "w-full border p-2 rounded bg-gray-700 border-gray-600 text-white";
//   const lightInputStyle = "w-full border p-2 rounded bg-white border-gray-300 text-gray-700";

//   return (
//     <div className={`w-full ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
//       <h3 className={`text-md font-medium mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>
//         Search & Actions
//       </h3>

//       {/* Search bar with full width */}
//       <div className="mb-4 w-full">
//         <input
//           type="text"
//           placeholder="Search by Account Number"
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className={`border p-2 text-sm rounded w-full ${
//             isDarkMode
//               ? "bg-gray-700 border-gray-600 text-gray-200"
//               : "bg-white border-gray-300 text-gray-700"
//           }`}
//         />
//       </div>

//       {/* Two dropdowns in the same line with responsive behavior */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//         {/* Only show this dropdown for admin users */}
//         {userRole === 'admin' && (
//           <select
//             value={filterType}
//             onChange={handleFilterChange}
//             className={`border rounded-lg p-2 w-full ${
//               isDarkMode
//                 ? "bg-gray-700 border-gray-600 text-gray-200"
//                 : "bg-white border-gray-300 text-gray-700"
//             }`}
//           >
//             <option value="active">Active Records</option>
//             <option value="deleted">Deleted Records</option>
//           </select>
//         )}

//         <select
//           value={filters.status || filters.caseStatus || ""}
//           onChange={(e) => {
//             const value = e.target.value;
//             if (["New Pending", "Sent"].includes(value)) {
//               setFilters({...filters, caseStatus: value, status: ""});
//             } else {
//               setFilters({...filters, status: value, caseStatus: ""});
//             }
//           }}
//           className={`border rounded-lg p-2 w-full ${
//             isDarkMode
//               ? "bg-gray-700 border-gray-600 text-gray-200"
//               : "bg-white border-gray-300 text-gray-700"
//           }`}
//         >
//           <option value="">All Statuses</option>
//           <option value="New Data">New Data</option>
//           <option value="New Pending">New Pending</option>
//           <option value="Sent">Sent</option>
//           <option value="Closed">Closed</option>
//         </select>
//       </div>

//       {/* Action buttons with better alignment */}
//       <div className="flex flex-wrap justify-start gap-3">
//         <button
//           onClick={() => setNewRecord(true)}
//           className={`px-4 py-2 rounded-lg ${
//             isDarkMode
//               ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
//               : 'bg-yellow-500 hover:bg-yellow-600 text-white'
//           }`}
//         >
//           Add New Record
//         </button>
//         <button
//           onClick={handleAddRecheckedRecord}
//           className={`px-4 py-2 rounded-lg ${
//             isDarkMode
//               ? 'bg-red-600 hover:bg-red-700 text-white'
//               : 'bg-red-500 hover:bg-red-600 text-white'
//           }`}
//         >
//           Add Recheck Record
//         </button>
//       </div>

//       {newRecord && (
//         <div style={modalBackdropStyle}>
//           <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
//             isDarkMode ? "bg-gray-700" : "bg-white"
//           }`}>
//             <button 
//               onClick={handleCloseModal} 
//               className={`absolute top-2 right-2 text-xl ${
//                 isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               ✖
//             </button>

//             <h2 className={`text-xl font-bold mb-4 ${
//               isDarkMode ? "text-white" : "text-gray-800"
//             }`}>
//               Add New Record
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Client ID field for employee/admin */}
//               {(userRole === "employee" || userRole === "admin") && (
//                 <div>
//                   <label className={`block mb-1 ${
//                     isDarkMode ? "text-gray-300" : "text-gray-700"
//                   }`}>
//                     Client ID
//                   </label>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={(e) => setClientId(e.target.value)}
//                     placeholder="Enter Client ID"
//                     className={isDarkMode ? darkInputStyle : lightInputStyle}
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Enter Name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div className="relative" ref={productRef}>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Product
//                 </label>
//                 <input
//                   type="text"
//                   name="product"
//                   placeholder="Enter or select product"
//                   value={formData.product}
//                   onChange={handleChange}
//                   onFocus={() => setShowProducts(true)}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//                 {showProducts && filteredProducts.length > 0 && (
//                   <div className={`absolute z-10 w-full max-h-40 overflow-y-auto border ${
//                     isDarkMode 
//                       ? "bg-gray-700 border-gray-600 text-gray-200" 
//                       : "bg-white border-gray-300 text-gray-700"
//                   }`}>
//                     {filteredProducts.map((product, index) => (
//                       <div 
//                         key={index}
//                         onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                         onClick={() => handleProductSelect(product)}
//                         className={`p-2 cursor-pointer ${
//                           isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                         }`}
//                       >
//                         {product.productName}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   placeholder="Enter Account Number"
//                   value={formData.accountNumber}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Requirement
//                 </label>
//                 <input
//                   type="text"
//                   name="requirement"
//                   placeholder="Enter Requirement"
//                   value={formData.requirement}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div className="flex justify-between">
//                 <button 
//                   type="button" 
//                   onClick={handleReset} 
//                   className={`px-4 py-2 rounded ${
//                     isDarkMode
//                       ? "bg-gray-600 hover:bg-gray-500 text-white"
//                       : "bg-gray-400 hover:bg-gray-500 text-white"
//                   }`}
//                 >
//                   Reset
//                 </button>

//                 <button 
//                   type="submit" 
//                   className={`px-4 py-2 rounded ${
//                     isDarkMode
//                       ? "bg-green-600 hover:bg-green-500 text-white"
//                       : "bg-green-500 hover:bg-green-600 text-white"
//                   }`}
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isRecheckModalOpen && (
//         <div style={modalBackdropStyle}>
//           <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
//             isDarkMode ? "bg-gray-700" : "bg-white"
//           }`}>
//             <button 
//               onClick={() => setIsRecheckModalOpen(false)} 
//               className={`absolute top-2 right-2 text-xl ${
//                 isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               ✖
//             </button>

//             <h2 className={`text-xl font-bold mb-4 ${
//               isDarkMode ? "text-white" : "text-gray-800"
//             }`}>
//               Add Recheck Record
//             </h2>

//             <form onSubmit={handleRecheckSubmit} className="space-y-4">
//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={rowData?.name || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Product
//                 </label>
//                 <input
//                   type="text"
//                   name="product"
//                   value={rowData?.product || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={rowData?.accountNumber || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Requirement
//                 </label>
//                 <input
//                   type="text"
//                   name="requirement"
//                   placeholder="Update your Requirement"
//                   value={requirement}
//                   onChange={(e) => setRequirement(e.target.value)}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <button 
//                 type="submit" 
//                 className={`w-full px-4 py-2 rounded ${
//                   isDarkMode
//                     ? "bg-green-600 hover:bg-green-500 text-white"
//                     : "bg-green-500 hover:bg-green-600 text-white"
//                 }`}
//               >
//                 Submit
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterAndSearch;



//////////////////////////////////////////////////////////



// import React, { useState, useEffect, useRef } from 'react';
// import axios from "axios";

// const FilterAndSearch = ({ 
//   setSearchQuery, 
//   onRecordAdded, 
//   rowData,
//   onRecheck,
//   onFilterTypeChange,
//   filters,
//   setFilters,
//   filterType,
// }) => {
//   const [newRecord, setNewRecord] = useState(false);
//   const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false);
//   const [requirement, setRequirement] = useState('');
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [productOption, setProductOption] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [showProducts, setShowProducts] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     product: "",
//     accountNumber: "",
//     requirement: "",
//   });
//   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
//   // Ref for product dropdown
//   const productRef = useRef(null);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
    
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   useEffect(() => {
//     const fetchProductName = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//         setProductOption(response.data);
//         setFilteredProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       }
//     };
//     fetchProductName();
//   }, []);

//   // Add click outside listener to close dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (productRef.current && !productRef.current.contains(event.target)) {
//         setShowProducts(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     if (name === "product") {
//       const filtered = productOption.filter(product => 
//         product.productName.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//       setShowProducts(true);
//     }
//   };

//   const handleProductInputBlur = () => {
//     // Close the dropdown when the input loses focus
//     setShowProducts(false);
//   };

//   const handleProductSelect = (product) => {
//     setFormData(prev => ({ ...prev, product: product.productName }));
//     setShowProducts(false);
//     // Focus back on the input after selection
//     setTimeout(() => productRef.current.querySelector('input').focus(), 0);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // For employee/admin, validate clientId
//     if ((userRole === "employee" || userRole === "admin") && !clientId) {
//       alert("Client ID is required!");
//       return;
//     }

//     try {
//       const payload = {
//         ...formData,userId: user.userId,clientId
//       };

//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`, payload);
//       setNewRecord(false);
//       setFormData({
//         name: "",
//         product: "",
//         accountNumber: "",
//         requirement: "",
//       });
//       setClientId("");
//       if (onRecordAdded) onRecordAdded();
//     } catch (error) {
//       console.error("Error adding record:", error);
//       alert(error.response?.data?.message || "Failed to add record");
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       name: "",
//       product: "",
//       accountNumber: "",
//       requirement: "",
//     });
//     setClientId("");
//   };

//   const handleCloseModal = () => {
//     setNewRecord(false);
//     setIsRecheckModalOpen(false);
//   };

//   const handleFilterChange = (e) => {
//     const newFilterType = e.target.value === "deleted" ? "deleted" : "active";
//     if (onFilterTypeChange) {
//       onFilterTypeChange(newFilterType);
//     }
//   };

//   const handleAddRecheckedRecord = () => {
//     if (onRecheck) onRecheck();
//     if (rowData) setIsRecheckModalOpen(true);
//   };

//   const handleRecheckSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         caseId: rowData.caseId,
//         name: rowData.name,
//         product: rowData.product,
//         accountNumber: rowData.accountNumber,
//         requirement,
//         isRechecked: true,
//         ...(userRole === "employee" || userRole === "admin" ? { clientId: rowData.clientCode } : {})
//       };
  
//       const response = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/recheck`, payload);
//       setIsRecheckModalOpen(false);
//       setRequirement('');   
//       if (onRecordAdded) {
//         // Clear the selection before refreshing
        
//         if (typeof onRecordAdded === 'function') {
//           onRecordAdded(null, true); 
//         }
//       }
//     } catch (error) {
//       console.error("Recheck error:", error);
//       alert(error.response?.data?.message || "Failed to recheck record");
//     }
//   };
  
//   const modalBackdropStyle = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     padding: '5% 0',
//     zIndex: 9999,
//   };

//   const inputStyle = "w-full border p-2 rounded";
//   const darkInputStyle = "w-full border p-2 rounded bg-gray-700 border-gray-600 text-white";
//   const lightInputStyle = "w-full border p-2 rounded bg-white border-gray-300 text-gray-700";

//   return (
//     <div className={`w-full ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg`}>
//       <h3 className={`text-md font-medium mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>
//         All Search & Actions
//       </h3>

//       {/* Search bar with full width */}
//       <div className="mb-4 w-full">
//         <input
//           type="text"
//           placeholder="Search by Account Number"
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className={`border p-2 text-sm rounded w-full ${
//             isDarkMode
//               ? "bg-gray-700 border-gray-600 text-gray-200"
//               : "bg-white border-gray-300 text-gray-700"
//           }`}
//         />
//       </div>

//       {/* Two dropdowns in the same line with responsive behavior */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//         {/* Only show this dropdown for admin users */}
//         {userRole === 'admin' && (
//           <select
//             value={filterType}
//             onChange={handleFilterChange}
//             className={`border rounded-lg p-2 w-full ${
//               isDarkMode
//                 ? "bg-gray-700 border-gray-600 text-gray-200"
//                 : "bg-white border-gray-300 text-gray-700"
//             }`}
//           >
//             <option value="active">Active Records</option>
//             <option value="deleted">Deleted Records</option>
//           </select>
//         )}
//         <select
//   value={
//     filters.isRechecked 
//       ? "recheck" 
//       : filters.caseStatus || filters.status || ""
//   }
//   onChange={(e) => {
//     const value = e.target.value;
//     if (value === "true") {
//       setFilters({
//         ...filters, 
//         recheck: true,
//         status: "",
//         caseStatus: ""
//       });
//     } else if (["New Pending", "Sent"].includes(value)) {
//       setFilters({
//         ...filters,
//         caseStatus: value,
//         status: "",
//         recheck: false
//       });
//     } else {
//       setFilters({
//         ...filters,
//         status: value,
//         caseStatus: "",
//         recheck: false
//       });
//     }
//   }}
//   className={`border rounded-lg p-2 w-full ${
//     isDarkMode
//       ? "bg-gray-700 border-gray-600 text-gray-200"
//       : "bg-white border-gray-300 text-gray-700"
//   }`}
// >
//   <option value="">All Statuses</option>
//   <option value="New Data">New Data</option>
//   <option value="New Pending">New Pending</option>
//   <option value="Sent">Sent</option>
//   <option value="Closed">Closed</option>
//   <option value="true">Recheck Records</option>
// </select>

//         {/* <select
//           value={filters.status || filters.caseStatus || ""}
//           onChange={(e) => {
//             const value = e.target.value;
//             if (["New Pending", "Sent"].includes(value)) {
//               setFilters({...filters, caseStatus: value, status: ""});
//             } else {
//               setFilters({...filters, status: value, caseStatus: ""});
//             }
//           }}
//           className={`border rounded-lg p-2 w-full ${
//             isDarkMode
//               ? "bg-gray-700 border-gray-600 text-gray-200"
//               : "bg-white border-gray-300 text-gray-700"
//           }`}
//         >
//           <option value="">All Statuses</option>
//           <option value="New Data">New Data</option>
//           <option value="New Pending">New Pending</option>
//           <option value="Sent">Sent</option>
//           <option value="Closed">Closed</option>
//         </select> */}
//       </div>

//       {/* Action buttons with better alignment */}
//       <div className="flex flex-wrap justify-start gap-3">
//         <button
//           onClick={() => setNewRecord(true)}
//           className={`px-4 py-2.5 ${
//             isDarkMode
//               ? 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white'
//               : 'bg-blue-500 hover:bg-blue-600 hover:cursor-pointer text-white'
//           }`}
//         >
//           Add new record
//         </button>
//         <button
//           onClick={handleAddRecheckedRecord}
//           className={`px-4 py-2.5 ${
//             isDarkMode
//               ? 'bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white'
//               : 'bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white'
//           }`}
//         >
//           Add recheck record
//         </button>
//       </div>

//       {newRecord && (
//         <div style={modalBackdropStyle}>
//           <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
//             isDarkMode ? "bg-gray-700" : "bg-white"
//           }`}>
//             <button 
//               onClick={handleCloseModal} 
//               className={`absolute top-2 right-2 text-xl ${
//                 isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               ✖
//             </button>

//             <h2 className={`text-xl font-bold mb-4 ${
//               isDarkMode ? "text-white" : "text-gray-800"
//             }`}>
//               Add New Record
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Client ID field for employee/admin */}
//               {(userRole === "employee" || userRole === "admin") && (
//                 <div>
//                   <label className={`block mb-1 ${
//                     isDarkMode ? "text-gray-300" : "text-gray-700"
//                   }`}>
//                     Client ID
//                   </label>
//                   <input
//                     type="text"
//                     value={clientId}
//                     onChange={(e) => setClientId(e.target.value)}
//                     placeholder="Enter Client ID"
//                     className={isDarkMode ? darkInputStyle : lightInputStyle}
//                     required
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Enter Name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div className="relative" ref={productRef}>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Product
//                 </label>
//                 {/* <input
//                   type="text"
//                   name="product"
//                   placeholder="Enter or select product"
//                   value={formData.product}
//                   onChange={handleChange}
//                   onFocus={() => setShowProducts(true)}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 /> */}
//                 <input
//   type="text"
//   name="product"
//   placeholder="Enter or select product"
//   value={formData.product}
//   onChange={handleChange}
//   onFocus={() => setShowProducts(true)}
//   onBlur={handleProductInputBlur} // Add this line
//   className={isDarkMode ? darkInputStyle : lightInputStyle}
//   required
// />
//                 {showProducts && filteredProducts.length > 0 && (
//                   <div className={`absolute z-10 w-full max-h-40 overflow-y-auto border ${
//                     isDarkMode 
//                       ? "bg-gray-700 border-gray-600 text-gray-200" 
//                       : "bg-white border-gray-300 text-gray-700"
//                   }`}>
//                     {filteredProducts.map((product, index) => (
//                       <div 
//                         key={index}
//                         onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                         onClick={() => handleProductSelect(product)}
//                         className={`p-2 cursor-pointer ${
//                           isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                         }`}
//                       >
//                         {product.productName}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   placeholder="Enter Account Number"
//                   value={formData.accountNumber}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Requirement
//                 </label>
//                 <input
//                   type="text"
//                   name="requirement"
//                   placeholder="Enter Requirement"
//                   value={formData.requirement}
//                   onChange={handleChange}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <div className="flex justify-between">
//                 <button 
//                   type="button" 
//                   onClick={handleReset} 
//                   className={`px-4 py-2 rounded ${
//                     isDarkMode
//                       ? "bg-gray-600 hover:bg-gray-500 text-white"
//                       : "bg-gray-400 hover:bg-gray-500 text-white"
//                   }`}
//                 >
//                   Reset
//                 </button>

//                 <button 
//                   type="submit" 
//                   className={`px-4 py-2 rounded ${
//                     isDarkMode
//                       ? "bg-green-600 hover:bg-green-500 text-white"
//                       : "bg-green-500 hover:bg-green-600 text-white"
//                   }`}
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isRecheckModalOpen && (
//         <div style={modalBackdropStyle}>
//           <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
//             isDarkMode ? "bg-gray-700" : "bg-white"
//           }`}>
//             <button 
//               onClick={() => setIsRecheckModalOpen(false)} 
//               className={`absolute top-2 right-2 text-xl ${
//                 isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               ✖
//             </button>

//             <h2 className={`text-xl font-bold mb-4 ${
//               isDarkMode ? "text-white" : "text-gray-800"
//             }`}>
//               Add Recheck Record
//             </h2>

//             <form onSubmit={handleRecheckSubmit} className="space-y-4">
//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={rowData?.name || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Product
//                 </label>
//                 <input
//                   type="text"
//                   name="product"
//                   value={rowData?.product || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={rowData?.accountNumber || ''}
//                   readOnly
//                   className={`w-full border p-2 rounded ${
//                     isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block mb-1 ${
//                   isDarkMode ? "text-gray-300" : "text-gray-700"
//                 }`}>
//                   Requirement
//                 </label>
//                 <input
//                   type="text"
//                   name="requirement"
//                   placeholder="Update your Requirement"
//                   value={requirement}
//                   onChange={(e) => setRequirement(e.target.value)}
//                   className={isDarkMode ? darkInputStyle : lightInputStyle}
//                   required
//                 />
//               </div>

//               <button 
//                 type="submit" 
//                 className={`w-full px-4 py-2 rounded ${
//                   isDarkMode
//                     ? "bg-green-600 hover:bg-green-500 text-white"
//                     : "bg-green-500 hover:bg-green-600 text-white"
//                 }`}
//               >
//                 Submit
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterAndSearch;


/////////////////////////////////////updated client code ////////////////////


import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";

const FilterAndSearch = ({ 
  setSearchQuery, 
  onRecordAdded, 
  rowData,
  onRecheck,
  onFilterTypeChange,
  filters,
  setFilters,
  filterType
}) => {
  const [newRecord, setNewRecord] = useState(false);
  const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false);
  const [requirement, setRequirement] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [productOption, setProductOption] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [clientId, setClientId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    product: "",
    accountNumber: "",
    requirement: "",
  });
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  // Add these state variables after the existing useState declarations:
const [clientCodes, setClientCodes] = useState([]);
const [showClientCodes, setShowClientCodes] = useState(false);
  
  // Ref for product dropdown
  const productRef = useRef(null);

  // Add this ref after the existing productRef:
const clientCodeRef = useRef(null);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    const role = localStorage.getItem("role");
    setUserRole(role);
    
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data);
    }
    
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchProductName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
        setProductOption(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProductName();
  }, []);

  // Add this useEffect after the existing useEffects for fetching client codes:
useEffect(() => {
  const fetchClientCodes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
      setClientCodes(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch client codes:", error);
    }
  };
  fetchClientCodes();
}, []);

  // // Add click outside listener to close dropdown
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (productRef.current && !productRef.current.contains(event.target)) {
  //       setShowProducts(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // Update the existing click outside useEffect to include clientCodeRef:
useEffect(() => {
  const handleClickOutside = (event) => {
    if (productRef.current && !productRef.current.contains(event.target)) {
      setShowProducts(false);
    }
    if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
      setShowClientCodes(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({ ...prev, [name]: value }));
    
  //   if (name === "product") {
  //     const filtered = productOption.filter(product => 
  //       product.productName.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setFilteredProducts(filtered);
  //     setShowProducts(true);
  //   }
  // };

  // Update the handleChange function to include clientId handling:
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  if (name === "product") {
    const filtered = productOption.filter(product => 
      product.productName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
    setShowProducts(true);
  }
};

  // Add these helper functions after the existing handleChange function:
const normalizeInput = (input) => {
  return input.trim().toUpperCase().replace(/\s+/g, "");
};

const filteredClientCodes = clientCodes.filter(code => 
  normalizeInput(code).includes(normalizeInput(clientId))
);

const handleClientCodeSelect = (code) => {
  setClientId(code);
  setShowClientCodes(false);
  // Focus back on the input after selection
  setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
};

// Add this new function for client ID input changes:
const handleClientIdChange = (e) => {
  setClientId(e.target.value);
  setShowClientCodes(true);
};
  const handleProductInputBlur = () => {
    // Close the dropdown when the input loses focus
    setShowProducts(false);
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({ ...prev, product: product.productName }));
    setShowProducts(false);
    // Focus back on the input after selection
    setTimeout(() => productRef.current.querySelector('input').focus(), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For employee/admin, validate clientId
    if ((userRole === "employee" || userRole === "admin") && !clientId) {
      alert("Client ID is required!");
      return;
    }

    try {
      const payload = {
        ...formData,userId: user.userId,clientId
      };

      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`, payload);
      setNewRecord(false);
      setFormData({
        name: "",
        product: "",
        accountNumber: "",
        requirement: "",
      });
      setClientId("");
      if (onRecordAdded) onRecordAdded();
    } catch (error) {
      console.error("Error adding record:", error);
      alert(error.response?.data?.message || "Failed to add record");
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      product: "",
      accountNumber: "",
      requirement: "",
    });
    setClientId("");
  };

  const handleCloseModal = () => {
    setNewRecord(false);
    setIsRecheckModalOpen(false);
  };

  const handleFilterChange = (e) => {
    const newFilterType = e.target.value === "deleted" ? "deleted" : "active";
    if (onFilterTypeChange) {
      onFilterTypeChange(newFilterType);
    }
  };

  const handleAddRecheckedRecord = () => {
    if (onRecheck) onRecheck();
    if (rowData) setIsRecheckModalOpen(true);
  };

  const handleRecheckSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        caseId: rowData.caseId,
        name: rowData.name,
        product: rowData.product,
        accountNumber: rowData.accountNumber,
        requirement,
        isRechecked: true,
        ...(userRole === "employee" || userRole === "admin" ? { clientId: rowData.clientCode } : {})
      };
  
      const response = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/recheck`, payload);
      setIsRecheckModalOpen(false);
      setRequirement('');
      if (onRecordAdded) {
        // Clear the selection before refreshing
        if (typeof onRecordAdded === 'function') {
          onRecordAdded(null, true); // Pass a flag to indicate we should clear selection
        }
      }
    } catch (error) {
      console.error("Recheck error:", error);
      alert(error.response?.data?.message || "Failed to recheck record");
    }
  };
  
  const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '5% 0',
    zIndex: 9999,
  };

  const inputStyle = "w-full border p-2 rounded";
  const darkInputStyle = "w-full border p-2 rounded bg-gray-700 border-gray-600 text-white";
  const lightInputStyle = "w-full border p-2 rounded bg-white border-gray-300 text-gray-700";

  return (
    <div className={`w-full ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4`}>
      <h3 className={`text-md font-medium mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-600"}`}>
        All Search & Actions
      </h3>

      {/* Search bar with full width */}
      <div className="mb-4 w-full">
        <input
          type="text"
          placeholder="Search by Account Number"
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`border p-2 text-sm rounded w-full ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        />
      </div>

      {/* Two dropdowns in the same line with responsive behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Only show this dropdown for admin users */}
        {userRole === 'admin' && (
          <select
            value={filterType}
            onChange={handleFilterChange}
            className={`border rounded-lg p-2 w-full ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            <option value="active">Active Records</option>
            <option value="deleted">Deleted Records</option>
          </select>
        )}
        <select
  value={
    filters.isRechecked 
      ? "recheck" 
      : filters.caseStatus || filters.status || ""
  }
  onChange={(e) => {
    const value = e.target.value;
    if (value === "true") {
      setFilters({
        ...filters, 
        recheck: true,
        status: "",
        caseStatus: ""
      });
    } else if (["New Pending", "Sent"].includes(value)) {
      setFilters({
        ...filters,
        caseStatus: value,
        status: "",
        recheck: false
      });
    } else {
      setFilters({
        ...filters,
        status: value,
        caseStatus: "",
        recheck: false
      });
    }
  }}
  className={`border rounded-lg p-2 w-full ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-200"
      : "bg-white border-gray-300 text-gray-700"
  }`}
>
  <option value="">All Statuses</option>
  <option value="New Data">New Data</option>
  <option value="New Pending">New Pending</option>
  <option value="Sent">Sent</option>
  <option value="Closed">Closed</option>
  <option value="true">Recheck Records</option>
</select>

        {/* <select
          value={filters.status || filters.caseStatus || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (["New Pending", "Sent"].includes(value)) {
              setFilters({...filters, caseStatus: value, status: ""});
            } else {
              setFilters({...filters, status: value, caseStatus: ""});
            }
          }}
          className={`border rounded-lg p-2 w-full ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-gray-200"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <option value="">All Statuses</option>
          <option value="New Data">New Data</option>
          <option value="New Pending">New Pending</option>
          <option value="Sent">Sent</option>
          <option value="Closed">Closed</option>
        </select> */}
      </div>

      {/* Action buttons with better alignment */}
      <div className="flex flex-wrap justify-start gap-3">
        <button
          onClick={() => setNewRecord(true)}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          Add New Record
        </button>
        <button
          onClick={handleAddRecheckedRecord}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Add Recheck Record
        </button>
      </div>

      {newRecord && (
        <div style={modalBackdropStyle}>
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
            isDarkMode ? "bg-gray-700" : "bg-white"
          }`}>
            <button 
              onClick={handleCloseModal} 
              className={`absolute top-2 right-2 text-xl ${
                isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ✖
            </button>

            <h2 className={`text-xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              Add New Record
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client ID field for employee/admin */}
              {/* {(userRole === "employee" || userRole === "admin") && (
                <div>
                  <label className={`block mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter Client ID"
                    className={isDarkMode ? darkInputStyle : lightInputStyle}
                    required
                  />
                </div>
              )} */}

{/* // Replace the existing Client ID input section in the form with this: */}
{(userRole === "employee" || userRole === "admin") && (
  <div className="relative" ref={clientCodeRef}>
    <label className={`block mb-1 ${
      isDarkMode ? "text-gray-300" : "text-gray-700"
    }`}>
      Client Code
    </label>
    <input
      type="text"
      value={clientId}
      onChange={handleClientIdChange}
      onFocus={() => setShowClientCodes(true)}
      placeholder="Enter the Code"
      className={isDarkMode ? darkInputStyle : lightInputStyle}
      required
    />
    {showClientCodes && clientId && filteredClientCodes.length > 0 && (
      <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
        isDarkMode 
          ? "bg-gray-800 border border-gray-700" 
          : "bg-white border border-gray-200"
      }`}>
        {filteredClientCodes.map((code, index) => (
          <div
            key={index}
            onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            onClick={() => handleClientCodeSelect(code)}
            className={`p-2 cursor-pointer hover:bg-blue-50 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
            }`}
          >
            {code}
          </div>
        ))}
      </div>
    )}
  </div>
)}
              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={isDarkMode ? darkInputStyle : lightInputStyle}
                  required
                />
              </div>

              <div className="relative" ref={productRef}>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Product
                </label>
                {/* <input
                  type="text"
                  name="product"
                  placeholder="Enter or select product"
                  value={formData.product}
                  onChange={handleChange}
                  onFocus={() => setShowProducts(true)}
                  className={isDarkMode ? darkInputStyle : lightInputStyle}
                  required
                /> */}
                <input
  type="text"
  name="product"
  placeholder="Enter or select product"
  value={formData.product}
  onChange={handleChange}
  onFocus={() => setShowProducts(true)}
  onBlur={handleProductInputBlur} // Add this line
  className={isDarkMode ? darkInputStyle : lightInputStyle}
  required
/>
                {showProducts && filteredProducts.length > 0 && (
                  <div className={`absolute z-10 w-full max-h-40 overflow-y-auto border ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-gray-200" 
                      : "bg-white border-gray-300 text-gray-700"
                  }`}>
                    {filteredProducts.map((product, index) => (
                      <div 
                        key={index}
                        onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                        onClick={() => handleProductSelect(product)}
                        className={`p-2 cursor-pointer ${
                          isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        {product.productName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="Enter Account Number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className={isDarkMode ? darkInputStyle : lightInputStyle}
                  required
                />
              </div>

              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Requirement
                </label>
                <input
                  type="text"
                  name="requirement"
                  placeholder="Enter Requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  className={isDarkMode ? darkInputStyle : lightInputStyle}
                  required
                />
              </div>

              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={handleReset} 
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                  }`}
                >
                  Reset
                </button>

                <button 
                  type="submit" 
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? "bg-green-600 hover:bg-green-500 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRecheckModalOpen && (
        <div style={modalBackdropStyle}>
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md mx-4 relative ${
            isDarkMode ? "bg-gray-700" : "bg-white"
          }`}>
            <button 
              onClick={() => setIsRecheckModalOpen(false)} 
              className={`absolute top-2 right-2 text-xl ${
                isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ✖
            </button>

            <h2 className={`text-xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              Add Recheck Record
            </h2>

            <form onSubmit={handleRecheckSubmit} className="space-y-4">
              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={rowData?.name || ''}
                  readOnly
                  className={`w-full border p-2 rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Product
                </label>
                <input
                  type="text"
                  name="product"
                  value={rowData?.product || ''}
                  readOnly
                  className={`w-full border p-2 rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={rowData?.accountNumber || ''}
                  readOnly
                  className={`w-full border p-2 rounded ${
                    isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100"
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Requirement
                </label>
                <input
                  type="text"
                  name="requirement"
                  placeholder="Update your Requirement"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className={isDarkMode ? darkInputStyle : lightInputStyle}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={`w-full px-4 py-2 rounded ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterAndSearch;