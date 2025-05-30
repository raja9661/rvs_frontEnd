import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../Layout/Layout';
import { 
  Clock, UserCheck, UserX, AlertTriangle, CheckCircle, Activity,
  RefreshCw, Download, ChevronRight, PieChart, Search, Loader2, X
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ComposedChart, Area, Legend
} from "recharts";
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LiveDashboard = () => {
  const isDarkMode = localStorage.getItem("theme") === "dark";
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    trends: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);
  
  const [modalData, setModalData] = useState({
    open: false,
    title: '',
    data: null,
    loading: false,
    hierarchy: {
      level: null,
      type: null,
      year: null,
      month: null,
      clientType: null,
      clientCode: null,
      product: null
    }
  });

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data);
      setRole(data.role || "");
    }
  }, []);

  // Formatting functions
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
  
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  // const formatMonth = (monthNum) => {
  //   const months = ['January', 'February', 'March', 'April', 'May', 'June', 
  //                  'July', 'August', 'September', 'October', 'November', 'December'];
  //   return months[parseInt(monthNum) - 1] || monthNum;
  // };
const formatMonth = (monthNum, year) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[parseInt(monthNum) - 1] || monthNum;
  return year ? `${monthName} ${year}` : monthName;
};
// Add this enhanced search function
// Enhanced getSearchableFields function
const getSearchableFields = (item, level) => {
  const fields = [];
  
  // Always include name/ID fields
  if (item.name) fields.push(item.name.toString().toLowerCase());
  if (item._id) fields.push(item._id.toString().toLowerCase());
  if (item.caseId) fields.push(item.caseId.toString().toLowerCase());

  // Level-specific fields
  switch(level) {
    case 'clientType':
      if (item.clientType) fields.push(item.clientType.toString().toLowerCase());
      break;
    case 'clientCode':
      if (item.clientCode) fields.push(item.clientCode.toString().toLowerCase());
      break;
    case 'product':
    case 'productDetails':
      if (item.product) fields.push(item.product.toString().toLowerCase());
      if (item.caseStatus) fields.push(item.caseStatus.toString().toLowerCase());
      if (item.priority) fields.push(item.priority.toString().toLowerCase());
      break;
  }
  
  return fields;
};

// Enhanced search functionality
// Add these constants at the top of your component
const SEARCH_CONFIG = {
  year: {
    fields: ['name'],
    placeholder: 'Search years...'
  },
  month: {
    fields: ['name'],
    placeholder: 'Search months...'
  },
  clientType: {
    fields: ['name', 'clientType'],
    placeholder: 'Search client types...'
  },
  clientCode: {
    fields: ['name', 'clientCode', 'clientType'],
    placeholder: 'Search client codes...'
  },
  product: {
    fields: ['name', 'product', 'clientCode'],
    placeholder: 'Search products...'
  },
  productDetails: {
    fields: ['caseId', 'clientType', 'clientCode', 'product', 'caseStatus', 'priority', 'name'],
    placeholder: 'Search cases...'
  }
};

// Utility function to get field values safely
const getFieldValue = (item, field) => {
  if (!item) return '';
  if (field.includes('.')) {
    return field.split('.').reduce((o, i) => o?.[i] || '', item);
  }
  return item[field] || '';
};

