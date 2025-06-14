import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import moment from "moment-timezone";
import Layout from "../../../Layout/Layout";
import FilterControls from "../Filter/Left-filter/FilterControls";
import FilterAndSearch from "../Filter/Right-filter/FilterAndSearch";
import Table from "./Table";
import { toast } from 'react-toastify';

const TrackerTable = () => {
  // State initialization
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [rowData, setRowData] = useState(null);
  const [editableColumns, setEditableColumns] = useState([]);
  const [filterType, setFilterType] = useState("active");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deduceMode, setDeduceMode] = useState(false);
  const [deduceFilters, setDeduceFilters] = useState({
    applyFilters: true,
    updateFields: false
  });
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: "",
    productType: "",
    dateIn: "",
    sentDate: "",
    dateOut: "",
    status: "",
    caseStatus: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Memoized values
  const themeClass = useMemo(() => isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100", [isDarkMode]);
  const panelClass = useMemo(() => isDarkMode ? "bg-gray-800" : "bg-white", [isDarkMode]);

  // Pre-process date filters
  const dateFilters = useMemo(() => ({
    dateIn: filters.dateIn ? moment(filters.dateIn, "DD-MM-YYYY") : null,
    sentDate: filters.sentDate ? moment(filters.sentDate, "DD-MM-YYYY") : null,
    dateOut: filters.dateOut ? moment(filters.dateOut, "DD-MM-YYYY") : null
  }), [filters.dateIn, filters.sentDate, filters.dateOut]);

  // User effect for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // User effect for initial user data
  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    if (getUser) {
      try {
        const data = JSON.parse(getUser);
        setRole(data.role || "");
        setUserId(data.userId || "");
        setName(data.name || "");
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Format row data efficiently
  const formatRow = useCallback((row, headers) => {
    const formattedRow = { attachments: row.attachments || [] };
    
    headers.forEach(header => {
      if (header === "☑") return;
      
      if (["dateIn", "dateOut", "sentDate", "createdAt", "updatedAt"].includes(header)) {
        try {
          formattedRow[header] = row[header] 
            ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY, h:mm:ss A")
            : "";
        } catch (e) {
          formattedRow[header] = "Format Error";
        }
      } else {
        formattedRow[header] = row[header] ?? "";
      }
    });
    
    return formattedRow;
  }, []);

  // Filter records based on current filters
  const filterRecords = useCallback((records, filters, dateFilters) => {
    if (!Object.values(filters).some(Boolean)) return records;

    return records.filter(record => {
      return (
        (!filters.product || (record.product && record.product.toLowerCase().includes(filters.product.toLowerCase()))) &&
        (!filters.productType || (record.productType && record.productType.toLowerCase().includes(filters.productType.toLowerCase()))) &&
        (!filters.status || (record.status && record.status.toLowerCase().includes(filters.status.toLowerCase()))) &&
        (!filters.caseStatus || (record.caseStatus && record.caseStatus.toLowerCase().includes(filters.caseStatus.toLowerCase()))) &&
        (!dateFilters.dateIn || (
          record.dateIn && 
          moment(record.dateIn, "DD-MM-YYYY, h:mm:ss A").isSame(dateFilters.dateIn, 'day')
        )) &&
        (!dateFilters.sentDate || (
          record.sentDate && 
          record.sentDate.trim() !== '' &&
          moment(record.sentDate, "DD-MM-YYYY, h:mm:ss A").isSame(dateFilters.sentDate, 'day')
        )) &&
        (!dateFilters.dateOut || (
          record.dateOut && 
          record.dateOut.trim() !== '' &&
          moment(record.dateOut, "DD-MM-YYYY, h:mm:ss A").isSame(dateFilters.dateOut, 'day')
        ))
      );
    });
  }, []);

  // Main data fetching function
  const fetchTrackerData = useCallback(async (applyFilters = true) => {
    setIsLoading(true);
    try {
      const endpoint = filterType === "deleted" 
        ? "/kyc/deleted-items" 
        : "/kyc/tracker-data";
      
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
        params: { 
          role, 
          userId, 
          name,
          ...(applyFilters && !deduceMode && {
            product: filters.product,
            productType: filters.productType,
            status: filters.status,
            caseStatus: filters.caseStatus,
            dateIn: filters.dateIn,
            sentDate: filters.sentDate,
            dateOut: filters.dateOut
          })
        }
      });
      
      let fetchedData = response.data?.data || response.data || [];
      setOriginalData(fetchedData);

      // Apply client-side filters if needed
      if (applyFilters && !deduceMode) {
        fetchedData = filterRecords(fetchedData, filters, dateFilters);
      }

      // Process columns and headers
      const columns = response.data?.editableColumns || [];
      if (columns.length > 0) setEditableColumns(columns);

      if (fetchedData.length > 0) {
        const extractedHeaders = [
          "&nbsp;",
          "caseId",
          ...Object.keys(fetchedData[0]).filter(
            key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
          ),
        ];

        const formattedData = fetchedData.map(row => formatRow(row, extractedHeaders));
        setHeaders(extractedHeaders);
        setData(formattedData);
      } else {
        setHeaders([]);
        setData([]);
      }

      if (deduceMode && !Object.values(filters).some(Boolean)) {
        setDeduceMode(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [role, userId, name, filterType, filters, deduceMode, dateFilters, filterRecords, formatRow]);

  // Effects for data fetching
  useEffect(() => {
    if (role) fetchTrackerData();
  }, [role, userId, name, filterType, fetchTrackerData]);

  const handleRowSelection = useCallback((r, isChecked) => {
    setData(prevData => {
      const updatedData = [...prevData];
      updatedData[r]["☑"] = isChecked;
      return updatedData;
    });

    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = isChecked 
        ? [...prevSelectedRows, r] 
        : prevSelectedRows.filter(row => row !== r);
      return newSelectedRows;
    });

    setRowData(isChecked && selectedRows.length === 0 ? data[r] : null);
  }, [data, selectedRows.length]);

  const handleRecheck = useCallback(() => {
    if (selectedRows.length !== 1) {
      alert(selectedRows.length === 0 
        ? "No row selected for recheck." 
        : "Please select only one row for recheck.");
      return;
    }
    setRowData(data[selectedRows[0]]);
  }, [data, selectedRows]);

  const handleRecordAdded = useCallback(async (recheckedRecord, shouldClearSelection = false) => {
    if (shouldClearSelection) {
      setSelectedRows([]);
      setRowData(null);
    }
    await fetchTrackerData();
  }, [fetchTrackerData]);

  const handleMasterReset = useCallback(async () => {
    setFilters({
      product: "",
      productType: "",
      dateIn: "",
      endDate: "",
      dateOut: "",
      status: "",
      caseStatus: "",
    });
    setSearchQuery("");
    setPageSize(50);
    setSelectedRows([]);
    setRowData(null);
    setSelectedRecord(null);
    await fetchTrackerData(false); // Skip filters on reset
  }, [fetchTrackerData]);

  const handleDeduce = useCallback(async () => {
    try {
      setIsLoading(true);
      setDeduceMode(true);
      
      const statusFilter = ["New Data", "Pending"];
      const caseStatusFilter = ["New", "Pending"];
      
      let recordsToCheck = originalData.filter(record => 
        statusFilter.includes(record.status) || 
        caseStatusFilter.includes(record.caseStatus)
      );
      
      if (deduceFilters.applyFilters) {
        recordsToCheck = filterRecords(recordsToCheck, filters, dateFilters);
      }
      
      const grouped = new Map();
      recordsToCheck.forEach(record => {
        const key = `${record.product}|${record.accountNumber}|${record.requirement}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key).push(record);
      });
      
      const duplicates = Array.from(grouped.values()).filter(group => group.length > 1);
      
      if (duplicates.length > 0) {
        const duplicateRecords = duplicates.flat();
        setData(duplicateRecords);
        toast.success(`Found ${duplicateRecords.length} duplicate records`);
      } else {
        toast.info("No duplicate records found");
        setDeduceMode(false);
        fetchTrackerData();
      }
    } catch (error) {
      console.error("Deduce error:", error);
      toast.error("Failed to find duplicates");
      setDeduceMode(false);
      fetchTrackerData();
    } finally {
      setIsLoading(false);
    }
  }, [originalData, deduceFilters.applyFilters, filters, dateFilters, filterRecords, fetchTrackerData]);

  return (
    <Layout>
      <div className="mx-auto space-y-2" style={{width:'calc(100% - 5px)'}}>
        <div className={`w-full rounded-xl shadow-lg overflow-hidden ${themeClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className={`${panelClass} p-4 rounded-lg shadow-md`}>
              <FilterControls 
                filters={filters} 
                setFilters={setFilters} 
                isDarkMode={isDarkMode}
                selectedRows={selectedRows}
                data={data}
                fetchTrackerData={fetchTrackerData}
                setSelectedRows={setSelectedRows}
              />
            </div>
            <div className={`${panelClass} p-4 rounded shadow-md`}>
              <FilterAndSearch 
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                rowData={rowData}
                onRecordAdded={handleRecordAdded}
                onRecheck={handleRecheck}
                onFilterTypeChange={setFilterType}
                filters={filters}
                setFilters={setFilters}
                filterType={filterType}
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <Table
              data={data}
              headers={headers}
              searchQuery={searchQuery}
              pageSize={pageSize}
              filters={filters}
              selectedRows={selectedRows}
              handleRowSelection={handleRowSelection}
              isDarkMode={isDarkMode}
              setPageSize={setPageSize}
              setData={setData}
              editableColumns={editableColumns}
              setSelectedRows={setSelectedRows}
              filterType={filterType}
              isLoading={isLoading}
              fetchTrackerData={fetchTrackerData}
              setSearchQuery={setSearchQuery}
              onMasterReset={handleMasterReset}
              deduceMode={deduceMode}
              deduceFilters={deduceFilters}
              setFilters={setFilters}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
            />
          </div>          
        </div>
      </div>
    </Layout>
  );
};

export default TrackerTable;



////////////////////////////////////update UI/////////////////////////

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import moment from "moment-timezone"
// import Layout from "../../../Layout/Layout";
// import FilterControls from "../Filter/Left-filter/FilterControls";
// import FilterAndSearch from "../Filter/Right-filter/FilterAndSearch";
// import Table from "./Table";
// import { format, parse } from "date-fns";
// import { toast } from 'react-toastify';

// const TrackerTable = () => {
//   const [data, setData] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [role, setRole] = useState("");
//   const [userId, setUserId] = useState("");
//   const [name, setName] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(50);
//   const [rowData, setRowData] = useState(null);
//   const [editableColumns, setEditableColumns] = useState([]);
//   const [filterType, setFilterType] = useState("active");
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [deduceMode, setDeduceMode] = useState(false);
// const [deduceFilters, setDeduceFilters] = useState({
//   applyFilters: true,
//   updateFields: false
// });
// const [originalData, setOriginalData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     product: "",
//     productType: "",
//     dateIn: "",
//     sentDate: "",
//     dateOut: "",
//     status: "",
//     caseStatus: "",
//   });
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setRole(data.role || "");
//       setUserId(data.userId || "");
//       setName(data.name || "");
//     }
//   }, []);

//   const fetchTrackerData = async (applyFilters = true) => {
//   setIsLoading(true);
//   try {
//     const endpoint = filterType === "deleted" 
//       ? "/kyc/deleted-items" 
//       : "/kyc/tracker-data";
    
//     // Get the base data from server
//     const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
//       params: { 
//         role, 
//         userId, 
//         name,
//         // Optionally send filters to server for more efficient filtering
//         ...(applyFilters && !deduceMode && {
//           product: filters.product,
//           productType: filters.productType,
//           status: filters.status,
//           caseStatus: filters.caseStatus,
//           dateIn: filters.dateIn,
//           sentDate: filters.sentDate,
//           dateOut: filters.dateOut
//         })
//       }
//     });
    
//     let fetchedData = response.data?.data || response.data || [];
//     setOriginalData(fetchedData); // Always store original unfiltered data

//     // Apply client-side filters if needed (when server doesn't handle filtering)
//     if (applyFilters && !deduceMode && Object.values(filters).some(Boolean)) {
//       fetchedData = fetchedData.filter(record => {
//         return (
//           (!filters.product || record.product?.toLowerCase().includes(filters.product.toLowerCase())) &&
//           (!filters.productType || record.productType?.toLowerCase().includes(filters.productType.toLowerCase())) &&
//           (!filters.status || record.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
//           (!filters.caseStatus || record.caseStatus?.toLowerCase().includes(filters.caseStatus.toLowerCase())) &&
//           (!filters.dateIn || (
//   record.dateIn &&
//   moment(record.dateIn, "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY") === filters.dateIn
// ))  && (!filters.sentDate || (
//   record.sentDate && 
//   record.sentDate.trim() !== '' &&
//   moment(record.sentDate, "DD-MM-YYYY, h:mm:ss a").isSame(
//     moment(filters.sentDate, "DD-MM-YYYY"),
//     'day'
//   )
// )) &&
// // (!filters.dateOut || (
// //   record.dateOut && 
// //   moment(record.dateOut).isSame(moment(filters.dateOut, "DD-MM-YYYY"), 'day')
// // ))
// (!filters.dateOut || (
//   record.dateOut && 
//   record.dateOut.trim() !== '' &&
//   moment(record.dateOut, "DD-MM-YYYY, h:mm:ss a").isSame(
//     moment(filters.dateOut, "DD-MM-YYYY"),
//     'day'
//   )
// ))

//         );
//       });
//     }

//     // Process columns and headers
//     let columns = response.data?.editableColumns || [];
//     if (columns.length > 0) setEditableColumns(columns);

//     if (fetchedData.length > 0) {
//       const extractedHeaders = [
//         "&nbsp;",
//         "caseId",
//         ...Object.keys(fetchedData[0]).filter(
//           key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
//         ),
//       ];

//       // Format the data for display
//       // const formattedData = fetchedData.map(row => ({
//       //   attachments: row.attachments || [],
//       //   ...Object.fromEntries(
//       //     extractedHeaders
//       //       .filter(header => header !== "☑")
//       //       .map(header => [
//       //         header,
//       //         ["createdAt", "updatedAt", "sentDate", "dateOut"].includes(header)
//       //           ? row[header]
//       //             ? moment(row[header]).format("DD-MM-YYYY, h:mm:ss A")
//       //             : ""
//       //           : row[header] ?? ""
//       //       ])
//       //   )
//       // }));
//       const formattedData = fetchedData.map(row => ({
//   attachments: row.attachments || [],
//   ...Object.fromEntries(
//     extractedHeaders
//       .filter(header => header !== "☑")
//       .map(header => {
//         // Handle date fields
//         if (["dateIn", "dateOut", "sentDate", "createdAt", "updatedAt"].includes(header)) {
//           try {
//             return [
//               header,
//               row[header] 
//                 ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").isValid()
//                   ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY, h:mm:ss A")
//                   : "Invalid Date"
//                 : ""
//             ];
//           } catch (e) {
//             return [header, "Format Error"];
//           }
//         }
//         return [header, row[header] ?? ""];
//       })
//   )
// }));
//       setHeaders(extractedHeaders);
//       setData(formattedData);
//     } else {
//       setHeaders([]);
//       setData([]);
//     }

//     // If in deduce mode but no filters applied, exit deduce mode
//     if (deduceMode && !Object.values(filters).some(Boolean)) {
//       setDeduceMode(false);
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     toast.error("Failed to fetch data. Please try again.");
//   } finally {
//     setIsLoading(false);
//   }
// };
//   useEffect(() => {
//     if (role) fetchTrackerData();
//   }, [role, userId, name, filterType,filters]);

//   const handleRowSelection = (r, isChecked) => {
//     const updatedData = [...data];
//     updatedData[r]["☑"] = isChecked;
//     setData(updatedData);

//     const newSelectedRows = isChecked 
//       ? [...selectedRows, r] 
//       : selectedRows.filter(row => row !== r);
    
//     setSelectedRows(newSelectedRows);
//     setRowData(isChecked && newSelectedRows.length === 1 ? updatedData[r] : null);
//   };

  
//   const handleRecheck = () => {
//     if (selectedRows.length !== 1) {
//       alert(selectedRows.length === 0 
//         ? "No row selected for recheck." 
//         : "Please select only one row for recheck.");
//       return;
//     }
//     setRowData(data[selectedRows[0]]);
//   };
  
//   // Modify the onRecordAdded callback to force a refresh
//   const handleRecordAdded = async (recheckedRecord, shouldClearSelection = false) => {
//     if (shouldClearSelection) {
//       setSelectedRows([]);
//       setRowData(null);
//     }
//     await fetchTrackerData();
//   };
  
//   const handleMasterReset = async() => {
//     // Reset filters
//     setFilters({
//       product: "",
//       productType: "",
//       dateIn: "",
//       endDate: "",
//       dateOut: "",
//       status: "",
//       caseStatus: "",
//     });
    
//     // Reset search
//     setSearchQuery("");
    
//     // Reset pagination
//     setPageSize(50);
//     // setCurrentPage(1);
    
//     // Clear all selections
//     setSelectedRows([]);
//     setRowData(null);
//     setSelectedRecord(null)
    
//     // Force a data refresh
//     await fetchTrackerData();
//   };
  
//   const handleDeduce = async () => {
//     try {
//       setIsLoading(true);
//       setDeduceMode(true);
      
//       // Get records with matching status/case status
//       const statusFilter = ["New Data", "Pending"];
//       const caseStatusFilter = ["New", "Pending"];
      
//       let recordsToCheck = originalData.filter(record => 
//         statusFilter.includes(record.status) || 
//         caseStatusFilter.includes(record.caseStatus)
//       );
      
//       // If applyFilters is true, apply current filters
//       if (deduceFilters.applyFilters) {
//         recordsToCheck = recordsToCheck.filter(record =>
//           Object.entries(filters).every(([key, value]) =>
//             value ? record[key]?.toString().toLowerCase().includes(value.toLowerCase()) : true
//           )
//         );
//       }
      
//       // Group by product, accountNumber, requirement
//       const grouped = {};
//       recordsToCheck.forEach(record => {
//         const key = `${record.product}|${record.accountNumber}|${record.requirement}`;
//         if (!grouped[key]) {
//           grouped[key] = [];
//         }
//         grouped[key].push(record);
//       });
      
//       // Find groups with duplicates
//       const duplicates = Object.values(grouped).filter(group => group.length > 1);
      
//       if (duplicates.length > 0) {
//         // Flatten the duplicates array and set as data
//         const duplicateRecords = duplicates.flat();
//         setData(duplicateRecords);
//         toast.success(`Found ${duplicateRecords.length} duplicate records`);
//       } else {
//         toast.info("No duplicate records found");
//         setDeduceMode(false);
//         fetchTrackerData(); // Reset to original data
//       }
//     } catch (error) {
//       console.error("Deduce error:", error);
//       toast.error("Failed to find duplicates");
//       setDeduceMode(false);
//       fetchTrackerData();
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   return (
//     <Layout>
//       <div className="mx-auto space-y-2" style={{width:'calc(100% - 5px)'}}>
//         <div className={`w-full rounded-xl shadow-lg overflow-hidden ${
//           isDarkMode 
//             ? "bg-gray-900" 
//             : "bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100"
//         }`}>

//           {/* Filter section with improved layout */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
//             <div className={`${
//               isDarkMode ? "bg-gray-800" : "bg-white"
//             } p-4 rounded-lg shadow-md`}>
//           <FilterControls 
//             filters={filters} 
//             setFilters={setFilters} 
//             isDarkMode={isDarkMode}
//             selectedRows={selectedRows}
//             data={data}
//             fetchTrackerData={fetchTrackerData}
//             setSelectedRows = {setSelectedRows}
//           />
//           </div>
//           <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow-md`}>
//             <FilterAndSearch 
//               setSearchQuery={setSearchQuery}
//               searchQuery = {searchQuery}
//               rowData={rowData}
//               onRecordAdded={handleRecordAdded}
//               onRecheck={handleRecheck}
//               onFilterTypeChange={setFilterType}
//               filters={filters}
//               setFilters={setFilters}
//               filterType={filterType}
//             />
//           </div>
//         </div>

//         {/* Table wrapper with overflow handling */}
//         <div className="w-full overflow-x-auto">
//         <Table
//           data={data}
//           headers={headers}
//           searchQuery={searchQuery}
//           pageSize={pageSize}
//           filters={filters}
//           selectedRows={selectedRows}
//           handleRowSelection={handleRowSelection}
//           isDarkMode={isDarkMode}
//           setPageSize={setPageSize}
//           setData={setData}
//           editableColumns={editableColumns}
//           setSelectedRows={setSelectedRows}
//           filterType={filterType}
//           // onDeletePermanently={handleDeletePermanently}
//           isLoading={isLoading}
//           fetchTrackerData={fetchTrackerData}
//           setSearchQuery={setSearchQuery}
//           onMasterReset={handleMasterReset}
//           deduceMode={deduceMode}
//           deduceFilters={deduceFilters}
//           setFilters={setFilters}
//           selectedRecord = {selectedRecord}
//           setSelectedRecord = {setSelectedRecord}
//         />
//         </div>          
//       </div>
//       </div>
//     </Layout>
//   );
// };

// export default TrackerTable;