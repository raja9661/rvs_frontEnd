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
import moment from "moment-timezone"


const FilterControls = ({ 
  filters, 
  setFilters, 
  isDarkMode,
  selectedRows,
  data,
  fetchTrackerData,
  setSelectedRows,
  deduceMode,
  handleDeduceClick
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
  const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "KYC", "STATEMENT","ACCOUNT CHECK","PAN SEARCH"]);
  const [statusOptions] = useState(["Pending", "Closed", "Negative", "CNV"]);
  const [caseStatusOptions] = useState(["New Pending", "Sent"]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [vendorNames, setVendorNames] = useState([]);
  const [role, setRole] = useState("");
  const productRef = useRef(null);
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [clientTypeOptions] = useState(["Agency","Corporate", "Other", "Unknown"]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

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
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchProductName(), fetchEmployeeNames(),fetchVendorNames()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchEmployeeNames = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employee names:", error);
        showNotification("Failed to fetch employee names", "error");
      }
    };

  const getFormattedDateTime = () => {
  return moment().tz("Asia/Kolkata").format("DD-MM-YYYY, hh:mm:ss A");
};
 const getFormattedDateDay = () => {
   return moment().format("DD-MM-YYYY, dddd");
 };

 const handleUpdate = async () => {
  if (selectedRows.length === 0) {
    toast.warning("Please select at least one row to update");
    return;
  }

  // Get truly unique caseIds from selected rows
  const caseIdMap = new Map();
  selectedRows.forEach(rowIndex => {
    const caseId = data[rowIndex]?.caseId;
    if (caseId) {
      caseIdMap.set(caseId, true);
    }
  });
  const caseIds = Array.from(caseIdMap.keys());

  if (caseIds.length === 0) {
    toast.error("No valid records selected for update");
    return;
  }

  // Vendor name validation
  if (updateFields.vendorName && !vendorNames.includes(updateFields.vendorName)) {
    toast.error("Selected vendor name is not valid. Please select a vendor from the dropdown.");
    return;
  }

  // Sent status validation
  if (updateFields.caseStatus === "Sent") {
    const alreadySentCases = selectedRows.filter(rowIndex => {
      const rowData = data[rowIndex];
      return rowData.caseStatus === "Sent";
    });

    if (alreadySentCases.length > 0) {
      const shouldProceed = window.confirm(
        `${alreadySentCases.length} selected case(s) are already marked as Sent. Do you want to update them anyway?`
      );
      if (!shouldProceed) return;
    }
  }

  // Closed status validation
  if (updateFields.status === "Closed" || updateFields.vendorStatus === "Closed") {
    const alreadyClosedCases = selectedRows.filter(rowIndex => {
      const rowData = data[rowIndex];
      return rowData.status === "Closed" || rowData.vendorStatus === "Closed";
    });

    if (alreadyClosedCases.length > 0) {
      const shouldProceed = window.confirm(
        `${alreadyClosedCases.length} selected case(s) are already Closed. Do you want to update them anyway?`
      );
      if (!shouldProceed) return;
    }

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
      status: updateFields.status,
      listByEmployee: selectedEmployee 
    };

    // Handle Closed status
    if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
      updates.dateOut = getFormattedDateTime();
      updates.dateOutInDay = getFormattedDateDay();
      updates.caseDoneBy = user.userId;
      if(deduceMode){
      updates.dedupBy =user.userId
    }
    }

    // Handle Sent status
    if (updates.caseStatus === "Sent" && user) {
      updates.sentBy = user.name;
      updates.sentDate = getFormattedDateTime();
      updates.sentDateInDay = getFormattedDateDay();
    }

    // Remove empty fields
    const nonEmptyUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );

    // Early return if no updates
    if (Object.keys(nonEmptyUpdates).length === 0 && !updateFields.attachment) {
      toast.warning("No update fields filled");
      return;
    }

    // Process attachment first if exists
    if (updateFields.attachment) {
      const file = updateFields.attachment;

  
  // if (file.size > 2 * 1024 * 1024) {
  //   alert('⚠️ Attachment size must be 2MB or less.');
  //   return; // Stop further execution
  // }
      const formData = new FormData();
      formData.append('file', file);
      caseIds.forEach(caseId => formData.append('caseIds', caseId));

      await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    }

    // Process other updates
    if (Object.keys(nonEmptyUpdates).length > 0) {
      const payload = { caseIds, updates: nonEmptyUpdates };
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
        payload
      );
      
      if (response.data?.success) {
        let successMessage;
        if (response.data.updatedCount === 0) {
          successMessage = "No updates needed (values were already set)";
        } else {
          successMessage = `Updated ${response.data.updatedCount} record(s) successfully`;
          if (response.data.clientTATUpdates > 0) {
            successMessage += ` (${response.data.clientTATUpdates} TATs calculated)`;
          }
        }
        toast.success(successMessage);
        
        if (response.data.errors?.length > 0) {
          response.data.errors.forEach(error => toast.warning(error));
        }
      } else {
        toast.error(response.data?.message || "Update failed");
      }
    } else if (updateFields.attachment) {
      toast.success(`Attachment uploaded for ${caseIds.length} record(s)`);
    }

    // Reset form
    setUpdateFields({
      vendorName: '',
      caseStatus: '',
      vendorStatus: '',
      remarks: '',
      status: '',
      attachment: null,
      selectedEmployee:""
    });
    setAttachmentFileName('');
    setSelectedRows([]);
    if(deduceMode){
      handleDeduceClick()
    }else{
    fetchTrackerData(true);
    }
  } catch (error) {
    console.error("Update error:", error);
    let errorMessage = "Update failed";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.join(", ");
    } else if (error.message) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
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




  // Update the resetFields function to reset the attachment field
const resetFields = () => {
  if (viewMode === 'filter') {
    setFilters({
      product: "",
      productType: "",
      dateIn: "",
      dateOut: "",
      status: "",
      caseStatus: "",
      vendorStatus: "",
    });
  } else {
    setUpdateFields({
      vendorName: '',
      caseStatus: '',
      vendorStatus: '',
      remarks: '',
      status: '',
      attachment: null // Reset attachment here
    });
    setAttachmentFileName(''); // Reset file name here
  }
};
useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if focus is not in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
      // Ctrl+D - Delete selected rows
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handleUpdate(true);
      }
      
      // Ctrl+E - Export data
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        resetFields();
      }
      
      
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        // <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

         {/* Date In Range */}
{/* <div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    Date In Range
  </label>
  <div className="flex gap-2">
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    }`}>
      <DatePicker
        selected={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateInStart: date ? format(date, 'dd-MM-yyyy') : '',
          dateIn: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="From"
        className="w-full"
      />
    </div>
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    }`}>
      <DatePicker
        selected={filters.dateInEnd ? parse(filters.dateInEnd, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateInEnd: date ? format(date, 'dd-MM-yyyy') : '',
          dateIn: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="To"
        className="w-full"
        minDate={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
      />
    </div>
  </div>
</div> */}

{/* Date Out Range */}
{/* <div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    Date Out Range
  </label>
  <div className="flex gap-2">
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    }`}>
      <DatePicker
        selected={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateOutStart: date ? format(date, 'dd-MM-yyyy') : '',
          dateOut: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="From"
        className="w-full"
      />
    </div>
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    }`}>
      <DatePicker
        selected={filters.dateOutEnd ? parse(filters.dateOutEnd, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateOutEnd: date ? format(date, 'dd-MM-yyyy') : '',
          dateOut: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="To"
        className="w-full"
        minDate={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
      />
    </div>
  </div>
</div> */}