// Replace your existing filterRecords function with this:
const filterRecords = (records, searchTerm, level) => {
  if (!records || !Array.isArray(records)) return [];
  if (!searchTerm) return records;

  const config = SEARCH_CONFIG[level] || SEARCH_CONFIG.productDetails;
  const searchLower = searchTerm.toLowerCase();

  return records.filter(item => {
    return config.fields.some(field => {
      const value = getFieldValue(item, field);
      return value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Replace your filteredRecords useMemo with this:
const filteredRecords = useMemo(() => {
  return filterRecords(
    modalData.hierarchy.level === 'productDetails' ? records.data : modalData.data, 
    searchTerm, 
    modalData.hierarchy.level
  );
}, [records.data, modalData.data, searchTerm, modalData.hierarchy.level]);

// Enhanced filteredRecords implementation
// const filteredRecords = useMemo(() => {
//   if (!records.data) return [];
//   if (!searchTerm) return records.data;
  
//   const searchLower = searchTerm.toLowerCase();
//   const { level } = modalData.hierarchy;

//   return records.data.filter(item => {
//     const fields = getSearchableFields(item, level);
//     return fields.some(field => 
//       field.toLowerCase().includes(searchLower)
//     );
//   });
// }, [records.data, searchTerm, modalData.hierarchy.level]);

// Updated fetchCaseDetails for today cases
// const fetchCaseDetails = async (type, year = null, month = null, clientType = null, clientCode = null, product = null) => {
//   setModalData(prev => ({
//     ...prev,
//     open: true,
//     loading: true,
//     title: type,
//     hierarchy: {
//       level: product ? 'productDetails' : 
//              clientCode ? 'product' : 
//              clientType ? 'clientCode' : 
//              type === 'today' ? 'clientType' : // Skip year/month for today cases
//              month ? 'clientType' :
//              year ? 'month' :
//              'year',
//       type,
//       year,
//       month,
//       clientType,
//       clientCode,
//       product
//     }
//   }));

//   try {
//     const url = new URL(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details`);
//     url.searchParams.set('type', type);
//      if (type !== 'today') {
//       if (year) url.searchParams.set('year', year);
//       if (month) url.searchParams.set('month', month);
//     }
    
//     if (clientType) url.searchParams.set('clientType', clientType);
//     if (clientCode) url.searchParams.set('clientCode', clientCode);
//     if (product) url.searchParams.set('product', product);

//     if (searchTerm) url.searchParams.set('search', searchTerm);

//     const res = await fetch(url.toString(), {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ role, user: user?.name })
//     });

//     const data = await res.json();

//     if (data.success) {
//       setModalData(prev => ({
//         ...prev,
//         data: data.data,
//         loading: false
//       }));
//       setRecords({
//         data: data.records,
//         loading: false
//       });
//       setSearchTerm(''); // Reset search term on new data load
//     }
//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     setModalData(prev => ({ ...prev, loading: false }));
//   }
// };
// Updated fetchCaseDetails function
const fetchCaseDetails = async (type, year = null, month = null, clientType = null, clientCode = null, product = null) => {
  // Clear previous search term when fetching new data
  setSearchTerm('');
  
  // Determine hierarchy level
  let level;
  if (type === 'today') {
    if (clientType) {
      level = clientCode ? 'product' : 'clientCode';
    } else {
      level = 'clientType'; // Default to clientType for today cases
    }
  } else {
    level = product ? 'productDetails' : 
           clientCode ? 'product' : 
           clientType ? 'clientCode' : 
           month ? 'clientType' :
           year ? 'month' :
           'year';
  }

  setModalData(prev => ({
    ...prev,
    open: true,
    loading: true,
    title: type === 'today' ? "Today's Cases" : `${type} Cases`,
    hierarchy: { level, type, year, month, clientType, clientCode, product }
  }));

  try {
    const params = new URLSearchParams();
    params.append('type', type);
    
    // Only add date params for non-today cases
    if (type !== 'today') {
      if (year) params.append('year', year);
      if (month) params.append('month', month);
    }
    
    if (clientType) params.append('clientType', clientType);
    if (clientCode) params.append('clientCode', clientCode);
    if (product) params.append('product', product);

    const res = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role, user: user?.name })
    });

    const data = await res.json();

    if (data.success) {
      setModalData(prev => ({
        ...prev,
        data: data.data,
        loading: false
      }));
      setRecords({
        data: data.records,
        loading: false
      });
    }
  } catch (error) {
    console.error("Error fetching case details:", error);
    setModalData(prev => ({ ...prev, loading: false, data: [] }));
  }
};
// Updated socket connection with role-based filtering
useEffect(() => {
  // Initial data fetch
  fetchData();

  // Socket connection setup
  const socketOptions = {
    auth: {
      role,
      user: user?.name
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket']
  };

  const newSocket = io(import.meta.env.VITE_Backend_Base_URL, socketOptions);

  // Connection established handler
  const handleConnect = () => {
    console.log('Socket connected:', newSocket.id);
    
    // Join appropriate room based on role
    if (role === 'employee' && user?.name) {
      newSocket.emit('join-room', `employee_${user.name}`);
    } else if (role === 'admin') {
      newSocket.emit('join-room', 'admins');
    }
    
    // Request immediate data update on connection
    newSocket.emit('request-update');
  };

  // Dashboard update handler
  const handleDashboardUpdate = (data) => {
    console.log('Received dashboard update');
    
    // Client-side data filtering for employees
    const processedData = role === 'employee'
      ? {
          ...data,
          activity: data.activity?.filter(item => item.listByEmployee === user?.name) || []
        }
      : data;

    setDashboardData(prev => ({
      stats: processedData.stats || prev.stats,
      trends: processedData.trends || prev.trends,
      activity: processedData.activity || prev.activity
    }));
    setLastUpdated(new Date());
  };

  // Error handlers
  const handleConnectError = (err) => {
    console.error('Socket connection error:', err);
  };

  const handleDisconnect = (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      newSocket.connect();
    }
  };

  // Event listeners
  newSocket.on('connect', handleConnect);
  newSocket.on('dashboardUpdate', handleDashboardUpdate);
  newSocket.on('connect_error', handleConnectError);
  newSocket.on('disconnect', handleDisconnect);

  // Cleanup function
  return () => {
    console.log('Cleaning up socket connection');
    newSocket.off('connect', handleConnect);
    newSocket.off('dashboardUpdate', handleDashboardUpdate);
    newSocket.off('connect_error', handleConnectError);
    newSocket.off('disconnect', handleDisconnect);
    newSocket.disconnect();
  };
}, [user, role]);


  // Drill down handler
  const handleDrillDown = (item) => {
    const { level, type, year, month, clientType, clientCode } = modalData.hierarchy;
    
    switch(level) {
      case 'year':
        fetchCaseDetails(type, item.name);
        break;
      case 'month':
        fetchCaseDetails(type, year, item.name);
        break;
      case 'clientType':
        fetchCaseDetails(type, year, month, item.name);
        break;
      case 'clientCode':
        fetchCaseDetails(type, year, month, clientType, item.name);
        break;
      case 'product':
        fetchCaseDetails(type, year, month, clientType, clientCode, item.name);
        break;
      default:
        break;
    }
  };

  // Download records
  // const downloadRecords = async (name) => {
  //   setExportLoading(true);
  //   try {
  //     const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
      
  //     const params = new URLSearchParams();
  //     params.append('type', type);
  //     params.append('download', 'true');
      
  //     if (year) params.append('year', year);
  //     if (month) params.append('month', month);
  //     if (clientType) params.append('clientType', clientType);
  //     if (clientCode) params.append('clientCode', clientCode);
  //     if (product) params.append('product', product);
      
  //     if (name) {
  //       if (level === 'year') {
  //         params.append('year', name);
  //       } else if (level === 'month') {
  //         params.append('month', name);
  //       } else if (level === 'clientType') {
  //         params.append('clientType', name);
  //       } else if (level === 'clientCode') {
  //         params.append('clientCode', name);
  //       } else if (level === 'product') {
  //         params.append('product', name);
  //       }
  //     }

  //     const response = await fetch(
  //       `${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({ role, user: user?.name })
  //       }
  //     );
      
  //     if (!response.ok) throw new Error('Download failed');

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
      
  //     const filenameParts = [type];
  //     if (year) filenameParts.push(year);
  //     if (month) filenameParts.push(month);
  //     if (clientType) filenameParts.push(clientType);
  //     if (clientCode) filenameParts.push(clientCode);
  //     if (product) filenameParts.push(product);
  //     if (name) filenameParts.push(name);
  //     a.download = `${filenameParts.join('_')}.xlsx`;
      
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     alert('Failed to download. Please try again.');
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };
  // Updated downloadRecords function
const downloadRecords = async (name) => {
  setExportLoading(true);
  try {
    const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
    
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('download', 'true');
    
    // Special handling for today cases
    if (type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      params.append('today', today);
    } else {
      if (year) params.append('year', year);
      if (month) params.append('month', month);
    }
    
    if (clientType) params.append('clientType', clientType);
    if (clientCode) params.append('clientCode', clientCode);
    if (product) params.append('product', product);
    
    if (name) {
      if (level === 'year') {
        params.append('year', name);
      } else if (level === 'month') {
        params.append('month', name);
      } else if (level === 'clientType') {
        params.append('clientType', name);
      } else if (level === 'clientCode') {
        params.append('clientCode', name);
      } else if (level === 'product') {
        params.append('product', name);
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, user: user?.name })
      }
    );
    
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const filenameParts = [type];
    if (type !== 'today') {
      if (year) filenameParts.push(year);
      if (month) filenameParts.push(month);
    }
    if (clientType) filenameParts.push(clientType);
    if (clientCode) filenameParts.push(clientCode);
    if (product) filenameParts.push(product);
    if (name) filenameParts.push(name);
    a.download = `${filenameParts.join('_')}.xlsx`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download. Please try again.');
  } finally {
    setExportLoading(false);
  }
};
  // Export current view
  const exportCurrentView = async () => {
    await downloadRecords();
  };

  // Fetch dashboard data
  // Update your fetchData function
