// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import moment from "moment";
// import Layout from "../../../Layout/Layout";
// import FilterControls from "../Filter/Left-filter/FilterControls";
// import FilterAndSearch from "../Filter/Right-filter/FilterAndSearch";
// import Table from "./Table";

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
//   const [isLoading, setIsLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     product: "",
//     productType: "",
//     dateIn: "",
//     endDate: "",
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

//   const fetchTrackerData = async () => {
//     setIsLoading(true);
//     try {
//       const endpoint = filterType === "deleted" 
//         ? "/kyc/deleted-items" 
//         : "/kyc/tracker-data";
      
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
//         params: { role, userId, name }
//       });

//       let fetchedData = response.data?.data || response.data || [];

//       fetchedData = fetchedData.sort((a, b) => {
//         if (a.isRechecked && !b.isRechecked) return -1;
//         if (!a.isRechecked && b.isRechecked) return 1;
//         return new Date(b.dateIn) - new Date(a.dateIn);
//       });

//       let columns = response.data?.editableColumns || [];

//       if (columns.length > 0) setEditableColumns(columns);

//       if (fetchedData.length > 0) {
//         const extractedHeaders = [
//           "☑",
//           "caseId",
//           ...Object.keys(fetchedData[0]).filter(
//             key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
//           ),
//         ];

//         const formattedData = fetchedData.map(row => ({
//           attachments: row.attachments || [],
//           ...Object.fromEntries(
//             extractedHeaders
//               .filter(header => header !== "☑")
//               .map(header => [
//                 header,
//                 ["createdAt", "updatedAt"].includes(header)
//                   ? row[header]
//                     ? moment(row[header]).format("DD-MM-YYYY HH:mm:ss")
//                     : ""
//                   : row[header] ?? ""
//               ])
//           )
//         }));

//         setHeaders(extractedHeaders);
//         setData(formattedData);
//       } else {
//         setHeaders([]);
//         setData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // const fetchTrackerData = async () => {
//   //   setIsLoading(true);
//   //   try {
//   //     const endpoint = filterType === "deleted" 
//   //       ? "/kyc/deleted-items" 
//   //       : "/kyc/tracker-data";
      
//   //     const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
//   //       params: { role, userId, name }
//   //     });
  
//   //     let fetchedData = response.data?.data || response.data || [];
  
//   //     fetchedData = fetchedData.sort((a, b) => {
//   //       if (a.isRechecked && !b.isRechecked) return -1;
//   //       if (!a.isRechecked && b.isRechecked) return 1;
//   //       return new Date(b.dateIn) - new Date(a.dateIn);
//   //     });
  
//   //     let columns = response.data?.editableColumns || [];
//   //     if (columns.length > 0) setEditableColumns(columns);
  
//   //     if (fetchedData.length > 0) {
//   //       // First get all possible keys excluding internal ones
//   //       const allKeys = new Set();
//   //       fetchedData.forEach(row => {
//   //         Object.keys(row).forEach(key => {
//   //           if (!key.startsWith('_') && key !== '__v') {
//   //             allKeys.add(key);
//   //           }
//   //         });
//   //       });
  
//   //       // Create headers array with checkbox first, then caseId, then other fields
//   //       const extractedHeaders = [
//   //         '☑', // checkbox column
//   //         'caseId',
//   //         ...Array.from(allKeys)
//   //           .filter(key => key !== 'caseId' && key !== 'attachments')
//   //           .sort(),
//   //         'attachments' // Make sure attachments is included
//   //       ];
  
//   //       // Format the data while preserving attachments
//   //       const formattedData = fetchedData.map(row => {
//   //         const formattedRow = {
//   //           attachments: row.attachments || [], // Preserve attachments array
//   //           ...Object.fromEntries(
//   //             extractedHeaders
//   //               .filter(header => header !== '☑' && header !== 'attachments')
//   //               .map(header => [
//   //                 header,
//   //                 ['createdAt', 'updatedAt', 'dateIn', 'dateOut', 'sentDate'].includes(header)
//   //                   ? row[header]
//   //                     ? moment(row[header]).format('YYYY-MM-DD, h:mm:ss a')
//   //                     : ''
//   //                   : row[header] ?? ''
//   //               ])
//   //           )
//   //         };
//   //         return formattedRow;
//   //       });
  
