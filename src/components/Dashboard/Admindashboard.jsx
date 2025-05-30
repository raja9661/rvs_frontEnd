import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../Layout/Layout';
import { 
  Clock, UserCheck, UserX, AlertTriangle, CheckCircle, Activity,
  RefreshCw, Download, Bell, X, Loader2, ChevronRight, PieChart, Search
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Pie, Cell, Legend, ComposedChart, Area
} from "recharts";
import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const isDarkMode = localStorage.getItem("theme") === "dark";
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    trends: [],
    distribution: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const [modalData, setModalData] = useState({
    open: false,
    title: '',
    data: null,
    loading: false,
    hierarchy: {
      level: null,
      type: null,
      clientType: null,
      clientCode: null,
      product: null
    }
  });

  // Formatting functions
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
  
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  // Update your filteredRecords logic
const filteredRecords = useMemo(() => {
  if (!records.data) return [];
  
  const searchLower = searchTerm.toLowerCase();
  // console.log("search-lower:",searchLower)
  const { level } = modalData.hierarchy;
  //  console.log("Record Data:",records.data)
  return records.data.filter(item => {
    if (!searchTerm) return true;

    // Different search logic per hierarchy level
    if (level === 'productDetails') {
      return (
        (item.name?.toLowerCase().includes(searchLower)) ||
        (item.caseId?.toLowerCase().includes(searchLower)) ||
        (item.clientType?.toLowerCase().includes(searchLower)) ||
        (item.clientCode?.toLowerCase().includes(searchLower)) ||
        (item.product?.toLowerCase().includes(searchLower)) ||
        (item.caseStatus?.toLowerCase().includes(searchLower)) ||
        (item.priority?.toLowerCase().includes(searchLower))
      )
    }
    if(level === 'clientType'){
      console.log("clientType",item.clientType)
      return (
        (item.clientType?.toLowerCase().includes(searchTerm)) 
      );
    }
     else {
      // For clientType/clientCode/product levels
      return item.name?.toLowerCase().includes(searchLower);
    }
  });
}, [records.data, searchTerm, modalData.hierarchy.level]);