{/* Date In Range */}
<div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    Date In Range
  </label>
  <div className="flex flex-col sm:flex-row gap-2">
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    } sticky top-0 z-10`}>
      <DatePicker
        selected={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateInStart: date ? format(date, 'dd-MM-yyyy') : '',
          dateIn: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="From Date"
        className="w-full"
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            options: {
              padding: 10,
            },
          },
          flip: {
            enabled: true,
          },
        }}
        popperPlacement="bottom-start"
      />
    </div>
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    } sticky top-0 z-10`}>
      <DatePicker
        selected={filters.dateInEnd ? parse(filters.dateInEnd, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateInEnd: date ? format(date, 'dd-MM-yyyy') : '',
          dateIn: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="To Date"
        className="w-full"
        minDate={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            options: {
              padding: 10,
            },
          },
          flip: {
            enabled: true,
          },
        }}
        popperPlacement="bottom-start"
      />
    </div>
  </div>
</div>

{/* Date Out Range */}
<div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    Date Out Range
  </label>
  <div className="flex flex-col sm:flex-row gap-2">
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    } sticky top-0 z-10`}>
      <DatePicker
        selected={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateOutStart: date ? format(date, 'dd-MM-yyyy') : '',
          dateOut: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="From Date"
        className="w-full"
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            options: {
              padding: 10,
            },
          },
          flip: {
            enabled: true,
          },
        }}
        popperPlacement="bottom-start"
      />
    </div>
    <div className={`w-full px-3 py-2 text-sm rounded border ${
      isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
    } sticky top-0 z-10`}>
      <DatePicker
        selected={filters.dateOutEnd ? parse(filters.dateOutEnd, 'dd-MM-yyyy', new Date()) : null}
        onChange={(date) => setFilters({...filters, 
          dateOutEnd: date ? format(date, 'dd-MM-yyyy') : '',
          dateOut: '' // Clear single date filter if using range
        })}
        dateFormat="dd-MM-yyyy"
        placeholderText="To Date"
        className="w-full"
        minDate={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            options: {
              padding: 10,
            },
          },
          flip: {
            enabled: true,
          },
        }}
        popperPlacement="bottom-start"
      />
    </div>
  </div>
</div>

{(role === "admin" || role === "employee") && (
  <>                    
{/* Send Date */}
<div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    Sent Date
  </label>
  <div className={`w-full px-3 py-2 text-sm rounded border ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-200"
      : "bg-white border-gray-300 text-gray-700"
    } sticky top-0 z-10`}>
    <DatePicker
      selected={filters.sentDate ? parse(filters.sentDate, 'dd-MM-yyyy', new Date()) : null}
      onChange={(date) => handleDateChange('sentDate', date)}
      dateFormat="dd-MM-yyyy"
      placeholderText="DD-MM-YYYY"
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
  </>
)}

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
  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

    {/* List of Employees */}
    {/* <div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    List of Employees 
  </label>
  <select
    className={`w-full p-3 rounded-lg border ${
      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
    } focus:ring-2 focus:ring-blue-500`}
    value={selectedEmployee || ""} 
    onChange={(e) => {
      console.log('Selected value:', e.target.value); 
      setSelectedEmployee(e.target.value);
    }}
  >
    <option value="">Select an Employee</option>
    {employees.map((emp) => {
      console.log('Employee option:', emp.name); 
      return (
        <option key={emp._id} value={emp.name}>
          {emp.name}
        </option>
      );
    })}
  </select>
  

  <div className="text-xs mt-1 text-gray-500">
    Current selection: {selectedEmployee || "None"}
  </div>
</div> */}
<div className="mb-2">
  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
    List of Employees
  </label>
  <Select
    id="employee-select"
    name="selectedEmployee"
    value={selectedEmployee ? { 
      value: selectedEmployee, 
      label: selectedEmployee 
    } : null}
    onChange={(selectedOption) => {
      setSelectedEmployee(selectedOption ? selectedOption.value : "");
    }}
    options={[
      { value: "", label: "Select an Employee" },
      ...employees.map(emp => ({ 
        value: emp.name, 
        label: emp.name 
      }))
    ]}
    styles={customStyles}
    placeholder="Select an Employee"
    isClearable
    isSearchable
    className="text-sm"
  />
</div>



    {/* Attachment with Drag and Drop */}
    {/* <div className="mb-2">
      <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        Attachment
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-4 transition-all duration-150 ${
          isDragging 
            ? 'border-blue-500 bg-blue-100/20' 
            : isDarkMode 
              ? 'border-gray-600 hover:border-gray-500' 
              : 'border-gray-300 hover:border-gray-400'
        } ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            const file = files[0];
            setUpdateFields({ ...updateFields, attachment: file });
            setAttachmentFileName(file.name);
          }
        }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <svg 
            className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isDragging ? 'Drop your file here' : 'Drag and drop your file here or'}
          </p>
          <label 
            htmlFor="attachment-upload"
            className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Browse Files
          </label>
          <input
            id="attachment-upload"
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              setUpdateFields({ ...updateFields, attachment: file });
              setAttachmentFileName(file ? file.name : '');
            }}
            className="hidden"
          />
        </div>
      </div>
      

      {attachmentFileName && (
        <div className={`mt-2 p-2 rounded flex items-center justify-between ${
          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
        }`}>
          <div className="flex items-center space-x-2">
            <svg 
              className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {attachmentFileName}
            </span>
          </div>
          <button 
            onClick={() => {
              setUpdateFields({ ...updateFields, attachment: null });
              setAttachmentFileName('');
            }}
            className={`p-0.5 rounded-full ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-blue-100 text-gray-500'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </div> */}
  </div>
