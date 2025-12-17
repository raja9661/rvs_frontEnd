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
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1
  });
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
  const [isdeduceLoading, setdedupLoading] = useState(false);
  const [filters, setFilters] = useState({
    product: "",
    productType: "",
    dateIn: "",
    dateInStart: "",
    dateInEnd: "",
    dateOut: "",
    dateOutStart: "",
    dateOutEnd: "",
    status: "",
    caseStatus: "",
    clientCode: "",
    clientType: ""
  });
  // const [filters, setFilters] = useState({
  //   product: "",
  //   productType: "",
  //   dateIn: "",
  //   sentDate: "",
  //   dateOut: "",
  //   status: "",
  //   caseStatus: "",
  // });
  const [selectedRows, setSelectedRows] = useState([]);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
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
        setIsUserDataLoaded(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setIsUserDataLoaded(false);
      }
    } else {
      setIsUserDataLoaded(false);
    }
  }, []);
  // useEffect(() => {
  //   const getUser = localStorage.getItem("loginUser");
  //   if (getUser) {
  //     try {
  //       const data = JSON.parse(getUser);
  //       setRole(data.role || "");
  //       setUserId(data.userId || "");
  //       setName(data.name || "");
  //     } catch (e) {
  //       console.error("Error parsing user data:", e);
  //     }
  //   }
  // }, []);

  const fetchTrackerData = async (page = pagination.page, size = pagination.pageSize) => {
    if (!role || !userId) {
      console.log('Skipping fetch - missing required user data');
      return;
    }

    setIsLoading(true);
    try {

      const endpoint =
        filterType === "deleted"
          ? "/kyc/deleted-items"
          : filterType === "dedup"
            ? "/kyc/find-similar-records"
            : "/kyc/tracker-data";

      // const endpoint = filterType === "deleted" 
      //   ? "/kyc/deleted-items" 
      //   : "/kyc/tracker-data";

      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
        params: {
          role,
          userId,
          name,
          page,
          pageSize: size,
          searchQuery,
          ...filters,
          // Pass all filter parameters
          product: filters.product,
          productType: filters.productType,
          status: filters.status,
          caseStatus: filters.caseStatus,
          dateInStart: filters.dateInStart,
          dateInEnd: filters.dateInEnd,
          dateOutStart: filters.dateOutStart,
          dateOutEnd: filters.dateOutEnd,
          sentDate: filters.sentDate,
          vendorStatus: filters.vendorStatus,
          priority: filters.priority,
          clientType: filters.clientType,
          clientCode: filters.clientCode
        }
      });

      // Handle response based on endpoint
      let fetchedData = [];
      let paginationData = {
        total: 0,
        page: 1,
        pageSize: size,
        totalPages: 1
      };

      if (filterType === "deleted") {
        fetchedData = response.data?.deletedItems || [];
        paginationData = response.data?.pagination || paginationData;
      } else {
        fetchedData = response.data?.data || [];
        paginationData = response.data?.pagination || paginationData;
        const editableColumns = response.data?.editableColumns || [];
        if (editableColumns.length > 0) setEditableColumns(editableColumns);
      }

      if (fetchedData.length > 0) {
        const extractedHeaders = [
          "&nbsp;",
          "caseId",
          ...Object.keys(fetchedData[0]).filter(
            key => key.toLowerCase() !== "caseid" && !key.startsWith("_")
          ),
        ];

        const formattedData = fetchedData.map(row => ({
          attachments: row.attachments || [],
          ...Object.fromEntries(
            extractedHeaders
              .filter(header => header !== "&nbsp;")
              .map(header => [
                header,
                ["dateIn", "dateOut", "sentDate", "createdAt", "updatedAt"].includes(header)
                  ? row[header]
                    ? moment(row[header], "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY, h:mm:ss A")
                    : ""
                  : row[header] ?? ""
              ])
          )
        }));

        setHeaders(extractedHeaders);
        setData(formattedData);
        setPagination(paginationData);
      } else {
        setHeaders([]);
        setData([]);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUserDataLoaded && role && userId) {
      fetchTrackerData(1, pagination.pageSize);
    }
  }, [isUserDataLoaded, role, userId, name, filterType]);


  // useEffect(() => {
  //   if (role && userId) {
  //     fetchTrackerData(1, pagination.pageSize); 
  //   }
  // }, [role, userId, name, filterType]);


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTrackerData(1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  const handleRowSelection = useCallback((rowIndex, isChecked) => {
    // No need to update `data` here (let Handsontable manage its own state)
    // console.log('handleRowSelection called', { rowIndex, isChecked });
    setSelectedRows(prev => {
      return isChecked
        ? [...prev, rowIndex]
        : prev.filter(idx => idx !== rowIndex);
    });
    setRowData(isChecked && selectedRows.length === 0 ? data[rowIndex] : null);
  }, [data, selectedRows.length]);
  // console.log("selected row:",selectedRows)

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

  const handleDeduceClick = async () => {
    try {
      setdedupLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/find-similar-records`,
        {
          userId,
          page: pagination.page,
          pageSize: pagination.pageSize,
          searchQuery,
          ...filters
        }
      );

      if (response.data?.success) {
        setData(response.data.data || []); // Changed from duplicates to data
        setPagination(response.data.pagination || {
          page: 1,
          pageSize: pagination.pageSize,
          total: response.data.data?.length || 0,
          totalPages: 1
        });
      } else {
        toast.info("No duplicate records found");
      }
      setDeduceMode(true);
    } catch (error) {
      console.error("Deduce error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to find duplicates");
    } finally {
      setdedupLoading(false);
    }
  };

  // const handleDeduceClick = async () => {
  //     try {
  //       setdedupLoading(true);
  //         // If no rows selected, find duplicates in all "New Data"/"Pending" records
  //         const response = await axios.post(
  //           `${import.meta.env.VITE_Backend_Base_URL}/kyc/find-similar-records`,{userId}

  //         );

  //         if (response.data?.success && response.data.duplicates?.length > 0) {
  //           setData(response.data.duplicates);
  //           // toast.success(`Found ${response.data.duplicates.length} duplicate records`);
  //         } else {
  //           toast.info("No duplicate records found");
  //         }
  //         setDeduceMode(true)
  //         setdedupLoading(false)

  //     } catch (error) {
  //       console.error("Deduce error:", error);
  //       toast.error(error.response?.data?.message || error.message || "Failed to find duplicates");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const handleMasterReset = useCallback(async () => {
    setFilters({
      product: "",
      productType: "",
      dateIn: "",
      dateInStart: "",
      dateInEnd: "",
      dateOut: "",
      dateOutStart: "",
      dateOutEnd: "",
      status: "",
      caseStatus: "",
      clientCode: "",
      clientType: ""
    });
    setSearchQuery("");
    setPageSize(50);
    setSelectedRows([]);
    setRowData(null);
    setSelectedRecord(null);
    setDeduceMode(false)
    await fetchTrackerData(false); // Skip filters on reset
  }, [fetchTrackerData]);


  return (
    <Layout>
      <div className="mx-auto space-y-2" style={{ width: 'calc(100% - 5px)' }}>
        <div className={`w-full rounded-xl shadow-lg overflow-hidden ${themeClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className={`${panelClass} p-4 rounded-lg shadow-md`}>
              <FilterControls
                deduceMode={deduceMode}
                filters={filters}
                setFilters={setFilters}
                isDarkMode={isDarkMode}
                selectedRows={selectedRows}
                data={data}
                fetchTrackerData={fetchTrackerData}
                setSelectedRows={setSelectedRows}
                handleDeduceClick={handleDeduceClick}
                pagination={pagination}
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
              setDeduceMode={setDeduceMode}
              deduceFilters={deduceFilters}
              setFilters={setFilters}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              handleDeduceClick={handleDeduceClick}
              isdeduceLoading={isdeduceLoading}
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackerTable;