const fetchData = async () => { 
  setLoading(true);
  try {
    if (!user && !role) {
      console.log('Cannot fetch data - user name missing for employee');
      return;
    }
    const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        role, 
        user: user?.name,
        timestamp: Date.now() 
      }) 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { stats, trends, activity } = await response.json();
    
    // Verify data is properly filtered for employee role
    if (role === 'employee') {
      const employeeName = user?.name;
      if (stats.totalCases > 0 && !employeeName) {
        console.warn('Employee data requested without user name');
      }
    }

    setDashboardData({ 
      stats: stats || null,
      trends: trends || [],
      activity: activity || []
    });
    setLastUpdated(new Date());
  } catch (error) {
    console.error("Error fetching data:", error);
    // Set empty data for employee if error occurs
    if (role === 'employee') {
      setDashboardData({
        stats: null,
        trends: [],
        activity: []
      });
    }
  } finally {
    setLoading(false);
  }
};

  // Initialize socket connection
  useEffect(() => {
    fetchData();

    const newSocket = io(import.meta.env.VITE_Backend_Base_URL);
    setSocket(newSocket);

    newSocket.on('dashboardUpdate', (data) => {
      setDashboardData(prev => ({ ...prev, ...data }));
      setLastUpdated(new Date());
    });

    return () => newSocket.disconnect();
  }, [user]);

  // Stats cards configuration
  const statsCards = [
    { 
      title: "Total Cases", value: dashboardData.stats?.totalCases || 0, icon: Clock,
      color: isDarkMode ? 'text-yellow-500' : 'text-purple-500',
      bgColor: isDarkMode ? 'bg-yellow-500/10' : 'bg-purple-500/10',
      onClick: () => fetchCaseDetails('total')
    },
    { 
      title: "Today's Cases", value: dashboardData.stats?.todayCases || 0, icon: UserCheck,
      color: isDarkMode ? 'text-blue-500' : 'text-cyan-500',
      bgColor: isDarkMode ? 'bg-blue-500/10' : 'bg-cyan-500/10',
      onClick: () => fetchCaseDetails('today')
    },
    { 
      title: "New Pending", value: dashboardData.stats?.pendingCases || 0, icon: UserX,
      color: isDarkMode ? 'text-red-500' : 'text-rose-500',
      bgColor: isDarkMode ? 'bg-red-500/10' : 'bg-rose-500/10',
      onClick: () => fetchCaseDetails('New Pending')
    },
    { 
      title: "High Priority", value: dashboardData.stats?.highPriorityCases || 0, icon: AlertTriangle,
      color: isDarkMode ? 'text-orange-500' : 'text-amber-500',
      bgColor: isDarkMode ? 'bg-orange-500/10' : 'bg-amber-500/10',
      onClick: () => fetchCaseDetails('highPriority')
    },
    { 
      title: "Closed Cases", value: dashboardData.stats?.closedCases || 0, icon: CheckCircle,
      color: isDarkMode ? 'text-green-500' : 'text-emerald-500',
      bgColor: isDarkMode ? 'bg-green-500/10' : 'bg-emerald-500/10',
      onClick: () => fetchCaseDetails('closed')
    },
    { 
      title: "Completion Rate", 
      value: dashboardData.stats?.completionRate ? `${dashboardData.stats.completionRate}%` : '0%', 
      icon: Activity,
      color: isDarkMode ? 'text-indigo-500' : 'text-violet-500',
      bgColor: isDarkMode ? 'bg-indigo-500/10' : 'bg-violet-500/10'
    }
  ];

  // const renderModalContent = () => {
  //   if (modalData.loading) {
  //     return (
  //       <div className="flex justify-center py-8">
  //         <Loader2 className="animate-spin h-8 w-8" />
  //       </div>
  //     );
  //   }

  //   const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
  //   const displayData = level === 'productDetails' ? filteredRecords : modalData.data;
    

  //   return (
  //     <div className="space-y-4">
  //       {/* Breadcrumb navigation */}
  //       <div className="flex items-center text-sm mb-4 flex-wrap gap-2">
  //         <button 
  //           onClick={() => fetchCaseDetails(type)}
  //           className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
  //         >
  //           {type} Cases
  //         </button>
          
  //         {year && (
  //           <>
  //             <ChevronRight className="w-4 h-4 mx-1" />
  //             <button 
  //               onClick={() => fetchCaseDetails(type, year)}
  //               className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
  //             >
  //               {year}
  //             </button>
  //           </>
  //         )}
          
  //         {month && (
  //           <>
  //             <ChevronRight className="w-4 h-4 mx-1" />
  //             <button 
  //               onClick={() => fetchCaseDetails(type, year, month)}
  //               className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
  //             >
  //               {formatMonth(month)}
  //             </button>
  //           </>
  //         )}
          
  //         {clientType && (
  //           <>
  //             <ChevronRight className="w-4 h-4 mx-1" />
  //             <button 
  //               onClick={() => fetchCaseDetails(type, year, month, clientType)}
  //               className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
  //             >
  //               {clientType}
  //             </button>
  //           </>
  //         )}
          
  //         {clientCode && (
  //           <>
  //             <ChevronRight className="w-4 h-4 mx-1" />
  //             <button 
  //               onClick={() => fetchCaseDetails(type, year, month, clientType, clientCode)}
  //               className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
  //             >
  //               {clientCode}
  //             </button>
  //           </>
  //         )}
          
  //         {product && (
  //           <>
  //             <ChevronRight className="w-4 h-4 mx-1" />
  //             <span>{product}</span>
  //           </>
  //         )}
  //       </div>

  //       {/* Search bar */}
  //       <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
  //         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //           <Search className="h-5 w-5 text-gray-400" />
  //         </div>
  //         <input
  //           type="text"
  //           placeholder={
  //             level === 'year' ? "Search years..." :
  //             level === 'month' ? "Search months..." :
  //             level === 'clientType' ? "Search client types..." :
  //             level === 'clientCode' ? "Search client codes..." :
  //             level === 'product' ? "Search products..." :
  //             "Search cases..."
  //           }
  //           className={`block w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
  //           value={searchTerm}
  //           onChange={(e) => setSearchTerm(e.target.value)}
  //         />
  //       </div>

  //       {/* Data table */}
  //       <div className="overflow-x-auto">
  //         <table className="w-full">
  //           <thead>
  //             <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
  //               <th className="px-4 py-2 text-left">Name</th>
  //               <th className="px-4 py-2 text-left">Count</th>
  //               {level === 'productDetails' && (
  //                 <>
  //                   <th className="px-4 py-2 text-left">Case ID</th>
  //                   <th className="px-4 py-2 text-left">Status</th>
  //                   <th className="px-4 py-2 text-left">Priority</th>
  //                   <th className="px-4 py-2 text-left">Date</th>
  //                 </>
  //               )}
  //               <th className="px-4 py-2 text-left">Actions</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {displayData?.map((item, index) => (
  //               <tr 
  //                 key={index} 
  //                 className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
  //               >
  //                 <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
  //                   {level === 'month' ? formatMonth(item.name) : (item.name || item.caseId)}
  //                 </td>
  //                 <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
  //                   {item.count || '-'}
  //                 </td>
                  
  //                 {level === 'productDetails' && (
  //                   <>
  //                     <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
  //                       {item.caseId}
  //                     </td>
  //                     <td className="px-4 py-2">
  //                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
  //                         item.caseStatus === 'New Pending' ? 
  //                           (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
  //                         item.caseStatus === 'Sent' ?
  //                           (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') :
  //                           (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
  //                       }`}>
  //                         {item.caseStatus}
  //                       </span>
  //                     </td>
  //                     <td className="px-4 py-2">
  //                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
  //                         item.priority === 'High' ? 
  //                           (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800') :
  //                           (isDarkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-800')
  //                       }`}>
  //                         {item.priority}
  //                       </span>
  //                     </td>
  //                     <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
  //                       {formatDate(item.updatedAt)}
  //                     </td>
  //                   </>
  //                 )}
                  
  //                 <td className="px-4 py-2">
  //                   <div className="flex space-x-2">
  //                     {level !== 'productDetails' ? (
  //                       <>
  //                         <button
  //                           onClick={() => handleDrillDown(item)}
  //                           className={`px-3 py-1 rounded text-sm ${
  //                             isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
  //                           } text-white flex items-center`}
  //                         >
  //                           View <ChevronRight className="w-4 h-4 ml-1" />
  //                         </button>
  //                         <button
  //                           onClick={() => downloadRecords(item.name)}
  //                           disabled={exportLoading}
  //                           className={`px-3 py-1 rounded text-sm ${
  //                             isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
  //                           } text-white flex items-center disabled:opacity-50`}
  //                         >
  //                           {exportLoading ? (
  //                             <Loader2 className="w-4 h-4 ml-1 animate-spin" />
  //                           ) : (
  //                             <>
  //                               Download <Download className="w-4 h-4 ml-1" />
  //                             </>
  //                           )}
  //                         </button>
  //                       </>
  //                     ) : (
  //                       <button
  //                         onClick={() => downloadRecords(item.caseId)}
  //                         className={`px-3 py-1 rounded text-sm ${
  //                           isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
  //                         } text-white flex items-center`}
  //                       >
  //                         Download <Download className="w-4 h-4 ml-1" />
  //                       </button>
  //                     )}
  //                   </div>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   );
  // };
  const renderModalContent = () => {
  if (modalData.loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
  const displayData = level === 'productDetails' ? filteredRecords : modalData.data;

  // Function to get the appropriate title based on hierarchy level
  const getModalTitle = () => {
    switch(level) {
      case 'year':
        return `${type} Cases by Year`;
      case 'month':
        return `${type} Cases for ${year} by Month`;
      case 'clientType':
        return type === 'today' 
          ? `Today's Cases by Client Type` 
          : `${type} Cases for ${formatMonth(month, year)} by Client Type`;
      case 'clientCode':
        return `${type} Cases for ${clientType} by Client Code`;
      case 'product':
        return `${type} Cases for ${clientCode} by Product`;
      case 'productDetails':
        return `${type} Case Details for ${product}`;
      default:
        return `${type} Cases`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm mb-4 flex-wrap gap-2">
        <button 
          onClick={() => fetchCaseDetails(type)}
          className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
        >
          {type} Cases
        </button>
        
        {year && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <button 
              onClick={() => fetchCaseDetails(type, year)}
              className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              {year}
            </button>
          </>
        )}
        
        {month && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <button 
              onClick={() => fetchCaseDetails(type, year, month)}
              className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              {formatMonth(month, year)}
            </button>
          </>
        )}
        
        {clientType && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <button 
              onClick={() => fetchCaseDetails(type, year, month, clientType)}
              className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              {clientType}
            </button>
          </>
        )}
        
        {clientCode && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <button 
              onClick={() => fetchCaseDetails(type, year, month, clientType, clientCode)}
              className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              {clientCode}
            </button>
          </>
        )}
        
        {product && (
          <>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span>{product}</span>
          </>
        )}
      </div>

      {/* Search bar */}