// useEffect(() => {
//   console.log(`Current level data (${modalData.hierarchy.level}):`, records.data);
// }, [records.data, modalData.hierarchy.level]);
  // const filteredRecords = useMemo(() => {
  //   if (!records.data) return [];
  //   return records.data.filter(item => {
  //     const searchLower = searchTerm.toLowerCase();
  //     return (
  //       (item.name && item.name.toLowerCase().includes(searchLower)) ||
  //       (item.caseId && item.caseId.toLowerCase().includes(searchLower)) ||
  //       (item.caseStatus && item.caseStatus.toLowerCase().includes(searchLower)) ||
  //       (item.clientType && item.clientType.toLowerCase().includes(searchLower)) ||
  //       (item.clientCode && item.clientCode.toLowerCase().includes(searchLower)) ||
  //       (item.product && item.product.toLowerCase().includes(searchLower))
  //     );
  //   });
  // }, [records.data, searchTerm]);

  // Fetch case details with hierarchy support
  const fetchCaseDetails = async (type, clientType = null, clientCode = null, product = null) => {
    setModalData(prev => ({
      ...prev,
      open: true,
      loading: true,
      title: type,
      hierarchy: {
        level: product ? 'productDetails' : 
               clientCode ? 'product' : 
               clientType ? 'clientCode' : 
               'clientType',
        type,
        clientType,
        clientCode,
        product
      }
    }));

    try {
      const url = new URL(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/case-details`);
    url.searchParams.set('type', type);
    if (clientType) url.searchParams.set('clientType', clientType);
    if (clientCode) url.searchParams.set('clientCode', clientCode);
    if (product) url.searchParams.set('product', product);
    if (searchTerm) url.searchParams.set('search', searchTerm); // Send search term to backend
    
    const res = await fetch(url.toString());
    const data = await res.json();
      // const url = new URL(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/case-details`);
      // url.searchParams.set('type', type);
      // if (clientType) url.searchParams.set('clientType', clientType);
      // if (clientCode) url.searchParams.set('clientCode', clientCode);
      // if (product) url.searchParams.set('product', product);
      
      // const res = await fetch(url.toString());
      // const data = await res.json();
      
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
      setModalData(prev => ({...prev, loading: false}));
    }
  };

  // Drill down handler
  const handleDrillDown = (item) => {
    const { level, type, clientType, clientCode } = modalData.hierarchy;
    
    if (level === 'clientType') {
      fetchCaseDetails(type, item.name);
    } else if (level === 'clientCode') {
      fetchCaseDetails(type, clientType, item.name);
    } else if (level === 'product') {
      fetchCaseDetails(type, clientType, clientCode, item.name);
    }
  };

  useEffect(() => {
    setSearchTerm('');
  }, [modalData.hierarchy.level]);

  // Download specific records
  const downloadRecords = async (name) => {
    setExportLoading(true);
    try {
      const { level, type, clientType, clientCode, product } = modalData.hierarchy;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('download', 'true');
      
      if (clientType) params.append('clientType', clientType);
      if (clientCode) params.append('clientCode', clientCode);
      if (product) params.append('product', product);
      
      // For specific row downloads, add the name as a filter
      if (name) {
        if (level === 'clientType') {
          params.append('clientType', name);
        } else if (level === 'clientCode') {
          params.append('clientCode', name);
        } else if (level === 'product') {
          params.append('product', name);
        }
      }

      // Make the download request
      const response = await fetch(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/case-details?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename
      const filenameParts = [type];
      if (clientType) filenameParts.push(clientType);
      if (clientCode) filenameParts.push(clientCode);
      if (product) filenameParts.push(product);
      if (name) filenameParts.push(name);
      a.download = `${filenameParts.join('_')}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Export current view with hierarchy parameters
  const exportCurrentView = async () => {
    await downloadRecords();
  };

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, activityRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/stats`),
        fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/trends`),
        // fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/distribution`),
        fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/dashboard/activity`)
      ]);
      
      const [statsData, trendsData,activityData] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        activityRes.json()
      ]);
      
      setDashboardData({
        stats: statsData.success ? statsData.stats : null,
        trends: trendsData.success ? trendsData.trends : [],
        activity: activityData.success ? activityData.activity : []
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
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

    newSocket.on('notification', (notification) => {
      const newNotification = {
        ...notification,
        id: Date.now(),
        read: false,
        timestamp: new Date()
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      if (!document.hasFocus() && Notification.permission === 'granted') {
        new Notification('KYC Dashboard Alert', { body: notification.message });
      }
    });

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    return () => newSocket.disconnect();
  }, []);

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

  const renderModalContent = () => {
    if (modalData.loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    const { level, type, clientType, clientCode, product } = modalData.hierarchy;
    const displayData = level === 'productDetails' ? filteredRecords : modalData.data;

    

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
          
          {clientType && (
            <>
              <ChevronRight className="w-4 h-4 mx-1" />
              <button 
                onClick={() => fetchCaseDetails(type, clientType)}
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
                onClick={() => fetchCaseDetails(type, clientType, clientCode)}
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

         {/* Enhanced Search bar for all levels */}
      <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={
            level === 'clientType' ? "Search client types..." :
            level === 'clientCode' ? "Search client codes..." :
            level === 'product' ? "Search products..." :
            "Search cases..."
          }
          className={`block w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </>
              )}
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData?.map((item, index) => (
              <tr 
                key={index} 
                className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
              >
                <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.name || item.caseId}
                </td>
                <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.count || '-'}
                </td>
                
                {level === 'productDetails' && (
                  <>
                    <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.caseId}
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
                        onClick={() => {
                          const worksheet = XLSX.utils.json_to_sheet([item]);
                          const workbook = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(workbook, worksheet, "CaseDetails");
                          XLSX.writeFile(workbook, `${item.caseId}_Details.xlsx`);
                        }}
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
            ))}
          </tbody>
        </table>
      </div>

        {/* Search bar */}
        {/* {level === 'productDetails'  &&  (
          <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search cases..."
              className={`block w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )} */}

        {/* Data table */}
        {/* <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Count</th>
                {level === 'productDetails' && (
                  <>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </>
                )}
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayData?.map((item, index) => (
                <tr 
                  key={index} 
                  className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
                >
                  <td className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.name || item.caseId}
                  </td>
                  <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.count || '-'}
                  </td>
                  
                  {level === 'productDetails' && (
                    <>
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
                          onClick={() => {
                            const worksheet = XLSX.utils.json_to_sheet([item]);
                            const workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, "CaseDetails");
                            XLSX.writeFile(workbook, `${item.caseId}_Details.xlsx`);
                          }}
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
              ))}
            </tbody>
          </table>
        </div> */}
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
            {/* <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              KYC Dashboard
            </h1> */}
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                title="Notifications"
              >
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-72 rounded-md shadow-lg z-50 ${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className={`p-2 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({...n, read: true})));
                          setShowNotifications(false);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`p-4 text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b ${
                            isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          } ${!notification.read ? (isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50') : ''}`}
                        >
                          <div className="flex justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.message}
                            </p>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(notification.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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

          {/* Case Status Distribution */}
          {/* <div className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-sm'
          } rounded-lg p-6 shadow-xl`}>
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } mb-4`}>
              Case Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                      color: isDarkMode ? '#FFFFFF' : '#111827'
                    }}
                    formatter={(value, name, props) => [value, props.payload.status]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div> */}

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

export default AdminDashboard;