<div className="w-full mb-2 col-span-1 md:col-span-2 lg:col-span-1">
  <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
    Attachment
  </label>
  <div 
    className={`w-full border-2 border-dashed rounded-lg p-2 sm:p-3 transition-all duration-150 ${
      isDragging 
        ? 'border-blue-500 bg-blue-100/20 scale-[1.01]' 
        : isDarkMode 
          ? 'border-gray-600 hover:border-gray-500' 
          : 'border-gray-300 hover:border-gray-400'
    } ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
    onDragEnter={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }}
    onDragOver={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }}
    onDragLeave={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }}
    onDrop={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        setUpdateFields({ ...updateFields, attachment: file });
        setAttachmentFileName(file.name);
      }
    }}
  >
    <div className="flex flex-col items-center justify-center text-center space-y-1.5">
      <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} transition-transform ${isDragging ? 'scale-105' : ''}`}>
        <svg 
          className={`w-4 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <div className="space-y-0.5">
        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isDragging ? 'Drop your file here!' : 'Drag & drop your file here'}
        </p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          or click to browse
        </p>
      </div>
      <label 
        htmlFor="attachment-upload"
        className={`px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium cursor-pointer transition-all transform hover:scale-105 ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
        }`}
      >
        Choose File
      </label>
      <input
        id="attachment-upload"
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          setUpdateFields({ ...updateFields, attachment: file });
          setAttachmentFileName(file ? file.name : '');
        }}
        className="hidden"
      />
    </div>
  </div>

  {/* Selected file info */}
  {attachmentFileName && (
    <div className={`mt-2 p-2 sm:p-2.5 rounded-lg flex items-center justify-between transition-all ${
      isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <div className={`p-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
          <svg 
            className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} title={attachmentFileName}>
          {attachmentFileName}
        </span>
      </div>
      <button 
        onClick={() => {
          setUpdateFields({ ...updateFields, attachment: null });
          setAttachmentFileName('');
        }}
        className={`ml-2 p-1 rounded-full transition-colors ${
          isDarkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-blue-100 text-gray-500 hover:text-red-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )}
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




// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Paperclip, Loader2 } from 'lucide-react';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, parse } from "date-fns";
// import AttachmentManager from "../../../AttachmentManager";
// import Select from "react-select";
// import moment from "moment-timezone"


// const FilterControls = ({ 
//   filters, 
//   setFilters, 
//   isDarkMode,
//   selectedRows,
//   data,
//   fetchTrackerData,
//   setSelectedRows,
//   deduceMode,
//   handleDeduceClick
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
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "KYC", "STATEMENT","ACCOUNT CHECK","PAN SEARCH"]);
//   const [statusOptions] = useState(["Pending", "Closed", "Negative", "CNV"]);
//   const [caseStatusOptions] = useState(["New Pending", "Sent"]);
//   const [showAttachmentModal, setShowAttachmentModal] = useState(false);
//   const [vendorNames, setVendorNames] = useState([]);
//   const [role, setRole] = useState("");
//   const productRef = useRef(null);
//   const [attachmentFileName, setAttachmentFileName] = useState('');
//   const [clientTypeOptions] = useState(["Agency","Corporate", "Other", "Unknown"]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");

//   useEffect(() => {
//       const getUser = localStorage.getItem("loginUser");
//       if (getUser) {
//         const data = JSON.parse(getUser);
//         setRole(data.role || "");
//       }
//     }, []);
  
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
//     const loadData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([fetchProductName(), fetchEmployeeNames(),fetchVendorNames()]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const fetchEmployeeNames = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
//         setEmployees(response.data);
//       } catch (error) {
//         console.error("Error fetching employee names:", error);
//         showNotification("Failed to fetch employee names", "error");
//       }
//     };

//   const getFormattedDateTime = () => {
//   return moment().tz("Asia/Kolkata").format("DD-MM-YYYY, hh:mm:ss A");
// };
//  const getFormattedDateDay = () => {
//    return moment().format("DD-MM-YYYY, dddd");
//  };

//  const handleUpdate = async () => {
//   if (selectedRows.length === 0) {
//     toast.warning("Please select at least one row to update");
//     return;
//   }

//   // Get truly unique caseIds from selected rows
//   const caseIdMap = new Map();
//   selectedRows.forEach(rowIndex => {
//     const caseId = data[rowIndex]?.caseId;
//     if (caseId) {
//       caseIdMap.set(caseId, true);
//     }
//   });
//   const caseIds = Array.from(caseIdMap.keys());

//   if (caseIds.length === 0) {
//     toast.error("No valid records selected for update");
//     return;
//   }

//   // Vendor name validation
//   if (updateFields.vendorName && !vendorNames.includes(updateFields.vendorName)) {
//     toast.error("Selected vendor name is not valid. Please select a vendor from the dropdown.");
//     return;
//   }

//   // Sent status validation
//   if (updateFields.caseStatus === "Sent") {
//     const alreadySentCases = selectedRows.filter(rowIndex => {
//       const rowData = data[rowIndex];
//       return rowData.caseStatus === "Sent";
//     });

//     if (alreadySentCases.length > 0) {
//       const shouldProceed = window.confirm(
//         `${alreadySentCases.length} selected case(s) are already marked as Sent. Do you want to update them anyway?`
//       );
//       if (!shouldProceed) return;
//     }
//   }

//   // Closed status validation
//   if (updateFields.status === "Closed" || updateFields.vendorStatus === "Closed") {
//     const alreadyClosedCases = selectedRows.filter(rowIndex => {
//       const rowData = data[rowIndex];
//       return rowData.status === "Closed" || rowData.vendorStatus === "Closed";
//     });

//     if (alreadyClosedCases.length > 0) {
//       const shouldProceed = window.confirm(
//         `${alreadyClosedCases.length} selected case(s) are already Closed. Do you want to update them anyway?`
//       );
//       if (!shouldProceed) return;
//     }

//     const casesWithoutSentDate = selectedRows.filter(rowIndex => {
//       const rowData = data[rowIndex];
//       return !rowData.sentDate;
//     });

//     if (casesWithoutSentDate.length > 0) {
//       toast.warning(
//         `${casesWithoutSentDate.length} selected case(s) don't have a sent date. ` +
//         `Please set case status to "Sent" first or skip these cases.`
//       );
//       return;
//     }
//   }

//   setIsUpdating(true);

//   try {
//     const getUser = localStorage.getItem("loginUser");
//     const user = getUser ? JSON.parse(getUser) : null;
    
//     const updates = {
//       vendorName: updateFields.vendorName,
//       caseStatus: updateFields.caseStatus,
//       vendorStatus: updateFields.vendorStatus,
//       remarks: updateFields.remarks,
//       status: updateFields.status,
//       listByEmployee: selectedEmployee 
//     };

//     // Handle Closed status
//     if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
//       updates.dateOut = getFormattedDateTime();
//       updates.dateOutInDay = getFormattedDateDay();
//       updates.caseDoneBy = user.userId;
//       if(deduceMode){
//       updates.dedupBy =user.userId
//     }
//     }

//     // Handle Sent status
//     if (updates.caseStatus === "Sent" && user) {
//       updates.sentBy = user.name;
//       updates.sentDate = getFormattedDateTime();
//       updates.sentDateInDay = getFormattedDateDay();
//     }

//     // Remove empty fields
//     const nonEmptyUpdates = Object.fromEntries(
//       Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
//     );

//     // Early return if no updates
//     if (Object.keys(nonEmptyUpdates).length === 0 && !updateFields.attachment) {
//       toast.warning("No update fields filled");
//       return;
//     }

//     // Process attachment first if exists
//     if (updateFields.attachment) {
//       const file = updateFields.attachment;

  
//   // if (file.size > 2 * 1024 * 1024) {
//   //   alert('⚠️ Attachment size must be 2MB or less.');
//   //   return; // Stop further execution
//   // }
//       const formData = new FormData();
//       formData.append('file', file);
//       caseIds.forEach(caseId => formData.append('caseIds', caseId));

//       await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );
//     }

//     // Process other updates
//     if (Object.keys(nonEmptyUpdates).length > 0) {
//       const payload = { caseIds, updates: nonEmptyUpdates };
//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
//         payload
//       );
      
//       if (response.data?.success) {
//         let successMessage;
//         if (response.data.updatedCount === 0) {
//           successMessage = "No updates needed (values were already set)";
//         } else {
//           successMessage = `Updated ${response.data.updatedCount} record(s) successfully`;
//           if (response.data.clientTATUpdates > 0) {
//             successMessage += ` (${response.data.clientTATUpdates} TATs calculated)`;
//           }
//         }
//         toast.success(successMessage);
        
