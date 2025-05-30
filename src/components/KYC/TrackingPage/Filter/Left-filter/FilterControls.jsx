
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Paperclip } from 'lucide-react';
// import AttachmentManager from "../../../AttachmentManager";
// import Select from "react-select";

// const FilterControls = ({ 
//   filters, 
//   setFilters, 
//   isDarkMode,
//   selectedRows,
//   data,
//   fetchTrackerData,
//   role
// }) => {
//   const [viewMode, setViewMode] = useState('filter');
//   const [updateFields, setUpdateFields] = useState({
//     vendorName: '',
//     caseStatus: '',
//     vendorStatus: '',
//     remarks: ''
//   });
//   const [productOptions, setProductOptions] = useState([]);
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "NYC", "STATEMENT"]);
//   const [statusOptions] = useState(["New Data", "Closed", "Negative", "CNV"]);
//   const [caseStatusOptions] = useState(["New Pending", "Sent", "Completed"]);
//   const [showAttachmentModal, setShowAttachmentModal] = useState(false);
//   const [vendorNames, setVendorNames] = useState([]);
//   const productRef = useRef(null);
//   console.log("selected row:", selectedRows);

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };


// const fetchVendorNames = async () => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getVendorName`);
//     console.log("Response:", response.data);
//     const names = response.data.vendorName.map(item => item.vendorName);
//     setVendorNames(names);
//   } catch (error) {
//     console.error("Error fetching vendor names:", error);
//   }
// };


//   useEffect(() => {
//     fetchProductName();
//     fetchVendorNames();
//   }, []);

//   const getFormattedDateTime = () => {
//   const date = new Date();

//   // Format the date as DD-MM-YYYY
//   const [year, month, day] = date.toISOString().split("T")[0].split("-");
//   const formattedDate = `${day}-${month}-${year}`;

//   // Get the time in HH:MM:SS format
//   const time = date.toLocaleTimeString();

//   return ` ${formattedDate}, ${time}`;
// };
// const handleUpdate = async () => {
//   if (selectedRows.length === 0) {
//     toast.warning("Please select at least one row to update");
//     return;
//   }

//   try {
//     const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
    
//     if (caseIds.length === 0) {
//       toast.error("No valid records selected for update");
//       return;
//     }

//     // Get user info from localStorage
//     const getUser = localStorage.getItem("loginUser");
//     const user = getUser ? JSON.parse(getUser) : null;
    
//     const updates = {
//       vendorName: updateFields.vendorName,
//       caseStatus: updateFields.caseStatus,
//       vendorStatus: updateFields.vendorStatus,
//       remarks: updateFields.remarks
//     };

//     // If caseStatus is being set to "Sent", add sentBy and sentDate
//     if (updateFields.caseStatus === "Sent" && user) {
//       updates.sentBy = user.name;
//       updates.sentDate = getFormattedDateTime();
//     }

//     // Filter out empty fields
//     const nonEmptyUpdates = Object.fromEntries(
//       Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
//     );

//     if (Object.keys(nonEmptyUpdates).length === 0) {
//       toast.warning("No update fields filled");
//       return;
//     }

//     const response = await axios.post(
//       `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
//       { caseIds, updates: nonEmptyUpdates }
//     );
    
//     if (response.data?.success) {
//       // Use updatedCount from response instead of checking nested properties
//       const count = response.data.updatedCount ?? 0;
//       toast.success(`Updated ${count} records successfully`);
      
//       setUpdateFields({
//         vendorName: '',
//         caseStatus: '',
//         vendorStatus: '',
//         remarks: ''
//       });
//       fetchTrackerData();
//     } else {
//       toast.error(response.data?.message || "Update failed");
//     }
//   } catch (error) {
//     console.error("Update error:", error);
//     toast.error(error.response?.data?.message || error.message || "Update failed");
//   }
// };

  
// //   const handleUpdate = async () => {
// //   if (selectedRows.length === 0) {
// //     toast.warning("Please select at least one row to update");
// //     return;
// //   }

// //   try {
// //     const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
    
// //     if (caseIds.length === 0) {
// //       toast.error("No valid records selected for update");
// //       return;
// //     }

// //     // Get user info from localStorage
// //     const getUser = localStorage.getItem("loginUser");
// //     const user = getUser ? JSON.parse(getUser) : null;
    
// //     const updates = {
// //       vendorName: updateFields.vendorName,
// //       caseStatus: updateFields.caseStatus,
// //       vendorStatus: updateFields.vendorStatus,
// //       remarks: updateFields.remarks
// //     };

// //     // If caseStatus is being set to "Sent", add sentBy and sentDate
// //     if (updateFields.caseStatus === "Sent" && user) {
// //       updates.sentBy = user.name;
// //       updates.sentDate = getFormattedDateTime();
// //     }

// //     // Filter out empty fields
// //     const nonEmptyUpdates = Object.fromEntries(
// //       Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
// //     );

// //     if (Object.keys(nonEmptyUpdates).length === 0) {
// //       toast.warning("No update fields filled");
// //       return;
// //     }

// //     const response = await axios.post(
// //       `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
// //       { caseIds, updates: nonEmptyUpdates }
// //     );
    
