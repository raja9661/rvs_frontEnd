import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import Select from 'react-select';
import axios from 'axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Layout from '../components/Layout/Layout';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const ClientTracker = () => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0); // Add state for selected rows
  
  // Options states
  const [productOptions, setProductOptions] = useState([]);
  const [clientCodes, setClientCodes] = useState([]);
  const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "KYC", "STATEMENT", "ACCOUNT CHECK", "PAN SEARCH"]);
  const [statusOptions] = useState(["Pending", "Closed", "Invalid", "CNV"]);
  const [caseStatusOptions] = useState(["New Pending", "Sent"]);
  const [clientTypeOptions] = useState(["AGENCY", "CORPORATE", "OTHER", "UNKNOWN"]);

  const [filters, setFilters] = useState({
    searchQuery: '',
    product: '',
    productType: '',
    status: '',
    caseStatus: '',
    dateInStart: '',
    dateInEnd: '',
    dateOutStart: '',
    dateOutEnd: '',
    sentDate: '',
    vendorStatus: '',
    priority: '',
    clientType: '',
    clientCode: '',
    year: '',
    month: '',
  });

  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      minHeight: '36px',
      fontSize: '14px'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50
    })
  };

  // Fetch dropdown data
  useEffect(() => {
    fetchProductName();
    fetchClientCodes();
    fetchReportData(); // Load initial data
  }, []);

  // Auto-fetch when filters or pagination changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReportData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, currentPage, pageSize]);

  const fetchProductName = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
      setProductOptions(response.data.map(p => p.productName));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchClientCodes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getcode`);
      setClientCodes(response.data);
    } catch (error) {
      console.error("Error fetching client codes:", error);
    }
  };

  // Fetch report data with pagination
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanFilters[key] = filters[key];
        }
      });

      const queryParams = new URLSearchParams({
        ...cleanFilters,
        page: currentPage,
        pageSize: pageSize
      });

      const response = await fetch(
        `${import.meta.env.VITE_Backend_Base_URL}/report/admin/reports?${queryParams}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        setRowData(result.data);
        setTotalCount(result.pagination.total);
      } else {
        console.error('Failed to fetch data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Handle selection changed event
  const onSelectionChanged = useCallback(() => {
    if (gridRef.current?.api) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      setSelectedRowCount(selectedRows.length);
    }
  }, []);

  // Improved column definitions with better header names and widths
  const [columnDefs] = useState([
    {
      headerName: '',
      field: 'select',
      width: 60,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left',
      filter: false,
      sortable: false,
      resizable: false
    },
    { 
      field: 'caseId', 
      headerName: 'Case ID',
      width: 130,
      pinned: 'left',
      filter: 'agTextColumnFilter',
      editable: true,
      cellStyle: { backgroundColor: '#f0f9ff' }
    },
    {
      field: 'attachments',
      headerName: 'Attachments',
      width: 140,
      filter: false,
      cellRenderer: (params) => 
        params.value?.length > 0 ? (
          <a 
            href={params.value[0].location} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View File
          </a>
        ) : 'No File'
    },
    { field: 'remarks', headerName: 'Remarks', width: 200, filter: 'agTextColumnFilter', editable: true },
    { field: 'name', headerName: 'Name', width: 180, filter: 'agTextColumnFilter', editable: true },
    { field: 'details', headerName: 'Details', width: 180, filter: 'agTextColumnFilter', editable: true },
    { field: 'details1', headerName: 'Details 1', width: 180, filter: 'agTextColumnFilter', editable: true },
    { field: 'updatedRequirement', headerName: 'Updated Requirement', width: 180, filter: 'agTextColumnFilter', editable: true },
    { field: 'vendorRate', headerName: 'Vendor Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
    { field: 'priority', headerName: 'Priority', width: 110, filter: 'agTextColumnFilter', editable: true },
    { field: 'correctUPN', headerName: 'Correct UPN', width: 140, filter: 'agTextColumnFilter', editable: true },
    { field: 'product', headerName: 'Product', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'accountNumber', headerName: 'Account Number', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'requirement', headerName: 'Requirement', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'accountNumberDigit', headerName: 'Account Number Digit', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'bankCode', headerName: 'Bank Code', width: 120, filter: 'agTextColumnFilter', editable: true },
    { 
      field: 'clientCode', 
      headerName: 'Client Code', 
      width: 130, 
      filter: 'agTextColumnFilter', 
      editable: true,
      // Add tooltip for truncated text
      tooltipField: 'clientCode'
    },
    { field: 'vendorName', headerName: 'Vendor Name', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'vendorStatus', headerName: 'Vendor Status', width: 140, filter: 'agTextColumnFilter', editable: true },
    { field: 'dateIn', headerName: 'Date In', width: 120, filter: 'agDateColumnFilter', editable: true },
    { field: 'dateInDate', headerName: 'Date In Day', width: 130, filter: 'agTextColumnFilter', editable: true },
    { field: 'status', headerName: 'Status', width: 130, filter: 'agTextColumnFilter', editable: true },
    { field: 'caseStatus', headerName: 'Case Status', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'productType', headerName: 'Product Type', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'listByEmployee', headerName: 'List By Employee', width: 160, filter: 'agTextColumnFilter', editable: true },
    { field: 'dateOut', headerName: 'Date Out', width: 120, filter: 'agDateColumnFilter', editable: true },
    { field: 'dateOutInDay', headerName: 'Date Out Day', width: 130, filter: 'agTextColumnFilter', editable: true },
    { field: 'sentBy', headerName: 'Sent By', width: 120, filter: 'agTextColumnFilter', editable: true },
    { field: 'autoOrManual', headerName: 'Auto Or Manual', width: 120, filter: 'agTextColumnFilter', editable: true },
    { field: 'caseDoneBy', headerName: 'Case Done By', width: 140, filter: 'agTextColumnFilter', editable: true },
    { field: 'clientTAT', headerName: 'Client TAT', width: 120, filter: 'agTextColumnFilter', editable: true },
    { field: 'customerCare', headerName: 'Customer Care', width: 140, filter: 'agTextColumnFilter', editable: true },
    { field: 'NameUploadBy', headerName: 'Name Upload By', width: 150, filter: 'agTextColumnFilter', editable: true },
    { field: 'sentDate', headerName: 'Sent Date', width: 120, filter: 'agDateColumnFilter', editable: true },
    { field: 'sentDateInDay', headerName: 'Sent Date Day', width: 140, filter: 'agTextColumnFilter', editable: true },
    { field: 'clientType', headerName: 'Client Type', width: 130, filter: 'agTextColumnFilter', editable: true },
    { field: 'dedupBy', headerName: 'Dedup By', width: 120, filter: 'agTextColumnFilter', editable: true },
    { field: 'ipAddress', headerName: 'IP Address', width: 130, filter: 'agTextColumnFilter', editable: true },
    { 
      field: 'isRechecked', 
      headerName: 'Is Rechecked', 
      width: 120, 
      filter: 'agTextColumnFilter', 
      editable: true,
      cellRenderer: (params) => params.value ? 'Yes' : 'No'
    },
    { field: 'ReferBy', headerName: 'Refer By', width: 120, filter: 'agTextColumnFilter', editable: true },
    { field: 'userId', headerName: 'User ID', width: 110, filter: 'agTextColumnFilter', editable: true },
    { field: 'clientRate', headerName: 'Client Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
    { 
      field: 'isDedup', 
      headerName: 'Is Dedup', 
      width: 100, 
      filter: 'agTextColumnFilter', 
      editable: true,
      cellRenderer: (params) => params.value ? 'Yes' : 'No'
    },
    { field: 'recheckedAt', headerName: 'Rechecked At', width: 150, filter: 'agDateColumnFilter', editable: true },
    { field: 'year', headerName: 'Year', width: 100, filter: 'agNumberColumnFilter', editable: true },
    { field: 'month', headerName: 'Month', width: 100, filter: 'agNumberColumnFilter', editable: true },
    { field: 'ModifyedAt', headerName: 'Modified At', width: 150, filter: 'agDateColumnFilter', editable: true }
  ]);

  // Improved default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
    floatingFilter: true,
    minWidth: 100,
    cellClass: 'cell-wrap-text',
    // // Enable auto-height for headers to prevent truncation
    // autoHeaderHeight: true,
    // wrapHeaderText: true,
    // Add tooltips for truncated headers
    tooltipValueGetter: (params) => {
      if (params.colDef.headerName && params.colDef.headerName.length > 15) {
        return params.colDef.headerName;
      }
      return null;
    },
    cellStyle: (params) => {
      if (filters.searchQuery && params.value && 
          params.value.toString().toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return { backgroundColor: '#FFEB3B', color: '#000' };
      }
      return null;
    },
  }), [filters.searchQuery]);

  // Auto-save cell changes
  const onCellValueChanged = useCallback(async (params) => {
    setSaving(true);
    try {
      const { data, colDef, newValue } = params;
      
      const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/report/update-cell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: data.caseId,
          field: colDef.field,
          value: newValue
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to save cell:', result.message);
        // Revert the change in the grid
        params.api.applyTransaction({ update: [params.data] });
      } else {
        console.log('Cell updated successfully');
        // Refresh data to get updated values
        fetchReportData();
      }
    } catch (error) {
      console.error('Error saving cell:', error);
      // Revert the change in the grid
      params.api.applyTransaction({ update: [params.data] });
    } finally {
      setSaving(false);
    }
  }, [fetchReportData]);

  // Download Excel
  const downloadExcel = async () => {
     setIsDownloading(true);
    try {
      const selectedNodes = gridRef.current?.api?.getSelectedNodes();
      const selectedCaseIds = selectedNodes ? selectedNodes.map(node => node.data.caseId) : [];
      
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanFilters[key] = filters[key];
        }
      });

      const queryParams = new URLSearchParams(cleanFilters);
      
      // Add selected case IDs if any
      if (selectedCaseIds.length > 0) {
        selectedCaseIds.forEach(id => queryParams.append('selectedCaseIds', id));
      }

      console.log('Downloading with params:', queryParams.toString());

      const response = await fetch(
        `${import.meta.env.VITE_Backend_Base_URL}/report/admin/reports/download?${queryParams}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `kyc_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Download failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }finally {
      setIsDownloading(false);
    }
  };

  // Handle filter changes
  const formatDateForFilter = (dateString) => {
    if (!dateString) return '';
    // Convert YYYY-MM-DD to DD-MM-YYYY for display
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleFilterChange = (key, value) => {
    // If it's a date field, ensure proper format
    if (key.includes('Date') && value) {
      console.log(`Date filter ${key}:`, value, '->', formatDateForFilter(value));
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      product: '',
      productType: '',
      status: '',
      caseStatus: '',
      dateInStart: '',
      dateInEnd: '',
      dateOutStart: '',
      dateOutEnd: '',
      sentDate: '',
      vendorStatus: '',
      priority: '',
      clientType: '',
      clientCode: '',
      year: '',
      month: '',
    });
    setCurrentPage(1);
    
    // Clear selection when resetting
    if (gridRef.current?.api) {
      gridRef.current.api.deselectAll();
      setSelectedRowCount(0);
    }
  };

  // Handle grid ready to set up auto-sizing
  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
    
    // Set up periodic column resizing to handle header text issues
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  }, []);

  // Handle first data rendered
  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Handle column everything changed (resize, etc)
  const onColumnEverythingChanged = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  // Pagination handlers
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize);
    setCurrentPage(totalPages);
  };

  // Generate year and month options
  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const monthOptions = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' }, 
    { value: '03', label: 'March' }, { value: '04', label: 'April' }, 
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' }, 
    { value: '09', label: 'September' }, { value: '10', label: 'October' }, 
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Client Report Generator</h1>
                <p className="text-sm text-gray-600 mt-1">Manage and analyze KYC case data</p>
              </div>
              <div className="flex flex-wrap gap-3">
                 <button
                  onClick={downloadExcel}
                  disabled={isDownloading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Excel
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Reset Filters
                </button>
                {saving && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                )}
              </div>
            </div>

            {/* Compact Filters Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Search
                </label>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  placeholder="Search across all fields..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              {/* Product Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <Select
                  value={filters.product ? { value: filters.product, label: filters.product } : null}
                  onChange={(selectedOption) => {
                    handleFilterChange('product', selectedOption ? selectedOption.value : "");
                  }}
                  options={[
                    { value: "", label: "All Products" },
                    ...productOptions.map(product => ({ value: product, label: product }))
                  ]}
                  styles={customStyles}
                  placeholder="All Products"
                  isClearable
                />
              </div>

              {/* Client Code Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Code
                </label>
                <Select
                  value={filters.clientCode ? { value: filters.clientCode, label: filters.clientCode } : null}
                  onChange={(selectedOption) => {
                    handleFilterChange('clientCode', selectedOption ? selectedOption.value : "");
                  }}
                  options={[
                    { value: "", label: "All Client Codes" },
                    ...clientCodes.map(code => ({ value: code.clientCode || code, label: code.clientCode || code }))
                  ]}
                  styles={customStyles}
                  placeholder="All Client Codes"
                  isClearable
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status ? { value: filters.status, label: filters.status } : null}
                  onChange={(selectedOption) => {
                    handleFilterChange('status', selectedOption ? selectedOption.value : "");
                  }}
                  options={[
                    { value: "", label: "All Status" },
                    ...statusOptions.map(status => ({ value: status, label: status }))
                  ]}
                  styles={customStyles}
                  placeholder="All Status"
                  isClearable
                />
              </div>

              {/* Case Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Status
                </label>
                <Select
                  value={filters.caseStatus ? { value: filters.caseStatus, label: filters.caseStatus } : null}
                  onChange={(selectedOption) => {
                    handleFilterChange('caseStatus', selectedOption ? selectedOption.value : "");
                  }}
                  options={[
                    { value: "", label: "All Case Status" },
                    ...caseStatusOptions.map(status => ({ value: status, label: status }))
                  ]}
                  styles={customStyles}
                  placeholder="All Case Status"
                  isClearable
                />
              </div>

              {/* Year and Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  >
                    <option value="">All Months</option>
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date In Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date In Start</label>
                  <input
                    type="date"
                    value={filters.dateInStart}
                    onChange={(e) => handleFilterChange('dateInStart', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date In End</label>
                  <input
                    type="date"
                    value={filters.dateInEnd}
                    onChange={(e) => handleFilterChange('dateInEnd', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                </div>
              </div>

              {/* Date Out Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Out Start</label>
                  <input
                    type="date"
                    value={filters.dateOutStart}
                    onChange={(e) => handleFilterChange('dateOutStart', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Out End</label>
                  <input
                    type="date"
                    value={filters.dateOutEnd}
                    onChange={(e) => handleFilterChange('dateOutEnd', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AG Grid Toolbar - FIXED: Now uses state for selected row count */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedRowCount}</span> of <span className="font-medium">{rowData.length}</span> rows selected on this page
                {loading && <span className="ml-4 text-blue-600">Loading data...</span>}
              </div>
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Page size:</span>
                <select 
                  value={pageSize} 
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                <button
                  onClick={handleLastPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>

          {/* AG Grid - FIXED: Added selection changed event and improved column sizing */}
          <div className="ag-theme-alpine rounded-xl shadow-sm" style={{ height: '60vh', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              pagination={false} // We handle pagination manually
              onCellValueChanged={onCellValueChanged}
              onSelectionChanged={onSelectionChanged} // Added this to track selection changes
              onGridReady={onGridReady}
              onFirstDataRendered={onFirstDataRendered}
              onColumnEverythingChanged={onColumnEverythingChanged}
              suppressColumnVirtualisation={true} // Helps with header rendering
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientTracker;









// import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
// import Select from 'react-select';
// import axios from 'axios';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import Layout from '../components/Layout/Layout';

// // Register AG Grid modules
// ModuleRegistry.registerModules([AllCommunityModule]);

// const ClientTracker = () => {
//   const gridRef = useRef();
//   const [rowData, setRowData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(50);
  
//   // Options states
//   const [productOptions, setProductOptions] = useState([]);
//   const [clientCodes, setClientCodes] = useState([]);
//   const [productTypeOptions] = useState(["BANKING", "MOBILE", "ITO", "KYC", "STATEMENT", "ACCOUNT CHECK", "PAN SEARCH"]);
//   const [statusOptions] = useState(["Pending", "Closed", "Invalid", "CNV"]);
//   const [caseStatusOptions] = useState(["New Pending", "Sent"]);
//   const [clientTypeOptions] = useState(["AGENCY", "CORPORATE", "OTHER", "UNKNOWN"]);

//   const [filters, setFilters] = useState({
//     searchQuery: '',
//     product: '',
//     productType: '',
//     status: '',
//     caseStatus: '',
//     dateInStart: '',
//     dateInEnd: '',
//     dateOutStart: '',
//     dateOutEnd: '',
//     sentDate: '',
//     vendorStatus: '',
//     priority: '',
//     clientType: '',
//     clientCode: '',
//     year: '',
//     month: '',
//   });

//   // Custom styles for react-select
//   const customStyles = {
//     control: (provided) => ({
//       ...provided,
//       border: '1px solid #d1d5db',
//       borderRadius: '0.375rem',
//       minHeight: '36px',
//       fontSize: '14px'
//     }),
//     menu: (provided) => ({
//       ...provided,
//       zIndex: 50
//     })
//   };

//   // Fetch dropdown data
//   useEffect(() => {
//     fetchProductName();
//     fetchClientCodes();
//     fetchReportData(); // Load initial data
//   }, []);

//   // Auto-fetch when filters or pagination changes
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       fetchReportData();
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [filters, currentPage, pageSize]);

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const fetchClientCodes = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getcode`);
//       setClientCodes(response.data);
//     } catch (error) {
//       console.error("Error fetching client codes:", error);
//     }
//   };

//   // Fetch report data with pagination
//   const fetchReportData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const cleanFilters = {};
//       Object.keys(filters).forEach(key => {
//         if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
//           cleanFilters[key] = filters[key];
//         }
//       });

//       const queryParams = new URLSearchParams({
//         ...cleanFilters,
//         page: currentPage,
//         pageSize: pageSize
//       });

//       const response = await fetch(
//         `${import.meta.env.VITE_Backend_Base_URL}/report/admin/reports?${queryParams}`
//       );
      
//       const result = await response.json();
      
//       if (result.success) {
//         setRowData(result.data);
//         setTotalCount(result.pagination.total);
//       } else {
//         console.error('Failed to fetch data:', result.message);
//       }
//     } catch (error) {
//       console.error('Error fetching report data:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, currentPage, pageSize]);


//   const [columnDefs] = useState([
//   {
//     headerName: '',
//     field: 'select',
//     width: 60,
//     checkboxSelection: true,
//     headerCheckboxSelection: true,
//     pinned: 'left',
//     filter: false,
//     sortable: false
//   },
//   { 
//     field: 'caseId', 
//     headerName: 'Case ID',
//     width: 130,
//     pinned: 'left',
//     filter: 'agTextColumnFilter',
//     editable: true,
//     cellStyle: { backgroundColor: '#f0f9ff' }
//   },
//   {
//     field: 'attachments',
//     headerName: 'Attachments',
//     width: 140,
//     filter: false,
//     cellRenderer: (params) => 
//       params.value?.length > 0 ? (
//         <a 
//           href={params.value[0].location} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 underline text-sm"
//         >
//           View File
//         </a>
//       ) : 'No File'
//   },
//   { field: 'remarks', headerName: 'Remarks', width: 200, filter: 'agTextColumnFilter', editable: true },
//   { field: 'name', headerName: 'Name', width: 180, filter: 'agTextColumnFilter', editable: true },
//   { field: 'details', headerName: 'Details', width: 180, filter: 'agTextColumnFilter', editable: true },
//   { field: 'details1', headerName: 'Details 1', width: 180, filter: 'agTextColumnFilter', editable: true },
//   { field: 'updatedRequirement', headerName: 'Updated Requirement', width: 180, filter: 'agTextColumnFilter', editable: true },
//   { field: 'vendorRate', headerName: 'Vendor Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
//   { field: 'priority', headerName: 'Priority', width: 110, filter: 'agTextColumnFilter', editable: true },
//   { field: 'correctUPN', headerName: 'Correct UPN', width: 140, filter: 'agTextColumnFilter', editable: true },
//   { field: 'product', headerName: 'Product', width: 150, filter: 'agTextColumnFilter', editable: true },
//   // { field: 'updatedProductName', headerName: 'Updated Product Name', width: 160, filter: 'agTextColumnFilter', editable: true },
//   { field: 'accountNumber', headerName: 'Account Number', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'requirement', headerName: 'Requirement', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'accountNumberDigit', headerName: 'Account Number Digit', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'bankCode', headerName: 'Bank Code', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'clientCode', headerName: 'Client Code', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { field: 'vendorName', headerName: 'Vendor Name', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'vendorStatus', headerName: 'Vendor Status', width: 140, filter: 'agTextColumnFilter', editable: true },
//   { field: 'dateIn', headerName: 'Date In', width: 120, filter: 'agDateColumnFilter', editable: true },
//   { field: 'dateInDate', headerName: 'Date In Day', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { field: 'status', headerName: 'Status', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { field: 'caseStatus', headerName: 'Case Status', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'productType', headerName: 'Product Type', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'listByEmployee', headerName: 'List By Employee', width: 160, filter: 'agTextColumnFilter', editable: true },
//   { field: 'dateOut', headerName: 'Date Out', width: 120, filter: 'agDateColumnFilter', editable: true },
//   { field: 'dateOutInDay', headerName: 'Date Out Day', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { field: 'sentBy', headerName: 'Sent By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'autoOrManual', headerName: 'Auto Or Manual', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'caseDoneBy', headerName: 'Case Done By', width: 140, filter: 'agTextColumnFilter', editable: true },
//   { field: 'clientTAT', headerName: 'Client TAT', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'customerCare', headerName: 'Customer Care', width: 140, filter: 'agTextColumnFilter', editable: true },
//   { field: 'NameUploadBy', headerName: 'Name Upload By', width: 150, filter: 'agTextColumnFilter', editable: true },
//   { field: 'sentDate', headerName: 'Sent Date', width: 120, filter: 'agDateColumnFilter', editable: true },
//   { field: 'sentDateInDay', headerName: 'Sent Date Day', width: 140, filter: 'agTextColumnFilter', editable: true },
//   { field: 'clientType', headerName: 'Client Type', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { field: 'dedupBy', headerName: 'Dedup By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'ipAddress', headerName: 'IP Address', width: 130, filter: 'agTextColumnFilter', editable: true },
//   { 
//     field: 'isRechecked', 
//     headerName: 'Is Rechecked', 
//     width: 120, 
//     filter: 'agTextColumnFilter', 
//     editable: true,
//     cellRenderer: (params) => params.value ? 'Yes' : 'No'
//   },
//   { field: 'ReferBy', headerName: 'Refer By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   { field: 'userId', headerName: 'User ID', width: 110, filter: 'agTextColumnFilter', editable: true },
//   { field: 'clientRate', headerName: 'Client Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
//   { 
//     field: 'isDedup', 
//     headerName: 'Is Dedup', 
//     width: 100, 
//     filter: 'agTextColumnFilter', 
//     editable: true,
//     cellRenderer: (params) => params.value ? 'Yes' : 'No'
//   },
//   { field: 'recheckedAt', headerName: 'Rechecked At', width: 150, filter: 'agDateColumnFilter', editable: true },
//   { field: 'year', headerName: 'Year', width: 100, filter: 'agNumberColumnFilter', editable: true },
//   { field: 'month', headerName: 'Month', width: 100, filter: 'agNumberColumnFilter', editable: true },
//   { field: 'ModifyedAt', headerName: 'Modified At', width: 150, filter: 'agDateColumnFilter', editable: true }
// ]);

// // Default Column Definitions (Keep exactly as before)
// const defaultColDef = useMemo(() => ({
//   sortable: true,
//   filter: true,
//   resizable: true,
//   editable: true,
//   floatingFilter: true,
//   minWidth: 100,
//   cellClass: 'cell-wrap-text',
//   cellStyle: (params) => {
//     if (filters.searchQuery && params.value && 
//         params.value.toString().toLowerCase().includes(filters.searchQuery.toLowerCase())) {
//       return { backgroundColor: '#FFEB3B', color: '#000' };
//     }
//     return null;
//   },
// }), [filters.searchQuery]);

//   // Complete Column Definitions with ALL columns
//   // const [columnDefs] = useState([
//   //   {
//   //     headerName: '',
//   //     field: 'select',
//   //     width: 60,
//   //     checkboxSelection: true,
//   //     headerCheckboxSelection: true,
//   //     pinned: 'left',
//   //     filter: false,
//   //     sortable: false
//   //   },
//   //   { 
//   //     field: 'caseId', 
//   //     headerName: 'Case ID',
//   //     width: 130,
//   //     pinned: 'left',
//   //     filter: 'agTextColumnFilter',
//   //     editable: true,
//   //     cellStyle: { backgroundColor: '#f0f9ff' }
//   //   },
//   //   { field: 'userId', headerName: 'User ID', width: 110, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'name', headerName: 'Name', width: 180, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'clientCode', headerName: 'Client Code', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'product', headerName: 'Product', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'productType', headerName: 'Product Type', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'status', headerName: 'Status', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'caseStatus', headerName: 'Case Status', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'priority', headerName: 'Priority', width: 110, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'dateIn', headerName: 'Date In', width: 120, filter: 'agDateColumnFilter', editable: true },
//   //   { field: 'dateOut', headerName: 'Date Out', width: 120, filter: 'agDateColumnFilter', editable: true },
//   //   { field: 'sentDate', headerName: 'Sent Date', width: 120, filter: 'agDateColumnFilter', editable: true },
//   //   { field: 'vendorStatus', headerName: 'Vendor Status', width: 140, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'clientType', headerName: 'Client Type', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'remarks', headerName: 'Remarks', width: 200, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'details', headerName: 'Details', width: 180, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'details1', headerName: 'Details 1', width: 180, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'correctUPN', headerName: 'Correct UPN', width: 140, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'updatedProductName', headerName: 'Updated Product', width: 160, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'accountNumber', headerName: 'Account Number', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'requirement', headerName: 'Requirement', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'updatedRequirement', headerName: 'Updated Requirement', width: 180, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'accountNumberDigit', headerName: 'Acc Number Digit', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'bankCode', headerName: 'Bank Code', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'vendorName', headerName: 'Vendor Name', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'dateInDate', headerName: 'Date In Day', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'dateOutInDay', headerName: 'Date Out Day', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'sentBy', headerName: 'Sent By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'autoOrManual', headerName: 'Auto/Manual', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'caseDoneBy', headerName: 'Case Done By', width: 140, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'clientTAT', headerName: 'Client TAT', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'customerCare', headerName: 'Customer Care', width: 140, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'sentDateInDay', headerName: 'Sent Date Day', width: 140, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'dedupBy', headerName: 'Dedup By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'vendorRate', headerName: 'Vendor Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
//   //   { field: 'clientRate', headerName: 'Client Rate', width: 120, filter: 'agNumberColumnFilter', editable: true },
//   //   { field: 'NameUploadBy', headerName: 'Name Upload By', width: 150, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'ReferBy', headerName: 'Refer By', width: 120, filter: 'agTextColumnFilter', editable: true },
//   //   { 
//   //     field: 'isRechecked', 
//   //     headerName: 'Is Rechecked', 
//   //     width: 120, 
//   //     filter: 'agTextColumnFilter', 
//   //     editable: true,
//   //     cellRenderer: (params) => params.value ? 'Yes' : 'No'
//   //   },
//   //   { 
//   //     field: 'isDedup', 
//   //     headerName: 'Is Dedup', 
//   //     width: 100, 
//   //     filter: 'agTextColumnFilter', 
//   //     editable: true,
//   //     cellRenderer: (params) => params.value ? 'Yes' : 'No'
//   //   },
//   //   { field: 'recheckedAt', headerName: 'Rechecked At', width: 150, filter: 'agDateColumnFilter', editable: true },
//   //   { field: 'ipAddress', headerName: 'IP Address', width: 130, filter: 'agTextColumnFilter', editable: true },
//   //   { field: 'year', headerName: 'Year', width: 100, filter: 'agNumberColumnFilter', editable: true },
//   //   { field: 'month', headerName: 'Month', width: 100, filter: 'agNumberColumnFilter', editable: true },
//   //   { field: 'ModifyedAt', headerName: 'Modified At', width: 150, filter: 'agDateColumnFilter', editable: true },
//   //   { field: 'listByEmployee', headerName: 'List By Employee', width: 160, filter: 'agTextColumnFilter', editable: true },
//   //   {
//   //     field: 'attachments',
//   //     headerName: 'Attachments',
//   //     width: 140,
//   //     filter: false,
//   //     cellRenderer: (params) => 
//   //       params.value?.length > 0 ? (
//   //         <a 
//   //           href={params.value[0].location} 
//   //           target="_blank" 
//   //           rel="noopener noreferrer"
//   //           className="text-blue-600 hover:text-blue-800 underline text-sm"
//   //         >
//   //           View File
//   //         </a>
//   //       ) : 'No File'
//   //   },
//   // ]);

//   // // Default Column Definitions
//   // const defaultColDef = useMemo(() => ({
//   //   sortable: false,
//   //   filter: true,
//   //   resizable: true,
//   //   editable: true,
//   //   floatingFilter: true,
//   //   minWidth: 100,
//   //   cellClass: 'cell-wrap-text',
//   //   cellStyle: (params) => {
//   //     if (filters.searchQuery && params.value && 
//   //         params.value.toString().toLowerCase().includes(filters.searchQuery.toLowerCase())) {
//   //       return { backgroundColor: '#FFEB3B', color: '#000' };
//   //     }
//   //     return null;
//   //   },
//   // }), [filters.searchQuery]);

//   // Auto-save cell changes
//   const onCellValueChanged = useCallback(async (params) => {
//     setSaving(true);
//     try {
//       const { data, colDef, newValue } = params;
      
//       const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/report/update-cell`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           caseId: data.caseId,
//           field: colDef.field,
//           value: newValue
//         })
//       });

//       const result = await response.json();
      
//       if (!result.success) {
//         console.error('Failed to save cell:', result.message);
//         // Revert the change in the grid
//         params.api.applyTransaction({ update: [params.data] });
//       } else {
//         console.log('Cell updated successfully');
//         // Refresh data to get updated values
//         fetchReportData();
//       }
//     } catch (error) {
//       console.error('Error saving cell:', error);
//       // Revert the change in the grid
//       params.api.applyTransaction({ update: [params.data] });
//     } finally {
//       setSaving(false);
//     }
//   }, [fetchReportData]);

//   // Download Excel
//   const downloadExcel = async () => {
//     try {
//       const selectedNodes = gridRef.current?.api?.getSelectedNodes();
//       const selectedCaseIds = selectedNodes ? selectedNodes.map(node => node.data.caseId) : [];
      
//       const cleanFilters = {};
//       Object.keys(filters).forEach(key => {
//         if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
//           cleanFilters[key] = filters[key];
//         }
//       });

//       const queryParams = new URLSearchParams(cleanFilters);
      
//       // Add selected case IDs if any
//       if (selectedCaseIds.length > 0) {
//         selectedCaseIds.forEach(id => queryParams.append('selectedCaseIds', id));
//       }

//       console.log('Downloading with params:', queryParams.toString());

//       const response = await fetch(
//         `${import.meta.env.VITE_Backend_Base_URL}/report/admin/reports/download?${queryParams}`,
//         {
//           method: 'GET',
//         }
//       );

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.style.display = 'none';
//         a.href = url;
//         a.download = `kyc_report_${new Date().toISOString().split('T')[0]}.xlsx`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//       } else {
//         console.error('Download failed:', response.status, response.statusText);
//         const errorText = await response.text();
//         console.error('Error response:', errorText);
//       }
//     } catch (error) {
//       console.error('Error downloading Excel:', error);
//     }
//   };

//   // Handle filter changes
// const formatDateForFilter = (dateString) => {
//   if (!dateString) return '';
//   // Convert YYYY-MM-DD to DD-MM-YYYY for display
//   const [year, month, day] = dateString.split('-');
//   return `${day}-${month}-${year}`;
// };



//   const handleFilterChange = (key, value) => {
//   // If it's a date field, ensure proper format
//   if (key.includes('Date') && value) {
//     console.log(`Date filter ${key}:`, value, '->', formatDateForFilter(value));
//   }
//   setFilters(prev => ({ ...prev, [key]: value }));
// };
//   // const handleFilterChange = (key, value) => {
//   //   setFilters(prev => ({ ...prev, [key]: value }));
//   // };

//   const handleReset = () => {
//     setFilters({
//       searchQuery: '',
//       product: '',
//       productType: '',
//       status: '',
//       caseStatus: '',
//       dateInStart: '',
//       dateInEnd: '',
//       dateOutStart: '',
//       dateOutEnd: '',
//       sentDate: '',
//       vendorStatus: '',
//       priority: '',
//       clientType: '',
//       clientCode: '',
//       year: '',
//       month: '',
//     });
//     setCurrentPage(1);
//   };

//   // Get selected rows count
//   const getSelectedRowCount = () => {
//     if (gridRef.current?.api) {
//       const selectedRows = gridRef.current.api.getSelectedRows();
//       return selectedRows.length;
//     }
//     return 0;
//   };

//   // Pagination handlers
//   const handlePageSizeChange = (e) => {
//     const newSize = parseInt(e.target.value);
//     setPageSize(newSize);
//     setCurrentPage(1); // Reset to first page when changing page size
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     const totalPages = Math.ceil(totalCount / pageSize);
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handleFirstPage = () => {
//     setCurrentPage(1);
//   };

//   const handleLastPage = () => {
//     const totalPages = Math.ceil(totalCount / pageSize);
//     setCurrentPage(totalPages);
//   };

//   // Generate year and month options
//   const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
//   const monthOptions = [
//     { value: '01', label: 'January' }, { value: '02', label: 'February' }, 
//     { value: '03', label: 'March' }, { value: '04', label: 'April' }, 
//     { value: '05', label: 'May' }, { value: '06', label: 'June' },
//     { value: '07', label: 'July' }, { value: '08', label: 'August' }, 
//     { value: '09', label: 'September' }, { value: '10', label: 'October' }, 
//     { value: '11', label: 'November' }, { value: '12', label: 'December' }
//   ];

//   const totalPages = Math.ceil(totalCount / pageSize);

//   return (
//     <Layout>
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-screen-2xl mx-auto">
//           {/* Header and Filters */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">KYC Report Generator</h1>
//                 <p className="text-sm text-gray-600 mt-1">Manage and analyze KYC case data</p>
//               </div>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={downloadExcel}
//                   className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   Export Excel
//                 </button>
//                 <button
//                   onClick={handleReset}
//                   className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
//                 >
//                   Reset Filters
//                 </button>
//                 {saving && (
//                   <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
//                     <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                     Saving...
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Compact Filters Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//               {/* Search */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Global Search
//                 </label>
//                 <input
//                   type="text"
//                   value={filters.searchQuery}
//                   onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
//                   placeholder="Search across all fields..."
//                   className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                 />
//               </div>

//               {/* Product Dropdown */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Product
//                 </label>
//                 <Select
//                   value={filters.product ? { value: filters.product, label: filters.product } : null}
//                   onChange={(selectedOption) => {
//                     handleFilterChange('product', selectedOption ? selectedOption.value : "");
//                   }}
//                   options={[
//                     { value: "", label: "All Products" },
//                     ...productOptions.map(product => ({ value: product, label: product }))
//                   ]}
//                   styles={customStyles}
//                   placeholder="All Products"
//                   isClearable
//                 />
//               </div>

//               {/* Client Code Dropdown */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Client Code
//                 </label>
//                 <Select
//                   value={filters.clientCode ? { value: filters.clientCode, label: filters.clientCode } : null}
//                   onChange={(selectedOption) => {
//                     handleFilterChange('clientCode', selectedOption ? selectedOption.value : "");
//                   }}
//                   options={[
//                     { value: "", label: "All Client Codes" },
//                     ...clientCodes.map(code => ({ value: code.clientCode || code, label: code.clientCode || code }))
//                   ]}
//                   styles={customStyles}
//                   placeholder="All Client Codes"
//                   isClearable
//                 />
//               </div>

//               {/* Status Dropdown */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <Select
//                   value={filters.status ? { value: filters.status, label: filters.status } : null}
//                   onChange={(selectedOption) => {
//                     handleFilterChange('status', selectedOption ? selectedOption.value : "");
//                   }}
//                   options={[
//                     { value: "", label: "All Status" },
//                     ...statusOptions.map(status => ({ value: status, label: status }))
//                   ]}
//                   styles={customStyles}
//                   placeholder="All Status"
//                   isClearable
//                 />
//               </div>

//               {/* Case Status Dropdown */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Case Status
//                 </label>
//                 <Select
//                   value={filters.caseStatus ? { value: filters.caseStatus, label: filters.caseStatus } : null}
//                   onChange={(selectedOption) => {
//                     handleFilterChange('caseStatus', selectedOption ? selectedOption.value : "");
//                   }}
//                   options={[
//                     { value: "", label: "All Case Status" },
//                     ...caseStatusOptions.map(status => ({ value: status, label: status }))
//                   ]}
//                   styles={customStyles}
//                   placeholder="All Case Status"
//                   isClearable
//                 />
//               </div>

//               {/* Year and Month */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
//                   <select
//                     value={filters.year}
//                     onChange={(e) => handleFilterChange('year', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   >
//                     <option value="">All Years</option>
//                     {yearOptions.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
//                   <select
//                     value={filters.month}
//                     onChange={(e) => handleFilterChange('month', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   >
//                     <option value="">All Months</option>
//                     {monthOptions.map(month => (
//                       <option key={month.value} value={month.value}>{month.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Date In Range */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Date In Start</label>
//                   <input
//                     type="date"
//                     value={filters.dateInStart}
//                     onChange={(e) => handleFilterChange('dateInStart', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Date In End</label>
//                   <input
//                     type="date"
//                     value={filters.dateInEnd}
//                     onChange={(e) => handleFilterChange('dateInEnd', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   />
//                 </div>
//               </div>

//               {/* Date Out Range */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Date Out Start</label>
//                   <input
//                     type="date"
//                     value={filters.dateOutStart}
//                     onChange={(e) => handleFilterChange('dateOutStart', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Date Out End</label>
//                   <input
//                     type="date"
//                     value={filters.dateOutEnd}
//                     onChange={(e) => handleFilterChange('dateOutEnd', e.target.value)}
//                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* AG Grid Toolbar */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div className="text-sm text-gray-600">
//                 <span className="font-medium">{getSelectedRowCount()}</span> of <span className="font-medium">{rowData.length}</span> rows selected on this page
//                 {loading && <span className="ml-4 text-blue-600">Loading data...</span>}
//               </div>
//               <div className="text-sm text-gray-500">
//                 Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
//               </div>
//             </div>
//           </div>

//           {/* Pagination Controls */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <span className="text-sm text-gray-600">Page size:</span>
//                 <select 
//                   value={pageSize} 
//                   onChange={handlePageSizeChange}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                   <option value={100}>100</option>
//                   <option value={200}>200</option>
//                 </select>
//               </div>
              
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={handleFirstPage}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   First
//                 </button>
//                 <button
//                   onClick={handlePreviousPage}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Previous
//                 </button>
//                 <span className="px-4 py-2 text-sm font-medium">
//                   Page {currentPage} of {totalPages || 1}
//                 </span>
//                 <button
//                   onClick={handleNextPage}
//                   disabled={currentPage >= totalPages}
//                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Next
//                 </button>
//                 <button
//                   onClick={handleLastPage}
//                   disabled={currentPage >= totalPages}
//                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Last
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* AG Grid */}
//           <div className="ag-theme-alpine rounded-xl shadow-sm" style={{ height: '60vh', width: '100%' }}>
//             <AgGridReact
//               ref={gridRef}
//               rowData={rowData}
//               columnDefs={columnDefs}
//               defaultColDef={defaultColDef}
//               rowSelection="multiple"
//               suppressRowClickSelection={true}
//               pagination={false} // We handle pagination manually
//               onCellValueChanged={onCellValueChanged}
//               onGridReady={(params) => {
//                 params.api.sizeColumnsToFit();
//               }}
//               onFirstDataRendered={(params) => {
//                 params.api.sizeColumnsToFit();
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ClientTracker;