//         if (response.data.errors?.length > 0) {
//           response.data.errors.forEach(error => toast.warning(error));
//         }
//       } else {
//         toast.error(response.data?.message || "Update failed");
//       }
//     } else if (updateFields.attachment) {
//       toast.success(`Attachment uploaded for ${caseIds.length} record(s)`);
//     }

//     // Reset form
//     setUpdateFields({
//       vendorName: '',
//       caseStatus: '',
//       vendorStatus: '',
//       remarks: '',
//       status: '',
//       attachment: null,
//       selectedEmployee:""
//     });
//     setAttachmentFileName('');
//     setSelectedRows([]);
//     if(deduceMode){
//       handleDeduceClick()
//     }else{
//     fetchTrackerData(true);
//     }
//   } catch (error) {
//     console.error("Update error:", error);
//     let errorMessage = "Update failed";
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.response?.data?.errors) {
//       errorMessage = error.response.data.errors.join(", ");
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
//     toast.error(errorMessage);
//   } finally {
//     setIsUpdating(false);
//   }
// };
  
// //    const handleUpdate = async () => {
// //   if (selectedRows.length === 0) {
// //     toast.warning("Please select at least one row to update");
// //     return;
// //   }

// //   const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
// //   if (caseIds.length === 0) {
// //     toast.error("No valid records selected for update");
// //     return;
// //   }

// //   // Check if the selected vendor name is valid
// //   if (updateFields.vendorName && !vendorNames.includes(updateFields.vendorName)) {
// //     toast.error("Selected vendor name is not valid. Please select a vendor from the dropdown.");
// //     return;
// //   }

// //   // Validate cases being sent
// //   if (updateFields.caseStatus === "Sent") {
// //     const alreadySentCases = selectedRows.filter(rowIndex => {
// //       const rowData = data[rowIndex];
// //       return rowData.caseStatus === "Sent";
// //     });

// //     if (alreadySentCases.length > 0) {
// //       const shouldProceed = window.confirm(
// //         `${alreadySentCases.length} selected case(s) are already marked as Sent. Do you want to update them anyway?`
// //       );
// //       if (!shouldProceed) return;
// //     }
// //   }

// //   // Validate cases being closed
// //   if (updateFields.status === "Closed" || updateFields.vendorStatus === "Closed") {
// //     const alreadyClosedCases = selectedRows.filter(rowIndex => {
// //       const rowData = data[rowIndex];
// //       return rowData.status === "Closed" || rowData.vendorStatus === "Closed";
// //     });

// //     if (alreadyClosedCases.length > 0) {
// //       const shouldProceed = window.confirm(
// //         `${alreadyClosedCases.length} selected case(s) are already Closed. Do you want to update them anyway?`
// //       );
// //       if (!shouldProceed) return;
// //     }

// //     // Check for cases without sent date
// //     const casesWithoutSentDate = selectedRows.filter(rowIndex => {
// //       const rowData = data[rowIndex];
// //       return !rowData.sentDate;
// //     });

// //     if (casesWithoutSentDate.length > 0) {
// //       toast.warning(
// //         `${casesWithoutSentDate.length} selected case(s) don't have a sent date. ` +
// //         `Please set case status to "Sent" first or skip these cases.`
// //       );
// //       return;
// //     }
// //   }

// //   setIsUpdating(true);

// //   try {
// //     const getUser = localStorage.getItem("loginUser");
// //     const user = getUser ? JSON.parse(getUser) : null;
    
// //     const updates = {
// //       vendorName: updateFields.vendorName,
// //       caseStatus: updateFields.caseStatus,
// //       vendorStatus: updateFields.vendorStatus,
// //       remarks: updateFields.remarks,
// //       status: updateFields.status
// //     };

// //     // Handle Closed status
// //     if ((updates.status === "Closed" || updates.vendorStatus === "Closed") && user) {
// //       updates.dateOut = getFormattedDateTime();
// //       updates.dateOutInDay = getFormattedDateDay();
// //       updates.caseDoneBy = user.name;
// //     }

// //     // Handle Sent status
// //     if (updates.caseStatus === "Sent" && user) {
// //       updates.sentBy = user.name;
// //       updates.sentDate = getFormattedDateTime();
// //       updates.sentDateInDay = getFormattedDateDay();
// //     }

// //     // Remove empty fields
// //     const nonEmptyUpdates = Object.fromEntries(
// //       Object.entries(updates).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
// //     );

// //     // Prepare the update payload
// //     const payload = { caseIds, updates: nonEmptyUpdates };

// //     // Process attachment first if exists
// //     if (updateFields.attachment) {
// //       const formData = new FormData();
// //       formData.append('file', updateFields.attachment);
      
// //       // Append each caseId individually
// //       caseIds.forEach(caseId => {
// //         formData.append('caseIds', caseId);
// //       });

// //       await axios.post(
// //         `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`,
// //         formData,
// //         { headers: { 'Content-Type': 'multipart/form-data' } }
// //       );
// //     }

// //     // Process other updates if any
// //     if (Object.keys(nonEmptyUpdates).length > 0) {
// //       const response = await axios.post(
// //         `${import.meta.env.VITE_Backend_Base_URL}/kyc/batch-update`,
// //         payload
// //       );
      
// //       if (response.data?.success) {
// //         let successMessage = `Updated ${response.data.updatedCount} record(s) successfully`;
// //         if (response.data.clientTATUpdates > 0) {
// //           successMessage += ` (${response.data.clientTATUpdates} TATs calculated)`;
// //         }
// //         toast.success(successMessage);
        
// //         if (response.data.errors?.length > 0) {
// //           response.data.errors.forEach(error => toast.warning(error));
// //         }
// //       } else {
// //         toast.error(response.data?.message || "Update failed");
// //       }
// //     } else if (updateFields.attachment) {
// //       toast.success("Attachment uploaded successfully");
// //     } else {
// //       toast.warning("No update fields filled");
// //     }

// //     // Reset form
// //     setUpdateFields({
// //       vendorName: '',
// //       caseStatus: '',
// //       vendorStatus: '',
// //       remarks: '',
// //       status: '',
// //       attachment: null,
// //     });
// //     setAttachmentFileName('');
// //     setSelectedRows([]);
// //     fetchTrackerData(true);
// //   } catch (error) {
// //     console.error("Update error:", error);
// //     let errorMessage = "Update failed";
    
// //     if (error.response) {
// //       if (error.response.data?.message) {
// //         errorMessage = error.response.data.message;
// //       } else if (error.response.data?.errors) {
// //         errorMessage = error.response.data.errors.join(", ");
// //       }
// //     } else if (error.message) {
// //       errorMessage = error.message;
// //     }
    
// //     toast.error(errorMessage);
// //   } finally {
// //     setIsUpdating(false);
// //   }
// // };

//   const handleDateChange = (name, date) => {
//       const formattedDate = date ? format(date, 'dd-MM-yyyy') : '';
//       setFilters({ ...filters, [name]: formattedDate });
//     };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({ ...filters, [name]: value });
//   };

//   // const resetFields = () => {
//   //   if (viewMode === 'filter') {
//   //     setFilters({
//   //       product: "",
//   //       productType: "",
//   //       dateIn: "",//update line
//   //       dateOut: "",//update line
//   //       status: "",
//   //       caseStatus: "",
//   //     });
//   //   } else {
//   //     setUpdateFields({
//   //       vendorName: '',
//   //       caseStatus: '',
//   //       vendorStatus: '',
//   //       remarks: '',
//   //       status: '',
//   //       attachment: null
//   //     });
//   //   }
//   // };


//   // Update the resetFields function to reset the attachment field
// const resetFields = () => {
//   if (viewMode === 'filter') {
//     setFilters({
//       product: "",
//       productType: "",
//       dateIn: "",
//       dateOut: "",
//       status: "",
//       caseStatus: "",
//       vendorStatus: "",
//     });
//   } else {
//     setUpdateFields({
//       vendorName: '',
//       caseStatus: '',
//       vendorStatus: '',
//       remarks: '',
//       status: '',
//       attachment: null // Reset attachment here
//     });
//     setAttachmentFileName(''); // Reset file name here
//   }
// };
// useEffect(() => {
//     const handleKeyDown = (e) => {
//       // Check if focus is not in an input/textarea
//       if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      
//       // Ctrl+D - Delete selected rows
//       if (e.ctrlKey && e.key === 'm') {
//         e.preventDefault();
//         handleUpdate(true);
//       }
      
//       // Ctrl+E - Export data
//       if (e.ctrlKey && e.key === 'b') {
//         e.preventDefault();
//         resetFields();
//       }
      
      
//     };
  
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

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
//     <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
//       <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex">
//           <button
//             onClick={() => setViewMode('filter')}
//             className={toggleButtonClass(viewMode === 'filter')}
//           >
//             Filter
//           </button>
//           {(role === "admin" || role === "employee") && (
//                   <button
//             onClick={() => setViewMode('update')}
//             className={toggleButtonClass(viewMode === 'update')}
//           >
//             Update
//           </button>
//                 )}
          
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
//               className="text-sm  z-20"
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
//               className="text-sm  z-20"
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

//          {/* Date In Range */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Date In Range
//   </label>
//   <div className="flex gap-2">
//     <div className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
//     }`}>
//       <DatePicker
//         selected={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
//         onChange={(date) => setFilters({...filters, 
//           dateInStart: date ? format(date, 'dd-MM-yyyy') : '',
//           dateIn: '' // Clear single date filter if using range
//         })}
//         dateFormat="dd-MM-yyyy"
//         placeholderText="From"
//         className="w-full"
//       />
//     </div>
//     <div className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
//     }`}>
//       <DatePicker
//         selected={filters.dateInEnd ? parse(filters.dateInEnd, 'dd-MM-yyyy', new Date()) : null}
//         onChange={(date) => setFilters({...filters, 
//           dateInEnd: date ? format(date, 'dd-MM-yyyy') : '',
//           dateIn: '' // Clear single date filter if using range
//         })}
//         dateFormat="dd-MM-yyyy"
//         placeholderText="To"
//         className="w-full"
//         minDate={filters.dateInStart ? parse(filters.dateInStart, 'dd-MM-yyyy', new Date()) : null}
//       />
//     </div>
//   </div>
// </div>

// {/* Date Out Range */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Date Out Range
//   </label>
//   <div className="flex gap-2">
//     <div className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
//     }`}>
//       <DatePicker
//         selected={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
//         onChange={(date) => setFilters({...filters, 
//           dateOutStart: date ? format(date, 'dd-MM-yyyy') : '',
//           dateOut: '' // Clear single date filter if using range
//         })}
//         dateFormat="dd-MM-yyyy"
//         placeholderText="From"
//         className="w-full"
//       />
//     </div>
//     <div className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-700"
//     }`}>
//       <DatePicker
//         selected={filters.dateOutEnd ? parse(filters.dateOutEnd, 'dd-MM-yyyy', new Date()) : null}
//         onChange={(date) => setFilters({...filters, 
//           dateOutEnd: date ? format(date, 'dd-MM-yyyy') : '',
//           dateOut: '' // Clear single date filter if using range
//         })}
//         dateFormat="dd-MM-yyyy"
//         placeholderText="To"
//         className="w-full"
//         minDate={filters.dateOutStart ? parse(filters.dateOutStart, 'dd-MM-yyyy', new Date()) : null}
//       />
//     </div>
//   </div>
// </div>


// {(role === "admin" || role === "employee") && (
//   <>                    
// {/* Send Date */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Sent Date
//   </label>
//   <div className={`w-full px-3 py-2 text-sm rounded border ${
//     isDarkMode
//       ? "bg-gray-700 border-gray-600 text-gray-200"
//       : "bg-white border-gray-300 text-gray-700"
//     } sticky top-0 z-10`}>
//     <DatePicker
//       selected={filters.sentDate ? parse(filters.sentDate, 'dd-MM-yyyy', new Date()) : null}
//       onChange={(date) => handleDateChange('sentDate', date)}
//       dateFormat="dd-MM-yyyy"
//       placeholderText="DD-MM-YYYY"
//       popperModifiers={{
//         preventOverflow: {
//           enabled: true,
//           options: {
//             padding: 10,
//           },
//         },
//         zIndex: {
//           enabled: true,
//           order: 9999,
//         },
//       }}
//     />
//   </div>
// </div>
//   </>
// )}

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
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//     {/* Vendor Name */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         Vendor Name
//       </label>
//       <Select
//         id="vendor-name-update-select"
//         name="vendorName"
//         value={updateFields.vendorName ? { 
//           value: updateFields.vendorName, 
//           label: updateFields.vendorName 
//         } : null}
//         onChange={(selectedOption) => {
//           setUpdateFields({ 
//             ...updateFields, 
//             vendorName: selectedOption ? selectedOption.value : "" 
//           });
//         }}
//         options={[
//           { value: "", label: "Select Vendor" },
//           ...vendorNames.map(vendor => ({ 
//             value: vendor, 
//             label: vendor 
//           }))
//         ]}
//         styles={customStyles}
//         placeholder="Select Vendor"
//         isClearable
//         className="text-sm"
//       />
//     </div>

//     {/* Case Status */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         Case Status
//       </label>
//       <select
//         value={updateFields.caseStatus}
//         onChange={(e) => setUpdateFields({...updateFields, caseStatus: e.target.value})}
//         className={`w-full px-3 py-2 text-sm rounded border ${
//           isDarkMode
//             ? "bg-gray-700 border-gray-600 text-gray-200"
//             : "bg-white border-gray-300 text-gray-700"
//         }`}
//       >
//         <option value="">Select Status</option>
//         {caseStatusOptions.map((status, index) => (
//           <option key={index} value={status}>{status}</option>
//         ))}
//       </select>
//     </div>

//     {/* Status */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         Status
//       </label>
//       <select
//         value={updateFields.status}
//         onChange={(e) => setUpdateFields({...updateFields, status: e.target.value})}
//         className={`w-full px-3 py-2 text-sm rounded border ${
//           isDarkMode
//             ? "bg-gray-700 border-gray-600 text-gray-200"
//             : "bg-white border-gray-300 text-gray-700"
//         }`}
//       >
//         <option value="">Select Status</option>
//         {statusOptions.map((status, index) => (
//           <option key={index} value={status}>{status}</option>
//         ))}
//       </select>
//     </div>

//     {/* Vendor Status */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         Vendor Status
//       </label>
//       <select
//         value={updateFields.vendorStatus}
//         onChange={(e) => setUpdateFields({...updateFields, vendorStatus: e.target.value})}
//         className={`w-full px-3 py-2 text-sm rounded border ${
//           isDarkMode
//             ? "bg-gray-700 border-gray-600 text-gray-200"
//             : "bg-white border-gray-300 text-gray-700"
//         }`}
//       >
//         <option value="">Select Status</option>
//         <option value="Closed">Closed</option>
//         <option value="Invalid">Invalid</option>
//         <option value="CNV">CNV</option>
//         <option value="Account Closed">Account Closed</option>
//         <option value="Restricted Account">Restricted Account</option>
//         <option value="Staff Account">Staff Account</option>
//         <option value="Records Not Updated">Records Not Updated</option>
//         <option value="Not Found">Not Found</option>
//         <option value="Records Not Found">Records Not Found</option>
//       </select>
//     </div>

//     {/* Remarks */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         Remarks
//       </label>
//       <textarea
//         value={updateFields.remarks}
//         onChange={(e) => setUpdateFields({...updateFields, remarks: e.target.value})}
//         className={`w-full px-3 py-2 text-sm rounded border ${
//           isDarkMode
//             ? "bg-gray-700 border-gray-600 text-gray-200"
//             : "bg-white border-gray-300 text-gray-700"
//         }`}
//         rows="1"
//       />
//     </div>
//     <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     List of Employees
//   </label>
//   <select
//     className={`w-full p-3 rounded-lg border ${
//       isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//     } focus:ring-2 focus:ring-blue-500`}
//     value={selectedEmployee || ""} // Ensure fallback to empty string
//     onChange={(e) => {
//       console.log('Selected value:', e.target.value); // Debugging
//       setSelectedEmployee(e.target.value);
//     }}
//   >
//     <option value="">Select an Employee</option>
//     {employees.map((emp) => {
//       console.log('Employee option:', emp.name); // Debugging
//       return (
//         <option key={emp._id} value={emp.name}>
//           {emp.name}
//         </option>
//       );
//     })}
//   </select>
  
//   {/* Debug output */}
//   <div className="text-xs mt-1 text-gray-500">
//     Current selection: {selectedEmployee || "None"}
//   </div>
// </div>
//     {/* <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//         List of Employees
//       </label>
//       <select
//                     className={`w-full p-3 rounded-lg border ${
//                       isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
//                     } focus:ring-2 focus:ring-blue-500`}
//                     value={selectedEmployee}
//                     onChange={(e) => setSelectedEmployee(e.target.value)}
//                   >
//                     <option value="">Select an Employee</option>
//                     {employees.map((emp) => (
//                       <option key={emp._id} value={emp.name}>{emp.name}</option>
//                     ))}
//                   </select>
//     </div> */}

//     {/* Attachment with Drag and Drop */}
//     <div className="mb-2">
//       <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//         Attachment
//       </label>
//       <div 
//         className={`border-2 border-dashed rounded-lg p-4 transition-all duration-150 ${
//           isDragging 
//             ? 'border-blue-500 bg-blue-100/20' 
//             : isDarkMode 
//               ? 'border-gray-600 hover:border-gray-500' 
//               : 'border-gray-300 hover:border-gray-400'
//         } ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
//         onDragEnter={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsDragging(true);
//         }}
//         onDragOver={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsDragging(true);
//         }}
//         onDragLeave={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsDragging(false);
//         }}
//         onDrop={(e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           setIsDragging(false);
          
//           const files = e.dataTransfer.files;
//           if (files.length > 0) {
//             const file = files[0];
//             setUpdateFields({ ...updateFields, attachment: file });
//             setAttachmentFileName(file.name);
//           }
//         }}
//       >
//         <div className="flex flex-col items-center justify-center text-center">
//           <svg 
//             className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
//             fill="none" 
//             stroke="currentColor" 
//             viewBox="0 0 24 24" 
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               strokeWidth="2" 
//               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//             ></path>
//           </svg>
//           <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//             {isDragging ? 'Drop your file here' : 'Drag and drop your file here or'}
//           </p>
//           <label 
//             htmlFor="attachment-upload"
//             className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
//               isDarkMode
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                 : 'bg-blue-500 hover:bg-blue-600 text-white'
//             }`}
//           >
//             Browse Files
//           </label>
//           <input
//             id="attachment-upload"
//             type="file"
//             onChange={(e) => {
//               const file = e.target.files[0];
//               setUpdateFields({ ...updateFields, attachment: file });
//               setAttachmentFileName(file ? file.name : '');
//             }}
//             className="hidden"
//           />
//         </div>
//       </div>
      
//       {/* Selected file info */}
//       {attachmentFileName && (
//         <div className={`mt-2 p-2 rounded flex items-center justify-between ${
//           isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
//         }`}>
//           <div className="flex items-center space-x-2">
//             <svg 
//               className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24" 
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round" 
//                 strokeWidth="2" 
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               ></path>
//             </svg>
//             <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//               {attachmentFileName}
//             </span>
//           </div>
//           <button 
//             onClick={() => {
//               setUpdateFields({ ...updateFields, attachment: null });
//               setAttachmentFileName('');
//             }}
//             className={`p-0.5 rounded-full ${
//               isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-blue-100 text-gray-500'
//             }`}
//           >
//             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         </div>
//       )}
//     </div>
    
//   </div>

//   <div className={`text-sm pt-2 border-t border-gray-200 dark:border-gray-700 ${
//     isDarkMode ? "text-gray-400" : "text-gray-500"
//   }`}>
//     {selectedRows?.length} record(s) selected
//   </div>
// </div>
// //         <div className="space-y-4">
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //             {/* Vendor Name */}
// //             <div className="mb-2">
// //               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
// //                 Vendor Name
// //               </label>
// //               <Select
// //                 id="vendor-name-update-select"
// //                 name="vendorName"
// //                 value={updateFields.vendorName ? { 
// //                   value: updateFields.vendorName, 
// //                   label: updateFields.vendorName 
// //                 } : null}
// //                 onChange={(selectedOption) => {
// //                   setUpdateFields({ 
// //                     ...updateFields, 
// //                     vendorName: selectedOption ? selectedOption.value : "" 
// //                   });
// //                 }}
// //                 options={[
// //                   { value: "", label: "Select Vendor" },
// //                   ...vendorNames.map(vendor => ({ 
// //                     value: vendor, 
// //                     label: vendor 
// //                   }))
// //                 ]}
// //                 styles={customStyles}
// //                 placeholder="Select Vendor"
// //                 isClearable
// //                 className="text-sm"
// //               />
// //             </div>



            
// //             {/* Case Status */}
// //             <div className="mb-2">
// //               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
// //                 Case Status
// //               </label>
// //               <select
// //                 value={updateFields.caseStatus}
// //                 onChange={(e) => setUpdateFields({...updateFields, caseStatus: e.target.value})}
// //                 className={`w-full px-3 py-2 text-sm rounded border ${
// //                   isDarkMode
// //                     ? "bg-gray-700 border-gray-600 text-gray-200"
// //                     : "bg-white border-gray-300 text-gray-700"
// //                 }`}
// //               >
// //                 <option value="">Select Status</option>
// //                 {caseStatusOptions.map((status, index) => (
// //                   <option key={index} value={status}>{status}</option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Status */}
// //             <div className="mb-2">
// //               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
// //                 Status
// //               </label>
// //               <select
// //                 value={updateFields.status}
// //                 onChange={(e) => setUpdateFields({...updateFields, status: e.target.value})}
// //                 className={`w-full px-3 py-2 text-sm rounded border ${
// //                   isDarkMode
// //                     ? "bg-gray-700 border-gray-600 text-gray-200"
// //                     : "bg-white border-gray-300 text-gray-700"
// //                 }`}
// //               >
// //                 <option value="">Select Status</option>
// //                 {statusOptions.map((status, index) => (
// //                   <option key={index} value={status}>{status}</option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Vendor Status */}
// //             <div className="mb-2">
// //               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
// //                 Vendor Status
// //               </label>
// //               <select
// //                 value={updateFields.vendorStatus}
// //                 onChange={(e) => setUpdateFields({...updateFields, vendorStatus: e.target.value})}
// //                 className={`w-full px-3 py-2 text-sm rounded border ${
// //                   isDarkMode
// //                     ? "bg-gray-700 border-gray-600 text-gray-200"
// //                     : "bg-white border-gray-300 text-gray-700"
// //                 }`}
// //               >
// //                 <option value="">Select Status</option>
// //                 <option value="Closed">Closed</option>
// //                 <option value="Invalid">Invalid</option>
// //                 <option value="CNV">CNV</option>
// //                 <option value="Account Closed">Account Closed</option>
// //                 <option value="Restricted Account">Restricted Account</option>
// //                 <option value="Staff Account">Staff Account</option>
// //                 <option value="Records Not Updated">Records Not Updated</option>
// //                 <option value="Not Found">Not Found</option>
// //                 <option value="Records Not Found">Records Not Found</option>
// //               </select>
// //             </div>

// //             {/* Remarks */}
// //             <div className="mb-2">
// //               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
// //                 Remarks
// //               </label>
// //               <textarea
// //                 value={updateFields.remarks}
// //                 onChange={(e) => setUpdateFields({...updateFields, remarks: e.target.value})}
// //                 className={`w-full px-3 py-2 text-sm rounded border ${
// //                   isDarkMode
// //                     ? "bg-gray-700 border-gray-600 text-gray-200"
// //                     : "bg-white border-gray-300 text-gray-700"
// //                 }`}
// //                 rows="1"
// //               />
// //             </div>

// // <div className="mb-2">
// //   <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
// //     Attachment
// //   </label>
// //   <div className="flex items-center gap-2">
// //     <input
// //       type="file"
// //       onChange={(e) => {
// //         const file = e.target.files[0];
// //         setUpdateFields({ ...updateFields, attachment: file });
// //         setAttachmentFileName(file ? file.name : '');
// //       }}
// //       className={`w-full px-3 py-1 text-sm rounded border shadow-sm transition-all duration-150 cursor-pointer file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium ${
// //         isDarkMode
// //           ? "bg-gray-700 border-gray-600 text-gray-200 file:bg-gray-600 file:text-gray-200"
// //           : "bg-white border-gray-300 text-gray-700 file:bg-gray-100 file:text-gray-700"
// //       }`}
// //     />
// //     <div className="mt-1 text-m text-gray-500 truncate">
// //       {attachmentFileName || "No file chosen"}
// //     </div>
// //   </div>
// // </div>

// //           </div>

// //           <div className={`text-sm pt-2 border-t border-gray-200 dark:border-gray-700 ${
// //             isDarkMode ? "text-gray-400" : "text-gray-500"
// //           }`}>
// //             {selectedRows?.length} record(s) selected
// //           </div>
// //         </div>
//       )}
//     </div>
//   );
// };

// export default FilterControls;




// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Paperclip, Loader2 } from 'lucide-react';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, parse } from "date-fns";
// import AttachmentManager from "../../../AttachmentManager";
// import Select from "react-select";
// import moment from "moment-timezone"


// const FilterControls = ({ 
//   filters, 
//   setFilters, 
//   isDarkMode,
//   selectedRows,
//   data,
//   fetchTrackerData,
//   setSelectedRows 
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
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "NYC", "STATEMENT"]);
//   const [statusOptions] = useState(["Pending", "Closed", "Negative", "CNV"]);
//   const [caseStatusOptions] = useState(["New Pending", "Sent"]);
//   const [showAttachmentModal, setShowAttachmentModal] = useState(false);
//   const [vendorNames, setVendorNames] = useState([]);
//   const [role, setRole] = useState("");
//   const productRef = useRef(null);
//   const [attachmentFileName, setAttachmentFileName] = useState('');
//   const [clientTypeOptions] = useState(["Agency","Corporate", "Other", "Unknown"]);

