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

  // Main data fetching function
const fetchTrackerData = async () => {
    setIsLoading(true);
    try {
      const endpoint = filterType === "deleted" 
      ? "/kyc/deleted-items" 
      : "/kyc/tracker-data";
    
    const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}${endpoint}`, {
      params: { role, userId, name }
    });

    let fetchedData = response.data?.data || response.data || [];
    setOriginalData(fetchedData); // Store original data


      let columns = response.data?.editableColumns || [];

      if (columns.length > 0) setEditableColumns(columns);

      if (fetchedData.length > 0) {
        const extractedHeaders = [
          //"☑",
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
              .filter(header => header !== "☑")
              .map(header => [
                header,
                ["dateIn", "dateOut", "sentDate", "createdAt", "updatedAt"].includes(header)
                  ? row[header]
                    ?  moment(row[header], "DD-MM-YYYY, h:mm:ss A").format("DD-MM-YYYY, h:mm:ss A")
                    : ""
                  : row[header] ?? ""
              ])
          )
        }));

        setHeaders(extractedHeaders);
        setData(formattedData);
      } else {
        setHeaders([]);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role) fetchTrackerData();
  }, [role, userId, name, filterType]);

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
  }, [originalData, deduceFilters.applyFilters, filters, dateFilters, fetchTrackerData]);

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
