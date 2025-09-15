import React, { useEffect, useMemo, useState } from 'react';
import Layout from './Layout/Layout';

const API_BASE = import.meta.env.VITE_Backend_Base_URL || '';

function num3(n) {
  if (n === null || n === undefined) return '0.00';
  return Number(n).toFixed(2);
}

// Month mapping for conversion
const MONTHS = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

const MONTH_NAMES = Object.values(MONTHS);

// Reverse mapping from name to number
const MONTH_TO_NUM = Object.fromEntries(
  Object.entries(MONTHS).map(([num, name]) => [name.toLowerCase(), num])
);

export default function ClientTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalGroups, setTotalGroups] = useState(0);

  const [filters, setFilters] = useState({ 
    year: '', 
    month: '', 
    clientCode: '', 
    userId: '',
    search: '' 
  });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewCtx, setViewCtx] = useState({ userId: '', clientCode: '' });
  const [cases, setCases] = useState([]);
  const [casesPage, setCasesPage] = useState(1);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesLoading, setCasesLoading] = useState(false);
  const [showYearCalendar, setShowYearCalendar] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);

  const totalPages = useMemo(() => Math.ceil((totalGroups || 0) / limit), [totalGroups, limit]);

  // Debounce function to delay API calls while typing
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  }

  const debouncedFilters = useDebounce(filters, 500);

  async function fetchSummary(p = 1) {
    setLoading(true);
    try {
      // Convert month name to number if needed
      let monthValue = filters.month;
      if (isNaN(monthValue) && monthValue) {
        const monthNum = MONTH_TO_NUM[monthValue.toLowerCase()];
        if (monthNum) monthValue = monthNum;
      }
      
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      
      // Add filters to params if they have values
      Object.entries({
        ...filters,
        month: monthValue
      }).forEach(([k, v]) => { 
        if (v) params.append(k, v); 
      });
      
      const res = await fetch(`${API_BASE}/mapping/summary?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
      setTotalGroups(json.totalGroups || 0);
      setPage(json.page || p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
async function fetchCases(p = 1, ctx = viewCtx) {
  setCasesLoading(true);
  try {
    const params = new URLSearchParams({ 
      page: String(p), 
      limit: '50', 
      userId: ctx.userId 
    });
    
    if (ctx.clientCode) params.append('clientCode', ctx.clientCode);
    if (ctx.year) params.append('year', ctx.year);
    if (ctx.month) params.append('month', ctx.month);
    if (ctx.clientCodeFilter) params.append('clientCodeFilter', ctx.clientCodeFilter);
    
    const res = await fetch(`${API_BASE}/mapping/cases?${params.toString()}`);
    const json = await res.json();
    setCases(json.items || []);
    setCasesTotal(json.total || 0);
    setCasesPage(json.page || p);
  } catch (e) {
    console.error(e);
  } finally {
    setCasesLoading(false);
  }
}
  // async function fetchCases(p = 1, ctx = viewCtx) {
  //   setCasesLoading(true);
  //   try {
  //     const params = new URLSearchParams({ page: String(p), limit: '50', userId: ctx.userId });
  //     if (ctx.clientCode) params.append('clientCode', ctx.clientCode);
  //     const res = await fetch(`${API_BASE}/mapping/cases?${params.toString()}`);
  //     const json = await res.json();
  //     setCases(json.items || []);
  //     setCasesTotal(json.total || 0);
  //     setCasesPage(json.page || p);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setCasesLoading(false);
  //   }
  // }

  // Automatically fetch data when filters change (with debounce)
  useEffect(() => {
    fetchSummary(1);
  }, [debouncedFilters, limit]);

  // In your ClientTracker component, update the onView and onDownload functions:

function onDownload(row) {
  // Convert month name to number if needed (same logic as in fetchSummary)
  let monthValue = filters.month;
  if (isNaN(monthValue) && monthValue) {
    const monthNum = MONTH_TO_NUM[monthValue.toLowerCase()];
    if (monthNum) monthValue = monthNum;
  }
  
  const params = new URLSearchParams({ 
    userId: row.userId, 
    year: filters.year,
    month: monthValue,
    clientCode: row.clientCode, // From the specific row
    clientCodeFilter: filters.clientCode // From the filter input
  });
  
  const url = `${API_BASE}/mapping/download?${params.toString()}`;
  window.open(url, '_blank');
}

function onView(row) {
  // Convert month name to number if needed
  let monthValue = filters.month;
  if (isNaN(monthValue) && monthValue) {
    const monthNum = MONTH_TO_NUM[monthValue.toLowerCase()];
    if (monthNum) monthValue = monthNum;
  }
  
  const viewContext = { 
    userId: row.userId, 
    clientCode: row.clientCode,
    year: filters.year,
    month: monthValue,
    clientCodeFilter: filters.clientCode // Different name to avoid conflict
  };
  
  setViewCtx(viewContext);
  setViewOpen(true);
  fetchCases(1, viewContext);
}

// Update the fetchCases function to include filters:


  // function onDownload(row) {
  //   const params = new URLSearchParams({ userId: row.userId });
  //   if (row.clientCode) params.append('clientCode', row.clientCode);
  //   const url = `${API_BASE}/mapping/download?${params.toString()}`;
  //   window.open(url, '_blank');
  // }

  // function onView(row) {
  //   setViewCtx({ userId: row.userId, clientCode: row.clientCode });
  //   setViewOpen(true);
  //   fetchCases(1, { userId: row.userId, clientCode: row.clientCode });
  // }

  // Handle month input with autocomplete
  const handleMonthChange = (e) => {
    const value = e.target.value;
    setFilters(f => ({ ...f, month: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ 
      year: '', 
      month: '', 
      clientCode: '', 
      userId: '',
      search: '' 
    });
    setShowYearCalendar(false);
    setShowMonthCalendar(false);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Generate years for year dropdown (last 10 years + next 2 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 20; i++) {
      years.push(i);
    }
    return years;
  };

  // Handle year selection from calendar
  const handleYearSelect = (year) => {
    setFilters(f => ({ ...f, year: String(year) }));
    setShowYearCalendar(false);
  };

  // Handle month selection from calendar
  const handleMonthSelect = (monthNum) => {
    const monthName = MONTHS[monthNum];
    setFilters(f => ({ ...f, month: monthName }));
    setShowMonthCalendar(false);
  };

  return (
    <Layout>
    <div className="p-4 md:p-8 space-y-6">
      <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Client-wise Completion Tracker</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
          <div className="relative">
            <div className="flex items-center">
              <input 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Year (YYYY)" 
                value={filters.year} 
                onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} 
                onFocus={() => setShowYearCalendar(true)}
              />
              {filters.year && (
                <button 
                  className="ml-2 text-gray-500 hover:text-red-500"
                  onClick={() => setFilters(f => ({ ...f, year: '' }))}
                >
                  ✕
                </button>
              )}
            </div>
            {showYearCalendar && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-full">
                <div className="grid grid-cols-3 gap-2">
                  {generateYears().map(year => (
                    <button
                      key={year}
                      className={`p-2 text-center rounded hover:bg-blue-100 ${filters.year === String(year) ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <button 
                  className="w-full mt-2 p-2 text-center text-blue-500 hover:bg-gray-100 rounded"
                  onClick={() => setShowYearCalendar(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <input 
                list="monthOptions"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Month name" 
                value={filters.month} 
                onChange={handleMonthChange}
                onFocus={() => setShowMonthCalendar(true)}
              />
              {filters.month && (
                <button 
                  className="ml-2 text-gray-500 hover:text-red-500"
                  onClick={() => setFilters(f => ({ ...f, month: '' }))}
                >
                  ✕
                </button>
              )}
            </div>
            <datalist id="monthOptions">
              {MONTH_NAMES.map(month => (
                <option key={month} value={month} />
              ))}
            </datalist>
            {showMonthCalendar && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-full">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(MONTHS).map(([num, name]) => (
                    <button
                      key={num}
                      className={`p-2 text-center rounded hover:bg-blue-100 ${filters.month.toLowerCase() === name.toLowerCase() ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => handleMonthSelect(num)}
                    >
                      {name.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <button 
                  className="w-full mt-2 p-2 text-center text-blue-500 hover:bg-gray-100 rounded"
                  onClick={() => setShowMonthCalendar(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Client Code" 
              value={filters.clientCode} 
              onChange={e => setFilters(f => ({ ...f, clientCode: e.target.value }))} 
            />
            {filters.clientCode && (
              <button 
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={() => setFilters(f => ({ ...f, clientCode: '' }))}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex items-center">
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="User ID" 
              value={filters.userId} 
              onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} 
            />
            {filters.userId && (
              <button 
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={() => setFilters(f => ({ ...f, userId: '' }))}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex items-center">
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Search..." 
              value={filters.search} 
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
            />
            {filters.search && (
              <button 
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={() => setFilters(f => ({ ...f, search: '' }))}
              >
                ✕
              </button>
            )}
          </div>
          
          <select 
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>

          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={clearFilters}
          >
            Clear All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User ID</th>
                <th className="px-4 py-3 text-left font-semibold">Client Code</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Total Closed</th>
                <th className="px-4 py-3 text-right font-semibold">Completion %</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, i) => (
                  <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3">{row.userId}</td>
                    <td className="px-4 py-3">{row.clientCode}</td>
                    <td className="px-4 py-3 text-right">{row.total}</td>
                    <td className="px-4 py-3 text-right">{row.totalClosed}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={`px-2 py-1 rounded-full text-xs ${row.completionRate >= 90 ? 'bg-green-100 text-green-800' : row.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {num3(row.completionRate)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button 
                        onClick={() => onView(row)} 
                        className="px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => onDownload(row)} 
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No records found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
          <span className="text-sm text-gray-600">
            Showing {data.length} of {totalGroups} records
          </span>
          
          <div className="flex space-x-1">
            <button 
              disabled={page <= 1} 
              onClick={() => fetchSummary(page - 1)} 
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            
            {generatePageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => fetchSummary(pageNum)}
                className={`px-4 py-2 border rounded-lg ${page === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} transition-colors`}
              >
                {pageNum}
              </button>
            ))}
            
            <button 
              disabled={page >= totalPages} 
              onClick={() => fetchSummary(page + 1)} 
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              Next
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Cases for {viewCtx.userId} {viewCtx.clientCode && `(${viewCtx.clientCode})`}
              </h3>
              <button 
                onClick={() => setViewOpen(false)} 
                className="text-gray-500 hover:text-black text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto flex-grow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Case ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Correct UPN</th>
                    <th className="px-4 py-3 text-left font-semibold">accountNumber</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Case Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Venodor Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Vendor Status</th>
                  </tr>
                </thead>
                <tbody>
                  {casesLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : cases.length > 0 ? (
                    cases.map((c, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{c.caseId}</td>
                        <td className="px-4 py-3">{c.correctUPN}</td>
                        <td className="px-4 py-3">{c.accountNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            c.status?.toLowerCase().includes('complete') || c.status?.toLowerCase().includes('closed') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{c.caseStatus}</td>
                        <td className="px-4 py-3">{c.vendorName}</td>
                        <td className="px-4 py-3">{c.vendorStatus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        No cases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Showing {cases.length} of {casesTotal} cases
              </span>
              
              <div className="flex space-x-2">
                <button 
                  disabled={casesPage <= 1} 
                  onClick={() => fetchCases(casesPage - 1)} 
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {casesPage} of {Math.ceil(casesTotal / 50)}
                </span>
                
                <button 
                  disabled={(casesPage * 50 >= casesTotal)} 
                  onClick={() => fetchCases(casesPage + 1)} 
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}





// import React, { useEffect, useMemo, useState } from 'react';
// import Layout from './Layout/Layout';

// const API_BASE = import.meta.env.VITE_Backend_Base_URL || '';

// function num3(n) {
//   if (n === null || n === undefined) return '0.000';
//   return Number(n).toFixed(3);
// }

// // Month mapping for conversion
// const MONTHS = {
//   '01': 'January', '02': 'February', '03': 'March', '04': 'April',
//   '05': 'May', '06': 'June', '07': 'July', '08': 'August',
//   '09': 'September', '10': 'October', '11': 'November', '12': 'December'
// };

// const MONTH_NAMES = Object.values(MONTHS);

// // Reverse mapping from name to number
// const MONTH_TO_NUM = Object.fromEntries(
//   Object.entries(MONTHS).map(([num, name]) => [name.toLowerCase(), num])
// );

// export default function ClientTracker() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(20);
//   const [totalGroups, setTotalGroups] = useState(0);

//   const [filters, setFilters] = useState({ 
//     year: '', 
//     month: '', 
//     clientCode: '', 
//     userId: '',
//     search: '' 
//   });

//   const [viewOpen, setViewOpen] = useState(false);
//   const [viewCtx, setViewCtx] = useState({ userId: '', clientCode: '' });
//   const [cases, setCases] = useState([]);
//   const [casesPage, setCasesPage] = useState(1);
//   const [casesTotal, setCasesTotal] = useState(0);
//   const [casesLoading, setCasesLoading] = useState(false);

//   const totalPages = useMemo(() => Math.ceil((totalGroups || 0) / limit), [totalGroups, limit]);

//   // Debounce function to delay API calls while typing
//   function useDebounce(value, delay) {
//     const [debouncedValue, setDebouncedValue] = useState(value);
    
//     useEffect(() => {
//       const handler = setTimeout(() => {
//         setDebouncedValue(value);
//       }, delay);
      
//       return () => {
//         clearTimeout(handler);
//       };
//     }, [value, delay]);
    
//     return debouncedValue;
//   }

//   const debouncedFilters = useDebounce(filters, 500);

//   async function fetchSummary(p = 1) {
//     setLoading(true);
//     try {
//       // Convert month name to number if needed
//       let monthValue = filters.month;
//       if (isNaN(monthValue) && monthValue) {
//         const monthNum = MONTH_TO_NUM[monthValue.toLowerCase()];
//         if (monthNum) monthValue = monthNum;
//       }
      
//       const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      
//       // Add filters to params if they have values
//       Object.entries({
//         ...filters,
//         month: monthValue
//       }).forEach(([k, v]) => { 
//         if (v) params.append(k, v); 
//       });
      
//       const res = await fetch(`${API_BASE}/mapping/summary?${params.toString()}`);
//       const json = await res.json();
//       setData(json.data || []);
//       setTotalGroups(json.totalGroups || 0);
//       setPage(json.page || p);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchCases(p = 1, ctx = viewCtx) {
//     setCasesLoading(true);
//     try {
//       const params = new URLSearchParams({ page: String(p), limit: '50', userId: ctx.userId });
//       if (ctx.clientCode) params.append('clientCode', ctx.clientCode);
//       const res = await fetch(`${API_BASE}/mapping/cases?${params.toString()}`);
//       const json = await res.json();
//       setCases(json.items || []);
//       setCasesTotal(json.total || 0);
//       setCasesPage(json.page || p);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setCasesLoading(false);
//     }
//   }

//   // Automatically fetch data when filters change (with debounce)
//   useEffect(() => {
//     fetchSummary(1);
//   }, [debouncedFilters, limit]);

//   function onDownload(row) {
//     const params = new URLSearchParams({ userId: row.userId });
//     if (row.clientCode) params.append('clientCode', row.clientCode);
//     const url = `${API_BASE}/mapping/download?${params.toString()}`;
//     window.open(url, '_blank');
//   }

//   function onView(row) {
//     setViewCtx({ userId: row.userId, clientCode: row.clientCode });
//     setViewOpen(true);
//     fetchCases(1, { userId: row.userId, clientCode: row.clientCode });
//   }

//   // Handle month input with autocomplete
//   const handleMonthChange = (e) => {
//     const value = e.target.value;
//     setFilters(f => ({ ...f, month: value }));
//   };

//   // Generate page numbers for pagination
//   const generatePageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;
//     let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
//     if (endPage - startPage + 1 < maxVisible) {
//       startPage = Math.max(1, endPage - maxVisible + 1);
//     }
    
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
    
//     return pages;
//   };

//   return (
//     <Layout>
//     <div className="p-4 md:p-8 space-y-6">
//       <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Client-wise Completion Tracker</h2>

//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
//           <div className="relative">
//             <input 
//               className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//               placeholder="Year (YYYY)" 
//               value={filters.year} 
//               onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} 
//             />
//           </div>
          
//           <div className="relative">
//             <input 
//               list="monthOptions"
//               className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//               placeholder="Month name" 
//               value={filters.month} 
//               onChange={handleMonthChange} 
//             />
//             <datalist id="monthOptions">
//               {MONTH_NAMES.map(month => (
//                 <option key={month} value={month} />
//               ))}
//             </datalist>
//           </div>
          
//           <input 
//             className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//             placeholder="Client Code" 
//             value={filters.clientCode} 
//             onChange={e => setFilters(f => ({ ...f, clientCode: e.target.value }))} 
//           />
          
//           <input 
//             className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//             placeholder="User ID" 
//             value={filters.userId} 
//             onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} 
//           />
          
//           <input 
//             className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//             placeholder="Search..." 
//             value={filters.search} 
//             onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
//           />
          
//           <select 
//             className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             value={limit}
//             onChange={e => setLimit(Number(e.target.value))}
//           >
//             <option value="10">10 per page</option>
//             <option value="20">20 per page</option>
//             <option value="50">50 per page</option>
//             <option value="100">100 per page</option>
//           </select>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto rounded-lg shadow">
//           <table className="min-w-full border-collapse">
//             <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//               <tr>
//                 <th className="px-4 py-3 text-left font-semibold">User ID</th>
//                 <th className="px-4 py-3 text-left font-semibold">Client Code</th>
//                 <th className="px-4 py-3 text-right font-semibold">Total</th>
//                 <th className="px-4 py-3 text-right font-semibold">Total Closed</th>
//                 <th className="px-4 py-3 text-right font-semibold">Completion %</th>
//                 <th className="px-4 py-3 text-center font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="text-center py-8">
//                     <div className="flex justify-center">
//                       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : data.length > 0 ? (
//                 data.map((row, i) => (
//                   <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
//                     <td className="px-4 py-3">{row.userId}</td>
//                     <td className="px-4 py-3">{row.clientCode}</td>
//                     <td className="px-4 py-3 text-right">{row.total}</td>
//                     <td className="px-4 py-3 text-right">{row.totalClosed}</td>
//                     <td className="px-4 py-3 text-right font-semibold">
//                       <span className={`px-2 py-1 rounded-full text-xs ${row.completionRate >= 90 ? 'bg-green-100 text-green-800' : row.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
//                         {num3(row.completionRate)}%
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-center space-x-2">
//                       <button 
//                         onClick={() => onView(row)} 
//                         className="px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => onDownload(row)} 
//                         className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                       >
//                         Download
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="text-center py-8 text-gray-500">
//                     No records found. Try adjusting your filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
//           <span className="text-sm text-gray-600">
//             Showing {data.length} of {totalGroups} records
//           </span>
          
//           <div className="flex space-x-1">
//             <button 
//               disabled={page <= 1} 
//               onClick={() => fetchSummary(page - 1)} 
//               className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//             >
//               Previous
//             </button>
            
//             {generatePageNumbers().map(pageNum => (
//               <button
//                 key={pageNum}
//                 onClick={() => fetchSummary(pageNum)}
//                 className={`px-4 py-2 border rounded-lg ${page === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'} transition-colors`}
//               >
//                 {pageNum}
//               </button>
//             ))}
            
//             <button 
//               disabled={page >= totalPages} 
//               onClick={() => fetchSummary(page + 1)} 
//               className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//             >
//               Next
//             </button>
//           </div>
          
//           <div className="text-sm text-gray-600">
//             Page {page} of {Math.max(totalPages, 1)}
//           </div>
//         </div>
//       </div>

//       {/* View Modal */}
//       {viewOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 Cases for {viewCtx.userId} {viewCtx.clientCode && `(${viewCtx.clientCode})`}
//               </h3>
//               <button 
//                 onClick={() => setViewOpen(false)} 
//                 className="text-gray-500 hover:text-black text-2xl"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="overflow-auto flex-grow">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-gray-100 sticky top-0">
//                   <tr>
//                     <th className="px-4 py-3 text-left font-semibold">Case ID</th>
//                     <th className="px-4 py-3 text-left font-semibold">Product</th>
//                     <th className="px-4 py-3 text-left font-semibold">Correct UPN</th>
//                     <th className="px-4 py-3 text-left font-semibold">Status</th>
//                     <th className="px-4 py-3 text-left font-semibold">Case Status</th>
//                     <th className="px-4 py-3 text-left font-semibold">List of Employee</th>
//                     <th className="px-4 py-3 text-left font-semibold">Vendor Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {casesLoading ? (
//                     <tr>
//                       <td colSpan={7} className="text-center py-8">
//                         <div className="flex justify-center">
//                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : cases.length > 0 ? (
//                     cases.map((c, i) => (
//                       <tr key={i} className="border-t hover:bg-gray-50">
//                         <td className="px-4 py-3">{c.caseId}</td>
//                         <td className="px-4 py-3">{c.updatedProductName || c.product}</td>
//                         <td className="px-4 py-3">{c.correctUPN}</td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded-full text-xs ${
//                             c.status?.toLowerCase().includes('complete') || c.status?.toLowerCase().includes('closed') 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {c.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">{c.caseStatus}</td>
//                         <td className="px-4 py-3">{c.listByEmployee}</td>
//                         <td className="px-4 py-3">{c.vendorStatus}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={7} className="text-center py-4 text-gray-500">
//                         No cases found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex justify-between items-center p-4 border-t bg-gray-50">
//               <span className="text-sm text-gray-600">
//                 Showing {cases.length} of {casesTotal} cases
//               </span>
              
//               <div className="flex space-x-2">
//                 <button 
//                   disabled={casesPage <= 1} 
//                   onClick={() => fetchCases(casesPage - 1)} 
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Previous
//                 </button>
                
//                 <span className="px-4 py-2 text-sm text-gray-600">
//                   Page {casesPage} of {Math.ceil(casesTotal / 50)}
//                 </span>
                
//                 <button 
//                   disabled={(casesPage * 50 >= casesTotal)} 
//                   onClick={() => fetchCases(casesPage + 1)} 
//                   className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//     </Layout>
//   );
// }