//   useEffect(() => {
//       const getUser = localStorage.getItem("loginUser");
//       if (getUser) {
//         const data = JSON.parse(getUser);
//         setRole(data.role || "");
//       }
//     }, []);
  
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

//   const getFormattedDateTime = () => {
//   return moment().tz("Asia/Kolkata").format("DD-MM-YYYY, hh:mm:ss A");
// };
//  const getFormattedDateDay = () => {
//    return moment().format("DD-MM-YYYY, dddd");
//  };

  
  
//   const handleUpdate = async () => {
//     if (selectedRows.length === 0) {
//       toast.warning("Please select at least one row to update");
//       return;
//     }

//     const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
//     if (caseIds.length === 0) {
//       toast.error("No valid records selected for update");
//       return;
//     }

//       // Check if the selected vendor name is valid
//   if (updateFields.vendorName && !vendorNames.includes(updateFields.vendorName)) {
//     toast.error("Selected vendor name is not valid. Please select a vendor from the dropdown.");
//     return;
//   }

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
//         updates.dateOutInDay = getFormattedDateDay()
//         updates.caseDoneBy = user.name;
//       }

//       // Handle Sent status
//       if (updates.caseStatus === "Sent" && user) {
//         updates.sentBy = user.name;
//         updates.sentDate = getFormattedDateTime();
//         updates.sentDateInDay = getFormattedDateDay()
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
//         attachment: null,
//       });
//       setAttachmentFileName('')
//       setSelectedRows([]);
//       fetchTrackerData(true);
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error(error.response?.data?.message || error.message || "Update failed");
//     } finally {
//       setIsUpdating(false);
//     }
//   };
//   const handleDateChange = (name, date) => {
//       const formattedDate = date ? format(date, 'dd-MM-yyyy') : '';
//       setFilters({ ...filters, [name]: formattedDate });
//     };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({ ...filters, [name]: value });
//   };