// //     if (response.data?.success) {
// //       toast.success(`Updated ${response.data.updatedCount || 0} records`);
// //       setUpdateFields({
// //         vendorName: '',
// //         caseStatus: '',
// //         vendorStatus: '',
// //         remarks: ''
// //       });
// //       fetchTrackerData();
// //     } else {
// //       toast.error(response.data.message || "Update failed");
// //     }
// //   } catch (error) {
// //     console.error("Update error:", error);
// //     toast.error(error.response?.data?.message || error.message || "Update failed");
// //   }
// // };
//   const handleDateChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({ ...filters, [name]: value });
//   };

//   const resetFields = () => {
//     if (viewMode === 'filter') {
//       setFilters({
//         product: "",
//         productType: "",
//         dateIn: "",
//         endDate: "",
//         dateOut: "",
//         status: "",
//         caseStatus: "",
//       });
//     } else {
//       setUpdateFields({
//         vendorName: '',
//         caseStatus: '',
//         vendorStatus: '',
//         remarks: ''
//       });
//     }
//   };

//   const toggleButtonClass = (active) => 
//     `px-4 py-2 rounded-t-lg transition-colors ${
//       active 
//         ? isDarkMode 
//           ? "bg-gray-700 text-white border-b-2 border-blue-500" 
//           : "bg-gray-200 text-gray-800 border-b-2 border-blue-500"
//         : isDarkMode 
//           ? "bg-gray-900 text-gray-400 hover:bg-gray-800"
//           : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//     }`;