//   //       setHeaders(extractedHeaders);
//   //       setData(formattedData);
        
//   //       // Debug logging
//   //       console.log('Headers:', extractedHeaders);
//   //       console.log('First row data:', formattedData[0]);
//   //       console.log('First row attachments:', formattedData[0]?.attachments);
//   //     } else {
//   //       setHeaders([]);
//   //       setData([]);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error fetching data:', error);
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };
//   useEffect(() => {
//     if (role) fetchTrackerData();
//   }, [role, userId, name, filterType]);

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

//   // const handleRecheck = () => {
//   //   if (selectedRows.length !== 1) {
//   //     alert(selectedRows.length === 0 
//   //       ? "No row selected for recheck." 
//   //       : "Please select only one row for recheck.");
//   //     return;
//   //   }
//   //   setRowData(data[selectedRows[0]]);
//   // };
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
//   // const handleRestoreRecords = async () => {
//   //   if (selectedRows.length === 0) return;
    
//   //   const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
//   //   if (!caseIds.length) return;
  
//   //   try {
//   //     const response = await axios.post(
//   //       `${import.meta.env.VITE_Backend_Base_URL}/kyc/restore-records`,
//   //       { caseIds }
//   //     );
      
//   //     if (response.status === 200) {
//   //       fetchTrackerData();
//   //       setSelectedRows([]);
//   //       alert(`${caseIds.length} record(s) restored successfully!`);
//   //     }
//   //   } catch (error) {
//   //     console.error("Restore error:", error);
//   //     alert("Failed to restore records");
//   //   }
//   // };

//   return (
//     <Layout>
//       <div className={`w-full mt-2 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100"}`}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <FilterControls 
//             filters={filters} 
//             setFilters={setFilters} 
//             isDarkMode={isDarkMode} 
//           />
//           <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow-md`}>
//             <FilterAndSearch 
//               setSearchQuery={setSearchQuery}
//               rowData={rowData}
//               onRecordAdded={fetchTrackerData}
//               onRecheck={handleRecheck}
//               onFilterTypeChange={setFilterType}
//               filters={filters}
//               setFilters={setFilters}
//               filterType={filterType}
//             />
//           </div>
//         </div>
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
//           // onRestoreRecords={handleRestoreRecords}
//         />
//       </div>
//     </Layout>
//   );
// };

// export default TrackerTable;



////////////////////////////////////update UI/////////////////////////

import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone"
import Layout from "../../../Layout/Layout";
import FilterControls from "../Filter/Left-filter/FilterControls";
import FilterAndSearch from "../Filter/Right-filter/FilterAndSearch";
import Table from "./Table";
import { format, parse } from "date-fns";
import { toast } from 'react-toastify';