//   // const resetFields = () => {
//   //   if (viewMode === 'filter') {
//   //     setFilters({
//   //       product: "",
//   //       productType: "",
//   //       dateIn: "",//update line
//   //       dateOut: "",//update line
//   //       status: "",
//   //       caseStatus: "",
//   //     });
//   //   } else {
//   //     setUpdateFields({
//   //       vendorName: '',
//   //       caseStatus: '',
//   //       vendorStatus: '',
//   //       remarks: '',
//   //       status: '',
//   //       attachment: null
//   //     });
//   //   }
//   // };


//   // Update the resetFields function to reset the attachment field
// const resetFields = () => {
//   if (viewMode === 'filter') {
//     setFilters({
//       product: "",
//       productType: "",
//       dateIn: "",
//       dateOut: "",
//       status: "",
//       caseStatus: "",
//       vendorStatus: "",
//     });
//   } else {
//     setUpdateFields({
//       vendorName: '',
//       caseStatus: '',
//       vendorStatus: '',
//       remarks: '',
//       status: '',
//       attachment: null // Reset attachment here
//     });
//     setAttachmentFileName(''); // Reset file name here
//   }
// };

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
//     <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
//       <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700">
//         <div className="flex">
//           <button
//             onClick={() => setViewMode('filter')}
//             className={toggleButtonClass(viewMode === 'filter')}
//           >
//             Filter
//           </button>
//           {(role === "admin" || role === "employee") && (
//                   <button
//             onClick={() => setViewMode('update')}
//             className={toggleButtonClass(viewMode === 'update')}
//           >
//             Update
//           </button>
//                 )}
          
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
//               className="text-sm  z-20"
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
//               className="text-sm  z-20"
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
//                       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                         Date In
//                       </label>
//                       <div className={`w-full px-3 py-2 text-sm rounded border ${
//                         isDarkMode
//                           ? "bg-gray-700 border-gray-600 text-gray-200"
//                           : "bg-white border-gray-300 text-gray-700"
//                         } sticky top-0 z-10`}>
//                         <DatePicker
//                           selected={filters.dateIn ? parse(filters.dateIn, 'dd-MM-yyyy', new Date()) : null}
//                           onChange={(date) => handleDateChange('dateIn', date)}
//                           dateFormat="dd-MM-yyyy"
//                           placeholderText="DD-MM-YYYY"
//                           // className={datePickerCustomClass}
//                           popperModifiers={{
//                             preventOverflow: {
//                               enabled: true,
//                               options: {
//                                 padding: 10,
//                               },
//                             },
//                             zIndex: {
//                               enabled: true,
//                               order: 9999,
//                             },
//                           }}
//                         />
//                       </div>
//                     </div>
          
          
          
