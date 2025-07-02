import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../Layout/Layout";
import Select from 'react-select';
import { Search, Save, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const VendorManagement = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({
    name: "",
    type: "other",
    products: []
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    vendorName: "", 
    products: [], 
    vendorType: "other" 
  });
  const [viewMode, setViewMode] = useState("type"); // 'type' or 'all'
  const [vendorType, setVendorType] = useState("default"); // 'default' or 'other'
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme detection
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toast timer
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_Backend_Base_URL}/mapping/getProducts`
        );
        console.log(response)
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        showToast("Failed to fetch products", "error");
      }
    };
    fetchProducts();
  }, []);

  // Fetch vendors based on view mode
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const url = viewMode === "all" 
        ? `${import.meta.env.VITE_Backend_Base_URL}/mapping/getAllVendors`
        : `${import.meta.env.VITE_Backend_Base_URL}/mapping/type/${vendorType}`;
      
      const response = await axios.get(url, {
        params: {
          page,
          limit: 10,
          search
        }
      });
      
      setVendors(response.data.vendors || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      showToast("Failed to fetch vendors", "error");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchVendors();
  }, [page, search, viewMode, vendorType]);

  // Helper functions
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleProductSelection = (e) => {
    const productName = e.target.value;
    if (productName && !newVendor.products.includes(productName)) {
      setNewVendor({ ...newVendor, products: [...newVendor.products, productName] });
    }
  };

  const handleRemoveProduct = (productName) => {
    setNewVendor({ 
      ...newVendor, 
      products: newVendor.products.filter(name => name !== productName) 
    });
  };

  // Save new vendor
  const handleSave = async () => {
    if (!newVendor.name.trim()) {
      showToast("Please enter a vendor name", "error");
      return;
    }
    
    if (newVendor.products.length === 0) {
      showToast("Please select at least one product", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/mapping/addVendor`,
        {
          vendorName: newVendor.name,
          products: newVendor.products,
          vendorType: newVendor.type
        }
      );
      
      showToast("Vendor saved successfully!");
      setNewVendor({ name: "", type: "other", products: [] });
      fetchVendors();
    } catch (err) {
      console.error("Save error:", err);
      showToast(`Error: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Edit vendor
  const handleEdit = (vendor) => {
    setEditingId(vendor._id);
    setEditForm({
      vendorName: vendor.vendorName,
      products: vendor.productName,
      vendorType: vendor.vendorType
    });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_Backend_Base_URL}/mapping/updateVendorProducts/${editingId}`,
        editForm
      );
      
      setEditingId(null);
      fetchVendors();
      showToast("Vendor updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      showToast(`Error: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete vendor
  const openDeleteModal = (vendor) => {
    setItemToDelete(vendor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_Backend_Base_URL}/mapping/deleteVendorProducts/${itemToDelete._id}`
      );
      
      fetchVendors();
      showToast("Vendor deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(`Error: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Remove product from vendor
  const handleRemoveProductFromVendor = async (vendorId, productName) => {
    if (window.confirm(`Remove ${productName} from this vendor?`)) {
      setLoading(true);
      try {
        await axios.delete(
          `${import.meta.env.VITE_Backend_Base_URL}}/mapping/${vendorId}/product/${productName}`
        );
        
        fetchVendors();
        showToast("Product removed successfully!");
      } catch (err) {
        console.error("Remove product error:", err);
        showToast(`Error: ${err.response?.data?.message || err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center">
          <div className={`${
            toast.type === "error"
              ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
              : (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
          } px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm`}>
            {toast.type === "error" ? (
              <AlertTriangle className="w-5 h-5 mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      <div className="w-auto mx-auto space-y-4">
        {/* Add New Vendor Section */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg shadow-xl p-4 md:p-6`}>
          <h3 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Add New Vendor</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vendor Name */}
            <div>
              <label className={`block font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Vendor Name:</label>
              <input
                type="text"
                className={`${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            {/* Vendor Type */}
            <div>
              <label className={`block font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Vendor Type:</label>
              <select
                className={`${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                value={newVendor.type}
                onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value })}
              >
                <option value="other">Other Vendor</option>
                <option value="default">Default Vendor</option>
              </select>
            </div>

            {/* Product Dropdown */}
            {/*Product Dropdown*/}
<div>
  <label className={`block font-medium mb-2 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`}>Select Products:</label>
  <Select
    id="product-select"
    name="product"
    value={
      newVendor.products.map(product => ({ 
        value: product, 
        label: product 
      }))
    }
    onChange={(selectedOptions) => {
      // Handle both single and multi-select cases
      const selectedValues = selectedOptions 
        ? (Array.isArray(selectedOptions) 
            ? selectedOptions.map(option => option.value)
            : [selectedOptions.value]
          )
        : [];
      setNewVendor({ ...newVendor, products: selectedValues });
    }}
    options={[ 
      ...(products || []).map(product => ({ 
        value: typeof product === 'string' ? product : product.productName || product.name,
        label: typeof product === 'string' ? product : product.productName || product.name
      }))
    ]}
    styles={{
      control: (provided, state) => ({
        ...provided,
        minHeight: '48px',
        borderColor: state.isFocused 
          ? '#3b82f6' 
          : (isDarkMode ? '#4b5563' : '#d1d5db'),
        backgroundColor: isDarkMode ? '#374151' : 'white',
        color: isDarkMode ? 'white' : '#111827',
        boxShadow: state.isFocused 
          ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
          : 'none',
        borderRadius: '0.5rem',
        '&:hover': {
          borderColor: state.isFocused 
            ? '#3b82f6' 
            : (isDarkMode ? '#6b7280' : '#9ca3af'),
        }
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: '8px 12px',
      }),
      input: (provided) => ({
        ...provided,
        color: isDarkMode ? 'white' : '#111827',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 50,
        backgroundColor: isDarkMode ? '#374151' : 'white',
        border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }),
      menuPortal: (provided) => ({
        ...provided,
        zIndex: 50,
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused 
          ? (isDarkMode ? '#4b5563' : '#f3f4f6') 
          : (isDarkMode ? '#374151' : 'white'),
        color: isDarkMode ? 'white' : '#111827',
        '&:hover': {
          backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
        }
      }),
      multiValue: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        color: isDarkMode ? 'white' : '#111827',
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        color: isDarkMode ? 'white' : '#111827',
      }),
      multiValueRemove: (provided) => ({
        ...provided,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        '&:hover': {
          backgroundColor: isDarkMode ? '#6b7280' : '#d1d5db',
          color: isDarkMode ? 'white' : '#111827',
        }
      }),
    }}
    placeholder="Select Products"
    isClearable
    isMulti
    menuPortalTarget={document.body}
    className="text-sm"
    isLoading={loading}
    noOptionsMessage={() => products?.length === 0 ? "No products available" : "No matching products"}
  />
</div>
            {/* <div>
              <label className={`block font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Select Products:</label>
              <select
                className={`${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                onChange={handleProductSelection}
                disabled={loading}
              >
                <option value="">Select a Product</option>
                {products.map((product) => (
                  <option key={product}  value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          {/* Selected Products List */}
          {newVendor.products.length > 0 && (
            <div className="mt-4">
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Selected Products ({newVendor.products.length})</h4>
              <div className="flex flex-wrap gap-2">
                {newVendor.products.map((product, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-blue-300' 
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {product}
                    <button
                      type="button"
                      className={`ml-2 rounded-full p-1 ${
                        isDarkMode 
                          ? 'hover:bg-gray-600 text-gray-300 hover:text-white' 
                          : 'hover:bg-blue-200 text-blue-700'
                      } transition-colors`}
                      onClick={() => handleRemoveProduct(product)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            className={`mt-6 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
            } px-6 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${
              (!newVendor.name.trim() || newVendor.products.length === 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSave}
            disabled={!newVendor.name.trim() || newVendor.products.length === 0 || loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Vendor
          </button>
        </div>
        
        {/* Vendor List Section */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg shadow-xl overflow-hidden`}>
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Vendor List</h3>
              
              {/* View Mode Toggle and Search */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viewMode === "all"}
                      onChange={() => {
                        setViewMode(viewMode === "all" ? "type" : "all");
                        setPage(1);
                      }}
                      className="sr-only peer"
                    />
                    <div className={`relative w-11 h-6 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    } peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:${
                      isDarkMode ? 'bg-gray-300' : 'bg-white'
                    } after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      isDarkMode ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-blue-500'
                    }`}></div>
                    <span className={`ml-3 text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Show All
                    </span>
                  </label>
                  
                  {/* Vendor Type Selector (visible when not in "all" mode) */}
                  {viewMode === "type" && (
                    <select
                      value={vendorType}
                      onChange={(e) => {
                        setVendorType(e.target.value);
                        setPage(1);
                      }}
                      className={`${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    >
                      <option value="default">Default Vendors</option>
                      <option value="other">Other Vendors</option>
                    </select>
                  )}
                </div>
                
                {/* Search Bar */}
                <div className="relative flex-grow md:w-80">
                  <input
                    type="text"
                    placeholder="Search vendors or products..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className={`${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } border pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                  isDarkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
              </div>
            )}

            {/* Vendor Table */}
            {!loading && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className={`${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className={`px-4 py-3 text-left ${
                        isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                      } border-b`}>Vendor</th>
                      <th className={`px-4 py-3 text-left ${
                        isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                      } border-b`}>Type</th>
                      <th className={`px-4 py-3 text-left ${
                        isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                      } border-b`}>Products</th>
                      <th className={`px-4 py-3 text-left ${
                        isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
                      } border-b w-36`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.length > 0 ? (
                      vendors.map((vendor) => (
                        <tr key={vendor._id} className={`${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        } border-b transition-colors`}>
                          <td className="px-4 py-4">
                            {editingId === vendor._id ? (
                              <input
                                type="text"
                                value={editForm.vendorName}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, vendorName: e.target.value })
                                }
                                className={`${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                              />
                            ) : (
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{vendor.vendorName}</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === vendor._id ? (
                              <select
                                value={editForm.vendorType}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, vendorType: e.target.value })
                                }
                                className={`${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                              >
                                <option value="other">Other</option>
                                <option value="default">Default</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                vendor.vendorType === 'default'
                                  ? (isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800')
                                  : (isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-gray-100 text-gray-800')
                              }`}>
                                {vendor.vendorType === 'default' ? 'Default' : 'Other'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {editingId === vendor._id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={editForm.products.join(", ")}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      products: e.target.value.split(", ")
                                    })
                                  }
                                  className={`${
                                    isDarkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                                  placeholder="Comma separated products"
                                />
                                <small className={`${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Separate products with commas</small>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {vendor.productName?.length > 0 ? (
                                  vendor.productName.map((product, index) => (
                                    <span
                                      key={index}
                                      className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                                        isDarkMode 
                                          ? 'bg-gray-700 text-gray-300' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {product}
                                      <button
                                        type="button"
                                        className={`ml-1 rounded-full p-1 ${
                                          isDarkMode 
                                            ? 'hover:bg-gray-600 text-gray-400 hover:text-red-300' 
                                            : 'hover:bg-gray-200 text-gray-600 hover:text-red-500'
                                        } transition-colors`}
                                        onClick={() => handleRemoveProductFromVendor(vendor._id, product)}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))
                                ) : (
                                  <span className={`${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`}>No products</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {editingId === vendor._id ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className={`${
                                      isDarkMode
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-green-500 hover:bg-green-600'
                                    } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className={`${
                                      isDarkMode
                                        ? 'bg-gray-600 hover:bg-gray-500' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    } text-white px-3 py-1 rounded text-sm transition-colors`}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(vendor)}
                                    className={`${
                                      isDarkMode
                                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                                        : 'bg-yellow-500 hover:bg-yellow-600'
                                    } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(vendor)}
                                    className={`${
                                      isDarkMode
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-red-500 hover:bg-red-600'
                                    } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className={`px-4 py-8 text-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          No vendors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {vendors.length > 0 && (
              <div className="flex justify-between items-center mt-6 px-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`flex items-center px-4 py-2 rounded ${
                    page === 1 
                      ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
                      : (isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white')
                  } transition-colors`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`flex items-center px-4 py-2 rounded ${
                    page === totalPages 
                      ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
                      : (isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white')
                  } transition-colors`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-black' : 'bg-gray-500'} opacity-75`}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            
            <div className={`inline-block align-bottom ${
              isDarkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-900'
            } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium">
                      Delete Vendor
                    </h3>
                    <div className="mt-2">
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                        Are you sure you want to delete the vendor{" "}
                        <span className="font-semibold">{itemToDelete?.vendorName}</span>?
                        This action cannot be undone.
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
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
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

export default VendorManagement;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Layout from "./../Layout/Layout";
// import { Search, Save, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

// const VendorManagement = () => {
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [newVendorName, setNewVendorName] = useState("");
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [vendorProducts, setVendorProducts] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({ vendorName: "", products: [] });
  
//   // Get theme from localStorage (synced with Layout component)
//   const [isDarkMode, setIsDarkMode] = useState(false);
  
//   // Add state for delete confirmation modal
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [itemToDelete, setItemToDelete] = useState(null);
  
//   // Add state for toast notifications
//   const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
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

//   // Toast notification timer
//   useEffect(() => {
//     if (toast.show) {
//       const timer = setTimeout(() => {
//         setToast({ ...toast, show: false });
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // Fetch products for dropdown
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const productsResponse = await axios.get(
//           `${import.meta.env.VITE_Backend_Base_URL}/mapping/getProducts`
//         );
//         setProducts(productsResponse.data);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         showToast("Failed to fetch products", "error");
//       }
//     };
//     fetchProducts();
//   }, []);

//   // Show toast notification
//   const showToast = (message, type = "success") => {
//     setToast({
//       show: true,
//       message,
//       type
//     });
//   };

//   // Fetch vendor-product combinations for table
//   const fetchVendorProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_Backend_Base_URL}/mapping/getVendorProducts`,
//         {
//           params: {
//             page,
//             limit: 10,
//             search
//           }
//         }
//       );
//       setVendorProducts(response.data.vendorProducts);
//       setTotalPages(response.data.totalPages);
//     } catch (err) {
//       console.error("Error fetching vendor products:", err);
//       showToast("Failed to fetch vendor products", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVendorProducts();
//   }, [page, search]);

//   // Handle product selection
//   const handleProductSelection = (e) => {
//     const productName = e.target.value;
//     if (productName && !selectedProducts.includes(productName)) {
//       setSelectedProducts([...selectedProducts, productName]);
//     }
//   };

//   // Handle remove selected product
//   const handleRemoveProduct = (productName) => {
//     setSelectedProducts(selectedProducts.filter(name => name !== productName));
//   };

//   // Handle save vendor-product combinations
//   const handleSave = async () => {
//     if (!newVendorName.trim()) {
//       showToast("Please enter a vendor name", "error");
//       return;
//     }
    
//     if (selectedProducts.length === 0) {
//       showToast("Please select at least one product", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/mapping/addVendor`,
//         {
//           vendorName: newVendorName,
//           products: selectedProducts,
//         }
//       );
//       showToast("Vendor-Product combinations saved successfully!");
//       setNewVendorName("");
//       setSelectedProducts([]);
//       fetchVendorProducts();
//     } catch (err) {
//       console.error("Save error:", err);
//       showToast(`Error saving: ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit vendor-product combination
//   const handleEdit = (item) => {
//     setEditingId(item._id);
//     setEditForm({
//       vendorName: item.vendorName,
//       products: item.productName || []
//     });
//   };

//   // Handle save edited vendor-product combination
//   const handleSaveEdit = async () => {
//     setLoading(true);
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_Backend_Base_URL}/mapping/updateVendorProducts/${editingId}`,
//         {
//           vendorName: editForm.vendorName,
//           products: editForm.products,
//         }
//       );
//       setEditingId(null);
//       fetchVendorProducts();
//       showToast("Updated successfully!");
//     } catch (err) {
//       console.error("Update error:", err);
//       showToast(`Error updating: ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open delete confirmation modal
//   const openDeleteModal = (item) => {
//     setItemToDelete(item);
//     setIsDeleteModalOpen(true);
//   };

//   // Handle confirm delete
//   const confirmDelete = async () => {
//     if (!itemToDelete) return;
    
//     setLoading(true);
//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_Backend_Base_URL}/mapping/deleteVendorProducts/${itemToDelete._id}`
//       );
//       fetchVendorProducts();
//       showToast("Deleted successfully!");
//     } catch (err) {
//       console.error("Delete error:", err);
//       showToast(`Error deleting: ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//       setIsDeleteModalOpen(false);
//       setItemToDelete(null);
//     }
//   };

//   // Handle remove product from vendor
//   const handleRemoveProductFromVendor = async (vendorId, productName) => {
//     if (window.confirm(`Remove ${productName} from this vendor?`)) {
//       setLoading(true);
//       try {
//         await axios.delete(
//           `${import.meta.env.VITE_Backend_Base_URL}/mapping/${vendorId}/product/${productName}`
//         );
//         fetchVendorProducts();
//         showToast("Product removed successfully!");
//       } catch (err) {
//         console.error("Remove product error:", err);
//         showToast(`Error removing product: ${err.response?.data?.message || err.message}`, "error");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <Layout>
//       {/* Toast Notification */}
//       {toast.show && (
//         <div className="fixed top-4 right-4 z-50 flex items-center">
//           <div className={`${
//             toast.type === "error"
//               ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
//               : (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
//           } px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm`}>
//             {toast.type === "error" ? (
//               <AlertTriangle className="w-5 h-5 mr-2" />
//             ) : (
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//             )}
//             <p>{toast.message}</p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto space-y-4">
//         {/* Add New Vendor Section */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg shadow-xl p-4 md:p-6`}>
//           <h3 className={`text-xl font-semibold mb-4 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>Add New Vendor</h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Vendor Input Field */}
//             <div>
//               <label className={`block font-medium mb-2 ${
//                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
//               }`}>Vendor Name:</label>
//               <input
//                 type="text"
//                 className={`${
//                   isDarkMode 
//                     ? 'bg-gray-700 border-gray-600 text-white' 
//                     : 'bg-white border-gray-300 text-gray-900'
//                 } border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
//                 value={newVendorName}
//                 onChange={(e) => setNewVendorName(e.target.value)}
//                 placeholder="Enter vendor name"
//               />
//             </div>

//             {/* Product Dropdown */}
//             <div>
//               <label className={`block font-medium mb-2 ${
//                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
//               }`}>Select Products:</label>
//               <select
//                 className={`${
//                   isDarkMode 
//                     ? 'bg-gray-700 border-gray-600 text-white' 
//                     : 'bg-white border-gray-300 text-gray-900'
//                 } border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
//                 onChange={handleProductSelection}
//                 disabled={loading}
//               >
//                 <option value="">Select a Product</option>
//                 {products.map((product) => (
//                   <option key={product._id} value={product.updatedProduct}>
//                     {product.updatedProduct}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Selected Products List */}
//           {selectedProducts.length > 0 && (
//             <div className="mt-4">
//               <h4 className={`font-medium mb-2 ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>Selected Products ({selectedProducts.length})</h4>
//               <div className="flex flex-wrap gap-2">
//                 {selectedProducts.map((product, index) => (
//                   <span
//                     key={index}
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
//                       isDarkMode 
//                         ? 'bg-gray-700 text-blue-300' 
//                         : 'bg-blue-100 text-blue-800'
//                     }`}
//                   >
//                     {product}
//                     <button
//                       type="button"
//                       className={`ml-2 rounded-full p-1 ${
//                         isDarkMode 
//                           ? 'hover:bg-gray-600 text-gray-300 hover:text-white' 
//                           : 'hover:bg-blue-200 text-blue-700'
//                       } transition-colors`}
//                       onClick={() => handleRemoveProduct(product)}
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Save Button */}
//           <button
//             className={`mt-6 ${
//               isDarkMode
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                 : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
//             } px-6 py-2 rounded-lg font-medium flex items-center justify-center transition-colors ${
//               (!newVendorName.trim() || selectedProducts.length === 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//             onClick={handleSave}
//             disabled={!newVendorName.trim() || selectedProducts.length === 0 || loading}
//           >
//             <Save className="w-4 h-4 mr-2" />
//             Save Mapping
//           </button>
//         </div>

//         {/* Vendor List Section */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg shadow-xl overflow-hidden`}>
//           <div className="p-4 md:p-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//               <h3 className={`text-xl font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>Vendor-Product List</h3>
              
//               {/* Search Bar */}
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search vendors or products..."
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setPage(1); // Reset to first page when searching
//                   }}
//                   className={`${
//                     isDarkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   } border pl-10 pr-4 py-2 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
//                 />
//                 <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
//                   isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                 }`} />
//               </div>
//             </div>

//             {/* Loading State */}
//             {loading && (
//               <div className="flex justify-center items-center py-12">
//                 <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
//                   isDarkMode ? 'border-blue-400' : 'border-blue-600'
//                 }`}></div>
//               </div>
//             )}

//             {/* Vendor-Product Table */}
//             {!loading && (
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead className={`${
//                     isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
//                   }`}>
//                     <tr>
//                       <th className={`px-4 py-3 text-left ${
//                         isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
//                       } border-b`}>Vendor</th>
//                       <th className={`px-4 py-3 text-left ${
//                         isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
//                       } border-b`}>Products</th>
//                       <th className={`px-4 py-3 text-left ${
//                         isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
//                       } border-b w-36`}>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {vendorProducts.length > 0 ? (
//                       vendorProducts.map((item) => (
//                         <tr key={item._id} className={`${
//                           isDarkMode 
//                             ? 'border-gray-700 hover:bg-gray-700'
//                             : 'border-gray-200 hover:bg-gray-50'
//                         } border-b transition-colors`}>
//                           <td className="px-4 py-4">
//                             {editingId === item._id ? (
//                               <input
//                                 type="text"
//                                 value={editForm.vendorName}
//                                 onChange={(e) =>
//                                   setEditForm({ ...editForm, vendorName: e.target.value })
//                                 }
//                                 className={`${
//                                   isDarkMode 
//                                     ? 'bg-gray-700 border-gray-600 text-white' 
//                                     : 'bg-white border-gray-300 text-gray-900'
//                                 } border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
//                               />
//                             ) : (
//                               <span className={`font-medium ${
//                                 isDarkMode ? 'text-white' : 'text-gray-900'
//                               }`}>{item.vendorName}</span>
//                             )}
//                           </td>
//                           <td className="px-4 py-4">
//                             {editingId === item._id ? (
//                               <div className="flex flex-col gap-2">
//                                 <input
//                                   type="text"
//                                   value={editForm.products.join(", ")}
//                                   onChange={(e) =>
//                                     setEditForm({
//                                       ...editForm,
//                                       products: e.target.value.split(", ")
//                                     })
//                                   }
//                                   className={`${
//                                     isDarkMode 
//                                       ? 'bg-gray-700 border-gray-600 text-white' 
//                                       : 'bg-white border-gray-300 text-gray-900'
//                                   } border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
//                                   placeholder="Comma separated products"
//                                 />
//                                 <small className={`${
//                                   isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                                 }`}>Separate products with commas</small>
//                               </div>
//                             ) : (
//                               <div className="flex flex-wrap gap-1">
//                                 {item.productName?.length > 0 ? (
//                                   item.productName.map((product, index) => (
//                                     <span
//                                       key={index}
//                                       className={`inline-flex items-center px-2 py-1 rounded text-sm ${
//                                         isDarkMode 
//                                           ? 'bg-gray-700 text-gray-300' 
//                                           : 'bg-gray-100 text-gray-800'
//                                       }`}
//                                     >
//                                       {product}
//                                       <button
//                                         type="button"
//                                         className={`ml-1 rounded-full p-1 ${
//                                           isDarkMode 
//                                             ? 'hover:bg-gray-600 text-gray-400 hover:text-red-300' 
//                                             : 'hover:bg-gray-200 text-gray-600 hover:text-red-500'
//                                         } transition-colors`}
//                                         onClick={() => handleRemoveProductFromVendor(item._id, product)}
//                                       >
//                                         <X className="w-3 h-3" />
//                                       </button>
//                                     </span>
//                                   ))
//                                 ) : (
//                                   <span className={`${
//                                     isDarkMode ? 'text-gray-500' : 'text-gray-400'
//                                   }`}>No products</span>
//                                 )}
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-4 py-4">
//                             <div className="flex gap-2">
//                               {editingId === item._id ? (
//                                 <>
//                                   <button
//                                     onClick={handleSaveEdit}
//                                     className={`${
//                                       isDarkMode
//                                         ? 'bg-green-600 hover:bg-green-700' 
//                                         : 'bg-green-500 hover:bg-green-600'
//                                     } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
//                                   >
//                                     <Save className="w-3 h-3 mr-1" />
//                                     Save
//                                   </button>
//                                   <button
//                                     onClick={() => setEditingId(null)}
//                                     className={`${
//                                       isDarkMode
//                                         ? 'bg-gray-600 hover:bg-gray-500' 
//                                         : 'bg-gray-300 hover:bg-gray-400'
//                                     } text-white px-3 py-1 rounded text-sm transition-colors`}
//                                   >
//                                     Cancel
//                                   </button>
//                                 </>
//                               ) : (
//                                 <>
//                                   <button
//                                     onClick={() => handleEdit(item)}
//                                     className={`${
//                                       isDarkMode
//                                         ? 'bg-yellow-600 hover:bg-yellow-700' 
//                                         : 'bg-yellow-500 hover:bg-yellow-600'
//                                     } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
//                                   >
//                                     <Edit className="w-3 h-3 mr-1" />
//                                     Edit
//                                   </button>
//                                   <button
//                                     onClick={() => openDeleteModal(item)}
//                                     className={`${
//                                       isDarkMode
//                                         ? 'bg-red-600 hover:bg-red-700' 
//                                         : 'bg-red-500 hover:bg-red-600'
//                                     } text-white px-3 py-1 rounded text-sm transition-colors flex items-center`}
//                                   >
//                                     <Trash2 className="w-3 h-3 mr-1" />
//                                     Delete
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="3" className={`px-4 py-8 text-center ${
//                           isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                         }`}>
//                           No vendor-product mappings found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Pagination */}
//             {vendorProducts.length > 0 && (
//               <div className="flex justify-between items-center mt-6 px-2">
//                 <button
//                   onClick={() => setPage(p => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className={`flex items-center px-4 py-2 rounded ${
//                     page === 1 
//                       ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
//                       : (isDarkMode 
//                           ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                           : 'bg-blue-500 hover:bg-blue-600 text-white')
//                   } transition-colors`}
//                 >
//                   <ChevronLeft className="w-4 h-4 mr-1" />
//                   Previous
//                 </button>
//                 <span className={`text-sm ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Page {page} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className={`flex items-center px-4 py-2 rounded ${
//                     page === totalPages 
//                       ? (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
//                       : (isDarkMode 
//                           ? 'bg-blue-600 hover:bg-blue-700 text-white' 
//                           : 'bg-blue-500 hover:bg-blue-600 text-white')
//                   } transition-colors`}
//                 >
//                   Next
//                   <ChevronRight className="w-4 h-4 ml-1" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {isDeleteModalOpen && (
//         <div className="fixed z-10 inset-0 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//               onClick={() => setIsDeleteModalOpen(false)}
//             >
//               <div className={`absolute inset-0 ${isDarkMode ? 'bg-black' : 'bg-gray-500'} opacity-75`}></div>
//             </div>

//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
//               &#8203;
//             </span>
            
//             <div className={`inline-block align-bottom ${
//               isDarkMode 
//                 ? 'bg-gray-800 text-white' 
//                 : 'bg-white text-gray-900'
//             } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
//               <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                     <AlertTriangle className="h-6 w-6 text-red-600" />
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                     <h3 className="text-lg leading-6 font-medium">
//                       Delete Vendor-Product Mapping
//                     </h3>
//                     <div className="mt-2">
//                       <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
//                         Are you sure you want to delete the mapping for{" "}
//                         <span className="font-semibold">{itemToDelete?.vendorName}</span>?
//                         This action cannot be undone.
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
//                   className={`mt-3 w-full inline-flex justify-center rounded-md border ${
//                     isDarkMode 
//                       ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
//                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                   } shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
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

// export default VendorManagement;