<div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2 mb-4`}>
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Search className="h-5 w-5 text-gray-400" />
  </div>
  <input
    type="text"
    placeholder={SEARCH_CONFIG[modalData.hierarchy.level]?.placeholder || "Search..."}
    className={`block w-full pl-10 pr-10 py-2 ${
      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
  />
  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
      aria-label="Clear search"
    >
      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
    </button>
  )}
</div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Count</th>
              {level === 'productDetails' && (
                <>
                  <th className="px-4 py-2 text-left">Case ID</th>
                  <th className="px-4 py-2 text-left">Client Type</th>
                  <th className="px-4 py-2 text-left">Client Code</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </>
              )}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData?.length > 0 ? (
              displayData.map((item, index) => (
                <tr 
                  key={index} 
                  className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
                >
                  <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {level === 'month' ? formatMonth(item.name, year) : (item.name || item.caseId)}
                  </td>
                  <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.count || '-'}
                  </td>
                  
                  {level === 'productDetails' && (
                    <>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.caseId}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.clientType}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.clientCode}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.caseStatus === 'New Pending' ? 
                            (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
                          item.caseStatus === 'Sent' ?
                            (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') :
                            (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
                        }`}>
                          {item.caseStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'High' ? 
                            (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800') :
                            (isDarkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(item.updatedAt)}
                      </td>
                    </>
                  )}
                  
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      {level !== 'productDetails' ? (
                        <>
                          <button
                            onClick={() => handleDrillDown(item)}
                            className={`px-3 py-1 rounded text-sm ${
                              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white flex items-center`}
                          >
                            View <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                          <button
                            onClick={() => downloadRecords(item.name)}
                            disabled={exportLoading}
                            className={`px-3 py-1 rounded text-sm ${
                              isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                            } text-white flex items-center disabled:opacity-50`}
                          >
                            {exportLoading ? (
                              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                            ) : (
                              <>
                                Download <Download className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => downloadRecords(item.caseId)}
                          className={`px-3 py-1 rounded text-sm ${
                            isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                          } text-white flex items-center`}
                        >
                          Download <Download className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={level === 'productDetails' ? 9 : 3} 
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex justify-between items-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg p-4 shadow-xl`}>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Live Dashboard ({role === 'admin' ? 'Admin View' : 'Employee View'})
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={fetchData}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            </button>
            <button 
              onClick={() => {
                const worksheet = XLSX.utils.json_to_sheet(dashboardData.trends);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "DashboardData");
                XLSX.writeFile(workbook, "DashboardExport.xlsx");
              }}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
              title="Export to Excel"
            >
              <Download className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white/95 backdrop-blur-sm hover:bg-gray-50'
                } rounded-lg p-6 shadow-xl transition-all hover:shadow-lg cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      {stat.title}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-2xl font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Trends Chart */}
          <div className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
          } rounded-lg p-6 shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Verification Trends (Last 7 Days)
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dashboardData.trends}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                      color: isDarkMode ? '#FFFFFF' : '#111827'
                    }}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Cases"
                    fill={isDarkMode ? '#8B5CF6' : '#7C3AED'}
                    stroke={isDarkMode ? '#8B5CF6' : '#7C3AED'}
                    fillOpacity={0.2}
                  />
                  <Bar dataKey="completed" name="Completed" fill={isDarkMode ? '#10B981' : '#059669'} />
                  <Bar dataKey="pending" name="Pending" fill={isDarkMode ? '#F59E0B' : '#D97706'} />
                  <Bar dataKey="sent" name="Sent" fill={isDarkMode ? '#3B82F6' : '#2563EB'} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
          } rounded-lg p-6 shadow-xl`}>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } mb-4`}>
              Recent Activity
            </h3>
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                    <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Case ID
                    </th>
                    <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Name
                    </th>
                    <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Status
                    </th>
                    <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.activity.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`${
                        isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      } border-b transition-colors`}
                    >
                      <td className={`py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.caseId}
                      </td>
                      <td className={`py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.name}
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.caseStatus === 'New Pending' ? 
                            (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
                          item.caseStatus === 'Sent' ?
                            (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') :
                            (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
                        }`}>
                          {item.caseStatus}
                        </span>
                      </td>
                      <td className={`py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(item.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Case Details Modal */}
      {modalData.open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${
          isDarkMode ? 'bg-black/70' : 'bg-black/50'
        }`}>
          <div className={`rounded-lg p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {modalData.title} Cases - {modalData.hierarchy.level}
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={exportCurrentView}
                  disabled={exportLoading}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors disabled:opacity-50`}
                  title="Export to Excel"
                >
                  {exportLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className={`w-5 h-5 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`} />
                  )}
                </button>
                <button 
                  onClick={() => setModalData({...modalData, open: false})}
                  className={`p-1 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <X className={`w-6 h-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} />
                </button>
              </div>
            </div>
            
            {renderModalContent()}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LiveDashboard;


// import React, { useEffect, useState, useMemo } from 'react';
// import Layout from '../Layout/Layout';
// import { 
//   Clock, UserCheck, UserX, AlertTriangle, CheckCircle, Activity,
//   RefreshCw, Download, ChevronRight, PieChart, Search, Loader2, X
// } from "lucide-react";
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
//   ResponsiveContainer, ComposedChart, Area,Legend
// } from "recharts";
// import { io } from 'socket.io-client';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// const LiveDashboard = () => {
//   const isDarkMode = localStorage.getItem("theme") === "dark";
//   const [dashboardData, setDashboardData] = useState({
//     stats: null,
//     trends: [],
//     activity: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [exportLoading, setExportLoading] = useState(false);
//   const [role, setRole] = useState('');
//   const [user, setUser] = useState('');
  

//   const [modalData, setModalData] = useState({
//     open: false,
//     title: '',
//     data: null,
//     loading: false,
//     hierarchy: {
//       level: null,
//       type: null,
//       year: null,
//       month: null,
//       clientType: null,
//       clientCode: null,
//       product: null
//     }
//   });

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data)
//       setRole(data.role || "");
//     }
//   }, []);

//   // Formatting functions
//   const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { 
//     weekday: 'short', month: 'short', day: 'numeric' 
//   });
  
//   const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], {
//     hour: '2-digit', minute: '2-digit'
//   });

//   // Filter records based on search term and hierarchy level
//   const filteredRecords = useMemo(() => {
//     if (!records.data) return [];
    
//     const searchLower = searchTerm.toLowerCase();
//     const { level } = modalData.hierarchy;
    
//     return records.data.filter(item => {
//       if (!searchTerm) return true;

//       switch(level) {
//         case 'year':
//           return (item.name?.toLowerCase().includes(searchLower));
//         case 'month':
//           return (item.name?.toLowerCase().includes(searchLower));
//         case 'clientType':
//           return (item.name?.toLowerCase().includes(searchLower));
//         case 'clientCode':
//           return (item.name?.toLowerCase().includes(searchLower));
//         case 'product':
//           return (item.name?.toLowerCase().includes(searchLower));
//         case 'productDetails':
//           return (
//             (item.name?.toLowerCase().includes(searchLower)) ||
//             (item.caseId?.toLowerCase().includes(searchLower)) ||
//             (item.clientType?.toLowerCase().includes(searchLower)) ||
//             (item.clientCode?.toLowerCase().includes(searchLower)) ||
//             (item.product?.toLowerCase().includes(searchLower)) ||
//             (item.caseStatus?.toLowerCase().includes(searchLower)) ||
//             (item.priority?.toLowerCase().includes(searchLower))
//           );
//         default:
//           return true;
//       }
//     });
//   }, [records.data, searchTerm, modalData.hierarchy.level]);

//   // Fetch case details with hierarchy support
//   const fetchCaseDetails = async (type, year = null, month = null, clientType = null, clientCode = null, product = null) => {
//   setModalData(prev => ({
//     ...prev,
//     open: true,
//     loading: true,
//     title: type,
//     hierarchy: {
//       level: product ? 'productDetails' : 
//              clientCode ? 'product' : 
//              clientType ? 'clientCode' : 
//              month ? 'clientType' :
//              year ? 'month' :
//              'year',
//       type,
//       year,
//       month,
//       clientType,
//       clientCode,
//       product
//     }
//   }));

//   try {
//     const url = new URL(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details`);
//     url.searchParams.set('type', type);
//     if (year) url.searchParams.set('year', year);
//     if (month) url.searchParams.set('month', month);
//     if (clientType) url.searchParams.set('clientType', clientType);
//     if (clientCode) url.searchParams.set('clientCode', clientCode);
//     if (product) url.searchParams.set('product', product);
//     if (searchTerm) url.searchParams.set('search', searchTerm);

//     const res = await fetch(url.toString(), {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ role, user })
//     });

//     const data = await res.json();

//     if (data.success) {
//       setModalData(prev => ({
//         ...prev,
//         data: data.data,
//         loading: false
//       }));
//       setRecords({
//         data: data.records,
//         loading: false
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     setModalData(prev => ({ ...prev, loading: false }));
//   }
// };

// //   const fetchCaseDetails = async (type, year = null, month = null, clientType = null, clientCode = null, product = null) => {
// //     setModalData(prev => ({
// //       ...prev,
// //       open: true,
// //       loading: true,
// //       title: type,
// //       hierarchy: {
// //         level: product ? 'productDetails' : 
// //                clientCode ? 'product' : 
// //                clientType ? 'clientCode' : 
// //                month ? 'clientType' :
// //                year ? 'month' :
// //                'year',
// //         type,
// //         year,
// //         month,
// //         clientType,
// //         clientCode,
// //         product
// //       }
// //     }));

// //     try {
// //       const url = new URL(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details`,{role,user});
// //       console.log("url:",url)
// //       url.searchParams.set('type', type);
// //       if (year) url.searchParams.set('year', year);
// //       if (month) url.searchParams.set('month', month);
// //       if (clientType) url.searchParams.set('clientType', clientType);
// //       if (clientCode) url.searchParams.set('clientCode', clientCode);
// //       if (product) url.searchParams.set('product', product);
// //       if (searchTerm) url.searchParams.set('search', searchTerm);
      
// //       const res = await fetch(url.toString());
// //       const data = await res.json();
      
// //       if (data.success) {
// //         setModalData(prev => ({
// //           ...prev,
// //           data: data.data,
// //           loading: false
// //         }));
// //         setRecords({
// //           data: data.records,
// //           loading: false
// //         });
// //       }
// //     } catch (error) {
// //       console.error("Error fetching case details:", error);
// //       setModalData(prev => ({...prev, loading: false}));
// //     }
// //   };

//   // Drill down handler
//   const handleDrillDown = (item) => {
//     const { level, type, year, month, clientType, clientCode } = modalData.hierarchy;
    
//     switch(level) {
//       case 'year':
//         fetchCaseDetails(type, item.name);
//         break;
//       case 'month':
//         fetchCaseDetails(type, year, item.name);
//         break;
//       case 'clientType':
//         fetchCaseDetails(type, year, month, item.name);
//         break;
//       case 'clientCode':
//         fetchCaseDetails(type, year, month, clientType, item.name);
//         break;
//       case 'product':
//         fetchCaseDetails(type, year, month, clientType, clientCode, item.name);
//         break;
//       default:
//         break;
//     }
//   };

//   // Download records
//   const downloadRecords = async (name) => {
//     setExportLoading(true);
//     try {
//       const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
      
//       const params = new URLSearchParams();
//       params.append('type', type);
//       params.append('download', 'true');
      
//       if (year) params.append('year', year);
//       if (month) params.append('month', month);
//       if (clientType) params.append('clientType', clientType);
//       if (clientCode) params.append('clientCode', clientCode);
//       if (product) params.append('product', product);
      
//       if (name) {
//         if (level === 'year') {
//           params.append('year', name);
//         } else if (level === 'month') {
//           params.append('month', name);
//         } else if (level === 'clientType') {
//           params.append('clientType', name);
//         } else if (level === 'clientCode') {
//           params.append('clientCode', name);
//         } else if (level === 'product') {
//           params.append('product', name);
//         }
//       }

//       const response = await fetch(
//         `${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`,{role,user}
//       );
      
//       if (!response.ok) throw new Error('Download failed');

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
      
//       const filenameParts = [type];
//       if (year) filenameParts.push(year);
//       if (month) filenameParts.push(month);
//       if (clientType) filenameParts.push(clientType);
//       if (clientCode) filenameParts.push(clientCode);
//       if (product) filenameParts.push(product);
//       if (name) filenameParts.push(name);
//       a.download = `${filenameParts.join('_')}.xlsx`;
      
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       console.error('Download error:', error);
//       alert('Failed to download. Please try again.');
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   // Export current view
//   const exportCurrentView = async () => {
//     await downloadRecords();
//   };

//   // Fetch dashboard data
//   const fetchData = async () => { 
//   setLoading(true);
//   try {
//     const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/data`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ role, user }) 
//     });

//     const { stats, trends, activity } = await response.json();
    
//     setDashboardData({ stats, trends, activity });
//     setLastUpdated(new Date());
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // const fetchData = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/data`,{role,user});
//   //     const { stats, trends, activity } = await response.json();
      
//   //     setDashboardData({
//   //       stats,
//   //       trends,
//   //       activity
//   //     });
      
//   //     setLastUpdated(new Date());
//   //   } catch (error) {
//   //     console.error("Error fetching data:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Initialize socket connection
//   useEffect(() => {
//     fetchData();

//     const newSocket = io(import.meta.env.VITE_Backend_Base_URL);
//     setSocket(newSocket);

//     newSocket.on('dashboardUpdate', (data) => {
//       setDashboardData(prev => ({ ...prev, ...data }));
//       setLastUpdated(new Date());
//     });

//     return () => newSocket.disconnect();
//   }, []);


//   // Stats cards configuration
//   const statsCards = [
//     { 
//       title: "Total Cases", value: dashboardData.stats?.totalCases || 0, icon: Clock,
//       color: isDarkMode ? 'text-yellow-500' : 'text-purple-500',
//       bgColor: isDarkMode ? 'bg-yellow-500/10' : 'bg-purple-500/10',
//       onClick: () => fetchCaseDetails('total')
//     },
//     { 
//       title: "Today's Cases", value: dashboardData.stats?.todayCases || 0, icon: UserCheck,
//       color: isDarkMode ? 'text-blue-500' : 'text-cyan-500',
//       bgColor: isDarkMode ? 'bg-blue-500/10' : 'bg-cyan-500/10',
//       onClick: () => fetchCaseDetails('today')
//     },
//     { 
//       title: "New Pending", value: dashboardData.stats?.pendingCases || 0, icon: UserX,
//       color: isDarkMode ? 'text-red-500' : 'text-rose-500',
//       bgColor: isDarkMode ? 'bg-red-500/10' : 'bg-rose-500/10',
//       onClick: () => fetchCaseDetails('New Pending')
//     },
//     { 
//       title: "High Priority", value: dashboardData.stats?.highPriorityCases || 0, icon: AlertTriangle,
//       color: isDarkMode ? 'text-orange-500' : 'text-amber-500',
//       bgColor: isDarkMode ? 'bg-orange-500/10' : 'bg-amber-500/10',
//       onClick: () => fetchCaseDetails('highPriority')
//     },
//     { 
//       title: "Closed Cases", value: dashboardData.stats?.closedCases || 0, icon: CheckCircle,
//       color: isDarkMode ? 'text-green-500' : 'text-emerald-500',
//       bgColor: isDarkMode ? 'bg-green-500/10' : 'bg-emerald-500/10',
//       onClick: () => fetchCaseDetails('closed')
//     },
//     { 
//       title: "Completion Rate", 
//       value: dashboardData.stats?.completionRate ? `${dashboardData.stats.completionRate}%` : '0%', 
//       icon: Activity,
//       color: isDarkMode ? 'text-indigo-500' : 'text-violet-500',
//       bgColor: isDarkMode ? 'bg-indigo-500/10' : 'bg-violet-500/10'
//     }
//   ];

//   const renderModalContent = () => {
//     if (modalData.loading) {
//       return (
//         <div className="flex justify-center py-8">
//           <Loader2 className="animate-spin h-8 w-8" />
//         </div>
//       );
//     }

//     const { level, type, year, month, clientType, clientCode, product } = modalData.hierarchy;
//     const displayData = level === 'productDetails' ? filteredRecords : modalData.data;

//     return (
//       <div className="space-y-4">
//         {/* Breadcrumb navigation */}
//         <div className="flex items-center text-sm mb-4 flex-wrap gap-2">
//           <button 
//             onClick={() => fetchCaseDetails(type)}
//             className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//           >
//             {type} Cases
//           </button>
          
//           {year && (
//             <>
//               <ChevronRight className="w-4 h-4 mx-1" />
//               <button 
//                 onClick={() => fetchCaseDetails(type, year)}
//                 className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//               >
//                 {year}
//               </button>
//             </>
//           )}
          
//           {month && (
//             <>
//               <ChevronRight className="w-4 h-4 mx-1" />
//               <button 
//                 onClick={() => fetchCaseDetails(type, year, month)}
//                 className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//               >
//                 {month}
//               </button>
//             </>
//           )}
          
//           {clientType && (
//             <>
//               <ChevronRight className="w-4 h-4 mx-1" />
//               <button 
//                 onClick={() => fetchCaseDetails(type, year, month, clientType)}
//                 className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//               >
//                 {clientType}
//               </button>
//             </>
//           )}
          
//           {clientCode && (
//             <>
//               <ChevronRight className="w-4 h-4 mx-1" />
//               <button 
//                 onClick={() => fetchCaseDetails(type, year, month, clientType, clientCode)}
//                 className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//               >
//                 {clientCode}
//               </button>
//             </>
//           )}
          
//           {product && (
//             <>
//               <ChevronRight className="w-4 h-4 mx-1" />
//               <span>{product}</span>
//             </>
//           )}
//         </div>

//         {/* Search bar */}
//         <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder={
//               level === 'year' ? "Search years..." :
//               level === 'month' ? "Search months..." :
//               level === 'clientType' ? "Search client types..." :
//               level === 'clientCode' ? "Search client codes..." :
//               level === 'product' ? "Search products..." :
//               "Search cases..."
//             }
//             className={`block w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {/* Data table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                 <th className="px-4 py-2 text-left">Name</th>
//                 <th className="px-4 py-2 text-left">Count</th>
//                 {level === 'productDetails' && (
//                   <>
//                     <th className="px-4 py-2 text-left">Case ID</th>
//                     <th className="px-4 py-2 text-left">Status</th>
//                     <th className="px-4 py-2 text-left">Priority</th>
//                     <th className="px-4 py-2 text-left">Date</th>
//                   </>
//                 )}
//                 <th className="px-4 py-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayData?.map((item, index) => (
//                 <tr 
//                   key={index} 
//                   className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
//                 >
//                   <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {item.name || item.caseId}
//                   </td>
//                   <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                     {item.count || '-'}
//                   </td>
                  
//                   {level === 'productDetails' && (
//                     <>
//                       <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                         {item.caseId}
//                       </td>
//                       <td className="px-4 py-2">
//                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           item.caseStatus === 'New Pending' ? 
//                             (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
//                           item.caseStatus === 'Sent' ?
//                             (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') :
//                             (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
//                         }`}>
//                           {item.caseStatus}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2">
//                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           item.priority === 'High' ? 
//                             (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800') :
//                             (isDarkMode ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-800')
//                         }`}>
//                           {item.priority}
//                         </span>
//                       </td>
//                       <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {formatDate(item.updatedAt)}
//                       </td>
//                     </>
//                   )}
                  
//                   <td className="px-4 py-2">
//                     <div className="flex space-x-2">
//                       {level !== 'productDetails' ? (
//                         <>
//                           <button
//                             onClick={() => handleDrillDown(item)}
//                             className={`px-3 py-1 rounded text-sm ${
//                               isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
//                             } text-white flex items-center`}
//                           >
//                             View <ChevronRight className="w-4 h-4 ml-1" />
//                           </button>
//                           <button
//                             onClick={() => downloadRecords(item.name)}
//                             disabled={exportLoading}
//                             className={`px-3 py-1 rounded text-sm ${
//                               isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
//                             } text-white flex items-center disabled:opacity-50`}
//                           >
//                             {exportLoading ? (
//                               <Loader2 className="w-4 h-4 ml-1 animate-spin" />
//                             ) : (
//                               <>
//                                 Download <Download className="w-4 h-4 ml-1" />
//                               </>
//                             )}
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           onClick={() => downloadRecords(item.caseId)}
//                           className={`px-3 py-1 rounded text-sm ${
//                             isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
//                           } text-white flex items-center`}
//                         >
//                           Download <Download className="w-4 h-4 ml-1" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className={`flex justify-between items-center ${
//           isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-4 shadow-xl`}>
//           <div>
//             <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               Live Dashboard ({role === 'admin' ? 'Admin View' : 'Employee View'})
//             </h1>
//             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//               {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
//             </p>
//           </div>
//           <div className="flex space-x-2">
//             <button 
//               onClick={fetchData}
//               className={`p-2 rounded-lg ${
//                 isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
//               } transition-colors`}
//               title="Refresh Data"
//             >
//               <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
//             </button>
//             <button 
//               onClick={() => {
//                 const worksheet = XLSX.utils.json_to_sheet(dashboardData.trends);
//                 const workbook = XLSX.utils.book_new();
//                 XLSX.utils.book_append_sheet(workbook, worksheet, "DashboardData");
//                 XLSX.writeFile(workbook, "DashboardExport.xlsx");
//               }}
//               className={`p-2 rounded-lg ${
//                 isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
//               } transition-colors`}
//               title="Export to Excel"
//             >
//               <Download className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
//             </button>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//           {statsCards.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <div
//                 key={index}
//                 onClick={stat.onClick}
//                 className={`${
//                   isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white/95 backdrop-blur-sm hover:bg-gray-50'
//                 } rounded-lg p-6 shadow-xl transition-all hover:shadow-lg cursor-pointer`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
//                       {stat.title}
//                     </p>
//                     <div className="flex items-center mt-2">
//                       <span className={`text-2xl font-semibold ${
//                         isDarkMode ? 'text-white' : 'text-gray-900'
//                       }`}>
//                         {stat.value}
//                       </span>
//                     </div>
//                   </div>
//                   <div className={`${stat.bgColor} p-3 rounded-lg`}>
//                     <Icon className={`w-6 h-6 ${stat.color}`} />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Charts Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Verification Trends Chart */}
//           <div className={`${
//             isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
//           } rounded-lg p-6 shadow-xl`}>
//             <div className="flex justify-between items-center mb-4">
//               <h3 className={`text-lg font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>
//                 Verification Trends (Last 7 Days)
//               </h3>
//             </div>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <ComposedChart data={dashboardData.trends}>
//                   <CartesianGrid 
//                     strokeDasharray="3 3" 
//                     stroke={isDarkMode ? '#374151' : '#E5E7EB'}
//                   />
//                   <XAxis 
//                     dataKey="date" 
//                     stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
//                     tickFormatter={formatDate}
//                   />
//                   <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
//                   <Tooltip 
//                     contentStyle={{
//                       backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
//                       borderColor: isDarkMode ? '#374151' : '#E5E7EB',
//                       color: isDarkMode ? '#FFFFFF' : '#111827'
//                     }}
//                     labelFormatter={formatDate}
//                   />
//                   <Legend />
//                   <Area 
//                     type="monotone" 
//                     dataKey="total" 
//                     name="Total Cases"
//                     fill={isDarkMode ? '#8B5CF6' : '#7C3AED'}
//                     stroke={isDarkMode ? '#8B5CF6' : '#7C3AED'}
//                     fillOpacity={0.2}
//                   />
//                   <Bar dataKey="completed" name="Completed" fill={isDarkMode ? '#10B981' : '#059669'} />
//                   <Bar dataKey="pending" name="Pending" fill={isDarkMode ? '#F59E0B' : '#D97706'} />
//                   <Bar dataKey="sent" name="Sent" fill={isDarkMode ? '#3B82F6' : '#2563EB'} />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div className={`${
//             isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
//           } rounded-lg p-6 shadow-xl`}>
//             <h3 className={`text-lg font-semibold ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             } mb-4`}>
//               Recent Activity
//             </h3>
//             <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
//               <table className="w-full">
//                 <thead>
//                   <tr className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
//                     <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Case ID
//                     </th>
//                     <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Name
//                     </th>
//                     <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Status
//                     </th>
//                     <th className={`text-left py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                       Time
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {dashboardData.activity.map((item, index) => (
//                     <tr 
//                       key={index} 
//                       className={`${
//                         isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
//                       } border-b transition-colors`}
//                     >
//                       <td className={`py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {item.caseId}
//                       </td>
//                       <td className={`py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                         {item.name}
//                       </td>
//                       <td className="py-2">
//                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           item.caseStatus === 'New Pending' ? 
//                             (isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-800') :
//                           item.caseStatus === 'Sent' ?
//                             (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-800') :
//                             (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-800')
//                         }`}>
//                           {item.caseStatus}
//                         </span>
//                       </td>
//                       <td className={`py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {formatTime(item.updatedAt)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Case Details Modal */}
//       {modalData.open && (
//         <div className={`fixed inset-0 z-50 flex items-center justify-center ${
//           isDarkMode ? 'bg-black/70' : 'bg-black/50'
//         }`}>
//           <div className={`rounded-lg p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto ${
//             isDarkMode ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <div className="flex justify-between items-center mb-4">
//               <h3 className={`text-xl font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>
//                 {modalData.title} Cases - {modalData.hierarchy.level}
//               </h3>
//               <div className="flex space-x-2">
//                 <button 
//                   onClick={exportCurrentView}
//                   disabled={exportLoading}
//                   className={`p-2 rounded-lg ${
//                     isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
//                   } transition-colors disabled:opacity-50`}
//                   title="Export to Excel"
//                 >
//                   {exportLoading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     <Download className={`w-5 h-5 ${
//                       isDarkMode ? 'text-white' : 'text-gray-800'
//                     }`} />
//                   )}
//                 </button>
//                 <button 
//                   onClick={() => setModalData({...modalData, open: false})}
//                   className={`p-1 rounded-full ${
//                     isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
//                   }`}
//                 >
//                   <X className={`w-6 h-6 ${
//                     isDarkMode ? 'text-white' : 'text-gray-900'
//                   }`} />
//                 </button>
//               </div>
//             </div>
            
//             {renderModalContent()}
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default LiveDashboard;