//                     {/* Date Out */}
//                     <div className="mb-2">
//                       <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                         Date Out
//                       </label>
//                       <div className={`w-full px-3 py-2 text-sm rounded border ${
//                         isDarkMode
//                           ? "bg-gray-700 border-gray-600 text-gray-200"
//                           : "bg-white border-gray-300 text-gray-700"
//                         } sticky top-0 z-10`}>
//                         <DatePicker
//                           selected={filters.dateOut ? parse(filters.dateOut, 'dd-MM-yyyy', new Date()) : null}
//                           onChange={(date) => handleDateChange('dateOut', date)}
//                           dateFormat="dd-MM-yyyy"
//                           placeholderText="DD-MM-YYYY"
//                           // className={datePickerCustomClass}
//                           popperModifiers={{
//                             preventOverflow: {
//                               enabled: true,
//                               options: {
//                                 padding: 10,
//                               },
//                             },
//                             zIndex: {
//                               enabled: true,
//                               order: 9999,
//                             },
//                           }}
//                         />
//                       </div>
//                     </div>


                    
// {/* Send Date */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Sent Date
//   </label>
//   <div className={`w-full px-3 py-2 text-sm rounded border ${
//     isDarkMode
//       ? "bg-gray-700 border-gray-600 text-gray-200"
//       : "bg-white border-gray-300 text-gray-700"
//     } sticky top-0 z-10`}>
//     <DatePicker
//       selected={filters.sentDate ? parse(filters.sentDate, 'dd-MM-yyyy', new Date()) : null}
//       onChange={(date) => handleDateChange('sentDate', date)}
//       dateFormat="dd-MM-yyyy"
//       placeholderText="DD-MM-YYYY"
//       popperModifiers={{
//         preventOverflow: {
//           enabled: true,
//           options: {
//             padding: 10,
//           },
//         },
//         zIndex: {
//           enabled: true,
//           order: 9999,
//         },
//       }}
//     />
//   </div>
// </div>


