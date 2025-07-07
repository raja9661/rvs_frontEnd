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
const monthNameToNumber = (monthName) => {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                 'july', 'august', 'september', 'october', 'november', 'december'];
  const index = months.findIndex(m => m.startsWith(monthName.toLowerCase()));
  return index >= 0 ? (index + 1).toString().padStart(2, '0') : null;
};
const formatMonth = (monthNum, year) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[parseInt(monthNum) - 1] || monthNum;
  return year ? `${monthName} ${year}` : monthName;
};

const SEARCH_CONFIG = {
  year: {
    fields: ['name', '_id'],
    placeholder: 'Search years...',
    searchInRecords: false
  },
  month: {
    fields: ['name'],
    searchTerms: (item) => [
      item.name,
      formatMonth(item.name),
      formatMonth(item.name).toLowerCase(),
      formatMonth(item.name).substring(0, 3)
    ],
    placeholder: 'Search months (e.g. "06", "June", or "jun")...',
    searchInRecords: false
  },
  clientType: {
    fields: ['name', 'clientType'],
    placeholder: 'Search client types...',
    searchInRecords: false
  },
  productType: {
    fields: ['name', 'productType'],
    placeholder: 'Search product types...',
    searchInRecords: false
  },
  clientCode: {
    fields: ['name', 'clientCode'],
    placeholder: 'Search client codes...',
    searchInRecords: false
  },
  product: {
    fields: ['name', 'product'],
    placeholder: 'Search products...',
    searchInRecords: false
  },
  productDetails: {
    fields: ['caseId', 'name', 'clientType', 'clientCode', 'product', 'caseStatus', 'priority'],
    placeholder: 'Search cases...',
    searchInRecords: true
  }
};

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
  const [clientCode, setClientCode] = useState(null);
  
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
      product: null,
      productType: null
    }
  });

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data);
      setRole(data.role || "");
      setClientCode(data.clientCode || null);
    }
  }, []);

  // Formatting functions
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
  
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  const filterRecords = (records, searchTerm, level) => {
    if (!records || !Array.isArray(records)) return [];
    if (!searchTerm) return records;

    const config = SEARCH_CONFIG[level] || SEARCH_CONFIG.productDetails;
    const searchLower = searchTerm.toLowerCase();

    // Special handling for month search
    if (level === 'month') {
      const monthNumber = monthNameToNumber(searchTerm);
      
      return records.filter(item => {
        // Check if search term matches any of the search terms
        if (config.searchTerms) {
          return config.searchTerms(item).some(term => 
            String(term).toLowerCase().includes(searchLower)
          );
        }
        
        // Also check if search term matches month number
        if (monthNumber && item.name === monthNumber) {
          return true;
        }
        
        // Default field matching
        return config.fields.some(field => {
          const value = String(item[field] || '').toLowerCase();
          return value.includes(searchLower);
        });
      });
    }

    // Default search for other levels
    return records.filter(item => {
      return config.fields.some(field => {
        const value = String(item[field] || '').toLowerCase();
        return value.includes(searchLower);
      });
    });
  };

  const filteredRecords = useMemo(() => {
    const shouldUseFullRecords = modalData.hierarchy.level === 'productDetails' || 
      SEARCH_CONFIG[modalData.hierarchy.level]?.searchInRecords;
      
    const recordsToFilter = shouldUseFullRecords 
      ? records.data 
      : modalData.data;
      
    return filterRecords(recordsToFilter, searchTerm, modalData.hierarchy.level);
  }, [records.data, modalData.data, searchTerm, modalData.hierarchy.level]);

  const fetchCaseDetails = async (type, year = null, month = null, clientType = null, productType = null, clientCode = null, product = null) => {
    setSearchTerm('');
    
    // Determine hierarchy level
    let level;
    if (type === 'today') {
      level = product ? 'productDetails' : 
             clientCode ? 'product' : 
             productType ? 'clientCode' : 
             clientType ? 'productType' : 
             'clientType';
    } else {
      level = product ? 'productDetails' : 
             clientCode ? 'product' : 
             productType ? 'clientCode' : 
             clientType ? 'productType' : 
             month ? 'clientType' :
             year ? 'month' :
             'year';
    }

    setModalData(prev => ({
      ...prev,
      open: true,
      loading: true,
      title: type === 'today' ? "Today's Cases" : `${type} Cases`,
      hierarchy: { level, type, year, month, clientType, productType, clientCode, product }
    }));

    try {
      const params = new URLSearchParams();
      params.append('type', type);
      
      if (type !== 'today') {
        if (year) params.append('year', year);
        if (month) params.append('month', month);
      }
      
      if (clientType) params.append('clientType', clientType);
      if (productType) params.append('productType', productType);
      if (clientCode) params.append('clientCode', clientCode);
      if (product) params.append('product', product);

       const requestBody = {
        role,
        user: user?.name
      };

      if (role === 'client') {
        requestBody.code = user?.clientCode;
      }

      const res = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          requestBody
        })
      });

      const data = await res.json();

      if (data.success) {
        // For clients, ensure we only show their data
        let filteredData = data.data;
        let filteredRecords = data.records;
        
        // if (role === 'client') {
        //   if (level === 'productDetails') {
        //     filteredRecords = data.records.filter(item => item.clientCode === user?.clientCode);
        //   } else {
        //     filteredData = data.data.filter(item => {
        //       // This depends on your data structure - adjust as needed
        //       return item.clientCode === user?.clientCode;
        //     });
        //   }
        // }

        setModalData(prev => ({
          ...prev,
          data: filteredData,
          loading: false
        }));
        
        if (level === 'productDetails') {
          setRecords({
            data: filteredRecords,
            loading: false
          });
        }
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
      setModalData(prev => ({ ...prev, loading: false, data: [] }));
    }
  };

  const handleDrillDown = (item) => {
    const { level, type, year, month, clientType, productType, clientCode } = modalData.hierarchy;
    
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
      case 'productType':
        fetchCaseDetails(type, year, month, clientType, item.name);
        break;
      case 'clientCode':
        fetchCaseDetails(type, year, month, clientType, productType, item.name);
        break;
      case 'product':
        fetchCaseDetails(type, year, month, clientType, productType, clientCode, item.name);
        break;
      default:
        break;
    }
  };

  const downloadRecords = async (name) => {
    setExportLoading(true);
    try {
      const { level, type, year, month, clientType, productType, clientCode, product } = modalData.hierarchy;
      
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('download', 'true');
      
      if (type !== 'today') {
        if (year) params.append('year', year);
        if (month) params.append('month', month);
      }
      
      if (clientType) params.append('clientType', clientType);
      if (productType) params.append('productType', productType);
      if (clientCode) params.append('clientCode', clientCode);
      if (product) params.append('product', product);
      
      if (name) {
        if (level === 'year') {
          params.append('year', name);
        } else if (level === 'month') {
          params.append('month', name);
        } else if (level === 'clientType') {
          params.append('clientType', name);
        } else if (level === 'productType') {
          params.append('productType', name);
        }
        else if (level === 'clientCode') {
          params.append('clientCode', name);
        } else if (level === 'product') {
          params.append('product', name);
        }
      }

      const requestBody = {
        role,
        user: user?.name
      };

      if (role === 'client') {
        requestBody.code = user?.clientCode;
      }

      const response = await fetch(
        `${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            requestBody
          })
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

  const exportCurrentView = async () => {
    await downloadRecords();
  };

  const fetchData = async () => { 
  setLoading(true);
  try {
    const requestBody = {
      role,
      user: user?.name,
      timestamp: Date.now()
    };

    // Add clientCode only if role is 'client'
    if (role === 'client' && user?.clientCode) {
      requestBody.clientCode = user?.clientCode;
    }

    const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle case where data might be undefined
    if (!data) {
      throw new Error('No data received from server');
    }

    // Additional client-side filtering if needed
    const processedData = role === 'client' ? {
      stats: data.stats || null,
      trends: data.trends || [],
      activity: data.activity?.filter(item => item.clientCode === user?.clientCode) || []
    } : { 
      stats: data.stats || null,
      trends: data.trends || [],
      activity: data.activity || []
    };

    setDashboardData(processedData);
    setLastUpdated(new Date());
  } catch (error) {
    console.error("Error fetching data:", error);
    // Set empty data structure to prevent undefined errors
    setDashboardData({
      stats: null,
      trends: [],
      activity: []
    });
  } finally {
    setLoading(false);
  }
};

  // Initialize socket connection
  useEffect(() => {
    fetchData();

    const socketOptions = {
      auth: {
        role,
        user: user?.name,
        clientCode: role === 'client' ? user?.clientCode : undefined
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
      newSocket.emit('request-immediate-update');
    };

    // Dashboard update handler
    const handleDashboardUpdate = (data) => {
      // Client-side data filtering for clients
      const processedData = role === 'client'
        ? {
            ...data,
            activity: data.activity?.filter(item => item.clientCode === user?.clientCode) || []
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

    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.off('connect', handleConnect);
      newSocket.off('dashboardUpdate', handleDashboardUpdate);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.disconnect();
    };
  }, [user, role, clientCode]);

  // Stats cards configuration - hide some cards for clients
  const statsCards = [
    { 
      title: "Total Cases", 
      value: dashboardData.stats?.totalCases || 0, 
      icon: Clock,
      color: isDarkMode ? 'text-yellow-500' : 'text-purple-500',
      bgColor: isDarkMode ? 'bg-yellow-500/10' : 'bg-purple-500/10',
      onClick: () => fetchCaseDetails('total'),
      show: true
    },
    { 
      title: "Today's Cases", 
      value: dashboardData.stats?.todayCases || 0, 
      icon: UserCheck,
      color: isDarkMode ? 'text-blue-500' : 'text-cyan-500',
      bgColor: isDarkMode ? 'bg-blue-500/10' : 'bg-cyan-500/10',
      onClick: () => fetchCaseDetails('today'),
      show: true
    },
    { 
      title: "New Pending", 
      value: dashboardData.stats?.pendingCases || 0, 
      icon: UserX,
      color: isDarkMode ? 'text-red-500' : 'text-rose-500',
      bgColor: isDarkMode ? 'bg-red-500/10' : 'bg-rose-500/10',
      onClick: () => fetchCaseDetails('New Pending'),
      show: true
    },
    { 
      title: "High Priority", 
      value: dashboardData.stats?.highPriorityCases || 0, 
      icon: AlertTriangle,
      color: isDarkMode ? 'text-orange-500' : 'text-amber-500',
      bgColor: isDarkMode ? 'bg-orange-500/10' : 'bg-amber-500/10',
      onClick: () => fetchCaseDetails('highPriority'),
      show: true
    },
    { 
      title: "Closed Cases", 
      value: dashboardData.stats?.closedCases || 0, 
      icon: CheckCircle,
      color: isDarkMode ? 'text-green-500' : 'text-emerald-500',
      bgColor: isDarkMode ? 'bg-green-500/10' : 'bg-emerald-500/10',
      onClick: () => fetchCaseDetails('closed'),
      show: true
    },
    { 
      title: "Completion Rate", 
      value: dashboardData.stats?.completionRate ? `${dashboardData.stats.completionRate}%` : '0%', 
      icon: Activity,
      color: isDarkMode ? 'text-indigo-500' : 'text-violet-500',
      bgColor: isDarkMode ? 'bg-indigo-500/10' : 'bg-violet-500/10',
      show: role !== 'client' // Hide for clients
    }
  ].filter(card => card.show);

  const renderModalContent = () => {
    if (modalData.loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    const { level, type, year, month, clientType, productType, clientCode, product } = modalData.hierarchy;
    const displayData = level === 'productDetails' ? filteredRecords : modalData.data;

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
        case 'productType':
          return `${type} Cases for ${clientType} by Product Type`;
        case 'clientCode':
          return `${type} Cases for ${productType} by Client Code`;
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
          
          {productType && (
            <>
              <ChevronRight className="w-4 h-4 mx-1" />
              <button 
                onClick={() => fetchCaseDetails(type, year, month, clientType, productType)}
                className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
              >
                {productType}
              </button>
            </>
          )}
          
          {clientCode && (
            <>
              <ChevronRight className="w-4 h-4 mx-1" />
              <button 
                onClick={() => fetchCaseDetails(type, year, month, clientType, productType, clientCode)}
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
            placeholder={`Search ${modalData.hierarchy.level}...`}
            className={`block w-full pl-10 pr-10 py-2 ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              {filteredRecords.length > 0 ? (
                filteredRecords.map((item, index) => (
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
                  <td colSpan={modalData.hierarchy.level === 'productDetails' ? 9 : 3} className="px-4 py-6 text-center text-gray-500">
                    {searchTerm ? (
                      <>
                        <Search className="h-5 w-5 mx-auto text-gray-400" />
                        <p className="mt-2">No matching {modalData.hierarchy.level} found for "{searchTerm}"</p>
                      </>
                    ) : (
                      "No data available"
                    )}
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
  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-transparent bg-clip-text">
    WELCOME TO RVS DOC
    <span className={`text-sm ml-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      ({role === 'admin' ? 'Admin View' : role === 'client' ? 'Client View' : 'Employee View'}
      {role === 'client' && clientCode ? ` - ${user?.name}` : ''})
    </span>
  </h1>

  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            {role !== 'client' && (
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
            )}
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

        {/* Charts Grid - Hide trends chart for clients */}
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification Trends Chart */}
            {/* <div className={`${
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
            </div> */}
            <div className={`${
  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
} rounded-lg p-6 shadow-xl`}>
  <div className="flex justify-between items-center mb-4">
    <h3 className={`text-lg font-semibold ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      Verification Trends (Last 7 Days)
      {role === 'client' && clientCode && (
        <span className={`text-sm ml-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          (Client: {clientCode})
        </span>
      )}
    </h3>
    {/* {dashboardData.trends && (
      <span className={`text-xs ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {dashboardData.stats?.updatedAt && `Updated: ${formatTime(dashboardData.stats.updatedAt)}`}
      </span>
    )} */}
  </div>
  
  <div className="h-64">
    {!dashboardData.trends || dashboardData.trends.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full">
        <Search className="h-8 w-8 text-gray-400 mb-2" />
        <p className={`text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {loading ? 'Loading trends data...' : 'No verification trends available'}
        </p>
        {!loading && (
          <button
            onClick={fetchData}
            className={`mt-2 px-3 py-1 rounded text-sm ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <RefreshCw className="inline mr-1 h-4 w-4" />
            Refresh
          </button>
        )}
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dashboardData.trends}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
          />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
            tickFormatter={(dateStr) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              borderColor: isDarkMode ? '#374151' : '#E5E7EB',
              color: isDarkMode ? '#FFFFFF' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            formatter={(value, name) => {
              // Format numbers with commas
              return [value.toLocaleString(), name];
            }}
            labelFormatter={(dateStr) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            name="Total Cases"
            fill={isDarkMode ? '#8B5CF6' : '#7C3AED'}
            stroke={isDarkMode ? '#8B5CF6' : '#7C3AED'}
            fillOpacity={0.2}
            activeDot={{ r: 6 }}
          />
          <Bar 
            dataKey="completed" 
            name="Completed" 
            fill={isDarkMode ? '#10B981' : '#059669'} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="pending" 
            name="Pending" 
            fill={isDarkMode ? '#F59E0B' : '#D97706'} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="sent" 
            name="Sent" 
            fill={isDarkMode ? '#3B82F6' : '#2563EB'} 
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )}
  </div>

  {/* Data freshness indicator */}
  {dashboardData.trends && dashboardData.trends.length > 0 && (
    <div className={`text-xs mt-2 text-right ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      Showing data from {formatDate(dashboardData.trends[0].date)} to{' '}
      {formatDate(dashboardData.trends[dashboardData.trends.length - 1].date)}
    </div>
  )}
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
                {modalData.title}
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
//   ResponsiveContainer, ComposedChart, Area, Legend
// } from "recharts";
// import { io } from 'socket.io-client';
// import * as XLSX from 'xlsx';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
// const monthNameToNumber = (monthName) => {
//   const months = ['january', 'february', 'march', 'april', 'may', 'june', 
//                  'july', 'august', 'september', 'october', 'november', 'december'];
//   const index = months.findIndex(m => m.startsWith(monthName.toLowerCase()));
//   return index >= 0 ? (index + 1).toString().padStart(2, '0') : null;
// };
// const formatMonth = (monthNum, year) => {
//   const months = ['January', 'February', 'March', 'April', 'May', 'June', 
//                  'July', 'August', 'September', 'October', 'November', 'December'];
//   const monthName = months[parseInt(monthNum) - 1] || monthNum;
//   return year ? `${monthName} ${year}` : monthName;
// };
// const SEARCH_CONFIG = {
//   year: {
//     fields: ['name', '_id'], // Search both name and _id fields
//     placeholder: 'Search years...',
//     searchInRecords: false // We'll search the aggregated data for years
//   },
//    month: {
//     fields: ['name'],
//     searchTerms: (item) => [
//       item.name, // The number (e.g. "06")
//       formatMonth(item.name), // The name (e.g. "June")
//       formatMonth(item.name).toLowerCase(), // Lowercase version
//       formatMonth(item.name).substring(0, 3) // Abbreviated (e.g. "Jun")
//     ],
//     placeholder: 'Search months (e.g. "06", "June", or "jun")...',
//     searchInRecords: false
//   },
//   clientType: {
//     fields: ['name', 'clientType'],
//     placeholder: 'Search client types...',
//     searchInRecords: false
//   },
//   productType: {
//     fields: ['name', 'productType'],
//     placeholder: 'Search product types...',
//     searchInRecords: false
//   },
//   clientCode: {
//     fields: ['name', 'clientCode'],
//     placeholder: 'Search client codes...',
//     searchInRecords: false
//   },
//   product: {
//     fields: ['name', 'product'],
//     placeholder: 'Search products...',
//     searchInRecords: false
//   },
//   productDetails: {
//     fields: ['caseId', 'name', 'clientType', 'clientCode', 'product', 'caseStatus', 'priority'],
//     placeholder: 'Search cases...',
//     searchInRecords: true
//   }
// };
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
//   const [user, setUser] = useState(null);
  
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
//       product: null,
//       productType: null
//     }
//   });

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
    
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
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



// // const filterRecords = (records, searchTerm, level) => {
// //   if (!records || !Array.isArray(records)) return [];
// //   if (!searchTerm) return records;

// //   const config = SEARCH_CONFIG[level] || SEARCH_CONFIG.productDetails;
// //   const searchLower = searchTerm.toLowerCase();

// //   // For non-productDetails levels, we search the aggregated data (name/count objects)
// //   if (!config.searchInRecords) {
// //     return records.filter(item => {
// //       return config.fields.some(field => {
// //         const value = String(item[field] || '').toLowerCase();
// //         return value.includes(searchLower);
// //       });
// //     });
// //   }
  
// //   // For productDetails, search the full records
// //   return records.filter(item => {
// //     return config.fields.some(field => {
// //       const value = String(item[field] || '').toLowerCase();
// //       return value.includes(searchLower);
// //     });
// //   });
// // };
// const filterRecords = (records, searchTerm, level) => {
//   if (!records || !Array.isArray(records)) return [];
//   if (!searchTerm) return records;

//   const config = SEARCH_CONFIG[level] || SEARCH_CONFIG.productDetails;
//   const searchLower = searchTerm.toLowerCase();

//   // Special handling for month search
//   if (level === 'month') {
//     // Try to convert month name to number
//     const monthNumber = monthNameToNumber(searchTerm);
    
//     return records.filter(item => {
//       // Check if search term matches any of the search terms
//       if (config.searchTerms) {
//         return config.searchTerms(item).some(term => 
//           String(term).toLowerCase().includes(searchLower)
//         );
//       }
      
//       // Also check if search term matches month number
//       if (monthNumber && item.name === monthNumber) {
//         return true;
//       }
      
//       // Default field matching
//       return config.fields.some(field => {
//         const value = String(item[field] || '').toLowerCase();
//         return value.includes(searchLower);
//       });
//     });
//   }

//   // Default search for other levels
//   return records.filter(item => {
//     return config.fields.some(field => {
//       const value = String(item[field] || '').toLowerCase();
//       return value.includes(searchLower);
//     });
//   });
// };
// const filteredRecords = useMemo(() => {
//   const shouldUseFullRecords = modalData.hierarchy.level === 'productDetails' || 
//     SEARCH_CONFIG[modalData.hierarchy.level]?.searchInRecords;
    
//   const recordsToFilter = shouldUseFullRecords 
//     ? records.data 
//     : modalData.data;
    
//   return filterRecords(recordsToFilter, searchTerm, modalData.hierarchy.level);
// }, [records.data, modalData.data, searchTerm, modalData.hierarchy.level]);


// // Updated fetchCaseDetails function
// const fetchCaseDetails = async (type, year = null, month = null, clientType = null,productType = null, clientCode = null, product = null) => {
//   setSearchTerm('');
  
//   // Determine hierarchy level
//   let level;
//   if (type === 'today') {
//     level = product ? 'productDetails' : 
//            clientCode ? 'product' : 
//            productType ? 'clientCode' : 
//            clientType ? 'productType' : 
//            'clientType';
//   } else {
//     level = product ? 'productDetails' : 
//            clientCode ? 'product' : 
//            productType ? 'clientCode' : 
//            clientType ? 'productType' : 
//            month ? 'clientType' :
//            year ? 'month' :
//            'year';
//   }

//   setModalData(prev => ({
//     ...prev,
//     open: true,
//     loading: true,
//     title: type === 'today' ? "Today's Cases" : `${type} Cases`,
//     hierarchy: { level, type, year, month, clientType, productType, clientCode, product }
//   }));

//   try {
//     const params = new URLSearchParams();
//     params.append('type', type);
    
//     if (type !== 'today') {
//       if (year) params.append('year', year);
//       if (month) params.append('month', month);
//     }
    
//     if (clientType) params.append('clientType', clientType);
//     if (productType) params.append('productType', productType);
//     if (clientCode) params.append('clientCode', clientCode);
//     if (product) params.append('product', product);

//     const res = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`, {
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
      
//       // Only set records if we're at productDetails level
//       if (level === 'productDetails') {
//         setRecords({
//           data: data.records,
//           loading: false
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching case details:", error);
//     setModalData(prev => ({ ...prev, loading: false, data: [] }));
//   }
// };
// // const fetchCaseDetails = async (type, year = null, month = null, clientType = null, clientCode = null, product = null) => {
// //   // Clear previous search term when fetching new data
// //   setSearchTerm('');
  
// //   // Determine hierarchy level
// //   let level;
// //   if (type === 'today') {
// //     if (clientType) {
// //       level = clientCode ? 'product' : 'clientCode';
// //     } else {
// //       level = 'clientType'; // Default to clientType for today cases
// //     }
// //   } else {
// //     level = product ? 'productDetails' : 
// //            clientCode ? 'product' : 
// //            clientType ? 'clientCode' : 
// //            month ? 'clientType' :
// //            year ? 'month' :
// //            'year';
// //   }

// //   setModalData(prev => ({
// //     ...prev,
// //     open: true,
// //     loading: true,
// //     title: type === 'today' ? "Today's Cases" : `${type} Cases`,
// //     hierarchy: { level, type, year, month, clientType, clientCode, product }
// //   }));

// //   try {
// //     const params = new URLSearchParams();
// //     params.append('type', type);
    
// //     // Only add date params for non-today cases
// //     if (type !== 'today') {
// //       if (year) params.append('year', year);
// //       if (month) params.append('month', month);
// //     }
    
// //     if (clientType) params.append('clientType', clientType);
// //     if (clientCode) params.append('clientCode', clientCode);
// //     if (product) params.append('product', product);

// //     const res = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/case-details?${params.toString()}`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json'
// //       },
// //       body: JSON.stringify({ role, user: user?.name })
// //     });

// //     const data = await res.json();

// //     if (data.success) {
// //       setModalData(prev => ({
// //         ...prev,
// //         data: data.data,
// //         loading: false,
        
// //       }));
// //       console.log('Received data:', {
// //   data: data.data,
// //   records: data.records,
// //   level: data.hierarchyLevel
// // });
// //       setRecords({
// //         data: data.records,
// //         loading: false
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Error fetching case details:", error);
// //     setModalData(prev => ({ ...prev, loading: false, data: [] }));
// //   }
// // };
// // Updated socket connection with role-based filtering
// useEffect(() => {
//   // Initial data fetch
//   fetchData();

//   // Socket connection setup
//   const socketOptions = {
//     auth: {
//       role,
//       user: user?.name
//     },
//     reconnection: true,
//     reconnectionAttempts: 5,
//     reconnectionDelay: 1000,
//     transports: ['websocket']
//   };

//   const newSocket = io(import.meta.env.VITE_Backend_Base_URL, socketOptions);

//   // Connection established handler
//   const handleConnect = () => {
//     console.log('Socket connected:', newSocket.id);
    
//     // Join appropriate room based on role
//     if (role === 'employee' && user?.name) {
//       newSocket.emit('join-room', `employee_${user.name}`);
//     } else if (role === 'admin') {
//       newSocket.emit('join-room', 'admins');
//     }
    
//     // Request immediate data update on connection
//     newSocket.emit('request-update');
//   };

//   // Dashboard update handler
//   const handleDashboardUpdate = (data) => {
//     console.log('Received dashboard update');
    
//     // Client-side data filtering for employees
//     const processedData = role === 'employee'
//       ? {
//           ...data,
//           activity: data.activity?.filter(item => item.listByEmployee === user?.name) || []
//         }
//       : data;

//     setDashboardData(prev => ({
//       stats: processedData.stats || prev.stats,
//       trends: processedData.trends || prev.trends,
//       activity: processedData.activity || prev.activity
//     }));
//     setLastUpdated(new Date());
//   };

//   // Error handlers
//   const handleConnectError = (err) => {
//     console.error('Socket connection error:', err);
//   };

//   const handleDisconnect = (reason) => {
//     console.log('Socket disconnected:', reason);
//     if (reason === 'io server disconnect') {
//       newSocket.connect();
//     }
//   };

//   // Event listeners
//   newSocket.on('connect', handleConnect);
//   newSocket.on('dashboardUpdate', handleDashboardUpdate);
//   newSocket.on('connect_error', handleConnectError);
//   newSocket.on('disconnect', handleDisconnect);

//   // Cleanup function
//   return () => {
//     console.log('Cleaning up socket connection');
//     newSocket.off('connect', handleConnect);
//     newSocket.off('dashboardUpdate', handleDashboardUpdate);
//     newSocket.off('connect_error', handleConnectError);
//     newSocket.off('disconnect', handleDisconnect);
//     newSocket.disconnect();
//   };
// }, [user, role]);


//   // Drill down handler
//   const handleDrillDown = (item) => {
//   const { level, type, year, month, clientType, productType, clientCode } = modalData.hierarchy;
  
//   switch(level) {
//     case 'year':
//       fetchCaseDetails(type, item.name);
//       break;
//     case 'month':
//       fetchCaseDetails(type, year, item.name);
//       break;
//     case 'clientType':
//       fetchCaseDetails(type, year, month, item.name);
//       break;
//     case 'productType':
//       fetchCaseDetails(type, year, month, clientType, item.name);
//       break;
//     case 'clientCode':
//       fetchCaseDetails(type, year, month, clientType, productType, item.name);
//       break;
//     case 'product':
//       fetchCaseDetails(type, year, month, clientType, productType, clientCode, item.name);
//       break;
//     default:
//       break;
//   }
// };
//   // const handleDrillDown = (item) => {
//   //   const { level, type, year, month, clientType, clientCode } = modalData.hierarchy;
    
//   //   switch(level) {
//   //     case 'year':
//   //       fetchCaseDetails(type, item.name);
//   //       break;
//   //     case 'month':
//   //       fetchCaseDetails(type, year, item.name);
//   //       break;
//   //     case 'clientType':
//   //       fetchCaseDetails(type, year, month, item.name);
//   //       break;
//   //     case 'clientCode':
//   //       fetchCaseDetails(type, year, month, clientType, item.name);
//   //       break;
//   //     case 'product':
//   //       fetchCaseDetails(type, year, month, clientType, clientCode, item.name);
//   //       break;
//   //     default:
//   //       break;
//   //   }
//   // };

// const downloadRecords = async (name) => {
//   setExportLoading(true);
//   try {
//     const { level, type, year, month, clientType,productType, clientCode, product } = modalData.hierarchy;
    
//     const params = new URLSearchParams();
//     params.append('type', type);
//     params.append('download', 'true');
    
//     // Special handling for today cases
//     if (type === 'today') {
//       const today = new Date().toISOString().split('T')[0];
//       params.append('today', today);
//     } else {
//       if (year) params.append('year', year);
//       if (month) params.append('month', month);
//     }
    
//     if (clientType) params.append('clientType', clientType);
//     if (productType) params.append('productType', productType);
//     if (clientCode) params.append('clientCode', clientCode);
//     if (product) params.append('product', product);
    
//     if (name) {
//       if (level === 'year') {
//         params.append('year', name);
//       } else if (level === 'month') {
//         params.append('month', name);
//       } else if (level === 'clientType') {
//         params.append('clientType', name);
//       } else if (level === 'productType') {
//         params.append('productType', name);
//       }
//       else if (level === 'clientCode') {
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
//     if (type !== 'today') {
//       if (year) filenameParts.push(year);
//       if (month) filenameParts.push(month);
//     }
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
//   // Export current view
//   const exportCurrentView = async () => {
//     await downloadRecords();
//   };

//   // Fetch dashboard data
//   // Update your fetchData function
// const fetchData = async () => { 
//   setLoading(true);
//   try {
//     if (!user && !role) {
//       console.log('Cannot fetch data - user name missing for employee');
//       return;
//     }
//     const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/dashboard/data`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         role, 
//         user: user?.name,
//         timestamp: Date.now() 
//       }) 
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const { stats, trends, activity } = await response.json();
    
//     // Verify data is properly filtered for employee role
//     if (role === 'employee') {
//       const employeeName = user?.name;
//       if (stats.totalCases > 0 && !employeeName) {
//         console.warn('Employee data requested without user name');
//       }
//     }

//     setDashboardData({ 
//       stats: stats || null,
//       trends: trends || [],
//       activity: activity || []
//     });
//     setLastUpdated(new Date());
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     // Set empty data for employee if error occurs
//     if (role === 'employee') {
//       setDashboardData({
//         stats: null,
//         trends: [],
//         activity: []
//       });
//     }
//   } finally {
//     setLoading(false);
//   }
// };

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
//   }, [user]);

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
//   if (modalData.loading) {
//     return (
//       <div className="flex justify-center py-8">
//         <Loader2 className="animate-spin h-8 w-8" />
//       </div>
//     );
//   }

//   const { level, type, year, month, clientType, productType, clientCode, product } = modalData.hierarchy;
//   const displayData = level === 'productDetails' ? filteredRecords : modalData.data;

//   // Function to get the appropriate title based on hierarchy level
//   const getModalTitle = () => {
//     switch(level) {
//       case 'year':
//         return `${type} Cases by Year`;
//       case 'month':
//         return `${type} Cases for ${year} by Month`;
//       case 'clientType':
//         return type === 'today' 
//           ? `Today's Cases by Client Type` 
//           : `${type} Cases for ${formatMonth(month, year)} by Client Type`;
//       case 'productType':
//         return `${type} Cases for ${clientType} by Product Type`;
//       case 'clientCode':
//         return `${type} Cases for ${productType} by Client Code`;
//       case 'product':
//         return `${type} Cases for ${clientCode} by Product`;
//       case 'productDetails':
//         return `${type} Case Details for ${product}`;
//       default:
//         return `${type} Cases`;
//     }
//   };
//   // const getModalTitle = () => {
//   //   switch(level) {
//   //     case 'year':
//   //       return `${type} Cases by Year`;
//   //     case 'month':
//   //       return `${type} Cases for ${year} by Month`;
//   //     case 'clientType':
//   //       return type === 'today' 
//   //         ? `Today's Cases by Client Type` 
//   //         : `${type} Cases for ${formatMonth(month, year)} by Client Type`;
//   //     case 'clientCode':
//   //       return `${type} Cases for ${clientType} by Client Code`;
//   //     case 'product':
//   //       return `${type} Cases for ${clientCode} by Product`;
//   //     case 'productDetails':
//   //       return `${type} Case Details for ${product}`;
//   //     default:
//   //       return `${type} Cases`;
//   //   }
//   // };

//   return (
//     <div className="space-y-4">
//       {/* Breadcrumb navigation */}
      
// <div className="flex items-center text-sm mb-4 flex-wrap gap-2">
//   <button 
//     onClick={() => fetchCaseDetails(type)}
//     className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//   >
//     {type} Cases
//   </button>
  
//   {year && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <button 
//         onClick={() => fetchCaseDetails(type, year)}
//         className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//       >
//         {year}
//       </button>
//     </>
//   )}
  
//   {month && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <button 
//         onClick={() => fetchCaseDetails(type, year, month)}
//         className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//       >
//         {formatMonth(month, year)}
//       </button>
//     </>
//   )}
  
//   {clientType && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <button 
//         onClick={() => fetchCaseDetails(type, year, month, clientType)}
//         className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//       >
//         {clientType}
//       </button>
//     </>
//   )}
  
//   {productType && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <button 
//         onClick={() => fetchCaseDetails(type, year, month, clientType, productType)}
//         className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//       >
//         {productType}
//       </button>
//     </>
//   )}
  
//   {clientCode && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <button 
//         onClick={() => fetchCaseDetails(type, year, month, clientType, productType, clientCode)}
//         className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
//       >
//         {clientCode}
//       </button>
//     </>
//   )}
  
//   {product && (
//     <>
//       <ChevronRight className="w-4 h-4 mx-1" />
//       <span>{product}</span>
//     </>
//   )}
// </div>
//       {/* <div className="flex items-center text-sm mb-4 flex-wrap gap-2">
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
//               {formatMonth(month, year)}
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
//       </div> */}

//       {/* Search bar */}
//       {/* Search bar - replace your existing one */}
// <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2 mb-4`}>
//   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//     <Search className="h-5 w-5 text-gray-400" />
//   </div>
//   <input
//     type="text"
//     placeholder={`Search ${modalData.hierarchy.level}...`}
//     className={`block w-full pl-10 pr-10 py-2 ${
//       isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
//     } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//   />
//   {searchTerm && (
//     <button
//       onClick={() => setSearchTerm('')}
//       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//     >
//       <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//     </button>
//   )}
// </div>

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
//                   <th className="px-4 py-2 text-left">Client Type</th>
//                   <th className="px-4 py-2 text-left">Client Code</th>
//                   <th className="px-4 py-2 text-left">Status</th>
//                   <th className="px-4 py-2 text-left">Priority</th>
//                   <th className="px-4 py-2 text-left">Date</th>
//                 </>
//               )}
//               <th className="px-4 py-2 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRecords.length > 0 ? (
//               filteredRecords.map((item, index) => (
//                 <tr 
//                   key={index} 
//                   className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
//                 >
//                   <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {level === 'month' ? formatMonth(item.name, year) : (item.name || item.caseId)}
//                   </td>
//                   <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                     {item.count || '-'}
//                   </td>
                  
//                   {level === 'productDetails' && (
//                     <>
//                       <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                         {item.caseId}
//                       </td>
//                       <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                         {item.clientType}
//                       </td>
//                       <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//                         {item.clientCode}
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
//               ))
//             ) : (
//                <tr>
//       <td colSpan={modalData.hierarchy.level === 'productDetails' ? 9 : 3} className="px-4 py-6 text-center text-gray-500">
//         {searchTerm ? (
//           <>
//             <Search className="h-5 w-5 mx-auto text-gray-400" />
//             <p className="mt-2">No matching {modalData.hierarchy.level} found for "{searchTerm}"</p>
//           </>
//         ) : (
//           "No data available"
//         )}
//       </td>
//     </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
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