const TrackerTable = () => {
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
    endDate: "",
    dateOut: "",
    status: "",
    caseStatus: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    if (getUser) {
      const data = JSON.parse(getUser);
      setRole(data.role || "");
      setUserId(data.userId || "");
      setName(data.name || "");
    }
  }, []);

  // const fetchTrackerData = async () => {
  //   setIsLoading(true);
  //   try {
  //     const endpoint = filterType === "deleted" 
  //     ? "/kyc/deleted-items" 
  //     : "/kyc/tracker-data";
    
  //   const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
  //     params: { role, userId, name }
  //   });

  //   let fetchedData = response.data?.data || response.data || [];
  //   setOriginalData(fetchedData); // Store original data


  //     let columns = response.data?.editableColumns || [];

  //     if (columns.length > 0) setEditableColumns(columns);

  //     if (fetchedData.length > 0) {
  //       const extractedHeaders = [
  //         //"☑",
  //         "&nbsp;",
  //         "caseId",
  //         ...Object.keys(fetchedData[0]).filter(
  //           key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
  //         ),
  //       ];

  //       const formattedData = fetchedData.map(row => ({
  //         attachments: row.attachments || [],
  //         ...Object.fromEntries(
  //           extractedHeaders
  //             .filter(header => header !== "☑")
  //             .map(header => [
  //               header,
  //               ["createdAt", "updatedAt"].includes(header)
  //                 ? row[header]
  //                   ? moment(row[header]).format("DD-MM-YYYY HH:mm:ss")
  //                   : ""
  //                 : row[header] ?? ""
  //             ])
  //         )
  //       }));

  //       setHeaders(extractedHeaders);
  //       setData(formattedData);
  //     } else {
  //       setHeaders([]);
  //       setData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const fetchTrackerData = async (applyFilters = true) => {
  setIsLoading(true);
  try {
    const endpoint = filterType === "deleted" 
      ? "/kyc/deleted-items" 
      : "/kyc/tracker-data";
    
    // Get the base data from server
    const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
      params: { 
        role, 
        userId, 
        name,
        // Optionally send filters to server for more efficient filtering
        ...(applyFilters && !deduceMode && {
          product: filters.product,
          productType: filters.productType,
          status: filters.status,
          caseStatus: filters.caseStatus,
          dateIn: filters.dateIn,
          endDate: filters.endDate,
          dateOut: filters.dateOut
        })
      }
    });
    
    let fetchedData = response.data?.data || response.data || [];
    setOriginalData(fetchedData); // Always store original unfiltered data

    // Apply client-side filters if needed (when server doesn't handle filtering)
    if (applyFilters && !deduceMode && Object.values(filters).some(Boolean)) {
      fetchedData = fetchedData.filter(record => {
        return (
          (!filters.product || record.product?.toLowerCase().includes(filters.product.toLowerCase())) &&
          (!filters.productType || record.productType?.toLowerCase().includes(filters.productType.toLowerCase())) &&
          (!filters.status || record.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
          (!filters.caseStatus || record.caseStatus?.toLowerCase().includes(filters.caseStatus.toLowerCase())) &&
          (!filters.dateIn || (
  record.dateIn &&
  moment(record.dateIn, "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY") === filters.dateIn
))  &&
// (!filters.dateOut || (
//   record.dateOut && 
//   moment(record.dateOut).isSame(moment(filters.dateOut, "DD-MM-YYYY"), 'day')
// ))
(!filters.dateOut || (
  record.dateOut && 
  record.dateOut.trim() !== '' &&
  moment(record.dateOut, "DD-MM-YYYY, h:mm:ss a").isSame(
    moment(filters.dateOut, "DD-MM-YYYY"),
    'day'
  )
))

        );
      });
    }

    // Process columns and headers
    let columns = response.data?.editableColumns || [];
    if (columns.length > 0) setEditableColumns(columns);

    if (fetchedData.length > 0) {
      const extractedHeaders = [
        "&nbsp;",
        "caseId",
        ...Object.keys(fetchedData[0]).filter(
          key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
        ),
      ];

      // Format the data for display
      // const formattedData = fetchedData.map(row => ({
      //   attachments: row.attachments || [],
      //   ...Object.fromEntries(
      //     extractedHeaders
      //       .filter(header => header !== "☑")
      //       .map(header => [
      //         header,
      //         ["createdAt", "updatedAt", "sentDate", "dateOut"].includes(header)
      //           ? row[header]
      //             ? moment(row[header]).format("DD-MM-YYYY, h:mm:ss A")
      //             : ""
      //           : row[header] ?? ""
      //       ])
      //   )
      // }));
      const formattedData = fetchedData.map(row => ({
  attachments: row.attachments || [],
  ...Object.fromEntries(
    extractedHeaders
      .filter(header => header !== "☑")
      .map(header => {
        // Handle date fields
        if (["dateIn", "dateOut", "sentDate", "createdAt", "updatedAt"].includes(header)) {
          try {
            return [
              header,
              row[header] 
                ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").isValid()
                  ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY, h:mm:ss A")
                  : "Invalid Date"
                : ""
            ];
          } catch (e) {
            return [header, "Format Error"];
          }
        }
        return [header, row[header] ?? ""];
      })
  )
}));
      setHeaders(extractedHeaders);
      setData(formattedData);
    } else {
      setHeaders([]);
      setData([]);
    }

    // If in deduce mode but no filters applied, exit deduce mode
    if (deduceMode && !Object.values(filters).some(Boolean)) {
      setDeduceMode(false);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.error("Failed to fetch data. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    if (role) fetchTrackerData();
  }, [role, userId, name, filterType,filters]);

  const handleRowSelection = (r, isChecked) => {
    const updatedData = [...data];
    updatedData[r]["☑"] = isChecked;
    setData(updatedData);

    const newSelectedRows = isChecked 
      ? [...selectedRows, r] 
      : selectedRows.filter(row => row !== r);
    
    setSelectedRows(newSelectedRows);
    setRowData(isChecked && newSelectedRows.length === 1 ? updatedData[r] : null);
  };

  
  const handleRecheck = () => {
    if (selectedRows.length !== 1) {
      alert(selectedRows.length === 0 
        ? "No row selected for recheck." 
        : "Please select only one row for recheck.");
      return;
    }
    setRowData(data[selectedRows[0]]);
  };
  
  // Modify the onRecordAdded callback to force a refresh
  const handleRecordAdded = async (recheckedRecord, shouldClearSelection = false) => {
    if (shouldClearSelection) {
      setSelectedRows([]);
      setRowData(null);
    }
    await fetchTrackerData();
  };
  
  const handleMasterReset = async() => {
    // Reset filters
    setFilters({
      product: "",
      productType: "",
      dateIn: "",
      endDate: "",
      dateOut: "",
      status: "",
      caseStatus: "",
    });
    
    // Reset search
    setSearchQuery("");
    
    // Reset pagination
    setPageSize(50);
    // setCurrentPage(1);
    
    // Clear all selections
    setSelectedRows([]);
    setRowData(null);
    setSelectedRecord(null)
    
    // Force a data refresh
    await fetchTrackerData();
  };
  
  const handleDeduce = async () => {
    try {
      setIsLoading(true);
      setDeduceMode(true);
      
      // Get records with matching status/case status
      const statusFilter = ["New Data", "Pending"];
      const caseStatusFilter = ["New", "Pending"];
      
      let recordsToCheck = originalData.filter(record => 
        statusFilter.includes(record.status) || 
        caseStatusFilter.includes(record.caseStatus)
      );
      
      // If applyFilters is true, apply current filters
      if (deduceFilters.applyFilters) {
        recordsToCheck = recordsToCheck.filter(record =>
          Object.entries(filters).every(([key, value]) =>
            value ? record[key]?.toString().toLowerCase().includes(value.toLowerCase()) : true
          )
        );
      }
      
      // Group by product, accountNumber, requirement
      const grouped = {};
      recordsToCheck.forEach(record => {
        const key = `${record.product}|${record.accountNumber}|${record.requirement}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(record);
      });
      
      // Find groups with duplicates
      const duplicates = Object.values(grouped).filter(group => group.length > 1);
      
      if (duplicates.length > 0) {
        // Flatten the duplicates array and set as data
        const duplicateRecords = duplicates.flat();
        setData(duplicateRecords);
        toast.success(`Found ${duplicateRecords.length} duplicate records`);
      } else {
        toast.info("No duplicate records found");
        setDeduceMode(false);
        fetchTrackerData(); // Reset to original data
      }
    } catch (error) {
      console.error("Deduce error:", error);
      toast.error("Failed to find duplicates");
      setDeduceMode(false);
      fetchTrackerData();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="mx-auto space-y-2" style={{width:'calc(100% - 5px)'}}>
        <div className={`w-full rounded-xl shadow-lg overflow-hidden ${
          isDarkMode 
            ? "bg-gray-900" 
            : "bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100"
        }`}>

          {/* Filter section with improved layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-4 rounded-lg shadow-md`}>
          <FilterControls 
            filters={filters} 
            setFilters={setFilters} 
            isDarkMode={isDarkMode}
            selectedRows={selectedRows}
            data={data}
            fetchTrackerData={fetchTrackerData}
            setSelectedRows = {setSelectedRows}
          />
          </div>
          <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded shadow-md`}>
            <FilterAndSearch 
              setSearchQuery={setSearchQuery}
              searchQuery = {searchQuery}
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

        {/* Table wrapper with overflow handling */}
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
          // onDeletePermanently={handleDeletePermanently}
          isLoading={isLoading}
          fetchTrackerData={fetchTrackerData}
          setSearchQuery={setSearchQuery}
          onMasterReset={handleMasterReset}
          deduceMode={deduceMode}
          deduceFilters={deduceFilters}
          setFilters={setFilters}
          selectedRecord = {selectedRecord}
          setSelectedRecord = {setSelectedRecord}
        />
        </div>          
      </div>
      </div>
    </Layout>
  );
};

export default TrackerTable;