// {/* Vendor Status */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Vendor Status
//   </label>
//   <select
//     name="vendorStatus"
//     value={filters.vendorStatus}
//     onChange={handleInputChange}
//     className={`w-full px-3 py-2 text-sm rounded border ${
//       isDarkMode
//         ? "bg-gray-700 border-gray-600 text-gray-200"
//         : "bg-white border-gray-300 text-gray-700"
//     }`}
//   >
//     <option value="">All Vendor Status</option>
//     {["Closed", "Invalid", "CNV", "Account Closed", "Restricted Account", "Staff Account", "Records Not Updated", "Not Found", "Records Not Found"].map((status, index) => (
//       <option key={index} value={status}>{status}</option>
//     ))}
//   </select>
// </div>

// {/* // Client Type Dropdown */}
// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//     Client Type
//   </label>
//   <Select
//     id="client-type-select"
//     name="clientType"
//     value={filters.clientType ? { value: filters.clientType, label: filters.clientType } : null}
//     onChange={(selectedOption) => {
//       setFilters({ ...filters, clientType: selectedOption ? selectedOption.value : "" });
//     }}
//     options={[
//       { value: "", label: "All Client Types" },
//       ...clientTypeOptions.map(type => ({ value: type, label: type })) // Use fetched client types
//     ]}
//     styles={customStyles}
//     placeholder="All Client Types"
//     isClearable
//     className="text-sm z-20"
//   />
// </div>


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
//             {/*<div className="mb-2">
//               <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
//                 Attachment
//               </label>
//               <div className="flex items-center">*/}
//                 {/* <input
//                   type="file"
//                   onChange={(e) => setUpdateFields({...updateFields, attachment: e.target.files[0]})}
//                   className={`w-full px-3 py-2 text-sm rounded border ${
//                     isDarkMode
//                       ? "bg-gray-700 border-gray-600 text-gray-200"
//                       : "bg-white border-gray-300 text-gray-700"
//                   }`}
//                 /> */}
//               {/*    <input
//      type="file"
//      onChange={(e) => {
//        const file = e.target.files[0];
//        setUpdateFields({...updateFields, attachment: file});
//        setAttachmentFileName(file ? file.name : '');
//      }}
//      className={`w-full px-3 py-2 text-sm rounded border ${
//        isDarkMode
//          ? "bg-gray-700 border-gray-600 text-gray-200"
//          : "bg-white border-gray-300 text-gray-700"
//      }`}
//    />
//     <div className="mt-1 text-sm text-gray-500">
//      {attachmentFileName || "No file chosen"}
//    </div>
//               </div>
//             </div> */}

// <div className="mb-2">
//   <label className={`block text-sm font-medium mb-1 transition-colors duration-150 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
//     Attachment
//   </label>
//   <div className="flex items-center gap-2">
//     <input
//       type="file"
//       onChange={(e) => {
//         const file = e.target.files[0];
//         setUpdateFields({ ...updateFields, attachment: file });
//         setAttachmentFileName(file ? file.name : '');
//       }}
//       className={`w-full px-3 py-1 text-sm rounded border shadow-sm transition-all duration-150 cursor-pointer file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium ${
//         isDarkMode
//           ? "bg-gray-700 border-gray-600 text-gray-200 file:bg-gray-600 file:text-gray-200"
//           : "bg-white border-gray-300 text-gray-700 file:bg-gray-100 file:text-gray-700"
//       }`}
//     />
//     <div className="mt-1 text-m text-gray-500 truncate">
//       {attachmentFileName || "No file chosen"}
//     </div>
//   </div>
// </div>

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