//   // Custom styles for the select dropdown to limit height
//   const customStyles = {
//     menu: (provided) => ({
//       ...provided,
//       maxHeight: '160px' // Approximately height for 5 items
//     }),
//     menuList: (provided) => ({
//       ...provided,
//       maxHeight: '160px' // Approximately height for 5 items
//     }),
//     control: (provided) => ({
//       ...provided,
//       backgroundColor: isDarkMode ? '#374151' : 'white',
//       borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected 
//         ? (isDarkMode ? '#2563EB' : '#BFDBFE') 
//         : state.isFocused 
//           ? (isDarkMode ? '#4B5563' : '#F3F4F6')
//           : (isDarkMode ? '#374151' : 'white'),
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     singleValue: (provided) => ({
//       ...provided,
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     placeholder: (provided) => ({
//       ...provided,
//       color: isDarkMode ? '#9CA3AF' : '#6B7280' // Optional: match placeholder with Tailwind gray-400 / gray-500
//     })
//   };

//   return (
//     <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow-md`}>
//       <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex">
//           <button
//             onClick={() => setViewMode('filter')}
//             className={toggleButtonClass(viewMode === 'filter')}
//           >
//             Filter Options
//           </button>
//           <button
//             onClick={() => setViewMode('update')}
//             className={toggleButtonClass(viewMode === 'update')}
//           >
//             Update Fields
//           </button>
//         </div>
        
//         <div className="flex gap-2">
//           <button
//             onClick={resetFields}
//             className={`px-3 py-1 text-sm rounded ${
//               isDarkMode
//                 ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//             }`}
//           >
//             Reset
//           </button>
          
//           {viewMode === 'update' && (
//             <button
//               onClick={handleUpdate}
//               disabled={selectedRows?.length === 0}
//               className={`px-3 py-1 text-sm rounded ${
//                 isDarkMode
//                   ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
//                   : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
//               }`}
//             >
//               Update
//             </button>
//           )}
//         </div>
//       </div>

//       {viewMode === 'filter' ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Product - Using react-select for customization */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Product
//             </label>
//             <Select
//               id="product-select"
//               name="product"
//               value={filters.product ? { value: filters.product, label: filters.product } : null}
//               onChange={(selectedOption) => {
//                 setFilters({ ...filters, product: selectedOption ? selectedOption.value : "" });
//               }}
//               options={[
//                 { value: "", label: "All Products" },
//                 ...productOptions.map(product => ({ value: product, label: product }))
//               ]}
//               styles={customStyles}
//               placeholder="All Products"
//               isClearable
//               className="text-sm"
//             />
//           </div>

//           {/* Product Type - Updated  */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Product Type
//             </label>
//             <Select
//               id="product-type-select"
//               name="productType"
//               value={filters.productType ? { value: filters.productType, label: filters.productType } : null}
//               onChange={(selectedOption) => {
//                 setFilters({ ...filters, productType: selectedOption ? selectedOption.value : "" });
//               }}
//               options={[
//                 { value: "", label: "All Product Types" },
//                 ...productTypeOptions.map(type => ({ value: type, label: type }))
//               ]}
//               styles={customStyles}
//               placeholder="All Product Types"
//               isClearable
//               className="text-sm"
//             />
//           </div>


//           {/* Status */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Status
//             </label>
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             >
//               <option value="">All Status</option>
//               {statusOptions.map((status, index) => (
//                 <option key={index} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>

//           {/* Date In */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Date In (From)
//             </label>
//             <input
//               type="date"
//               name="dateIn"
//               value={filters.dateIn}
//               onChange={handleDateChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             />
//           </div>

//           {/* End Date */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Date In (To)
//             </label>
//             <input
//               type="date"
//               name="endDate"
//               value={filters.endDate}
//               onChange={handleDateChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             />
//           </div>

//           {/* Case Status */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Case Status
//             </label>
//             <select
//               name="caseStatus"
//               value={filters.caseStatus}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             >
//               <option value="">All Case Status</option>
//               {caseStatusOptions.map((status, index) => (
//                 <option key={index} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Vendor Name - Updated to dropdown */}
//             <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Vendor Name
//   </label>
//   <Select
//     id="vendor-name-update-select"
//     name="vendorName"
//     value={updateFields.vendorName ? { 
//       value: updateFields.vendorName, 
//       label: updateFields.vendorName 
//     } : null}
//     onChange={(selectedOption) => {
//       setUpdateFields({ 
//         ...updateFields, 
//         vendorName: selectedOption ? selectedOption.value : "" 
//       });
//     }}
//     options={[
//       { value: "", label: "Select Vendor" },
//       ...vendorNames.map(vendor => ({ 
//         value: vendor, 
//         label: vendor 
//       }))
//     ]}
//     styles={customStyles}
//     placeholder="Select Vendor"
//     isClearable
//     className="text-sm"
//   />
// </div>
            
//             {/* Case Status */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Case Status
//               </label>
//               <select
//                 value={updateFields.caseStatus}
//                 onChange={(e) => setUpdateFields({...updateFields, caseStatus: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 {caseStatusOptions.map((status, index) => (
//                   <option key={index} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Vendor Status and Remarks grouped together */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Vendor Status
//               </label>
//               <select
//                 value={updateFields.vendorStatus}
//                 onChange={(e) => setUpdateFields({...updateFields, vendorStatus: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 <option value="Closed">Closed</option>
//                 <option value="Invalid">Invalid</option>
//                 <option value="CNV">CNV</option>
//                 <option value="Records Not Updated">Records Not Updated</option>
//                 <option value="Not Found">Not Found</option>
//                 <option value="Records Not Found">Records Not Found</option>
//               </select>
//             </div>

//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Remarks
//               </label>
//               <textarea
//                 value={updateFields.remarks}
//                 onChange={(e) => setUpdateFields({...updateFields, remarks: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//                 rows="1"
//               />
//             </div>
//           </div>

//           <div className={`text-sm pt-2 border-t border-gray-200 dark:border-gray-700 ${
//             isDarkMode ? "text-gray-400" : "text-gray-500"
//           }`}>
//             {selectedRows?.length} record(s) selected
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterControls;

////////////////////////////////////////////////////////////////////////////working attachment/////////////////////////////////////////////////////////////

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Paperclip, Loader2 } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import AttachmentManager from "../../../AttachmentManager";
import Select from "react-select";
import moment from 'moment';

const FilterControls = ({ 
  filters, 
  setFilters, 
  isDarkMode,
  selectedRows,
  data,
  fetchTrackerData,
  setSelectedRows 
}) => {
  const [viewMode, setViewMode] = useState('filter');
  const [updateFields, setUpdateFields] = useState({
    vendorName: '',
    caseStatus: '',
    vendorStatus: '',
    remarks: '',
    status: '',
    attachment: null
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "NYC", "STATEMENT"]);
  const [statusOptions] = useState(["New Data", "Closed", "Negative", "CNV"]);
  const [caseStatusOptions] = useState(["New Pending", "Sent", "Completed"]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [vendorNames, setVendorNames] = useState([]);
  const [role, setRole] = useState("");
  const productRef = useRef(null);

  useEffect(() => {
      const getUser = localStorage.getItem("loginUser");
      if (getUser) {
        const data = JSON.parse(getUser);
        setRole(data.role || "");
      }
    }, []);
  
  const fetchProductName = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
      setProductOptions(response.data.map(p => p.productName));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchVendorNames = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getVendorName`);
      const names = response.data.vendorName.map(item => item.vendorName);
      setVendorNames(names);
    } catch (error) {
      console.error("Error fetching vendor names:", error);
    }
  };

  useEffect(() => {
    fetchProductName();
    fetchVendorNames();
  }, []);

  const getFormattedDateTime = () => {
  return moment().format("DD-MM-YYYY, hh:mm:ss A");
};

  // const handleUpdate = async () => {
  //   if (selectedRows.length === 0) {
  //     toast.warning("Please select at least one row to update");
  //     return;
  //   }

  //   setIsUpdating(true);

  //   try {
  //     const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
      
  //     if (caseIds.length === 0) {
  //       toast.error("No valid records selected for update");
  //       return;
  //     }

  //     const getUser = localStorage.getItem("loginUser");
  //     const user = getUser ? JSON.parse(getUser) : null;
      
  //     const updates = {
  //       vendorName: updateFields.vendorName,
  //       caseStatus: updateFields.caseStatus,
  //       vendorStatus: updateFields.vendorStatus,
  //       remarks: updateFields.remarks,
  //       status: updateFields.status
  //     };

  //     // Handle Closed status for both status and vendorStatus
  //     if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
  //       updates.dateOut = getFormattedDateTime();
  //       updates.caseDoneBy = user.name;
  //     }

  //     if (updates.caseStatus === "Sent" && user) {
  //       updates.sentBy = user.name;
  //       updates.sentDate = getFormattedDateTime();
  //     }

  //     const nonEmptyUpdates = Object.fromEntries(
  //       Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
  //     );

  //     if (Object.keys(nonEmptyUpdates).length === 0 && !updateFields.attachment) {
  //       toast.warning("No update fields filled");
  //       return;
  //     }

  //     // Handle attachment upload first
  //     if (updateFields.attachment) {
  //       const formData = new FormData();
  //       formData.append('file', updateFields.attachment);
  //       console.log("updateFields.attachment:",updateFields.attachment)
  //       console.log("caseIds:",caseIds)
  //       formData.append('caseId', caseIds[0]); // Attach to first case in bulk
        
  //       await axios.post(
  //         `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
  //         formData,
  //         { headers: { 'Content-Type': 'multipart/form-data' } }
  //       );
  //     }

  //     // Handle other updates
  //     if (Object.keys(nonEmptyUpdates).length > 0) {
  //       const response = await axios.post(
  //         `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
  //         { caseIds, updates: nonEmptyUpdates }
  //       );
        
  //       if (response.data?.success) {
  //         const count = response.data.updatedCount ?? 0;
  //         toast.success(`Updated ${count} records successfully`);
  //       } else {
  //         toast.error(response.data?.message || "Update failed");
  //       }
  //     } else {
  //       toast.success("Attachment uploaded successfully");
  //     }

  //     setUpdateFields({
  //       vendorName: '',
  //       caseStatus: '',
  //       vendorStatus: '',
  //       remarks: '',
  //       status: '',
  //       attachment: null
  //     });
  //     fetchTrackerData();
  //   } catch (error) {
  //     console.error("Update error:", error);
  //     toast.error(error.response?.data?.message || error.message || "Update failed");
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };
  
  
  const handleUpdate = async () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to update");
      return;
    }

    const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
    if (caseIds.length === 0) {
      toast.error("No valid records selected for update");
      return;
    }

    // Validate cases being closed have sentDate
    if ((updateFields.status === "Closed" || updateFields.vendorStatus === "Closed")) {
      const casesWithoutSentDate = selectedRows.filter(rowIndex => {
        const rowData = data[rowIndex];
        return !rowData.sentDate;
      });

      if (casesWithoutSentDate.length > 0) {
        toast.warning(
          `${casesWithoutSentDate.length} selected case(s) don't have a sent date. ` +
          `Please set case status to "Sent" first or skip these cases.`
        );
        return;
      }
    }

    setIsUpdating(true);

    try {
      const getUser = localStorage.getItem("loginUser");
      const user = getUser ? JSON.parse(getUser) : null;
      
      const updates = {
        vendorName: updateFields.vendorName,
        caseStatus: updateFields.caseStatus,
        vendorStatus: updateFields.vendorStatus,
        remarks: updateFields.remarks,
        status: updateFields.status
      };

      // Handle Closed status
      if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
        updates.dateOut = getFormattedDateTime();
        updates.caseDoneBy = user.name;
      }

      // Handle Sent status
      if (updates.caseStatus === "Sent" && user) {
        updates.sentBy = user.name;
        updates.sentDate = getFormattedDateTime();
      }

      // Remove empty fields
      const nonEmptyUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      // Prepare the update payload
      const payload = { caseIds, updates: nonEmptyUpdates };

      // Process attachment first if exists
      if (updateFields.attachment) {
  const formData = new FormData();
  formData.append('file', updateFields.attachment);
  
  // Append each caseId individually
  caseIds.forEach(caseId => {
    formData.append('caseIds', caseId);
  });

  await axios.post(
    `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
      // if (updateFields.attachment) {
      //   const formData = new FormData();
      //   formData.append('file', updateFields.attachment);
      //   formData.append('caseIds', JSON.stringify(caseIds)); // Send all case IDs
        
      //   await axios.post(
      //     `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
      //     formData,
      //     { headers: { 'Content-Type': 'multipart/form-data' } }
      //   );
      // }

      // Process other updates if any
      if (Object.keys(nonEmptyUpdates).length > 0) {
        const response = await axios.post(
          `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
          payload
        );
        
        if (response.data?.success) {
          toast.success(`Updated ${response.data.updatedCount} records successfully`);
        } else {
          toast.error(response.data?.message || "Update failed");
        }
      } else if (updateFields.attachment) {
        toast.success("Attachment uploaded successfully");
      } else {
        toast.warning("No update fields filled");
      }

      // Reset form
      setUpdateFields({
        vendorName: '',
        caseStatus: '',
        vendorStatus: '',
        remarks: '',
        status: '',
        attachment: null
      });
      setSelectedRows([]);
      // Refresh data
      fetchTrackerData();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || error.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDateChange = (name, date) => {
      const formattedDate = date ? format(date, 'dd-MM-yyyy') : '';
      setFilters({ ...filters, [name]: formattedDate });
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFields = () => {
    if (viewMode === 'filter') {
      setFilters({
        product: "",
        productType: "",
        dateIn: "",//update line
        dateOut: "",//update line
        status: "",
        caseStatus: "",
      });
    } else {
      setUpdateFields({
        vendorName: '',
        caseStatus: '',
        vendorStatus: '',
        remarks: '',
        status: '',
        attachment: null
      });
    }
  };

  const toggleButtonClass = (active) => 
    `px-4 py-2 rounded-t-lg transition-colors ${
      active 
        ? isDarkMode 
          ? "bg-gray-700 text-white border-b-2 border-blue-500" 
          : "bg-gray-200 text-gray-800 border-b-2 border-blue-500"
        : isDarkMode 
          ? "bg-gray-900 text-gray-400 hover:bg-gray-800"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`;

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      maxHeight: '160px'
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '160px'
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#374151' : 'white',
      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
      color: isDarkMode ? '#E5E7EB' : '#374151'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? (isDarkMode ? '#2563EB' : '#BFDBFE') 
        : state.isFocused 
          ? (isDarkMode ? '#4B5563' : '#F3F4F6')
          : (isDarkMode ? '#374151' : 'white'),
      color: isDarkMode ? '#E5E7EB' : '#374151'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? '#E5E7EB' : '#374151'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? '#9CA3AF' : '#6B7280'
    })
  };

  return (
    <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setViewMode('filter')}
            className={toggleButtonClass(viewMode === 'filter')}
          >
            Filter
          </button>
          {(role === "admin" || role === "employee") && (
                  <button
            onClick={() => setViewMode('update')}
            className={toggleButtonClass(viewMode === 'update')}
          >
            Update
          </button>
                )}
          
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={resetFields}
            className={`px-3 py-1 text-sm rounded ${
              isDarkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Reset
          </button>
          
          {viewMode === 'update' && (
            <button
              onClick={handleUpdate}
              disabled={selectedRows?.length === 0 || isUpdating}
              className={`px-3 py-1 text-sm rounded flex items-center justify-center ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
                  : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
              }`}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : 'Update'}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'filter' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Product */}
          <div className="mb-2">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Product
            </label>
            <Select
              id="product-select"
              name="product"
              value={filters.product ? { value: filters.product, label: filters.product } : null}
              onChange={(selectedOption) => {
                setFilters({ ...filters, product: selectedOption ? selectedOption.value : "" });
              }}
              options={[
                { value: "", label: "All Products" },
                ...productOptions.map(product => ({ value: product, label: product }))
              ]}
              styles={customStyles}
              placeholder="All Products"
              isClearable
              className="text-sm  z-20"
            />
          </div>

          {/* Product Type */}
          <div className="mb-2">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Product Type
            </label>
            <Select
              id="product-type-select"
              name="productType"
              value={filters.productType ? { value: filters.productType, label: filters.productType } : null}
              onChange={(selectedOption) => {
                setFilters({ ...filters, productType: selectedOption ? selectedOption.value : "" });
              }}
              options={[
                { value: "", label: "All Product Types" },
                ...productTypeOptions.map(type => ({ value: type, label: type }))
              ]}
              styles={customStyles}
              placeholder="All Product Types"
              isClearable
              className="text-sm  z-20"
            />
          </div>

          {/* Status */}
          <div className="mb-2">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <option value="">All Status</option>
              {statusOptions.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Date In */}
          <div className="mb-2">
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Date In
                      </label>
                      <div className={`w-full px-3 py-2 text-sm rounded border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-700"
                        } sticky top-0 z-10`}>
                        <DatePicker
                          selected={filters.dateIn ? parse(filters.dateIn, 'dd-MM-yyyy', new Date()) : null}
                          onChange={(date) => handleDateChange('dateIn', date)}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          // className={datePickerCustomClass}
                          popperModifiers={{
                            preventOverflow: {
                              enabled: true,
                              options: {
                                padding: 10,
                              },
                            },
                            zIndex: {
                              enabled: true,
                              order: 9999,
                            },
                          }}
                        />
                      </div>
                    </div>
          
          
          
                    {/* Date Out */}
                    <div className="mb-2">
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Date Out
                      </label>
                      <div className={`w-full px-3 py-2 text-sm rounded border ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-700"
                        } sticky top-0 z-10`}>
                        <DatePicker
                          selected={filters.dateOut ? parse(filters.dateOut, 'dd-MM-yyyy', new Date()) : null}
                          onChange={(date) => handleDateChange('dateOut', date)}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          // className={datePickerCustomClass}
                          popperModifiers={{
                            preventOverflow: {
                              enabled: true,
                              options: {
                                padding: 10,
                              },
                            },
                            zIndex: {
                              enabled: true,
                              order: 9999,
                            },
                          }}
                        />
                      </div>
                    </div>
          {/* Case Status */}
          <div className="mb-2">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Case Status
            </label>
            <select
              name="caseStatus"
              value={filters.caseStatus}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm rounded border ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <option value="">All Case Status</option>
              {caseStatusOptions.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vendor Name */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Vendor Name
              </label>
              <Select
                id="vendor-name-update-select"
                name="vendorName"
                value={updateFields.vendorName ? { 
                  value: updateFields.vendorName, 
                  label: updateFields.vendorName 
                } : null}
                onChange={(selectedOption) => {
                  setUpdateFields({ 
                    ...updateFields, 
                    vendorName: selectedOption ? selectedOption.value : "" 
                  });
                }}
                options={[
                  { value: "", label: "Select Vendor" },
                  ...vendorNames.map(vendor => ({ 
                    value: vendor, 
                    label: vendor 
                  }))
                ]}
                styles={customStyles}
                placeholder="Select Vendor"
                isClearable
                className="text-sm"
              />
            </div>
            
            {/* Case Status */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Case Status
              </label>
              <select
                value={updateFields.caseStatus}
                onChange={(e) => setUpdateFields({...updateFields, caseStatus: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <option value="">Select Status</option>
                {caseStatusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Status
              </label>
              <select
                value={updateFields.status}
                onChange={(e) => setUpdateFields({...updateFields, status: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <option value="">Select Status</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Vendor Status */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Vendor Status
              </label>
              <select
                value={updateFields.vendorStatus}
                onChange={(e) => setUpdateFields({...updateFields, vendorStatus: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <option value="">Select Status</option>
                <option value="Closed">Closed</option>
                <option value="Invalid">Invalid</option>
                <option value="CNV">CNV</option>
                <option value="Account Closed">Account Closed</option>
                <option value="Restricted Account">Restricted Account</option>
                <option value="Staff Account">Staff Account</option>
                <option value="Records Not Updated">Records Not Updated</option>
                <option value="Not Found">Not Found</option>
                <option value="Records Not Found">Records Not Found</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Remarks
              </label>
              <textarea
                value={updateFields.remarks}
                onChange={(e) => setUpdateFields({...updateFields, remarks: e.target.value})}
                className={`w-full px-3 py-2 text-sm rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                rows="1"
              />
            </div>

            {/* Attachment */}
            <div className="mb-2">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Attachment
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  onChange={(e) => setUpdateFields({...updateFields, attachment: e.target.files[0]})}
                  className={`w-full px-3 py-2 text-sm rounded border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className={`text-sm pt-2 border-t border-gray-200 dark:border-gray-700 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            {selectedRows?.length} record(s) selected
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;


///////////////////////////////////////////////////////////////////////////working date formate///////////////////////////////////////


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Select from "react-select";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, parse } from 'date-fns';

// const FilterControls = ({ 
//   filters, 
//   setFilters, 
//   isDarkMode,
//   selectedRows,
//   data,
//   fetchTrackerData,
//   role
// }) => {
//   const [viewMode, setViewMode] = useState('filter');
//   const [updateFields, setUpdateFields] = useState({
//     vendorName: '',
//     caseStatus: '',
//     vendorStatus: '',
//     remarks: '',
//     status: '',
//     attachment: null
//   });
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [productOptions, setProductOptions] = useState([]);
//   const [vendorNames, setVendorNames] = useState([]);
  
//   const productTypeOptions = ["BANKING", "MOBILE", "ITO", "NYC", "STATEMENT"];
//   const statusOptions = ["New Data", "Closed", "Negative", "CNV"];
//   const caseStatusOptions = ["New Pending", "Sent", "Completed"];

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const fetchVendorNames = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getVendorName`);
//       const names = response.data.vendorName.map(item => item.vendorName);
//       setVendorNames(names);
//     } catch (error) {
//       console.error("Error fetching vendor names:", error);
//     }
//   };

//   useEffect(() => {
//     fetchProductName();
//     fetchVendorNames();
//   }, []);

//     const getFormattedDateTime = () => {
//     const date = new Date();
//     const [year, month, day] = date.toISOString().split("T")[0].split("-");
//     const formattedDate = `${day}-${month}-${year}`;
//     const time = date.toLocaleTimeString();
//     return ` ${formattedDate}, ${time}`;
//   };

//     const handleUpdate = async () => {
//     if (selectedRows.length === 0) {
//       toast.warning("Please select at least one row to update");
//       return;
//     }

//     const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
//     if (caseIds.length === 0) {
//       toast.error("No valid records selected for update");
//       return;
//     }

//     // Validate cases being closed have sentDate
//     if ((updateFields.status === "Closed" || updateFields.vendorStatus === "Closed")) {
//       const casesWithoutSentDate = selectedRows.filter(rowIndex => {
//         const rowData = data[rowIndex];
//         return !rowData.sentDate;
//       });

//       if (casesWithoutSentDate.length > 0) {
//         toast.warning(
//           `${casesWithoutSentDate.length} selected case(s) don't have a sent date. ` +
//           `Please set case status to "Sent" first or skip these cases.`
//         );
//         return;
//       }
//     }

//     setIsUpdating(true);

//     try {
//       const getUser = localStorage.getItem("loginUser");
//       const user = getUser ? JSON.parse(getUser) : null;
      
//       const updates = {
//         vendorName: updateFields.vendorName,
//         caseStatus: updateFields.caseStatus,
//         vendorStatus: updateFields.vendorStatus,
//         remarks: updateFields.remarks,
//         status: updateFields.status
//       };

//       // Handle Closed status
//       if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
//         updates.dateOut = getFormattedDateTime();
//         updates.caseDoneBy = user.name;
//       }

//       // Handle Sent status
//       if (updates.caseStatus === "Sent" && user) {
//         updates.sentBy = user.name;
//         updates.sentDate = getFormattedDateTime();
//       }

//       // Remove empty fields
//       const nonEmptyUpdates = Object.fromEntries(
//         Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
//       );

//       // Prepare the update payload
//       const payload = { caseIds, updates: nonEmptyUpdates };

//       // Process attachment first if exists
//       if (updateFields.attachment) {
//   const formData = new FormData();
//   formData.append('file', updateFields.attachment);
  
//   // Append each caseId individually
//   caseIds.forEach(caseId => {
//     formData.append('caseIds', caseId);
//   });

//   await axios.post(
//     `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
//     formData,
//     { headers: { 'Content-Type': 'multipart/form-data' } }
//   );
// }
//       // if (updateFields.attachment) {
//       //   const formData = new FormData();
//       //   formData.append('file', updateFields.attachment);
//       //   formData.append('caseIds', JSON.stringify(caseIds)); // Send all case IDs
        
//       //   await axios.post(
//       //     `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
//       //     formData,
//       //     { headers: { 'Content-Type': 'multipart/form-data' } }
//       //   );
//       // }

//       // Process other updates if any
//       if (Object.keys(nonEmptyUpdates).length > 0) {
//         const response = await axios.post(
//           `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
//           payload
//         );
        
//         if (response.data?.success) {
//           toast.success(`Updated ${response.data.updatedCount} records successfully`);
//         } else {
//           toast.error(response.data?.message || "Update failed");
//         }
//       } else if (updateFields.attachment) {
//         toast.success("Attachment uploaded successfully");
//       } else {
//         toast.warning("No update fields filled");
//       }

//       // Reset form
//       setUpdateFields({
//         vendorName: '',
//         caseStatus: '',
//         vendorStatus: '',
//         remarks: '',
//         status: '',
//         attachment: null
//       });
      
//       // Refresh data
//       fetchTrackerData();
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error(error.response?.data?.message || error.message || "Update failed");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleDateChange = (name, date) => {
//     const formattedDate = date ? format(date, 'dd-MM-yyyy') : '';
//     setFilters({ ...filters, [name]: formattedDate });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({ ...filters, [name]: value });
//   };

//   const resetFields = () => {
//     if (viewMode === 'filter') {
//       setFilters({
//         product: "",
//         productType: "",
//         dateIn: "",
//         dateOut: "", // Updated to reflect the new name
//         status: "",
//         caseStatus: "",
//       });
//     } else {
//       setUpdateFields({
//         vendorName: '',
//         caseStatus: '',
//         vendorStatus: '',
//         remarks: '',
//         status: '',
//         attachment: null
//       });
//     }
//   };

//   const toggleButtonClass = (active) => 
//     `px-4 py-2 rounded-t-lg transition-colors ${
//       active 
//         ? isDarkMode 
//           ? "bg-gray-700 text-white border-b-2 border-blue-500" 
//           : "bg-gray-200 text-gray-800 border-b-2 border-blue-500"
//         : isDarkMode 
//           ? "bg-gray-900 text-gray-400 hover:bg-gray-800"
//           : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//     }`;

//   const customStyles = {
//     menu: (provided) => ({
//       ...provided,
//       maxHeight: '160px'
//     }),
//     menuList: (provided) => ({
//       ...provided,
//       maxHeight: '160px'
//     }),
//     control: (provided) => ({
//       ...provided,
//       backgroundColor: isDarkMode ? '#374151' : 'white',
//       borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected 
//         ? (isDarkMode ? '#2563EB' : '#BFDBFE') 
//         : state.isFocused 
//           ? (isDarkMode ? '#4B5563' : '#F3F4F6')
//           : (isDarkMode ? '#374151' : 'white'),
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     singleValue: (provided) => ({
//       ...provided,
//       color: isDarkMode ? '#E5E7EB' : '#374151'
//     }),
//     placeholder: (provided) => ({
//       ...provided,
//       color: isDarkMode ? '#9CA3AF' : '#6B7280'
//     })
//   };

//   return (
//     <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow-md`}>
//       <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex">
//           <button
//             onClick={() => setViewMode('filter')}
//             className={toggleButtonClass(viewMode === 'filter')}
//           >
//             Filter Options
//           </button>
//           <button
//             onClick={() => setViewMode('update')}
//             className={toggleButtonClass(viewMode === 'update')}
//           >
//             Update Fields
//           </button>
//         </div>
        
//         <div className="flex gap-2">
//           <button
//             onClick={resetFields}
//             className={`px-3 py-1 text-sm rounded ${
//               isDarkMode
//                 ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//             }`}
//           >
//             Reset
//           </button>
//                      {viewMode === 'update' && (
//             <button
//               onClick={handleUpdate}
//               disabled={selectedRows?.length === 0 || isUpdating}
//               className={`px-3 py-1 text-sm rounded flex items-center justify-center ${
//                 isDarkMode
//                   ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
//                   : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
//               }`}
//             >
//               {isUpdating ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2 h-4 w-4" />
//                   Updating...
//                 </>
//               ) : 'Update'}
//             </button>
//           )}
//         </div>
//       </div>


//       {viewMode === 'filter' ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Product */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Product
//             </label>
//             <Select
//               id="product-select"
//               name="product"
//               value={filters.product ? { value: filters.product, label: filters.product } : null}
//               onChange={(selectedOption) => {
//                 setFilters({ ...filters, product: selectedOption ? selectedOption.value : "" });
//               }}
//               options={[
//                 { value: "", label: "All Products" },
//                 ...productOptions.map(product => ({ value: product, label: product }))
//               ]}
//               styles={customStyles}
//               placeholder="All Products"
//               isClearable
//               className="text-sm"
//             />
//           </div>

//           {/* Product Type */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Product Type
//             </label>
//             <Select
//               id="product-type-select"
//               name="productType"
//               value={filters.productType ? { value: filters.productType, label: filters.productType } : null}
//               onChange={(selectedOption) => {
//                 setFilters({ ...filters, productType: selectedOption ? selectedOption.value : "" });
//               }}
//               options={[
//                 { value: "", label: "All Product Types" },
//                 ...productTypeOptions.map(type => ({ value: type, label: type }))
//               ]}
//               styles={customStyles}
//               placeholder="All Product Types"
//               isClearable
//               className="text-sm"
//             />
//           </div>

//           {/* Status */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Status
//             </label>
//             <select
//               name="status"
//               value={filters.status}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             >
//               <option value="">All Status</option>
//               {statusOptions.map((status, index) => (
//                 <option key={index} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>

//           {/* Date In */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Date In (From)
//             </label>
//                           <div
//     className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode
//         ? "bg-gray-700 border-gray-600 text-gray-200"
//         : "bg-white border-gray-300 text-gray-700"
//     } sticky top-0 z-10`}
//   >
//             <DatePicker
//               selected={filters.dateIn ? parse(filters.dateIn, 'dd-MM-yyyy', new Date()) : null}
//               onChange={(date) => handleDateChange('dateIn', date)}
//               dateFormat="dd-MM-yyyy"
//               placeholderText="DD-MM-YYYY"
//               popperModifiers={{
//                 preventOverflow: {
//                   enabled: true,
//                   options: {
//                     padding: 10,
//                   },
//                 },
//                 zIndex: {
//                   enabled: true,
//                   order: 9999,
//                 },
//               }}
//             />
//           </div>
//           </div>


//           {/* Date Out */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Date Out
//             </label>
//               <div
//     className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode
//         ? "bg-gray-700 border-gray-600 text-gray-200"
//         : "bg-white border-gray-300 text-gray-700"
//     } sticky top-0 z-10`}
//   >
//             <DatePicker
//               selected={filters.dateOut ? parse(filters.dateOut, 'dd-MM-yyyy', new Date()) : null}
//               onChange={(date) => handleDateChange('dateOut', date)}
//               dateFormat="dd-MM-yyyy"
//               // className={`w-full px-3 py-2 text-sm rounded border ${
//               //   isDarkMode
//               //     ? "bg-gray-700 border-gray-600 text-gray-200"
//               //     : "bg-white border-gray-300 text-gray-700"
//               // }`}
//               placeholderText="DD-MM-YYYY"
//               popperModifiers={{
//                 preventOverflow: {
//                   enabled: true,
//                   options: {
//                     padding: 10,
//                   },
//                 },
//                 zIndex: {
//                   enabled: true,
//                   order: 9999,
//                 },
//               }}
//             />
//           </div>
//           </div>

//           {/* Case Status */}
//           <div className="mb-2">
//             <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//               Case Status
//             </label>
//             <select
//               name="caseStatus"
//               value={filters.caseStatus}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 text-sm rounded border ${
//                 isDarkMode
//                   ? "bg-gray-700 border-gray-600 text-gray-200"
//                   : "bg-white border-gray-300 text-gray-700"
//               }`}
//             >
//               <option value="">All Case Status</option>
//               {caseStatusOptions.map((status, index) => (
//                 <option key={index} value={status}>{status}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Vendor Name */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Vendor Name
//               </label>
//               <Select
//                 id="vendor-name-update-select"
//                 name="vendorName"
//                 value={updateFields.vendorName ? { 
//                   value: updateFields.vendorName, 
//                   label: updateFields.vendorName 
//                 } : null}
//                 onChange={(selectedOption) => {
//                   setUpdateFields({ 
//                     ...updateFields, 
//                     vendorName: selectedOption ? selectedOption.value : "" 
//                   });
//                 }}
//                 options={[
//                   { value: "", label: "Select Vendor" },
//                   ...vendorNames.map(vendor => ({ 
//                     value: vendor, 
//                     label: vendor 
//                   }))
//                 ]}
//                 styles={customStyles}
//                 placeholder="Select Vendor"
//                 isClearable
//                 className="text-sm"
//               />
//             </div>
            
//             {/* Case Status */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Case Status
//               </label>
//               <select
//                 value={updateFields.caseStatus}
//                 onChange={(e) => setUpdateFields({...updateFields, caseStatus: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 {caseStatusOptions.map((status, index) => (
//                   <option key={index} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Status */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Status
//               </label>
//               <select
//                 value={updateFields.status}
//                 onChange={(e) => setUpdateFields({...updateFields, status: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 {statusOptions.map((status, index) => (
//                   <option key={index} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Vendor Status */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Vendor Status
//               </label>
//               <select
//                 value={updateFields.vendorStatus}
//                 onChange={(e) => setUpdateFields({...updateFields, vendorStatus: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//               >
//                 <option value="">Select Status</option>
//                 <option value="Closed">Closed</option>
//                 <option value="Invalid">Invalid</option>
//                 <option value="CNV">CNV</option>
//                 <option value="Account Closed">Account Closed</option>
//                 <option value="Restricted Account">Restricted Account</option>
//                 <option value="Staff Account">Staff Account</option>
//                 <option value="Records Not Updated">Records Not Updated</option>
//                 <option value="Not Found">Not Found</option>
//                 <option value="Records Not Found">Records Not Found</option>
//               </select>
//             </div>

//             {/* Remarks */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Remarks
//               </label>
//               <textarea
//                 value={updateFields.remarks}
//                 onChange={(e) => setUpdateFields({...updateFields, remarks: e.target.value})}
//                 className={`w-full px-3 py-2 text-sm rounded border ${
//                   isDarkMode
//                     ? "bg-gray-700 border-gray-600 text-gray-200"
//                     : "bg-white border-gray-300 text-gray-700"
//                 }`}
//                 rows="1"
//               />
//             </div>

//             {/* Attachment */}
//             <div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Attachment
//               </label>
//               <div className="flex items-center">
//                 <input
//                   type="file"
//                   onChange={(e) => setUpdateFields({...updateFields, attachment: e.target.files[0]})}
//                   className={`w-full px-3 py-2 text-sm rounded border ${
//                     isDarkMode
//                       ? "bg-gray-700 border-gray-600 text-gray-200"
//                       : "bg-white border-gray-300 text-gray-700"
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className={`text-sm pt-2 border-t border-gray-200 dark:border-gray-700 ${
//             isDarkMode ? "text-gray-400" : "text-gray-500"
//           }`}>
//             {selectedRows?.length} record(s) selected
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterControls;










