
import React, { useEffect, useRef, useState, useCallback } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
// import 'handsontable/styles/handsontable.css';
import debounce from "lodash.debounce";
import Pagination, { addPaginationStyles } from "./Pagination";
import CellPreview, { addCellPreviewStyles } from "../Preview/CellPreview";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerAllModules } from 'handsontable/registry';
import { DropdownEditor } from 'handsontable/editors/dropdownEditor';
import axios from "axios";
import AttachmentManager from "../../AttachmentManager";
import { Paperclip } from 'lucide-react';
import AttachmentsModal from "../../AttachmentsModal";
// import CopyFieldsModal from "../../CopyFieldsModal";
import moment from "moment-timezone";
import CopyFieldsModal from "./CopyFieldsModal";

// import "../Table/TableStyles.css";

// Register all Handsontable modules
registerAllModules();


import ExcelExportModal from "../Downloads/ExcelExportModal";
import {
  createEnhancedHighlightRenderer,
  createImprovedCellRenderer,
  createTableStyles,
  formatHeaderDisplay,
  getColumnWidths
} from "../../Highlight";

const Table = ({
  data,
  headers,
  searchQuery,
  pageSize,
  filters,
  selectedRows,
  handleRowSelection,
  isDarkMode,
  setPageSize,
  setData,
  editableColumns,
  setSelectedRows,
  filterType,
  // onDeletePermanently,
  isLoading,
  setSearchQuery,
  fetchTrackerData,
  onMasterReset,
  deduceMode,
  deduceFilters,
  setFilters,
  selectedRecord,
  setSelectedRecord,
  setDeduceMode,
  handleDeduceClick,
  isdeduceLoading,
  pagination,
  setPagination
  // onRestoreRecords
}) => {
  const tableRef = useRef(null);
  const hotInstanceRef = useRef(null);
  const scrollPositionRef = useRef({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [role, setRole] = useState("");
  const [selectedCellInfo, setSelectedCellInfo] = useState(null);
  const [editingCellValue, setEditingCellValue] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = useState(headers);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
const [isPermanentlyDeleting, setIsPermanentlyDeleting] = useState(false);
  // const [selectedRecord, setSelectedRecord] = useState(null);
  const DEFAULT_EMPLOYEE_EDITABLE = ["remarks", "details", "details1", "requirement"];
  const DEFAULT_CLIENT_EDITABLE = ["priority"];
  const [showAttachment, setShowAttachment] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDeduceModalOpen, setIsDeduceModalOpen] = useState(false);
  const [similarRecords, setSimilarRecords] = useState([]);
  const [selectedRecordToCopy, setSelectedRecordToCopy] = useState(null);
  
  const [caseId,setCaseId] = useState("");
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  const [columnOrder, setColumnOrder] = useState([]);
  const [copyFields, setCopyFields] = useState([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  // const [sourceRecordToCopy, setSourceRecordToCopy] = useState(null);
  const [sourceRecordToCopy, setSourceRecordToCopy] = useState(null);
const [targetRows, setTargetRows] = useState([]);
const [endItem,setendItem] = useState(0);
const [startItem,setstartItem] = useState(0);

  

  
  
  
  const checkboxStateRef = useRef({
    selectedRow: null,
    isProcessing: false
  });

  const [employeeList, setEmployeeList] = useState([]);

  const handleAttachmentClick = () => {
    setShowAttachment(true);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
            const data = await response.json();
            
            if (Array.isArray(data)) { // Check if data is an array
                // Extract just the EmployeeName from each object
                const names = data.map(employee => employee.name);
      
                setEmployeeList(names);
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };
    
    fetchEmployees();
}, []);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    if (getUser) {
      const data = JSON.parse(getUser);
      setRole(data.role || "");
    }
  }, []);


useEffect(() => {
  if (!data || data.length === 0) {
    setFilteredData([]);
    return;
  }

  const filtered = data
    .filter((row) =>
      Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        // Handle date range filters first
        if (key === 'dateInStart' || key === 'dateInEnd' || 
            key === 'dateOutStart' || key === 'dateOutEnd') {
          return true; // We'll handle these separately
        }
        
        // Handle array filter values (multiple selections)
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0) return true;
          const rowValue = row[key];
          return filterValue.includes(rowValue);
        }
        
        // Handle single string filter value
        const rowValue = row[key];
        if (rowValue === undefined || rowValue === null) return false;
        return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
      })
    )
    // Apply date range filters after the general filtering
    .filter((row) => {
      // Date In range filter
      if (filters.dateInStart || filters.dateInEnd) {
        if (!row.dateIn) return false;
        
        const rowDateIn = moment(row.dateIn.split(',')[0].trim(), "DD-MM-YYYY");
        const startDate = filters.dateInStart ? moment(filters.dateInStart, "DD-MM-YYYY") : null;
        const endDate = filters.dateInEnd ? moment(filters.dateInEnd, "DD-MM-YYYY") : null;

        if (startDate && rowDateIn.isBefore(startDate, 'day')) return false;
        if (endDate && rowDateIn.isAfter(endDate, 'day')) return false;
      }

      // Date Out range filter
      if (filters.dateOutStart || filters.dateOutEnd) {
        if (!row.dateOut) return false;
        
        const rowDateOut = moment(row.dateOut.split(',')[0].trim(), "DD-MM-YYYY");
        const startDate = filters.dateOutStart ? moment(filters.dateOutStart, "DD-MM-YYYY") : null;
        const endDate = filters.dateOutEnd ? moment(filters.dateOutEnd, "DD-MM-YYYY") : null;

        if (startDate && rowDateOut.isBefore(startDate, 'day')) return false;
        if (endDate && rowDateOut.isAfter(endDate, 'day')) return false;
      }

      return true;
    })
    .filter((row) => {
      if (!searchQuery) return true;
      return Object.values(row).some((value) => {
        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(String(searchQuery).toLowerCase());
      });
    });

  setFilteredData(filtered);
  const calculatedTotalPages = Math.ceil(filtered.length / pageSize);
  setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
  
  if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
    setCurrentPage(1);
  }
}, [data, filters, searchQuery, pageSize]);

const selectRow = useCallback((instance, rowIndex, selected) => {
  console.log('selectRow called', { rowIndex, selected });
  if (checkboxStateRef.current.isProcessing) return;
  checkboxStateRef.current.isProcessing = true;

  try {
    const startIndex = (currentPage - 1) * pageSize;
    const filteredIndex = startIndex + rowIndex;
    const record = filteredData[filteredIndex];
    
    if (!record) return;

    const originalIndex = data.findIndex(item => item.caseId === record.caseId);
    if (originalIndex === -1) return;

    // Use functional update to avoid race conditions
    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = selected
        ? [...prevSelectedRows, originalIndex]
        : prevSelectedRows.filter(idx => idx !== originalIndex);
      
      return newSelectedRows;
    });

    // Update UI
    instance.setDataAtCell(rowIndex, 0, selected, 'silent');
    checkboxStateRef.current.selectedRow = selected ? rowIndex : null;
    setSelectedRecord(selected ? record : null);

  } finally {
    setTimeout(() => {
      checkboxStateRef.current.isProcessing = false;
    }, 50);
  }
}, [handleRowSelection, currentPage, pageSize, filteredData, data]);

const createCustomCheckboxRenderer = useCallback(() => {
  return function(instance, td, row, col, prop, value, cellProperties) {
    // Header checkbox (select all)
    if (row === -1) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'select-all-checkbox';
      
      // Calculate if all filtered rows are selected
      const allSelected = filteredData.length > 0 && filteredData.every(item => {
        const originalIndex = data.findIndex(d => d.caseId === item.caseId);
        return selectedRows.includes(originalIndex);
      });
      
      checkbox.checked = allSelected;

      checkbox.onclick = (e) => {
        e.stopPropagation();
        const selectAll = checkbox.checked;
        
        // Get original indices of all filtered rows
        const originalIndices = filteredData.map(item => 
          data.findIndex(d => d.caseId === item.caseId)
        ).filter(i => i >= 0);

        if (selectAll) {
          // Select all
          setSelectedRows(prev => [...new Set([...prev, ...originalIndices])]);
          
          // Update current page checkboxes
          const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
          for (let r = 0; r < pageRowCount; r++) {
            instance.setDataAtCell(r, 0, true, 'silent');
          }
        } else {
          // Deselect all
          setSelectedRows(prev => prev.filter(idx => !originalIndices.includes(idx)));
          
          // Update current page checkboxes
          const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
          for (let r = 0; r < pageRowCount; r++) {
            instance.setDataAtCell(r, 0, false, 'silent');
          }
        }
      };
      
      td.innerHTML = '';
      td.appendChild(checkbox);
      return td;
    }

    // Normal row checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'custom-checkbox';

    // Get the record for this row (accounting for pagination)
    const startIndex = (currentPage - 1) * pageSize;
    const filteredIndex = startIndex + row;
    const record = filteredData[filteredIndex];
    
    // Find original index in full dataset
    const originalIndex = record ? data.findIndex(item => item.caseId === record.caseId) : -1;
    const isSelected = originalIndex >= 0 && selectedRows.includes(originalIndex);
    checkbox.checked = isSelected;

    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent default behavior to avoid duplicate events
      
      // Debounce rapid clicks
      const now = Date.now();
      if (checkboxStateRef.current.lastClick && now - checkboxStateRef.current.lastClick < 100) {
        return;
      }
      checkboxStateRef.current.lastClick = now;

      // Only proceed if not already processing
      if (!checkboxStateRef.current.isProcessing) {
        selectRow(instance, row, !isSelected);
      }
    };

    checkbox.addEventListener('click', handleClick);

    td.innerHTML = '';
    td.appendChild(checkbox);
    return td;
  };
}, [selectRow, filteredData, data, currentPage, pageSize, selectedRows]);




// const selectRow = useCallback((instance, rowIndex, selected) => {
//   if (checkboxStateRef.current.isProcessing) return;
//   checkboxStateRef.current.isProcessing = true;

//   try {
//     // Get the record from current page's filtered data
//     const startIndex = (currentPage - 1) * pageSize;
//     const filteredIndex = startIndex + rowIndex;
//     const record = filteredData[filteredIndex];
    
//     if (!record) return;

//     // Find original index in full dataset
//     const originalIndex = data.findIndex(item => item.caseId === record.caseId);
//     if (originalIndex === -1) return;

//     if (selected) {
//       // Unselect previous row if any
//       const prevSelected = checkboxStateRef.current.selectedRow;
//       if (prevSelected !== null && prevSelected !== rowIndex) {
//         instance.setDataAtCell(prevSelected, 0, false, 'silent');
//       }

//       // Update UI
//       instance.setDataAtCell(rowIndex, 0, true, 'silent');
//       instance.selectRows(rowIndex);
//       checkboxStateRef.current.selectedRow = rowIndex;
//       setSelectedRecord(record);

//       // Update selected rows state
//       setSelectedRows(prev => [...new Set([...prev, originalIndex])]);

//       if (handleRowSelection) {
//         handleRowSelection(originalIndex, true);
//       }
//     } else {
//       // Update UI
//       instance.setDataAtCell(rowIndex, 0, false, 'silent');
//       instance.deselectCell();
//       checkboxStateRef.current.selectedRow = null;
//       setSelectedRecord(null);

//       // Update selected rows state
//       setSelectedRows(prev => prev.filter(idx => idx !== originalIndex));

//       if (handleRowSelection) {
//         handleRowSelection(originalIndex, false);
//       }
//     }
//   } finally {
//     setTimeout(() => {
//       checkboxStateRef.current.isProcessing = false;
//     }, 50);
//   }
// }, [handleRowSelection, currentPage, pageSize, filteredData, data]);

// const createCustomCheckboxRenderer = useCallback(() => {
//   return function(instance, td, row, col, prop, value, cellProperties) {
//     // Header checkbox (select all)
//     if (row === -1) {
//       const checkbox = document.createElement('input');
//       checkbox.type = 'checkbox';
//       checkbox.className = 'select-all-checkbox';
      
//       // Check if all filtered rows are selected
//       const allSelected = filteredData.every(item => {
//         const originalIndex = data.findIndex(d => d.caseId === item.caseId);
//         return selectedRows.includes(originalIndex);
//       });
      
//       checkbox.checked = allSelected;

//       checkbox.onclick = (e) => {
//         e.stopPropagation();
//         const selectAll = checkbox.checked;
        
//         // Get original indices of all filtered rows
//         const originalIndices = filteredData.map(item => 
//           data.findIndex(d => d.caseId === item.caseId)
//         ).filter(i => i >= 0);

//         if (selectAll) {
//           // Select all
//           setSelectedRows(prev => [...new Set([...prev, ...originalIndices])]);
          
//           // Update current page checkboxes
//           const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
//           for (let r = 0; r < pageRowCount; r++) {
//             instance.setDataAtCell(r, 0, true, 'silent');
//           }
//         } else {
//           // Deselect all
//           setSelectedRows(prev => prev.filter(idx => !originalIndices.includes(idx)));
          
//           // Update current page checkboxes
//           const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
//           for (let r = 0; r < pageRowCount; r++) {
//             instance.setDataAtCell(r, 0, false, 'silent');
//           }
//         }
//       };
      
//       td.innerHTML = '';
//       td.appendChild(checkbox);
//       return td;
//     }

//     // Normal row checkbox
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.className = 'custom-checkbox';

//     // Get the record for this row
//     const recordIndex = (currentPage - 1) * pageSize + row;
//     const record = filteredData[recordIndex];
    
//     // Check if this row is selected
//     const originalIndex = record ? data.findIndex(item => item.caseId === record.caseId) : -1;
//     const isSelected = originalIndex >= 0 && selectedRows.includes(originalIndex);
//     checkbox.checked = isSelected;

//     const handleClick = (e) => {
//       e.stopPropagation();
//       if (checkboxStateRef.current.isProcessing) {
//         e.preventDefault();
//         return;
//       }
      
//       // Toggle selection state
//       selectRow(instance, row, !isSelected);
//     };

//     checkbox.addEventListener('click', handleClick);

//     td.innerHTML = '';
//     td.appendChild(checkbox);
//     return td;
//   };
// }, [selectRow, filteredData, data, currentPage, pageSize, selectedRows]);



  const handleCellValueChange = useCallback((e) => {
    setEditingCellValue(e.target.value);
  }, []);

  const saveCellValue = useCallback(() => {
    if (!selectedCellInfo || editingCellValue === selectedCellInfo.value) return;
    
    const { row, col } = selectedCellInfo;
    
    if (hotInstanceRef.current) {
      hotInstanceRef.current.setDataAtCell(row, col, editingCellValue);
      setSelectedCellInfo({
        ...selectedCellInfo,
        value: editingCellValue
      });
    }
  }, [selectedCellInfo, editingCellValue]);



  const createAttachmentRenderer = useCallback(() => {
    return function(instance, td, row, col, prop, value, cellProperties) {
      td.innerHTML = '';
      td.style.padding = '2px';
      
      
  
      const rowData = instance.getSourceDataAtRow(row);
      // const recheckStatusIndex = headers.indexOf('isRechecked');
      // const isRechecked = recheckStatusIndex >= 0 ? rowData[recheckStatusIndex] === true : false;
      // if(isRechecked){
      //   td.style.background = '#FFF9C4'
      // }
      // Find recheck status dynamically - look for common field names
    const recheckField = headers.find(h => 
      h.toLowerCase().includes('recheck') || 
      h.toLowerCase().includes('isrechecked')
    );
    const isRechecked = recheckField ? rowData[headers.indexOf(recheckField)] === true : false;
    
    // Apply recheck styling first (important to do this before adding content)
    if (isRechecked) {
      td.style.backgroundColor = '#FFF9C4';
      td.style.fontWeight = 'bold';
    }
      const attachments = Array.isArray(rowData) 
        ? rowData.find(item => Array.isArray(item)) 
        : [];
  
      // console.log("Attachments:", attachments); // Debug
  
      if (attachments?.length > 0) {
        const iconContainer = document.createElement('div');
        iconContainer.style.display = 'flex';
        iconContainer.style.justifyContent = 'center';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.height = '100%';
        iconContainer.style.width = '100%';
        iconContainer.style.cursor = 'pointer';
        // iconContainer.style.background = '#FFFF00';
        
        iconContainer.innerHTML = `📎 <sup className='badge'>${attachments.length}</sup>`;
        iconContainer.style.fontSize = '16px';
        iconContainer.style.color = '#1890ff';
  
        iconContainer.onclick = (e) => {
          e.stopPropagation();

          setSelectedCase({
            caseId: rowData[1], // Assuming caseId is at index 1
            attachments
          });
          setShowAttachments(true);
        };
  
        td.appendChild(iconContainer);
      }
  
      return td;
    };
  }, [isDarkMode ,headers]);

  const saveScrollPosition = () => {
  const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
  if (scrollableContainer) {
    scrollPositionRef.current = {
      top: scrollableContainer.scrollTop,
      left: scrollableContainer.scrollLeft
    };
  }
};

const restoreScrollPosition = () => {
  const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
  if (scrollableContainer && scrollPositionRef.current) {
    scrollableContainer.scrollTop = scrollPositionRef.current.top;
    scrollableContainer.scrollLeft = scrollPositionRef.current.left;
  }
};



 useEffect(() => {
    if (!tableRef.current || !headers || headers.length === 0 || !filteredData) return;

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = data.map((row) => headers.map((key) => row[key] ?? ""));
    // const paginatedData = filteredData
    //   .slice(startIndex, startIndex + pageSize)
    //   .map((row) => headers.map((key) => row[key] ?? ""));

      saveScrollPosition()

    if (hotInstanceRef.current) {
      // saveScrollPosition();
    
      hotInstanceRef.current.destroy();
    }
    const createImprovedCellRenderer = (searchQuery, enhancedHighlightRenderer) => {
      return function(instance, td, row, col, prop, value, cellProperties) {
        // First apply the recheck styling (if any)
        const rowData = instance.getSourceDataAtRow(row);
        // const isRechecked = rowData[rowData.length - 1] === true;
        const recheckStatusIndex = headers.indexOf('isRechecked'); 
         const isRechecked = recheckStatusIndex >= 0 ? rowData[recheckStatusIndex] === true : false;
        
        if (isRechecked) {
          td.style.backgroundColor = '#FFF9C4';
          td.style.fontWeight = 'bold';
        }
        
        // Then apply the search highlighting
        if (searchQuery && value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
          enhancedHighlightRenderer(instance, td, row, col, prop, value, cellProperties);
        } else {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
        }
        
        return td;
      };
    };
    const enhancedHighlightRenderer = createEnhancedHighlightRenderer(searchQuery, isDarkMode);
    const customCheckboxRenderer = createCustomCheckboxRenderer();
    const improvedCellRenderer = createImprovedCellRenderer(searchQuery, enhancedHighlightRenderer);
    
    const styleEl = createTableStyles(isDarkMode);
    const paginationStyleEl = addPaginationStyles();
    const previewStyleEl = addCellPreviewStyles();

    tableRef.current.className = `mt-2 border border-${
      isDarkMode ? "gray-700" : "gray-300"
    } shadow-md rounded-lg handsontable-${
      isDarkMode ? "dark" : "light"
    } overflow-auto`;

    const dropdownOptions = ["Pending", "Done"];
    // const employeelist = ["KAIF", "UMAR", "SUNIL", "NAWSHAD"];
    const statusDropDown = ["New Data","Closed","Invalid","CNV"];
    const readOnlyColumns = ["userId"];
    const caseStatusDropDown = ["New Pending","Sent"];
    const vendorStatus = ["","Closed","Invalid","CNN","Account Closed","Restricted Account","Staff Account","Large File","Records Not Updated","Not Found","Records Not Found"]
    const priorityDropdown = ["","Urgent",""]

    console.log("paginatedData",paginatedData)
    console.log("headers",headers)
    
    const formattedHeaders = formatHeaderDisplay(headers);
    const attachmentRenderer = createAttachmentRenderer();
    hotInstanceRef.current = new Handsontable(tableRef.current, {
      data: paginatedData,
      colHeaders: formattedHeaders,
      columns: headers.map((header, index) => {
        // const isEditable = role === "admin" ? true : role === "employee" ? editableColumns.includes(header) : false;
        let isEditable = false;

        if (role === "admin") {
  isEditable = true;
} else if (role === "employee") {
  isEditable = DEFAULT_EMPLOYEE_EDITABLE.includes(header) || 
              (editableColumns && editableColumns.includes(header));
} else if (role === "client") {
  isEditable = DEFAULT_CLIENT_EDITABLE.includes(header) || 
              (editableColumns && editableColumns.includes(header));
}
  
        // if (role === "admin") {
        //   isEditable = true; 
        // } else if (role === "employee") {
        //   isEditable = DEFAULT_EMPLOYEE_EDITABLE.includes(header) || 
        //               (editableColumns && editableColumns.includes(header));
        // }   
        if (index === 0) {
          return {
            type: "checkbox",
            readOnly: false,
            renderer: customCheckboxRenderer,
            
          };
        }
        // In your Table component, update the columns configuration for the attachments column
        if (header === "attachments" || header.toLowerCase().includes("attachment")) {
          return {
            type: "text",
            readOnly: true,
            renderer: attachmentRenderer,
            width: 100, // Make it wider for debugging
            className: 'debug-attachment-cell', // Add debug class
          };
        }
        if (header === "listByEmployee") {
          return {
            type: 'dropdown',
            source: employeeList,
            strict: false,
            allowInvalid: false,
            className: 'htDropdown',
            renderer: improvedCellRenderer,
            readOnly: !isEditable,
            // Critical dropdown settings:
            editor: DropdownEditor,
            dropdownMenu: {
              className: 'htDropdownMenu',
              // itemsLimit: 10,
            },
            
            
          };
        }
        if (header === "vendorStatus") {
          return {
            type: 'dropdown',
            source: vendorStatus,
            strict: false,
            allowInvalid: false,
            className: 'htDropdown',
            renderer: improvedCellRenderer,
            readOnly: !isEditable,
            // Critical dropdown settings:
            editor: DropdownEditor,
            dropdownMenu: {
              className: 'htDropdownMenu',
              // itemsLimit: 10,
            },
            
            
          };
        }
        if (header === "priority") {
          return {
            type: 'dropdown',
            source: priorityDropdown,
            strict: false,
            allowInvalid: false,
            className: 'htDropdown',
            renderer: improvedCellRenderer,
            readOnly: !isEditable,
            // Critical dropdown settings:
            editor: DropdownEditor,
            dropdownMenu: {
              className: 'htDropdownMenu',
              // itemsLimit: 10,
            },
            
            
          };
        }
        if (header === "status") {
          return {
            type: "dropdown",
            source: statusDropDown,
            editorClassName: 'custom-dropdown',
            renderer: (instance, td, row, col, prop, value, cellProperties) => {
      td.style.textAlign = 'left';
      
      return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
    },
            readOnly: !isEditable,
          };
        }
        if (header === "caseStatus") {
          return {
            type: "dropdown",
            source: caseStatusDropDown,
            editorClassName: 'custom-dropdown',
            renderer: (instance, td, row, col, prop, value, cellProperties) => {
      td.style.textAlign = 'left';
      
      return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
    },
            readOnly: !isEditable,
          };
        }
        if (readOnlyColumns.includes(header)) {
          return { type: "text", readOnly: true, 
            renderer: (instance, td, row, col, prop, value, cellProperties) => {
      // Apply base styling first
      td.style.whiteSpace = 'nowrap';
      td.style.overflow = 'hidden';
      td.style.textOverflow = 'ellipsis';
      td.style.textAlign = 'left'; 
      return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
    } 
          };
        }
        
        return {
          type: "text",
          renderer: (instance, td, row, col, prop, value, cellProperties) => {
            const rowData = instance.getSourceDataAtRow(row);
            const recheckStatusIndex = headers.indexOf('isRechecked');
            const isRechecked = recheckStatusIndex >= 0 ? rowData[recheckStatusIndex] === true : false;

            // Apply base styling first
            td.style.whiteSpace = 'nowrap';
            td.style.overflow = 'hidden';
            td.style.textOverflow = 'ellipsis';
            td.style.maxWidth = '200px'; // Set a reasonable max width
            td.style.textAlign = 'left'
            
            if (isRechecked) {
              td.style.backgroundColor = '#FFF9C4'; // Light yellow background
              td.style.fontWeight = 'bold';
              td.style.color = '#000'
              
              // Special styling for caseId column
              if (header === "caseId") {
                td.style.borderLeft = '3px solid #FFC107'; // Gold border
                td.innerHTML = `<span style="color:#FF8F00">↻</span> ${value}`;
              }
            }
            
            // For IP address column (or any column that shouldn't expand)
            if (header === "ipAddress") {
              td.style.maxWidth = '150px'; // Even more restrictive for IPs
            }

            if (rowData?._dedupColor) {
    td.style.backgroundColor = rowData._dedupColor === 'blue' 
      ? 'rgba(0, 0, 255, 0.1)' 
      : 'rgba(0, 255, 0, 0.1)';
  }
            
            return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
          },
          readOnly: !isEditable,
        };
      }),
      dropdownMenu: true,
      filters: true,
      // columnSorting: true,
      search: true,
      manualColumnResize: true, // Allow manual resizing
      stretchH: 'none', // Don't stretch columns to fit
      height: "450px",
      rowHeaders: function(row) {
  return ((pagination.page - 1) * pagination.pageSize) + row + 1;
},
      // rowHeaders: function(row) {
      //   return (currentPage - 1) * pageSize + row + 1;
      // },
      manualColumnMove: columnOrder.length > 0 ? columnOrder : true,
      hiddenColumns: {
    columns: headers,
    indicators: true, // shows small indicators for hidden columns
  },
      
            contextMenu: {
  items: {
    'add_full_border': {
      name: 'Add Full Border',
      callback: function () {
        const selected = this.getSelectedRange();
        if (selected) {
          const bordersPlugin = this.getPlugin('customBorders');
          selected.forEach((range) => {
            for (let row = range.from.row; row <= range.to.row; row++) {
              for (let col = range.from.col; col <= range.to.col; col++) {
                bordersPlugin.setBorders([[row, col]], {
                  top: { width: 1, color: 'black' },
                  left: { width: 1, color: 'black' },
                  bottom: { width: 1, color: 'black' },
                  right: { width: 1, color: 'black' }
                });
              }
            }
          });
        }
      }
    },
    'borders': {},
    'remove_col': {},
    'hidden_columns_hide': { name: 'Hide column' },
    'hidden_columns_show': { name: 'Show column' }
  }
},
      rowHeights: 22,
      className: "htCenter htMiddle",
      licenseKey: "non-commercial-and-evaluation",
      afterColumnMove: (columns, target) => {
  setColumnOrder(hotInstanceRef.current?.getPlugin('manualColumnMove')?.columnsMapper?.manualColumnPositions || []);
},

      afterFilter: function (conditionsStack) {
  // Map Handsontable column headers to your React filters keys
  const columnToFilterKeyMap = {
    "Case Id":"caseId",
    "Remarks":"remarks",
    "Details":"details",
    "Details 1":"details",
    "Priority":"priority",
    "Product": "product",
    "Product Type": "productType",
    "Status": "status",
    "Case Status": "caseStatus",
    "Date In": "dateIn",
    "Date In (To)": "endDate",
    "Client Type": "clientType",
    "Correct UPN": "correctUPN",
    "Updated Product Name": "updatedProductName",
    "Updated Requirement": "updatedRequirement",
    "Bank Code": "bankCode",
    "Client Code": "clientCode",
    "Vendor Name": "vendorName",
    "vendorStatus":"vendorStatus",
    "Sent By": "sentBy",
    "Case Done By": "caseDoneBy",
    "List By Employee": "listByEmployee",
    "Auto or Manual": "autoOrManual",
    "Role": "role",
    "Name": "name",
    "Account Number": "accountNumber",
    "Account Number Digit":"accountNumberDigit",
    "Date In Date":"dateInDate",
    "Date Out":"dateOut",
    "dateOutInDay":"dateOutInDay",
    "Client TAT":"clientTAT",
    "Customer Care":"customerCare",
    "NameUploadBy":"NameUploadBy",
    "Sent Date":"sentDate",
    "sentDateInDay":"sentDateInDay",
    "Dedup By":"dedupBy"

  };
  const updatedFilters = {};

  conditionsStack.forEach((condition) => {
    const columnIndex = condition.column;
    const columnHeader = this.getColHeader(columnIndex); // Gets the display header text
    const conditions = condition.conditions;

    conditions.forEach((c) => {
      if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
        const selectedValues = c.args[0];
        const filterKey = columnToFilterKeyMap[columnHeader];
        
        if (filterKey) {
          // Store all selected values for multi-select filters
          updatedFilters[filterKey] = selectedValues.length > 0 ? selectedValues : "";
        }
      }
    });
  });

  // Update React filters state
  if (Object.keys(updatedFilters).length > 0) {
    setFilters(prev => ({ 
      ...prev, 
      ...updatedFilters 
    }));
  }
  // const updatedFilters = {};

  // conditionsStack.forEach((condition) => {
  //   const columnIndex = condition.column;
  //   const columnHeader = this.getColHeader(columnIndex); // e.g., "Product"
  //   const conditions = condition.conditions;

  //   conditions.forEach((c) => {
  //     if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
  //       const selectedValues = c.args[0];
  //       const filterKey = columnToFilterKeyMap[columnHeader];
        
  //       if (filterKey) {
  //         // Store all selected values instead of just the first one
  //         updatedFilters[filterKey] = selectedValues.length > 0 ? selectedValues : "";
  //       }
  //     }
  //   });
  // });

  // // Update React filters state only once to prevent rerenders per filter
  // if (Object.keys(updatedFilters).length > 0) {
  //   setFilters((prev) => ({ ...prev, ...updatedFilters }));
  // }
},
//        afterFilter: function (conditionsStack) {
//   // Map Handsontable column headers to your React filters keys
//   const columnToFilterKeyMap = {
//     "Product": "product",
//     "Product Type": "productType",
//     "Status": "status",
//     "Case Status": "caseStatus",
//     "Date In": "dateIn",
//     "Date In (To)": "endDate",
//     "Client Type": "clientType",
//     "Correct UPN": "correctUPN",
//     "Updated Product Name": "updatedProductName",
//     "Updated Requirement": "updatedRequirement",
//     "Bank Code": "bankCode",
//     "Client Code": "clientCode",
//     "Vendor Name": "vendorName",
//     "Sent By": "sentBy",
//     "Case Done By": "caseDoneBy",
//     "List By Employee": "listByEmployee",
//     "Auto or Manual": "autoOrManual",
//     "Role": "role",
//     "Name":"name",
//     "Account Number":"accountNumber",
//     // Add more as needed based on your actual column headers
//   };

//   const updatedFilters = {};

//   conditionsStack.forEach((condition) => {
//     const columnIndex = condition.column;
//     const columnHeader = this.getColHeader(columnIndex); // e.g., "Product"
//     const conditions = condition.conditions;

//     conditions.forEach((c) => {
//       if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
//         const selectedValues = c.args[0];
//         const firstValue = selectedValues[0] || ""; // If no value, fallback to empty

//         const filterKey = columnToFilterKeyMap[columnHeader];
//         if (filterKey) {
//           updatedFilters[filterKey] = firstValue;
//         }
//       }
//     });
//   });

//   // Update React filters state only once to prevent rerenders per filter
//   if (Object.keys(updatedFilters).length > 0) {
//     setFilters((prev) => ({ ...prev, ...updatedFilters }));
//   }
// },

      cells: (row, col) => {
        // Make cells read-only in deduce mode unless field is allowed for updates
        if (deduceMode) {
          const header = headers[col];
          const isUpdatable = deduceFilters.updateFields && deduceFilters[header];
          return {
            readOnly: !isUpdatable
          };
        }
        return {};
      },
      afterChange: (changes, source) => {
  if (source === "edit" || source === "paste") {
    const updates = [];
    const startIndex = (currentPage - 1) * pageSize;
    
    changes.forEach(change => {
      const [row, col, oldValue, newValue] = change;
      if (oldValue !== newValue) {
        const rowData = hotInstanceRef.current.getDataAtRow(row);
        const rowId = filteredData[startIndex + row].caseId;
        
        updates.push({
          caseId: rowId,
          changedField: headers[col],
          [headers[col]]: newValue
        });
      }
    });
    
    if (updates.length > 0) {
      sendBatchUpdatesToBackend(updates);
    }
  }
},
    //   afterChange: (changes, source) => {
    //     if (source === "edit") {

    // const updatedRowIndex = changes[0][0];
    // const updatedColIndex = changes[0][1];
    // const updatedHeader = headers[updatedColIndex];
    // const newValue = changes[0][3];
    
    // const rowData = hotInstanceRef.current.getDataAtRow(updatedRowIndex);
    // const rowId = filteredData[startIndex + updatedRowIndex].caseId;

    // const update = {
    //   caseId: rowId,
    //   changedField: headers[updatedColIndex], 
    //   [headers[updatedColIndex]]: newValue   
    // };

    
    
    // sendUpdateToBackend(update);
    //     }
    //   },
   
      
afterSelection: function(row, column, row2, column2, preventScrolling) {
  if (row >= 0 && column > 0) {
    const selectedValue = this.getDataAtCell(row, column);
    const headerName = headers[column];
    const selectedCell = this.getCell(row, column);
  if (selectedCell) {
    selectedCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const isEditable = 
  role === "admin" ? true : 
  ["employee", "client"].includes(role) ? editableColumns.includes(headerName) : 
  false;

    // const isEditable = role === "admin" ? true : 
    //   role === "employee" ? editableColumns.includes(headerName) :role === "client" ? editableColumns.includes(headerName) : false;

    setSelectedCellInfo({
      row,
      col: column,
      value: selectedValue || "",
      header: headerName,
      isEditable
    });
    
    setEditingCellValue(selectedValue || "");
  }
},
// In your column configuration
renderer: (instance, td, row, col, prop, value, cellProperties) => {
  const rowData = instance.getSourceDataAtRow(row);
  if (rowData?.isRechecked) {
    td.style.backgroundColor = '#FFF9C4';
    td.style.fontWeight = 'bold';
  }
  return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
},
      
      // afterScrollVertically: () => {
      //   const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
      //   if (scrollableContainer) {
      //     scrollPositionRef.current.top = scrollableContainer.scrollTop;
      //   }
      // },
      // afterScrollHorizontally: () => {
      //   const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
      //   if (scrollableContainer) {
      //     scrollPositionRef.current.left = scrollableContainer.scrollLeft;
      //   }
      // },
      viewportColumnRenderingOffset: 10,
      mergeCells: true,
      customBorders: true,
      allowInsertColumn: false,
      allowInsertRow: false,
    });
    
    
const mapSelectedRowToCurrentPage = () => {
  const selectedGlobalRow = checkboxStateRef.current.selectedRow;
  
  if (selectedGlobalRow !== null) {
    const pageIndex = Math.floor(selectedGlobalRow / pageSize);
    
    if (pageIndex + 1 === currentPage) {
      const localRowIndex = selectedGlobalRow % pageSize;
      if (localRowIndex < paginatedData.length) {
        requestAnimationFrame(() => {
          hotInstanceRef.current.selectRows(localRowIndex);
          hotInstanceRef.current.setDataAtCell(localRowIndex, 0, true, 'silent');
        });
      }
    }
  }
};

    setTimeout(() => {
      mapSelectedRowToCurrentPage();
      restoreScrollPosition();
      // restoreScrollPosition();
    }, 10);
    
    return () => {
      [styleEl, paginationStyleEl, previewStyleEl].forEach(el => {
        if (document.head.contains(el)) {
          document.head.removeChild(el);
        }
      });
    };
     }, [filteredData, headers, searchQuery, pageSize, isDarkMode, currentPage, createCustomCheckboxRenderer, selectRow, role, editableColumns]);
//   useEffect(() => {
//     if (!tableRef.current || !headers || headers.length === 0 || !filteredData) return;

//     const startIndex = (currentPage - 1) * pageSize;
//     const paginatedData = filteredData
//       .slice(startIndex, startIndex + pageSize)
//       .map((row) => headers.map((key) => row[key] ?? ""));

//     if (hotInstanceRef.current) {
//       // saveScrollPosition();
    
//       hotInstanceRef.current.destroy();
//     }
//     const createImprovedCellRenderer = (searchQuery, enhancedHighlightRenderer) => {
//       return function(instance, td, row, col, prop, value, cellProperties) {
//         // First apply the recheck styling (if any)
//         const rowData = instance.getSourceDataAtRow(row);
//         // const isRechecked = rowData[rowData.length - 1] === true;
//         const recheckStatusIndex = headers.indexOf('isRechecked'); 
//          const isRechecked = recheckStatusIndex >= 0 ? rowData[recheckStatusIndex] === true : false;
        
//         if (isRechecked) {
//           td.style.backgroundColor = '#FFF9C4';
//           td.style.fontWeight = 'bold';
//         }
        
//         // Then apply the search highlighting
//         if (searchQuery && value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
//           enhancedHighlightRenderer(instance, td, row, col, prop, value, cellProperties);
//         } else {
//           Handsontable.renderers.TextRenderer.apply(this, arguments);
//         }
        
//         return td;
//       };
//     };
//     const enhancedHighlightRenderer = createEnhancedHighlightRenderer(searchQuery, isDarkMode);
//     const customCheckboxRenderer = createCustomCheckboxRenderer();
//     const improvedCellRenderer = createImprovedCellRenderer(searchQuery, enhancedHighlightRenderer);
    
//     const styleEl = createTableStyles(isDarkMode);
//     const paginationStyleEl = addPaginationStyles();
//     const previewStyleEl = addCellPreviewStyles();

//     tableRef.current.className = `mt-2 border border-${
//       isDarkMode ? "gray-700" : "gray-300"
//     } shadow-md rounded-lg handsontable-${
//       isDarkMode ? "dark" : "light"
//     } overflow-auto`;

//     const dropdownOptions = ["Pending", "Done"];
//     // const employeelist = ["KAIF", "UMAR", "SUNIL", "NAWSHAD"];
//     const statusDropDown = [ "", "New Data","Closed","Negative","CNV"];
//     const readOnlyColumns = ["name", "accountNumber"];
//     const caseStatusDropDown = ["","New Pending","Sent"];
//     const vendorStatus = ["","Closed","Invalid","CNV","Account Closed","Restricted Account","Staff Account","Records Not Updated","Not Found","Records Not Found"]
//     const priorityDropdown = ["","Urgent","",""]
//     const isAdmin = role === 'admin';
//     const formattedHeaders = formatHeaderDisplay(headers);
//     const attachmentRenderer = createAttachmentRenderer();
//     hotInstanceRef.current = new Handsontable(tableRef.current, {
//       data: paginatedData,
//       colHeaders: formattedHeaders,
//       columns: headers.map((header, index) => {
//         // const isEditable = role === "admin" ? true : role === "employee" ? editableColumns.includes(header) : false;
//         let isEditable = false;

//         if (role === "admin") {
//   isEditable = true;
// } else if (role === "employee") {
//   isEditable = DEFAULT_EMPLOYEE_EDITABLE.includes(header) || 
//               (editableColumns && editableColumns.includes(header));
// } else if (role === "client") {
//   isEditable = DEFAULT_CLIENT_EDITABLE.includes(header) || 
//               (editableColumns && editableColumns.includes(header));
// }
  
//         // if (role === "admin") {
//         //   isEditable = true; 
//         // } else if (role === "employee") {
//         //   isEditable = DEFAULT_EMPLOYEE_EDITABLE.includes(header) || 
//         //               (editableColumns && editableColumns.includes(header));
//         // }   
//         if (index === 0) {
//           return {
//             type: "checkbox",
//             readOnly: false,
//             renderer: customCheckboxRenderer,
            
//           };
//         }
//         // In your Table component, update the columns configuration for the attachments column
//         if (header === "attachments" || header.toLowerCase().includes("attachment")) {
//           return {
//             type: "text",
//             readOnly: true,
//             renderer: attachmentRenderer,
//             width: 100, // Make it wider for debugging
//             className: 'debug-attachment-cell', // Add debug class
//           };
//         }
//         if (header === "listByEmployee") {
//           return {
//             type: 'dropdown',
//             source: employeeList,
//             strict: false,
//             allowInvalid: false,
//             className: 'htDropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//             // Critical dropdown settings:
//             editor: DropdownEditor,
//             dropdownMenu: {
//               className: 'htDropdownMenu',
//               // itemsLimit: 10,
//             },
            
            
//           };
//         }
//         if (header === "vendorStatus") {
//           return {
//             type: 'dropdown',
//             source: vendorStatus,
//             strict: false,
//             allowInvalid: false,
//             className: 'htDropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//             // Critical dropdown settings:
//             editor: DropdownEditor,
//             dropdownMenu: {
//               className: 'htDropdownMenu',
//               // itemsLimit: 10,
//             },
            
            
//           };
//         }
//         if (header === "priority") {
//           return {
//             type: 'dropdown',
//             source: priorityDropdown,
//             strict: false,
//             allowInvalid: false,
//             className: 'htDropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//             // Critical dropdown settings:
//             editor: DropdownEditor,
//             dropdownMenu: {
//               className: 'htDropdownMenu',
//               // itemsLimit: 10,
//             },
            
            
//           };
//         }
//         if (header === "status") {
//           return {
//             type: "dropdown",
//             source: statusDropDown,
//             editorClassName: 'custom-dropdown',
//             renderer: (instance, td, row, col, prop, value, cellProperties) => {
//       td.style.textAlign = 'left';
      
//       return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
//     },
//             readOnly: !isEditable,
//           };
//         }
//         if (header === "caseStatus") {
//           return {
//             type: "dropdown",
//             source: caseStatusDropDown,
//             editorClassName: 'custom-dropdown',
//             renderer: (instance, td, row, col, prop, value, cellProperties) => {
//       td.style.textAlign = 'left';
      
//       return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
//     },
//             readOnly: !isEditable,
//           };
//         }
//         if (readOnlyColumns.includes(header)) {
//           return { type: "text", readOnly: true, 
//             renderer: (instance, td, row, col, prop, value, cellProperties) => {
//       // Apply base styling first
//       td.style.whiteSpace = 'nowrap';
//       td.style.overflow = 'hidden';
//       td.style.textOverflow = 'ellipsis';
//       td.style.textAlign = 'left'; 
//       return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
//     } 
//           };
//         }
        
//         return {
//           type: "text",
//           renderer: (instance, td, row, col, prop, value, cellProperties) => {
//             const rowData = instance.getSourceDataAtRow(row);
//             const recheckStatusIndex = headers.indexOf('isRechecked');
//             const isRechecked = recheckStatusIndex >= 0 ? rowData[recheckStatusIndex] === true : false;

//             // Apply base styling first
//             td.style.whiteSpace = 'nowrap';
//             td.style.overflow = 'hidden';
//             td.style.textOverflow = 'ellipsis';
//             td.style.maxWidth = '200px'; // Set a reasonable max width
//             td.style.textAlign = 'left'
            
//             if (isRechecked) {
//               td.style.backgroundColor = '#FFF9C4'; // Light yellow background
//               td.style.fontWeight = 'bold';
//               td.style.color = '#000'
              
//               // Special styling for caseId column
//               if (header === "caseId") {
//                 td.style.borderLeft = '3px solid #FFC107'; // Gold border
//                 td.innerHTML = `<span style="color:#FF8F00">↻</span> ${value}`;
//               }
//             }
            
//             // For IP address column (or any column that shouldn't expand)
//             if (header === "ipAddress") {
//               td.style.maxWidth = '150px'; // Even more restrictive for IPs
//             }
            
//             return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
//           },
//           readOnly: !isEditable,
//         };
//       }),
//       dropdownMenu: isAdmin
//     ? true
//     : ['filter_by_value', 'filter_action_bar'],
//       // dropdownMenu: true,
//       // dropdownMenu: ['filter_by_value', 'filter_action_bar'],

//       filters: true,
//       hiddenColumns: {
//     columns: headers,
//     indicators: true, // shows small indicators for hidden columns
//   },
//       // columnSorting: true,
//       search: true,
//       manualColumnResize: true, // Allow manual resizing
//       stretchH: 'none', // Don't stretch columns to fit
//       height: "450px",
//       rowHeaders: function(row) {
//         return (currentPage - 1) * pageSize + row + 1;
//       },
//       manualColumnMove: columnOrder.length > 0 ? columnOrder : true,
//       // contextMenu: true,
//       contextMenu: {
//   items: {
//     'add_full_border': {
//       name: 'Add Full Border',
//       callback: function () {
//         const selected = this.getSelectedRange();
//         if (selected) {
//           const bordersPlugin = this.getPlugin('customBorders');
//           selected.forEach((range) => {
//             for (let row = range.from.row; row <= range.to.row; row++) {
//               for (let col = range.from.col; col <= range.to.col; col++) {
//                 bordersPlugin.setBorders([[row, col]], {
//                   top: { width: 1, color: 'black' },
//                   left: { width: 1, color: 'black' },
//                   bottom: { width: 1, color: 'black' },
//                   right: { width: 1, color: 'black' }
//                 });
//               }
//             }
//           });
//         }
//       }
//     },
//     'borders': {},
//     'remove_col': {},
//     'hidden_columns_hide': { name: 'Hide column' },
//     'hidden_columns_show': { name: 'Show column' }
//   }
// },
//   //     contextMenu: [
//   //   'cut',
//   //   'copy',
//   //   'row_above',
//   //   'row_below',
//   //   'remove_row',
//   //   'alignment',
//   //   'make_read_only',
//   //   'clear_column',
//   //   'remove_col'

//   // ],
//       rowHeights: 22,
//       className: "htCenter htMiddle",
//       licenseKey: "non-commercial-and-evaluation",
//       afterColumnMove: (columns, target) => {
//   setColumnOrder(hotInstanceRef.current?.getPlugin('manualColumnMove')?.columnsMapper?.manualColumnPositions || []);
// },

//       afterFilter: function (conditionsStack) {
//   // Map Handsontable column headers to your React filters keys
//   const columnToFilterKeyMap = {
//     "Case Id":"caseId",
//     "Remarks":"remarks",
//     "Details":"details",
//     "Details 1":"details",
//     "Priority":"priority",
//     "Product": "product",
//     "Product Type": "productType",
//     "Status": "status",
//     "Case Status": "caseStatus",
//     "Date In": "dateIn",
//     "Date In (To)": "endDate",
//     "Client Type": "clientType",
//     "Correct UPN": "correctUPN",
//     "Updated Product Name": "updatedProductName",
//     "Updated Requirement": "updatedRequirement",
//     "Bank Code": "bankCode",
//     "Client Code": "clientCode",
//     "Vendor Name": "vendorName",
//     "vendorStatus":"vendorStatus",
//     "Sent By": "sentBy",
//     "Case Done By": "caseDoneBy",
//     "List By Employee": "listByEmployee",
//     "Auto or Manual": "autoOrManual",
//     "Role": "role",
//     "Name": "name",
//     "Account Number": "accountNumber",
//     "Account Number Digit":"accountNumberDigit",
//     "Date In Date":"dateInDate",
//     "Date Out":"dateOut",
//     "dateOutInDay":"dateOutInDay",
//     "Client TAT":"clientTAT",
//     "Customer Care":"customerCare",
//     "NameUploadBy":"NameUploadBy",
//     "Sent Date":"sentDate",
//     "sentDateInDay":"sentDateInDay",
//     "Dedup By":"dedupBy"

    


//     // Add more as needed based on your actual column headers
//   };

//   const updatedFilters = {};

//   conditionsStack.forEach((condition) => {
//     const columnIndex = condition.column;
//     const columnHeader = this.getColHeader(columnIndex); // e.g., "Product"
//     const conditions = condition.conditions;

//     conditions.forEach((c) => {
//       if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
//         const selectedValues = c.args[0];
//         const filterKey = columnToFilterKeyMap[columnHeader];
        
//         if (filterKey) {
//           // Store all selected values instead of just the first one
//           updatedFilters[filterKey] = selectedValues.length > 0 ? selectedValues : "";
//         }
//       }
//     });
//   });

//   // Update React filters state only once to prevent rerenders per filter
//   if (Object.keys(updatedFilters).length > 0) {
//     setFilters((prev) => ({ ...prev, ...updatedFilters }));
//   }
// },
// //        afterFilter: function (conditionsStack) {
// //   // Map Handsontable column headers to your React filters keys
// //   const columnToFilterKeyMap = {
// //     "Product": "product",
// //     "Product Type": "productType",
// //     "Status": "status",
// //     "Case Status": "caseStatus",
// //     "Date In": "dateIn",
// //     "Date In (To)": "endDate",
// //     "Client Type": "clientType",
// //     "Correct UPN": "correctUPN",
// //     "Updated Product Name": "updatedProductName",
// //     "Updated Requirement": "updatedRequirement",
// //     "Bank Code": "bankCode",
// //     "Client Code": "clientCode",
// //     "Vendor Name": "vendorName",
// //     "Sent By": "sentBy",
// //     "Case Done By": "caseDoneBy",
// //     "List By Employee": "listByEmployee",
// //     "Auto or Manual": "autoOrManual",
// //     "Role": "role",
// //     "Name":"name",
// //     "Account Number":"accountNumber",
// //     // Add more as needed based on your actual column headers
// //   };

// //   const updatedFilters = {};

// //   conditionsStack.forEach((condition) => {
// //     const columnIndex = condition.column;
// //     const columnHeader = this.getColHeader(columnIndex); // e.g., "Product"
// //     const conditions = condition.conditions;

// //     conditions.forEach((c) => {
// //       if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
// //         const selectedValues = c.args[0];
// //         const firstValue = selectedValues[0] || ""; // If no value, fallback to empty

// //         const filterKey = columnToFilterKeyMap[columnHeader];
// //         if (filterKey) {
// //           updatedFilters[filterKey] = firstValue;
// //         }
// //       }
// //     });
// //   });

// //   // Update React filters state only once to prevent rerenders per filter
// //   if (Object.keys(updatedFilters).length > 0) {
// //     setFilters((prev) => ({ ...prev, ...updatedFilters }));
// //   }
// // },

//       cells: (row, col) => {
//         // Make cells read-only in deduce mode unless field is allowed for updates
//         if (deduceMode) {
//           const header = headers[col];
//           const isUpdatable = deduceFilters.updateFields && deduceFilters[header];
//           return {
//             readOnly: !isUpdatable
//           };
//         }
//         return {};
//       },
//       afterChange: (changes, source) => {
//   if (source === "edit" || source === "paste") {
//     const updates = [];
//     const startIndex = (currentPage - 1) * pageSize;
    
//     changes.forEach(change => {
//       const [row, col, oldValue, newValue] = change;
//       if (oldValue !== newValue) {
//         const rowData = hotInstanceRef.current.getDataAtRow(row);
//         const rowId = filteredData[startIndex + row].caseId;
        
//         updates.push({
//           caseId: rowId,
//           changedField: headers[col],
//           [headers[col]]: newValue
//         });
//       }
//     });
    
//     if (updates.length > 0) {
//       sendBatchUpdatesToBackend(updates);
//     }
//   }
// },
//     //   afterChange: (changes, source) => {
//     //     if (source === "edit") {

//     // const updatedRowIndex = changes[0][0];
//     // const updatedColIndex = changes[0][1];
//     // const updatedHeader = headers[updatedColIndex];
//     // const newValue = changes[0][3];
    
//     // const rowData = hotInstanceRef.current.getDataAtRow(updatedRowIndex);
//     // const rowId = filteredData[startIndex + updatedRowIndex].caseId;

//     // const update = {
//     //   caseId: rowId,
//     //   changedField: headers[updatedColIndex], 
//     //   [headers[updatedColIndex]]: newValue   
//     // };

    
    
//     // sendUpdateToBackend(update);
//     //     }
//     //   },
   
      
// afterSelection: function(row, column, row2, column2, preventScrolling) {
//   if (row >= 0 && column > 0) {
//     const selectedValue = this.getDataAtCell(row, column);
//     const headerName = headers[column];
//     const selectedCell = this.getCell(row, column);
//   if (selectedCell) {
//     selectedCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
//   }

//   const isEditable = 
//   role === "admin" ? true : 
//   ["employee", "client"].includes(role) ? editableColumns.includes(headerName) : 
//   false;

//     // const isEditable = role === "admin" ? true : 
//     //   role === "employee" ? editableColumns.includes(headerName) :role === "client" ? editableColumns.includes(headerName) : false;

//     setSelectedCellInfo({
//       row,
//       col: column,
//       value: selectedValue || "",
//       header: headerName,
//       isEditable
//     });
    
//     setEditingCellValue(selectedValue || "");
//   }
// },
// // In your column configuration
// renderer: (instance, td, row, col, prop, value, cellProperties) => {
//   const rowData = instance.getSourceDataAtRow(row);
//   if (rowData?.isRechecked) {
//     td.style.backgroundColor = '#FFF9C4';
//     td.style.fontWeight = 'bold';
//   }
//   return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
// },
      
//       // afterScrollVertically: () => {
//       //   const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
//       //   if (scrollableContainer) {
//       //     scrollPositionRef.current.top = scrollableContainer.scrollTop;
//       //   }
//       // },
//       // afterScrollHorizontally: () => {
//       //   const scrollableContainer = tableRef.current?.querySelector('.wtHolder');
//       //   if (scrollableContainer) {
//       //     scrollPositionRef.current.left = scrollableContainer.scrollLeft;
//       //   }
//       // },
//       viewportColumnRenderingOffset: 10,
//       mergeCells: true,
//       customBorders: true,
//       allowInsertColumn: false,
//       allowInsertRow: false,
//     });
    
    
// const mapSelectedRowToCurrentPage = () => {
//   const selectedGlobalRow = checkboxStateRef.current.selectedRow;
  
//   if (selectedGlobalRow !== null) {
//     const pageIndex = Math.floor(selectedGlobalRow / pageSize);
    
//     if (pageIndex + 1 === currentPage) {
//       const localRowIndex = selectedGlobalRow % pageSize;
//       if (localRowIndex < paginatedData.length) {
//         requestAnimationFrame(() => {
//           hotInstanceRef.current.selectRows(localRowIndex);
//           hotInstanceRef.current.setDataAtCell(localRowIndex, 0, true, 'silent');
//         });
//       }
//     }
//   }
// };

//     setTimeout(() => {
//       mapSelectedRowToCurrentPage();
//       // restoreScrollPosition();
//     }, 10);
    
//     return () => {
//       [styleEl, paginationStyleEl, previewStyleEl].forEach(el => {
//         if (document.head.contains(el)) {
//           document.head.removeChild(el);
//         }
//       });
//     };
//   }, [filteredData, headers, searchQuery, pageSize, isDarkMode, currentPage, createCustomCheckboxRenderer, selectRow, role, editableColumns]);
 const sendBatchUpdatesToBackend = debounce(async (updates) => {
  try {
    const getUser = localStorage.getItem("loginUser");
    const user = getUser ? JSON.parse(getUser) : null;
    
    if (!user || !user.name) {
      throw new Error("User information not available");
    }

    const payload = updates.map(update => ({
      ...update,
      userId: user.userId,
      userName: user.name
    }));

    const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/update-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedData: payload })
    });

    if (!response.ok) {
      throw new Error("Batch update failed");
    }

    setUpdateStatus(`${updates.length} updates successful`);
    setTimeout(() => setUpdateStatus(null), 3000);
  } catch (error) {
    console.error("Batch update error:", error);
    setUpdateStatus(`Error: ${error.message}`);
    setTimeout(() => setUpdateStatus(null), 5000);
  }
}, 500);
const sendUpdateToBackend = debounce(async (update) => {
  try {
    const getUser = localStorage.getItem("loginUser");
    const user = getUser ? JSON.parse(getUser) : null;
    
    if (!user || !user.name) {
      throw new Error("User information not available");
    }

    const payload = {
      caseId: update.caseId,
      changedField: update.changedField,
      [update.changedField]: update[update.changedField],
      userId: user.userId,  // Send both ID and name
      userName: user.name
    };

    const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/update-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedData: [payload] })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Update failed");
    }

    // Optional: Optimistic UI update here if needed
    setUpdateStatus("Update successful");
    setTimeout(() => setUpdateStatus(null), 3000);

  } catch (error) {
    // console.error("Update error:", error);
    if (error.response) {
    const { message, field } = error.response.data;
    
    // Show error message to user
    toast.error(message);
    
    // Highlight problematic field if available
    if (field) {
      // Your logic to highlight the field in UI
    }
  } else {
    toast.error("Network error occurred");
  }
    setUpdateStatus(`Error: ${error.message}`);
    setTimeout(() => setUpdateStatus(null), 5000);
  }
}, 500);

const handleDeleteSelectedRows = useCallback(async () => {
  if (selectedRows.length === 0) {
    toast.warning("No rows selected for deletion.");
    return;
  }

  try {
    setIsDeleting(true);
    
    // Get the actual records from the full data array using the selected indices
    const selectedItems = selectedRows.map(index => data[index]);
    const caseIds = selectedItems.map(item => item?.caseId).filter(Boolean);

    if (caseIds.length === 0) {
      toast.error("No valid caseIds found for selected rows.");
      return;
    }

    const confirmMessage = filterType === "deleted" 
      ? "permanently delete these records?" 
      : "delete these records?";
    
    if (!window.confirm(`Are you sure you want to ${confirmMessage}`)) {
      return;
    }

    // Clear selection in the table UI
    const instance = hotInstanceRef.current;
    if (instance) {
      // Find the visible row indices that correspond to the selected rows
      const startIndex = (currentPage - 1) * pageSize;
      const visibleData = filteredData.slice(startIndex, startIndex + pageSize);
      
      visibleData.forEach((row, visibleRowIndex) => {
        const originalIndex = data.findIndex(d => d.caseId === row.caseId);
        if (selectedRows.includes(originalIndex)) {
          instance.setDataAtCell(visibleRowIndex, 0, false, 'silent');
        }
      });
      
      instance.deselectCell();
    }

    // Rest of your delete logic remains the same...
    const endpoint = filterType === "deleted" 
      ? `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-permanently`
      : `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-data`;

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caseIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.updatedData) {
      setData(result.updatedData);
      setFilteredData(result.updatedData);
    } else {
      const selectedIndices = new Set(selectedRows);
      const newData = data.filter((_, index) => !selectedIndices.has(index));
      
      setData(newData);
      setFilteredData(newData);
    }

    setSelectedRows([]);
    checkboxStateRef.current.selectedRow = null;
    setCurrentPage(1);
    fetchTrackerData(1, 50);
    
    toast.success(`${caseIds.length} records ${filterType === "deleted" ? "permanently deleted" : "deleted"} successfully`)

  } catch (error) {
    console.error("Delete error:", error);
    toast.error(`Delete failed: ${error.message}`);
  } finally {
    setIsDeleting(false);
  }
}, [data, selectedRows, filterType, setData, setFilteredData, setSelectedRows, currentPage, pageSize, filteredData]);
  
  
  // const handleDeleteSelectedRows = useCallback(async () => {
  //   if (selectedRows.length === 0) {
  //     toast.warning("No rows selected for deletion.");
  //     return;
  //   }
  
  //   try {
  //     setIsDeleting(true);
  //     const selectedItems = selectedRows.map(index => data[index]);
  //     const caseIds = selectedItems.map(item => item?.caseId).filter(Boolean);
  
  //     if (caseIds.length === 0) {
  //       toast.error("No valid caseIds found for selected rows.");
  //       return;
  //     }
  
  //     const confirmMessage = filterType === "deleted" 
  //       ? "permanently delete these records?" 
  //       : "delete these records?";
      
  //     if (!window.confirm(`Are you sure you want to ${confirmMessage}`)) {
  //       return;
  //     }
  
  //     // Clear selection before deletion
  //     const instance = hotInstanceRef.current;
  //     if (instance) {
  //       selectedRows.forEach(rowIndex => {
  //         instance.setDataAtCell(rowIndex, 0, false, 'silent');
  //       });
  //       instance.deselectCell();
  //     }
  
  //     const endpoint = filterType === "deleted" 
  //       ? `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-permanently`
  //       : `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-data`;
  
  //     const response = await fetch(endpoint, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ caseIds }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  
  //     const result = await response.json();
  //     if (result.updatedData) {
  //       setData(result.updatedData);
  //       setFilteredData(result.updatedData);
  //     } else {
  //       const selectedIndices = new Set(selectedRows);
  //       const newData = data.filter((_, index) => !selectedIndices.has(index));
        
  //       setData(newData);
  //       setFilteredData(newData);
  //     }
  
  //     setSelectedRows([]);
  //     checkboxStateRef.current.selectedRow = null;
  //     setCurrentPage(1);
      
  //     toast.success(`${caseIds.length} records ${filterType === "deleted" ? "permanently deleted" : "deleted"} successfully`)
  
  //   } catch (error) {
  //     console.error("Delete error:", error);
  //     toast.error(`Delete failed: ${error.message}`);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // }, [data, selectedRows, filterType, setData, setFilteredData, setSelectedRows]);
  // const handlePageChange = (newPage) => {
  //   setPagination(prev => ({ ...prev, page: newPage }));
  // fetchTrackerData(newPage, pagination.pageSize);
  //   // if (newPage > 0 && newPage <= totalPages) {
  //   //   setCurrentPage(newPage);
  //   // }
  // };

  const handlePageChange = (newPage) => {
  setPagination(prev => ({ ...prev, page: newPage }));
  fetchTrackerData(newPage, pagination.pageSize);
};
    // Export handlers
    const handleExportData = async (shouldExport, columns, format = "excel") => {
      setIsExportModalOpen(false);
      
      if (!shouldExport) return;
    
      try {
        let dataToExport = [];
        
        // If rows are selected, export only those
        if (selectedRows.length > 0) {
          dataToExport = selectedRows.map(rowIndex => {
            const rowData = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = data[rowIndex][header] ?? '';
            });
            return rowData;
          });
        } 
        // Otherwise export all visible rows
        else if (hotInstanceRef.current) {
          const hotData = hotInstanceRef.current.getData();
          dataToExport = hotData.map((row, index) => {
            const rowData = {};
            headers.forEach((header, colIndex) => {
              rowData[header] = row[colIndex] !== undefined ? row[colIndex] : '';
            });
            return rowData;
          });
        } 
        else {
          dataToExport = [...filteredData];
        }
        if (format === 'text' && !columns.includes("productType")) {
          columns.push("productType");
        }
        
        const preparedData = dataToExport.map(row => {
          const exportRow = {};
          columns.forEach(col => {
            exportRow[col] = col.split('.').reduce((o, i) => o?.[i], row) ?? "";
          });
          return exportRow;
        });
    
        if (preparedData.length === 0 || preparedData.every(row => Object.values(row).every(val => val === ""))) {
          throw new Error("No valid data available for export");
        }
    
        const formatHeader = (header) => {
          return header
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
            .trim();
        };
    
        const formattedHeaders = columns.map(header => ({
          key: header,
          label: formatHeader(header),
          
        }));
    
        const dateString = new Date().toISOString().split('T')[0];
        
        switch (format) {
          case 'excel':
            exportToExcel(preparedData, formattedHeaders, dateString);
            break;
          case 'text':
            exportToText(preparedData, formattedHeaders, dateString);
            break;
          case 'csv':
            exportToCSV(preparedData, formattedHeaders, dateString);
            break;
          default:
            exportToExcel(preparedData, formattedHeaders, dateString);
        }
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("Export failed: " );
      }
    };
    
    const exportToExcel = (data, headers, dateString) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      if (worksheet['!ref']) {
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: 0, c: C });
          if (worksheet[address]) {
            worksheet[address].v = headers[C].label;
          } else {
            worksheet[address] = { v: headers[C].label };
          }
        }
      }
  
      const colWidths = headers.map(header => {
        let maxLength = header.label.length;
        data.forEach(row => {
          const value = row[header.key] || '';
          const valueLength = value.toString().length;
          maxLength = Math.max(maxLength, valueLength);
        });
        return { width: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
  
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");
      
      const excelBuffer = XLSX.write(workbook, { 
        bookType: "xlsx", 
        type: "array" 
      });
      
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      saveAs(blob, `export_${dateString}.xlsx`);
      
    };


    const exportToText = (data, headers, dateString) => {
      const formatField = (key, value) => value;
    
      let textContent = data.map((row, index) => {
        let recordText = '';
    
        if (row.productType?.toLowerCase() === 'banking') {
          const acc = formatField('accountNumber', row['accountNumber'] || '');
          const req = formatField('requirement', row['requirement'] || '');
          recordText = `${acc}\n${req}`;
        } else {
          const filteredHeaders = headers.filter(h => h.key !== "productType");
    
          const pairs = filteredHeaders.map(header => {
            const key = header.label === "Updated Product Name" ? "Product" : header.label;
            const value = formatField(header.key, row[header.key] || '');
            return `${key}=${value}`;
          }).join(', ');
    
          recordText = `${pairs}.`;
        }
    
        // Add separator after every record except the last one
        const separator = index < data.length - 1 ? '\n' + '-'.repeat(60) + '\n' : '';
        return recordText + separator;
      }).join('\n');
    
      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `export_${dateString}.txt`);
    };
    
  
    const exportToCSV = (data, headers, dateString) => {
      let csvContent = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',') + '\r\n';
      
      data.forEach(row => {
        csvContent += headers.map(h => {
          const value = row[h.key] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',') + '\r\n';
      });
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `export_${dateString}.csv`);
    };

    const handleDeletePermanently = async () => {
      if (selectedRows.length === 0) {
        toast.warning("No rows selected for deletion.");
        return;
      }
    
      const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
      if (!caseIds.length) {
        toast.error("No valid caseIds found for selected rows.");
        return;
      }
    
      if (!window.confirm("Are you sure you want to permanently delete these records?")) {
        return;
      }
    
      try {
        setIsPermanentlyDeleting(true); 
        // Clear selections before deletion
        setSelectedRows([]);
        checkboxStateRef.current = {
          selectedRow: null,
          isProcessing: false
        };
    
        if (hotInstanceRef.current) {
          // Clear all checkboxes
          const hotData = hotInstanceRef.current.getData();
          hotData.forEach((row, rowIndex) => {
            if (row[0] === true) {
              hotInstanceRef.current.setDataAtCell(rowIndex, 0, false);
            }
          });
          
          // Clear selections
          hotInstanceRef.current.deselectCell();
        }
    
        const response = await axios.delete(
          `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-permanently`,
          { data: { caseIds } }
        );
    
        if (response.status === 200) {
          // Update data
          const selectedIndices = new Set(selectedRows);
          const newData = data.filter((_, index) => !selectedIndices.has(index));
          
          setData(newData);
          setFilteredData(newData);
          setCurrentPage(1);
          
          toast.success(`${caseIds.length} records permanently deleted successfully`);
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`Delete failed: ${error.message}`);
      } finally {
        
        // Ensure selections are cleared even if error occurs
        setSelectedRows([]);
        if (hotInstanceRef.current) {
          hotInstanceRef.current.deselectCell();
        }
        setIsPermanentlyDeleting(false);

      }
    };

    const handlePageSizeChange = (newSize) => {
  const validatedSize = Math.max(1, Math.min(newSize, 1000)); // Add reasonable limits
  setPagination(prev => ({
    ...prev,
    pageSize: validatedSize,
    page: 1 // Reset to first page when changing size
  }));
  fetchTrackerData(1, validatedSize); // Fetch with new size
};
    
    const handleRestoreRecords = async () => {
      if (selectedRows.length === 0) {
        toast.warning("No rows selected for restoration.");
        return;
      }
      
      const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
      if (!caseIds.length) {
        toast.error("No valid caseIds found for selected rows.");
        return;
      }
    
      if (!window.confirm("Are you sure you want to restore these records?")) {
        return;
      }
    
      try {
         setIsRestoring(true); 
        const response = await axios.post(
          `${import.meta.env.VITE_Backend_Base_URL}/kyc/restore-records`,
          { caseIds }
        );
        
        if (response.status === 200) {
          // Update data
          const selectedIndices = new Set(selectedRows);
          const newData = data.filter((_, index) => !selectedIndices.has(index));
          
          setData(newData);
          setFilteredData(newData);
          setSelectedRows([]);
          setCurrentPage(1);
          
          // Clear Handsontable selection
          setTimeout(() => {
            const instance = hotInstanceRef.current;
            if (instance) {
              instance.deselectCell();
              const selection = instance.getSelected();
              if (selection) {
                selection.forEach(range => {
                  instance.deselectCell(range.from.row, range.from.col, range.to.row, range.to.col);
                });
              }
              if (instance.getActiveEditor()) {
                instance.getActiveEditor().close();
              }
              instance.render();
            }
          }, 0);
          
          toast.success(`${caseIds.length} records restored successfully`);
          fetchTrackerData(1, 50);
        }
      } catch (error) {
        console.error("Restore error:", error);
        toast.error(`Restore failed: ${error.message}`);
      }finally {
    setIsRestoring(false); // Reset restoring state
  }
    }; 
   
    useEffect(() => {
      if (selectedRows.length === 0 && checkboxStateRef.current.selectedRow !== null) {
        // Clear Handsontable selection if parent cleared selections
        if (hotInstanceRef.current) {
          hotInstanceRef.current.deselectCell();
          checkboxStateRef.current.selectedRow = null;
        }
      }
    }, [selectedRows]);
  
  const handleMasterReset = () => {
    // Clear local selected rows state
    setPagination({
    page: 1,
    pageSize: 50,  // Force reset to 50 items per page
    total: 0,      // Temporary reset during loading
    totalPages: 1
  });

  fetchTrackerData(1, 50);

    setSelectedRows([]);
    checkboxStateRef.current = {
      selectedRow: null,
      isProcessing: false
    };
  
    // Clear Handsontable selections
    if (hotInstanceRef.current) {
      try {
        // Clear all checkboxes
        const data = hotInstanceRef.current.getData();

        data.forEach((row, rowIndex) => {
          if (row[0] === true) {
            hotInstanceRef.current.setDataAtCell(rowIndex, 0, false);
          }
        });
        
        
        // Clear selections
        hotInstanceRef.current.deselectCell();
        
        // Force re-render
        hotInstanceRef.current.render();
      } catch (error) {
        console.error("Error during reset:", error);
      }
    }
  
    // Call parent reset function last
    if (onMasterReset) onMasterReset();
  };

  const handleSelectAllVisible = useCallback(() => {
  const instance = hotInstanceRef.current;
  if (!instance || filteredData.length === 0) return;

  // Save current scroll position
  const scrollContainer = instance.rootElement.querySelector('.wtHolder');
  const { scrollTop, scrollLeft } = scrollContainer || { scrollTop: 0, scrollLeft: 0 };

  setSelectionInProgress(true);

  // Calculate visible rows
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const visibleRows = filteredData.slice(startIndex, endIndex);

  // Map to original indices
  const visibleRowIndices = visibleRows.map(row => 
    data.findIndex(d => d.caseId === row.caseId)
  ).filter(index => index !== -1);

  // Determine current selection state
  const allVisibleSelected = visibleRowIndices.length > 0 && 
    visibleRowIndices.every(index => selectedRows.includes(index));

  // Optimistic UI update
  instance.batch(() => {
    visibleRows.forEach((_, i) => {
      instance.setDataAtCell(i, 0, !allVisibleSelected, 'silent');
    });
  });

  // Update state
  setSelectedRows(prev => {
    const newSelection = allVisibleSelected
      ? prev.filter(index => !visibleRowIndices.includes(index))
      : [...new Set([...prev, ...visibleRowIndices])];
    return newSelection;
  });

  // Restore scroll position and clean up
  requestAnimationFrame(() => {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollTop;
      scrollContainer.scrollLeft = scrollLeft;
    }
    setSelectionInProgress(false);
  });
}, [currentPage, pageSize, filteredData, data, selectedRows]);


useEffect(() => {
  const handleKeyDown = (e) => {
    // Check if focus is not in an input/textarea
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    
    // Ctrl+D - Delete selected rows
    if(role === "admin"){
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      handleDeleteSelectedRows();
    }
  }
    
    // Ctrl+E - Export data
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setIsExportModalOpen(true);
    }
    
    // Ctrl+R - Reset
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      handleMasterReset();
    }
    
    if(role === "admin"  || role === "employee"){
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      handleDeduceClick();
    }
  }
    
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      handleSelectAllVisible();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleDeleteSelectedRows, handleMasterReset]);



// const handlePageSizeChange = (newSize) => {
//   const validatedSize = Math.max(1, Math.min(newSize, 1000));
//   setPagination(prev => ({
//     ...prev,
//     pageSize: validatedSize,
//     page: 1 // Reset to first page when changing size
//   }));
//   fetchTrackerData(1, validatedSize);
// };

// const handlePageSizeChange = (newSize) => {
//   const validatedSize = Math.max(1, Math.min(newSize, 1000)); // Add reasonable limits
//   setPagination(prev => ({
//     ...prev,
//     pageSize: validatedSize,
//     page: 1 // Reset to first page when changing size
//   }));
//   fetchTrackerData(1, validatedSize);
// };

const handleSaveChanges = () => {
  const instance = hotInstanceRef.current;
  if (!instance) return;
  
  // Get all changes since last save
  const changes = instance.getSourceData();
  const originalData = filteredData.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  const updates = [];
  
  changes.forEach((row, rowIndex) => {
    headers.forEach((header, colIndex) => {
      if (row[colIndex] !== originalData[rowIndex]?.[header]) {
        updates.push({
          caseId: originalData[rowIndex]?.caseId,
          changedField: header,
          [header]: row[colIndex]
        });
      }
    });
  });
  
  if (updates.length > 0) {
    sendBatchUpdatesToBackend(updates);
  } else {
    toast.info("No changes to save");
  }
};




// const handleCopySelected = () => {
//   if (selectedRows.length !== 1) {
//     toast.warning("Please select exactly one row to copy");
//     return;
//   }
  
//   const sourceIndex = selectedRows[0];
//   const sourceRecord = data[sourceIndex];
  
//   // Store the source record temporarily
//   setSourceRecordToCopy(sourceRecord);
//   setIsCopyModalOpen(true);
// };

// const handlePasteSelected = async () => {
//   if (selectedRows.length === 0) {
//     toast.warning("Please select at least one row to paste to");
//     return;
//   }

//   if (!sourceRecordToCopy) {
//     toast.warning("No source record selected for copying");
//     return;
//   }

//   if (copyFields.length === 0) {
//     toast.warning("No fields selected for copying");
//     return;
//   }

//   const targetRecords = selectedRows
//     .map(index => data[index])
//     .filter(record => record.caseId !== sourceRecordToCopy.caseId); // skip source

//   if (targetRecords.length === 0) {
//     toast.warning("No valid target rows selected");
//     return;
//   }

//   try {
//     const getUser = localStorage.getItem("loginUser");
//     const user = getUser ? JSON.parse(getUser) : null;

//     const response = await axios.post(
//       `${import.meta.env.VITE_Backend_Base_URL}/kyc/copy-paste-dedup`,
//       {
//         sourceId: sourceRecordToCopy.caseId,
//         targetIds: targetRecords.map(r => r.caseId),
//         fields: copyFields,
//         userId: user.userId,
//         userName: user.name
//       }
//     );

//     if (response.data.success) {
//       toast.success("Fields copied to multiple rows successfully");
//       handleDeduceClick(); // refresh or re-fetch
//     } else {
//       toast.error(response.data.message || "Copy failed");
//     }
//   } catch (error) {
//     toast.error(error.response?.data?.message || error.message || "Copy failed");
//   }
// };
const handleCopySelected = () => {
  if (selectedRows.length !== 1) {
    toast.warning("Please select exactly one row to copy");
    return;
  }

  const sourceIndex = selectedRows[0];
  const sourceRecord = data[sourceIndex];

  // Automatically copy specific fields
  const fieldsToCopy = ["attachment", "detail", "detail1"];

  const copyPayload = {};
  fieldsToCopy.forEach(field => {
    if (sourceRecord[field] !== undefined) {
      copyPayload[field] = sourceRecord[field];
    }
  });

  // Store the copied values
  setSourceRecordToCopy({ ...sourceRecord, ...copyPayload });
  setCopyFields(fieldsToCopy); // ensure paste can still check copyFields
  toast.success("Record copied successfully");
};

const handlePasteSelected = async () => {
  if (selectedRows.length === 0) {
    toast.warning("Please select at least one row to paste to");
    return;
  }

  if (!sourceRecordToCopy) {
    toast.warning("No source record selected for copying");
    return;
  }

  const getUser = localStorage.getItem("loginUser");
  const user = getUser ? JSON.parse(getUser) : null;

  if (!user) {
    toast.error("User session expired");
    return;
  }

  const targetRecords = selectedRows
    .map(index => data[index])
    .filter(record => record.caseId !== sourceRecordToCopy.caseId); // skip source

  if (targetRecords.length === 0) {
    toast.warning("No valid target rows selected");
    return;
  }
  console.log("sourceRecordToCopy:",sourceRecordToCopy)

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_Backend_Base_URL}/kyc/copy-paste-dedup`,
      {
        // sourceData: {
        //   attachment: sourceRecordToCopy.attachment,
        //   detail: sourceRecordToCopy.detail,
        //   detail1: sourceRecordToCopy.detail1
        // },
        sourceRecordToCopy,
        targetIds: targetRecords.map(r => r.caseId),
        userId: user.userId,
        userName: user.name
      }
    );

    if (response.data.success) {
      toast.success("Fields copied and updated successfully");
      handleDeduceClick(); // refresh
    } else {
      toast.error(response.data.message || "Paste failed");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || "Paste failed");
  }
};
// const { page,  total} = pagination;




  return (
    <div>
      <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-2 rounded shadow-md`}>
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <>
            {/* <CellPreview
              selectedCellInfo={selectedCellInfo}
              editingCellValue={editingCellValue}
              handleCellValueChange={handleCellValueChange}
              saveCellValue={saveCellValue}
              isDarkMode={isDarkMode}
            /> */}

                        {selectedCellInfo && selectedCellInfo.header !== "attachments" && (
  <CellPreview
    selectedCellInfo={selectedCellInfo}
    editingCellValue={editingCellValue}
    handleCellValueChange={handleCellValueChange}
    saveCellValue={saveCellValue}
    isDarkMode={isDarkMode}
  />
)}
            
            {updateStatus && (
              <div className={`mb-2 p-2 rounded text-sm ${updateStatus.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {updateStatus}
              </div>
            )}
  
            <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center p-1.5 rounded gap-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2">
                <button
  onClick={handleSelectAllVisible}
  className={`px-3 py-1.5 text-sm rounded flex items-center justify-center min-w-[32px] transition-all ${
    isDarkMode 
      ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
  } ${
    selectionInProgress ? "opacity-75 cursor-wait" : ""
  }`}
  disabled={filteredData.length === 0 || selectionInProgress}
  aria-busy={selectionInProgress}
  title={selectionInProgress ? "Processing selection..." : "Toggle select all visible rows"}
>
  {selectionInProgress ? (
    <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
  ) : (
    (() => {
      if (filteredData.length === 0) return '✓';
      
      const visibleIndices = filteredData
        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .map(row => data.findIndex(d => d.caseId === row.caseId))
        .filter(index => index !== -1);
      
      return visibleIndices.length > 0 && 
        visibleIndices.every(index => selectedRows.includes(index))
        ? '✕' 
        : '✓';
    })()
  )}
</button>

<div className="text-sm">
  {pagination.total > 0 ? (
    <span>
      Showing <span className="font-medium">
        {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}
      </span>-<span className="font-medium">
        {Math.min(pagination.page * pagination.pageSize, pagination.total)}
      </span> of{' '}
      <span className="font-medium">{pagination.total}</span> items
    </span>
  ) : (
    'No items to display'
  )}
</div>

  
                {/* <input
                  type="text"
                  placeholder="Search"
                  className={`border p-1.5 text-sm rounded w-56 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      : "bg-white border-gray-300 text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                /> */}
              </div>
  
              <div className="flex items-center gap-4">
                {filterType === "deleted" ? (
                  <>
    {role === "admin" && (
      <button
        onClick={handleRestoreRecords}
        className={`px-3 py-1.5 text-sm ${
          isDarkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
        } flex items-center justify-center min-w-[80px]`}
        disabled={selectedRows.length === 0 || isRestoring}
      >
        {isRestoring ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Restoring...
          </>
        ) : 'Restore'}
      </button>
    )}
    {role === "admin" && (
      <button
        onClick={handleDeletePermanently}
        className={`px-3 py-1.5 text-sm ${
          isDarkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
        } flex items-center justify-center min-w-[150px]`}
        disabled={selectedRows.length === 0 || isPermanentlyDeleting}
      >
        {isPermanentlyDeleting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </>
        ) : 'Delete Permanently'}
      </button>
    )}
  </>
                  // <>
                  //   {role === "admin" && (
                  //     <button
                  //       onClick={handleRestoreRecords}
                  //       className={`px-3 py-1.5 text-sm ${
                  //         isDarkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
                  //       }`}
                  //       disabled={selectedRows.length === 0}
                  //     >
                  //       Restore
                  //     </button>
                  //   )}
                  //   {role === "admin" && (
                  //     <button
                  //       onClick={handleDeletePermanently}
                  //       className={`px-3 py-1.5 text-sm ${
                  //         isDarkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
                  //       }`}
                  //       disabled={selectedRows.length === 0}
                  //     >
                  //       Delete Permanently
                  //     </button>
                  //   )}
                  // </>
                ) : (
                  <>
                  { (role === "admin" || role === "employee" ) && (

                    <>
                            {deduceMode && (
  <>
    <button
  onClick={handleCopySelected}
  className={`px-3 py-1.5 text-sm ${
    isDarkMode 
      ? "bg-purple-600 hover:bg-purple-700 text-white" 
      : "bg-purple-500 hover:bg-purple-600 text-white"
  }`}
  disabled={selectedRows.length !== 1}
>
  Copy
</button>
<button
  onClick={handlePasteSelected}
  className={`px-3 py-1.5 text-sm ${
    isDarkMode 
      ? "bg-green-600 hover:bg-green-700 text-white" 
      : "bg-green-500 hover:bg-green-600 text-white"
  }`}
  disabled={!sourceRecordToCopy}
>
  Paste
</button>

  </>
)}
                    <button
  onClick={handleSaveChanges}
  className={`px-3 py-1.5 text-sm ${
    isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
  }`}
>
  Save Changes
</button>
</>
                  ) }
                  

                    {selectedRecord && (role === "admin" || role === "employee") && (
                      <>
                      <button
                        onClick={handleAttachmentClick}
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="View Attachments"
                      >
                        <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </button>
                      </>
                    )}

                    {role === "admin" && (
      <button
        onClick={handleDeleteSelectedRows}
        className={`px-3 py-1.5 text-sm ${
          isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
        } flex items-center justify-center min-w-[80px]`}
        disabled={selectedRows.length === 0 || isDeleting}
      >
        {isDeleting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </>
        ) : 'Delete'}
      </button>
    )}
  
                    {/* {role === "admin" && (
                      <button
                        className={`px-3 py-1.5 text-sm ${
                          isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
                        }`}
                        onClick={handleDeleteSelectedRows}
                        disabled={selectedRows.length === 0}
                      >
                        Delete
                      </button>
                    )} */}
                  </>
                )}

                <button
                        className={`px-3 py-1.5 text-sm transition-colors ${
                          isDarkMode
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() => setIsExportModalOpen(true)}
                      >
                        Download
                      </button>
                {(role === "admin" || role === "employee" ) && (
                  <>
                  
                  <button
                    onClick={handleDeduceClick}
                    className={`px-3 py-1.5 text-sm ${
                      isDarkMode
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-purple-500 hover:bg-purple-600 text-white"
                    }`}
                    disabled={isLoading || (selectedRows.length > 1 && selectedRows.length !== filteredData.length)}
                    title="Find similar previous records"
                  >
                    {isdeduceLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Dedup'}
                  </button>
                  </>
                )}
                <button
  onClick={handleMasterReset}
  disabled={isLoading}
  className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded ${
    isDarkMode
      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
      : "bg-yellow-400 hover:bg-yellow-500 text-black"
  }`}
  title="Reset all filters and selections"
>
  {isLoading ? (
    <>
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Refreshing...
    </>
  ) : (
    "Refresh"
  )}
</button>

                
                      {/* <button
                  onClick={handleMasterReset}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
                    isDarkMode
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                  title="Reset all filters and selections"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    "Refresh"
                  )}
                </button> */}
  
                <button
                  onClick={handleMasterReset}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-sm flex items-center gap-1 ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-700"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:bg-gray-200"
                  }`}
                  title="Reset all filters and selections"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    "Reset all"
                  )}
                </button>
                
              <select
  className={`border p-1 py-1.5 px-1.5 text-xs rounded ${
    isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
  }`}
  value={pagination.pageSize}
  onChange={(e) => {
    if (e.target.value === 'custom') {
      const inputElement = document.createElement('input');
      inputElement.type = 'number';
      inputElement.className = `border p-1 py-0.5 px-1 text-xs rounded ${isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"}`;
      inputElement.placeholder = 'Enter size';
      inputElement.style.width = '75px';
      inputElement.style.height = '30px';

      inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          const customSize = parseInt(inputElement.value);
          if (!isNaN(customSize) && customSize > 0) {
            handlePageSizeChange(customSize);
          } else {
            alert("Invalid page size.");
          }
          e.target.replaceWith(e.target);
        }
      });

      inputElement.addEventListener('blur', () => {
        const customSize = parseInt(inputElement.value);
        if (!isNaN(customSize) && customSize > 0) {
          handlePageSizeChange(customSize);
        } else {
          alert("Invalid page size.");
        }
        e.target.replaceWith(e.target);
      });
      
      e.target.replaceWith(inputElement);
      inputElement.focus();
    } else {
      handlePageSizeChange(Number(e.target.value));
    }
  }}
>
  {[50, 100, 200, 300, 400, 500].map(size => (
    <option key={size} value={size}>{size}</option>
  ))}
  <option value="custom">Custom</option>
</select>
                {/* <select
                  className={`border p-1 py-1.5 px-1.5 text-xs rounded ${
                    isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
                  }`}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[50,100,200,300,400,500].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select> */}
              </div>
            </div>
  
            <div
              ref={tableRef}
              style={{ height: "450px" }}
              className="mt-2 border border-gray-300 shadow-md rounded-lg overflow-auto"
            ></div>
  
            <Pagination
             pagination = {pagination}
             handlePageChange = {handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredData.length}
              pageSize={pageSize}
              setendItem = {setendItem}
              setstartItem = {setstartItem}
              // handlePageChange={handlePageChange}
              isDarkMode={isDarkMode}
            />
            
            <ExcelExportModal
              isOpen={isExportModalOpen}
              onClose={handleExportData}
              headers={headers}
              initialSelectedColumns={selectedExportColumns}
              isDarkMode={isDarkMode}
            />
          </>
        )}
        
        {showAttachment && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
            <div className={`relative w-[90%] max-w-3xl mx-auto p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Case Attachments
                </h3>
                <button
                  onClick={() => setShowAttachment(false)}
                  className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
  
              <AttachmentManager
                caseId={selectedRecord.caseId}
                role={role}
                isDarkMode={isDarkMode}
                onClose={() => setShowAttachment(false)}
                fetchTrackerData = {fetchTrackerData}
                handleMasterReset = {handleMasterReset}
              />
            </div>
          </div>
        )}
  
        <AttachmentsModal
          visible={showAttachments}
          caseId={selectedCase?.caseId}
          onClose={() => setShowAttachments(false)}
        />


{isCopyModalOpen && (
  <CopyFieldsModal
    headers={headers}
    onClose={() => setIsCopyModalOpen(false)}
    onSelectFields={(fields) => {
      setCopyFields(fields);
      setIsCopyModalOpen(false);
      toast.success(`${fields.length} fields selected for copying`);
    }}
    isDarkMode={isDarkMode}
  />
)}
  
        {/* {isDeduceModalOpen && <DeduceModal />}
        {selectedRecordToCopy && (
          <CopyFieldsModal 
            record={selectedRecordToCopy}
            onClose={() => setSelectedRecordToCopy(null)}
            selectedRecord={selectedRecord}
            fetchTrackerData={fetchTrackerData}
            isDarkMode={isDarkMode}
          />
        )} */}
      </div>
    </div>
  );
   
};

const addTableStyles = () => {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `

  .fa-paperclip {
  transition: transform 0.2s, color 0.2s;
  padding: 4px;
}

.fa-paperclip:hover {
  transform: scale(1.2);
  color: var(--primary-color);
}
  .handsontable td .fa-download {
  transition: transform 0.2s, color 0.2s;
  padding: 4px;
}

/* Add to your global styles */
.debug-attachment-cell {
  background-color: rgba(255, 0, 0, 0.1) !important;
  border: 2px dashed red !important;
}

.debug-attachment-icon {
  background-color: rgba(0, 255, 0, 0.2) !important;
  border: 1px solid green !important;
}








 /* Fix for border overflow with modals */
    // .handsontable {
    //   box-sizing: border-box;
    //   overflow: hidden !important;
    // }
    
    
    /* Ensure proper z-index stacking */
    .handsontable {
      z-index: 1;
    }
    
    /* Fix for border rendering */
    .handsontable table {
      border-collapse: separate;
      
    }




    // Add to your style element
.handsontable .wtHolder {
  overflow: auto !important;
}

.copy-field-item {
  transition: background-color 0.2s;
}

.copy-field-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.dark .copy-field-item:hover {
  background-color: rgba(29, 78, 216, 0.2);
}




    
  `;
  document.head.appendChild(styleEl);
  return styleEl;
};

addTableStyles();

export default Table;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// import React, { useEffect, useRef, useState, useCallback } from "react";
// import Handsontable from "handsontable";
// import "handsontable/dist/handsontable.full.css";
// // import 'handsontable/styles/handsontable.css';
// import debounce from "lodash.debounce";
// import Pagination, { addPaginationStyles } from "./Pagination";
// import CellPreview, { addCellPreviewStyles } from "../Preview/CellPreview";
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { registerAllModules } from 'handsontable/registry';
// import { DropdownEditor } from 'handsontable/editors/dropdownEditor';
// import axios from "axios";
// import AttachmentManager from "../../AttachmentManager";
// import { Paperclip } from 'lucide-react';
// import AttachmentsModal from "../../AttachmentsModal";
// import CopyFieldsModal from "../../CopyFieldsModal";

// // Register all Handsontable modules
// registerAllModules();


// import ExcelExportModal from "../Downloads/ExcelExportModal";
// import {
//   createEnhancedHighlightRenderer,
//   createImprovedCellRenderer,
//   createTableStyles,
//   formatHeaderDisplay,
//   getColumnWidths
// } from "../../Highlight";

// const Table = ({
//   data,
//   headers,
//   searchQuery,
//   pageSize,
//   filters,
//   selectedRows,
//   handleRowSelection,
//   isDarkMode,
//   setPageSize,
//   setData,
//   editableColumns,
//   setSelectedRows,
//   filterType,
//   // onDeletePermanently,
//   isLoading,
//   setSearchQuery,
//   fetchTrackerData,
//   onMasterReset,
//   deduceMode,
//   deduceFilters,
//   setFilters
//   // onRestoreRecords
// }) => {
//   const tableRef = useRef(null);
//   const hotInstanceRef = useRef(null);
//   const scrollPositionRef = useRef({ top: 0, left: 0 });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filteredData, setFilteredData] = useState([]);
//   const [updateStatus, setUpdateStatus] = useState(null);
//   const [role, setRole] = useState("");
//   const [selectedCellInfo, setSelectedCellInfo] = useState(null);
//   const [editingCellValue, setEditingCellValue] = useState("");
//   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
//   const [selectedExportColumns, setSelectedExportColumns] = useState(headers);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const DEFAULT_EMPLOYEE_EDITABLE = ["remarks", "details", "details1", "requirement"];
//   const [showAttachment, setShowAttachment] = useState(false);
//   const [showAttachments, setShowAttachments] = useState(false);
//   const [selectedCase, setSelectedCase] = useState(null);
//   const [isDeduceModalOpen, setIsDeduceModalOpen] = useState(false);
//   const [similarRecords, setSimilarRecords] = useState([]);
//   const [selectedRecordToCopy, setSelectedRecordToCopy] = useState(null);
//   const [isdeduceLoading, setIsLoading] = useState(false);
//   const [caseId,setCaseId] = useState("");

  
//   const checkboxStateRef = useRef({
//     selectedRow: null,
//     isProcessing: false
//   });

//   const [employeeList, setEmployeeList] = useState([]);

//   const handleAttachmentClick = () => {
//     setShowAttachment(true);
//   };

//   useEffect(() => {
//     const fetchEmployees = async () => {
//         try {
//             const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
//             const data = await response.json();
            
//             if (Array.isArray(data)) { // Check if data is an array
//                 // Extract just the EmployeeName from each object
//                 const names = data.map(employee => employee.name);
      
//                 setEmployeeList(names);
//             }
//         } catch (error) {
//             console.error("Error fetching employees:", error);
//         }
//     };
    
//     fetchEmployees();
// }, []);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setRole(data.role || "");
//     }
//   }, []);


  
//   useEffect(() => {
//     if (!data || data.length === 0) {
//       setFilteredData([]);
//       return;
//     }

// const filtered = data
//       .filter((row) =>
//         Object.entries(filters).every(([key, value]) =>
//           value ? row[key]?.toString().toLowerCase().includes(value.toLowerCase()) : true
//         )
//       )
//       .filter((row) =>
//         Object.values(row).some((value) =>
//           value ? value.toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
//         )
//       );

//     setFilteredData(filtered);
//     const calculatedTotalPages = Math.ceil(filtered.length / pageSize);
//     setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
    
//     if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
//       setCurrentPage(1);
//     }
//   }, [data, filters, searchQuery, pageSize]);

// const selectRow = useCallback((instance, rowIndex, selected) => {
//   if (checkboxStateRef.current.isProcessing) return;
//   checkboxStateRef.current.isProcessing = true;

//   try {
//     // Get the record from current page's filtered data
//     const startIndex = (currentPage - 1) * pageSize;
//     const filteredIndex = startIndex + rowIndex;
//     const record = filteredData[filteredIndex];
    
//     if (!record) return;

//     // Find original index in full dataset
//     const originalIndex = data.findIndex(item => item.caseId === record.caseId);
//     if (originalIndex === -1) return;

//     if (selected) {
//       // Unselect previous row if any
//       const prevSelected = checkboxStateRef.current.selectedRow;
//       if (prevSelected !== null && prevSelected !== rowIndex) {
//         instance.setDataAtCell(prevSelected, 0, false, 'silent');
//       }

//       // Update UI
//       instance.setDataAtCell(rowIndex, 0, true, 'silent');
//       instance.selectRows(rowIndex);
//       checkboxStateRef.current.selectedRow = rowIndex;
//       setSelectedRecord(record);

//       // Update selected rows state
//       setSelectedRows(prev => [...new Set([...prev, originalIndex])]);

//       if (handleRowSelection) {
//         handleRowSelection(originalIndex, true);
//       }
//     } else {
//       // Update UI
//       instance.setDataAtCell(rowIndex, 0, false, 'silent');
//       instance.deselectCell();
//       checkboxStateRef.current.selectedRow = null;
//       setSelectedRecord(null);

//       // Update selected rows state
//       setSelectedRows(prev => prev.filter(idx => idx !== originalIndex));

//       if (handleRowSelection) {
//         handleRowSelection(originalIndex, false);
//       }
//     }
//   } finally {
//     setTimeout(() => {
//       checkboxStateRef.current.isProcessing = false;
//     }, 50);
//   }
// }, [handleRowSelection, currentPage, pageSize, filteredData, data]);

// const createCustomCheckboxRenderer = useCallback(() => {
//   return function(instance, td, row, col, prop, value, cellProperties) {
//     // Header checkbox (select all)
//     if (row === -1) {
//       const checkbox = document.createElement('input');
//       checkbox.type = 'checkbox';
//       checkbox.className = 'select-all-checkbox';
      
//       // Check if all filtered rows are selected
//       const allSelected = filteredData.every(item => {
//         const originalIndex = data.findIndex(d => d.caseId === item.caseId);
//         return selectedRows.includes(originalIndex);
//       });
      
//       checkbox.checked = allSelected;

//       checkbox.onclick = (e) => {
//         e.stopPropagation();
//         const selectAll = checkbox.checked;
        
//         // Get original indices of all filtered rows
//         const originalIndices = filteredData.map(item => 
//           data.findIndex(d => d.caseId === item.caseId)
//         ).filter(i => i >= 0);

//         if (selectAll) {
//           // Select all
//           setSelectedRows(prev => [...new Set([...prev, ...originalIndices])]);
          
//           // Update current page checkboxes
//           const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
//           for (let r = 0; r < pageRowCount; r++) {
//             instance.setDataAtCell(r, 0, true, 'silent');
//           }
//         } else {
//           // Deselect all
//           setSelectedRows(prev => prev.filter(idx => !originalIndices.includes(idx)));
          
//           // Update current page checkboxes
//           const pageRowCount = Math.min(pageSize, filteredData.length - (currentPage - 1) * pageSize);
//           for (let r = 0; r < pageRowCount; r++) {
//             instance.setDataAtCell(r, 0, false, 'silent');
//           }
//         }
//       };
      
//       td.innerHTML = '';
//       td.appendChild(checkbox);
//       return td;
//     }

//     // Normal row checkbox
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.className = 'custom-checkbox';

//     // Get the record for this row
//     const recordIndex = (currentPage - 1) * pageSize + row;
//     const record = filteredData[recordIndex];
    
//     // Check if this row is selected
//     const originalIndex = record ? data.findIndex(item => item.caseId === record.caseId) : -1;
//     const isSelected = originalIndex >= 0 && selectedRows.includes(originalIndex);
//     checkbox.checked = isSelected;

//     const handleClick = (e) => {
//       e.stopPropagation();
//       if (checkboxStateRef.current.isProcessing) {
//         e.preventDefault();
//         return;
//       }
      
//       // Toggle selection state
//       selectRow(instance, row, !isSelected);
//     };

//     checkbox.addEventListener('click', handleClick);

//     td.innerHTML = '';
//     td.appendChild(checkbox);
//     return td;
//   };
// }, [selectRow, filteredData, data, currentPage, pageSize, selectedRows]);




//   const handleCellValueChange = useCallback((e) => {
//     setEditingCellValue(e.target.value);
//   }, []);

//   const saveCellValue = useCallback(() => {
//     if (!selectedCellInfo || editingCellValue === selectedCellInfo.value) return;
    
//     const { row, col } = selectedCellInfo;
    
//     if (hotInstanceRef.current) {
//       hotInstanceRef.current.setDataAtCell(row, col, editingCellValue);
//       setSelectedCellInfo({
//         ...selectedCellInfo,
//         value: editingCellValue
//       });
//     }
//   }, [selectedCellInfo, editingCellValue]);

//   const createAttachmentRenderer = useCallback(() => {
//     return function(instance, td, row, col, prop, value, cellProperties) {
//       td.innerHTML = '';
//       td.style.padding = '2px';
      
      
  
//       const rowData = instance.getSourceDataAtRow(row);
//       const isRechecked = rowData[rowData.length - 1] === true;
//       if(isRechecked){
//         td.style.background = '#FFF9C4'
//       }
      
//       const attachments = Array.isArray(rowData) 
//         ? rowData.find(item => Array.isArray(item)) 
//         : [];
  
//       // console.log("Attachments:", attachments); // Debug
  
//       if (attachments?.length > 0) {
//         const iconContainer = document.createElement('div');
//         iconContainer.style.display = 'flex';
//         iconContainer.style.justifyContent = 'center';
//         iconContainer.style.alignItems = 'center';
//         iconContainer.style.height = '100%';
//         iconContainer.style.width = '100%';
//         iconContainer.style.cursor = 'pointer';
//         // iconContainer.style.background = '#FFFF00';
        
//         iconContainer.innerHTML = `📎 <sup>${attachments.length}</sup>`;
//         iconContainer.style.fontSize = '16px';
//         iconContainer.style.color = '#1890ff';
  
//         iconContainer.onclick = (e) => {
//           e.stopPropagation();

//           setSelectedCase({
//             caseId: rowData[1], // Assuming caseId is at index 1
//             attachments
//           });
//           setShowAttachments(true);
//         };
  
//         td.appendChild(iconContainer);
//       }
  
//       return td;
//     };
//   }, [isDarkMode]);

//   useEffect(() => {
//     if (!tableRef.current || !headers || headers.length === 0 || !filteredData) return;

//     const startIndex = (currentPage - 1) * pageSize;
//     const paginatedData = filteredData
//       .slice(startIndex, startIndex + pageSize)
//       .map((row) => headers.map((key) => row[key] ?? ""));

//     if (hotInstanceRef.current) {
//       // saveScrollPosition();
    
//       hotInstanceRef.current.destroy();
//     }
//     const createImprovedCellRenderer = (searchQuery, enhancedHighlightRenderer) => {
//       return function(instance, td, row, col, prop, value, cellProperties) {
//         // First apply the recheck styling (if any)
//         const rowData = instance.getSourceDataAtRow(row);
//         const isRechecked = rowData[rowData.length - 1] === true;
        
//         if (isRechecked) {
//           td.style.backgroundColor = '#FFF9C4';
//           td.style.fontWeight = 'bold';
//         }
        
//         // Then apply the search highlighting
//         if (searchQuery && value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
//           enhancedHighlightRenderer(instance, td, row, col, prop, value, cellProperties);
//         } else {
//           Handsontable.renderers.TextRenderer.apply(this, arguments);
//         }
        
//         return td;
//       };
//     };
//     const enhancedHighlightRenderer = createEnhancedHighlightRenderer(searchQuery, isDarkMode);
//     const customCheckboxRenderer = createCustomCheckboxRenderer();
//     const improvedCellRenderer = createImprovedCellRenderer(searchQuery, enhancedHighlightRenderer);
    

//     const styleEl = createTableStyles(isDarkMode);
//     const paginationStyleEl = addPaginationStyles();
//     const previewStyleEl = addCellPreviewStyles();

//     tableRef.current.className = `mt-2 border border-${
//       isDarkMode ? "gray-700" : "gray-300"
//     } shadow-md rounded-lg handsontable-${
//       isDarkMode ? "dark" : "light"
//     } overflow-auto`;

//     const dropdownOptions = ["Pending", "Done"];
//     // const employeelist = ["KAIF", "UMAR", "SUNIL", "NAWSHAD"];
//     const statusDropDown = ["New Data","Closed","Negative","CNV"];
//     const readOnlyColumns = ["name", "accountNumber"];
//     const caseStatusDropDown = ["New Pending","Sent"];
    
//     const formattedHeaders = formatHeaderDisplay(headers);
//     const attachmentRenderer = createAttachmentRenderer();
//     hotInstanceRef.current = new Handsontable(tableRef.current, {
//       data: paginatedData,
//       colHeaders: formattedHeaders,
//       columns: headers.map((header, index) => {
//         // const isEditable = role === "admin" ? true : role === "employee" ? editableColumns.includes(header) : false;
//         let isEditable = false;
  
//         if (role === "admin") {
//           isEditable = true; 
//         } else if (role === "employee") {
//           isEditable = DEFAULT_EMPLOYEE_EDITABLE.includes(header) || 
//                       (editableColumns && editableColumns.includes(header));
//         }   
//         if (index === 0) {
//           return {
//             type: "checkbox",
//             readOnly: false,
//             renderer: customCheckboxRenderer,
            
//           };
//         }
//         // In your Table component, update the columns configuration for the attachments column
//         if (header === "attachments" || header.toLowerCase().includes("attachment")) {
//           return {
//             type: "text",
//             readOnly: true,
//             renderer: attachmentRenderer,
//             width: 100, // Make it wider for debugging
//             className: 'debug-attachment-cell', // Add debug class
//           };
//         }
//         if (header === "listByEmployee") {
//           return {
//             type: 'dropdown',
//             source: employeeList,
//             strict: false,
//             allowInvalid: false,
//             className: 'htDropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//             // Critical dropdown settings:
//             editor: DropdownEditor,
//             dropdownMenu: {
//               className: 'htDropdownMenu',
//               // itemsLimit: 10,
//             },
            
            
//           };
//         }
//         if (header === "status") {
//           return {
//             type: "dropdown",
//             source: statusDropDown,
//             editorClassName: 'custom-dropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//           };
//         }
//         if (header === "caseStatus") {
//           return {
//             type: "dropdown",
//             source: caseStatusDropDown,
//             editorClassName: 'custom-dropdown',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//           };
//         }
//         if (header === "dateOut" || header === "sentDate") {
//           return {
//             type: 'date',
//             allowInvalid: false,
//             dateFormat: 'YYYY-MM-DD',
//             headerClassName: 'htLeft',
//             renderer: improvedCellRenderer,
//             readOnly: !isEditable,
//             // Add these properties to improve dropdown visibility
//             editor: 'date',
//             datePickerConfig: {
//               // Show the date picker on single click
//               showOn: 'click',
//               // Position the date picker properly
//               position: 'bottom-start',
//             }
//           };
//         }
//         if (readOnlyColumns.includes(header)) {
//           return { type: "text", readOnly: true, renderer: improvedCellRenderer };
//         }
        
//         return {
//           type: "text",
//           renderer: (instance, td, row, col, prop, value, cellProperties) => {
//             const rowData = instance.getSourceDataAtRow(row);
//             const isRechecked = rowData[rowData.length - 1] === true;
            
//             // Apply base styling first
//             td.style.whiteSpace = 'nowrap';
//             td.style.overflow = 'hidden';
//             td.style.textOverflow = 'ellipsis';
//             td.style.maxWidth = '200px'; // Set a reasonable max width
//             td.style.textAlign = 'left'
            
//             if (isRechecked) {
//               td.style.backgroundColor = '#FFF9C4'; // Light yellow background
//               td.style.fontWeight = 'bold';
              
//               // Special styling for caseId column
//               if (header === "caseId") {
//                 td.style.borderLeft = '3px solid #FFC107'; // Gold border
//                 td.innerHTML = `<span style="color:#FF8F00">↻</span> ${value}`;
//               }
//             }
            
//             // For IP address column (or any column that shouldn't expand)
//             if (header === "ipAddress") {
//               td.style.maxWidth = '150px'; // Even more restrictive for IPs
//             }
            
//             return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
//           },
//           readOnly: !isEditable,
//         };
//       }),
//       dropdownMenu: true,
//       filters: true,
//       // columnSorting: true,
//       search: true,
//       manualColumnResize: true, // Allow manual resizing
//       stretchH: 'none', // Don't stretch columns to fit
//       height: "450px",
//       rowHeaders: function(row) {
//         return (currentPage - 1) * pageSize + row + 1;
//       },
//       manualColumnMove: true,
//       contextMenu: [
//     'cut',
//     'copy',
//     '---------',
//     'row_above',
//     'row_below',
//     'remove_row',
//     '---------',
//     'alignment',
//     'make_read_only',
//     'clear_column',
//   ],
//       rowHeights: 22,
//       className: "htCenter htMiddle",
//       licenseKey: "non-commercial-and-evaluation",
//        afterFilter: function (conditionsStack) {
//   // Map Handsontable column headers to your React filters keys
//   const columnToFilterKeyMap = {
//     "Product": "product",
//     "Product Type": "productType",
//     "Status": "status",
//     "Case Status": "caseStatus",
//     "Date In": "dateIn",
//     "Date In (To)": "endDate",
//     "Client Type": "clientType",
//     "Correct UPN": "correctUPN",
//     "Updated Product Name": "updatedProductName",
//     "Updated Requirement": "updatedRequirement",
//     "Bank Code": "bankCode",
//     "Client Code": "clientCode",
//     "Vendor Name": "vendorName",
//     "Sent By": "sentBy",
//     "Case Done By": "caseDoneBy",
//     "List By Employee": "listByEmployee",
//     "Auto or Manual": "autoOrManual",
//     "Role": "role",
//     "Name":"name"
//     // Add more as needed based on your actual column headers
//   };

//   const updatedFilters = {};

//   conditionsStack.forEach((condition) => {
//     const columnIndex = condition.column;
//     const columnHeader = this.getColHeader(columnIndex); // e.g., "Product"
//     const conditions = condition.conditions;

//     conditions.forEach((c) => {
//       if (c.name === 'by_value' && Array.isArray(c.args) && Array.isArray(c.args[0])) {
//         const selectedValues = c.args[0];
//         const firstValue = selectedValues[0] || ""; // If no value, fallback to empty

//         const filterKey = columnToFilterKeyMap[columnHeader];
//         if (filterKey) {
//           updatedFilters[filterKey] = firstValue;
//         }
//       }
//     });
//   });

//   // Update React filters state only once to prevent rerenders per filter
//   if (Object.keys(updatedFilters).length > 0) {
//     setFilters((prev) => ({ ...prev, ...updatedFilters }));
//   }
// },

//       cells: (row, col) => {
//         // Make cells read-only in deduce mode unless field is allowed for updates
//         if (deduceMode) {
//           const header = headers[col];
//           const isUpdatable = deduceFilters.updateFields && deduceFilters[header];
//           return {
//             readOnly: !isUpdatable
//           };
//         }
//         return {};
//       },
//       afterChange: (changes, source) => {
//         if (source === "edit") {

//     const updatedRowIndex = changes[0][0];
//     const updatedColIndex = changes[0][1];
//     const updatedHeader = headers[updatedColIndex];
//     const newValue = changes[0][3];
    
//     const rowData = hotInstanceRef.current.getDataAtRow(updatedRowIndex);
//     const rowId = filteredData[startIndex + updatedRowIndex].caseId;

//     const update = {
//       caseId: rowId,
//       changedField: headers[updatedColIndex], 
//       [headers[updatedColIndex]]: newValue   
//     };

    
    
//     sendUpdateToBackend(update);
//         }
//       },
   
      
// afterSelection: function(row, column, row2, column2, preventScrolling) {
//   if (row >= 0 && column > 0) {
//     const selectedValue = this.getDataAtCell(row, column);
//     const headerName = headers[column];
//     const isEditable = role === "admin" ? true : 
//       role === "employee" ? editableColumns.includes(headerName) : false;

//     setSelectedCellInfo({
//       row,
//       col: column,
//       value: selectedValue || "",
//       header: headerName,
//       isEditable
//     });
    
//     setEditingCellValue(selectedValue || "");
//   }
// },
// // In your column configuration
// renderer: (instance, td, row, col, prop, value, cellProperties) => {
//   const rowData = instance.getSourceDataAtRow(row);
//   if (rowData?.isRechecked) {
//     td.style.backgroundColor = '#FFF9C4';
//     td.style.fontWeight = 'bold';
//   }
//   return improvedCellRenderer(instance, td, row, col, prop, value, cellProperties);
// },
      

//       viewportColumnRenderingOffset: 10,
//       mergeCells: true,
//       customBorders: true,
//       allowInsertColumn: false,
//       allowInsertRow: false,
//     });
    
    
// const mapSelectedRowToCurrentPage = () => {
//   const selectedGlobalRow = checkboxStateRef.current.selectedRow;
  
//   if (selectedGlobalRow !== null) {
//     const pageIndex = Math.floor(selectedGlobalRow / pageSize);
    
//     if (pageIndex + 1 === currentPage) {
//       const localRowIndex = selectedGlobalRow % pageSize;
//       if (localRowIndex < paginatedData.length) {
//         requestAnimationFrame(() => {
//           hotInstanceRef.current.selectRows(localRowIndex);
//           hotInstanceRef.current.setDataAtCell(localRowIndex, 0, true, 'silent');
//         });
//       }
//     }
//   }
// };

//     setTimeout(() => {
//       mapSelectedRowToCurrentPage();
//       // restoreScrollPosition();
//     }, 10);
    
//     return () => {
//       [styleEl, paginationStyleEl, previewStyleEl].forEach(el => {
//         if (document.head.contains(el)) {
//           document.head.removeChild(el);
//         }
//       });
//     };
//   }, [filteredData, headers, searchQuery, pageSize, isDarkMode, currentPage, createCustomCheckboxRenderer, selectRow, role, editableColumns]);
 
// const sendUpdateToBackend = debounce(async (update) => {
//   try {
//     const getUser = localStorage.getItem("loginUser");
//     const user = getUser ? JSON.parse(getUser) : null;
    
//     if (!user || !user.name) {
//       throw new Error("User information not available");
//     }

//     const payload = {
//       caseId: update.caseId,
//       changedField: update.changedField,
//       [update.changedField]: update[update.changedField],
//       userId: user.userId,  // Send both ID and name
//       userName: user.name
//     };

//     const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/kyc/update-data`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ updatedData: [payload] })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Update failed");
//     }

//     // Optional: Optimistic UI update here if needed
//     setUpdateStatus("Update successful");
//     setTimeout(() => setUpdateStatus(null), 3000);

//   } catch (error) {
//     console.error("Update error:", error);
//     setUpdateStatus(`Error: ${error.message}`);
//     setTimeout(() => setUpdateStatus(null), 5000);
//   }
// }, 500);
  
  
//   const handleDeleteSelectedRows = useCallback(async () => {
//     if (selectedRows.length === 0) {
//       toast.warning("No rows selected for deletion.");
//       return;
//     }
  
//     try {
//       setIsDeleting(true);
//       const selectedItems = selectedRows.map(index => data[index]);
//       const caseIds = selectedItems.map(item => item?.caseId).filter(Boolean);
  
//       if (caseIds.length === 0) {
//         toast.error("No valid caseIds found for selected rows.");
//         return;
//       }
  
//       const confirmMessage = filterType === "deleted" 
//         ? "permanently delete these records?" 
//         : "delete these records?";
      
//       if (!window.confirm(`Are you sure you want to ${confirmMessage}`)) {
//         return;
//       }
  
//       // Clear selection before deletion
//       const instance = hotInstanceRef.current;
//       if (instance) {
//         selectedRows.forEach(rowIndex => {
//           instance.setDataAtCell(rowIndex, 0, false, 'silent');
//         });
//         instance.deselectCell();
//       }
  
//       const endpoint = filterType === "deleted" 
//         ? `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-permanently`
//         : `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-data`;
  
//       const response = await fetch(endpoint, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ caseIds }),
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
  
//       const result = await response.json();
//       if (result.updatedData) {
//         setData(result.updatedData);
//         setFilteredData(result.updatedData);
//       } else {
//         const selectedIndices = new Set(selectedRows);
//         const newData = data.filter((_, index) => !selectedIndices.has(index));
        
//         setData(newData);
//         setFilteredData(newData);
//       }
  
//       setSelectedRows([]);
//       checkboxStateRef.current.selectedRow = null;
//       setCurrentPage(1);
      
//       toast.success(`${caseIds.length} records ${filterType === "deleted" ? "permanently deleted" : "deleted"} successfully`)
  
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error(`Delete failed: ${error.message}`);
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [data, selectedRows, filterType, setData, setFilteredData, setSelectedRows]);
//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };
//     // Export handlers
//     const handleExportData = async (shouldExport, columns, format = "excel") => {
//       setIsExportModalOpen(false);
      
//       if (!shouldExport) return;
    
//       try {
//         let dataToExport = [];
        
//         // If rows are selected, export only those
//         if (selectedRows.length > 0) {
//           dataToExport = selectedRows.map(rowIndex => {
//             const rowData = {};
//             headers.forEach((header, colIndex) => {
//               rowData[header] = data[rowIndex][header] ?? '';
//             });
//             return rowData;
//           });
//         } 
//         // Otherwise export all visible rows
//         else if (hotInstanceRef.current) {
//           const hotData = hotInstanceRef.current.getData();
//           dataToExport = hotData.map((row, index) => {
//             const rowData = {};
//             headers.forEach((header, colIndex) => {
//               rowData[header] = row[colIndex] !== undefined ? row[colIndex] : '';
//             });
//             return rowData;
//           });
//         } 
//         else {
//           dataToExport = [...filteredData];
//         }
//         if (format === 'text' && !columns.includes("productType")) {
//           columns.push("productType");
//         }
        
//         const preparedData = dataToExport.map(row => {
//           const exportRow = {};
//           columns.forEach(col => {
//             exportRow[col] = col.split('.').reduce((o, i) => o?.[i], row) ?? "";
//           });
//           return exportRow;
//         });
    
//         if (preparedData.length === 0 || preparedData.every(row => Object.values(row).every(val => val === ""))) {
//           throw new Error("No valid data available for export");
//         }
    
//         const formatHeader = (header) => {
//           return header
//             .replace(/([A-Z])/g, ' $1')
//             .replace(/_/g, ' ')
//             .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
//             .trim();
//         };
    
//         const formattedHeaders = columns.map(header => ({
//           key: header,
//           label: formatHeader(header),
          
//         }));
    
//         const dateString = new Date().toISOString().split('T')[0];
        
//         switch (format) {
//           case 'excel':
//             exportToExcel(preparedData, formattedHeaders, dateString);
//             break;
//           case 'text':
//             exportToText(preparedData, formattedHeaders, dateString);
//             break;
//           case 'csv':
//             exportToCSV(preparedData, formattedHeaders, dateString);
//             break;
//           default:
//             exportToExcel(preparedData, formattedHeaders, dateString);
//         }
//       } catch (error) {
//         console.error("Export failed:", error);
//         toast.error("Export failed: " );
//       }
//     };
    
//     const exportToExcel = (data, headers, dateString) => {
//       const worksheet = XLSX.utils.json_to_sheet(data);
      
//       if (worksheet['!ref']) {
//         const range = XLSX.utils.decode_range(worksheet['!ref']);
//         for (let C = range.s.c; C <= range.e.c; ++C) {
//           const address = XLSX.utils.encode_cell({ r: 0, c: C });
//           if (worksheet[address]) {
//             worksheet[address].v = headers[C].label;
//           } else {
//             worksheet[address] = { v: headers[C].label };
//           }
//         }
//       }
  
//       const colWidths = headers.map(header => {
//         let maxLength = header.label.length;
//         data.forEach(row => {
//           const value = row[header.key] || '';
//           const valueLength = value.toString().length;
//           maxLength = Math.max(maxLength, valueLength);
//         });
//         return { width: Math.min(Math.max(maxLength + 2, 10), 50) };
//       });
  
//       worksheet['!cols'] = colWidths;
      
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");
      
//       const excelBuffer = XLSX.write(workbook, { 
//         bookType: "xlsx", 
//         type: "array" 
//       });
      
//       const blob = new Blob([excelBuffer], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });
      
//       saveAs(blob, `export_${dateString}.xlsx`);
//     };
//     const exportToText = (data, headers, dateString) => {
//       const formatField = (key, value) => value;
    
//       let textContent = data.map((row, index) => {
//         let recordText = '';
    
//         if (row.productType?.toLowerCase() === 'banking') {
//           const acc = formatField('accountNumber', row['accountNumber'] || '');
//           const req = formatField('requirement', row['requirement'] || '');
//           recordText = `${acc}\n${req}`;
//         } else {
//           const filteredHeaders = headers.filter(h => h.key !== "productType");
    
//           const pairs = filteredHeaders.map(header => {
//             const key = header.label === "Updated Product Name" ? "Product" : header.label;
//             const value = formatField(header.key, row[header.key] || '');
//             return `${key}=${value}`;
//           }).join(', ');
    
//           recordText = `${pairs}.`;
//         }
    
//         // Add separator after every record except the last one
//         const separator = index < data.length - 1 ? '\n' + '-'.repeat(60) + '\n' : '';
//         return recordText + separator;
//       }).join('\n');
    
//       const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
//       saveAs(blob, `export_${dateString}.txt`);
//     };
    
  
//     const exportToCSV = (data, headers, dateString) => {
//       let csvContent = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',') + '\r\n';
      
//       data.forEach(row => {
//         csvContent += headers.map(h => {
//           const value = row[h.key] || '';
//           return `"${value.toString().replace(/"/g, '""')}"`;
//         }).join(',') + '\r\n';
//       });
      
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       saveAs(blob, `export_${dateString}.csv`);
//     };

//     const handleDeletePermanently = async () => {
//       if (selectedRows.length === 0) {
//         toast.warning("No rows selected for deletion.");
//         return;
//       }
    
//       const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
//       if (!caseIds.length) {
//         toast.error("No valid caseIds found for selected rows.");
//         return;
//       }
    
//       if (!window.confirm("Are you sure you want to permanently delete these records?")) {
//         return;
//       }
    
//       try {
//         // Clear selections before deletion
//         setSelectedRows([]);
//         checkboxStateRef.current = {
//           selectedRow: null,
//           isProcessing: false
//         };
    
//         if (hotInstanceRef.current) {
//           // Clear all checkboxes
//           const hotData = hotInstanceRef.current.getData();
//           hotData.forEach((row, rowIndex) => {
//             if (row[0] === true) {
//               hotInstanceRef.current.setDataAtCell(rowIndex, 0, false);
//             }
//           });
          
//           // Clear selections
//           hotInstanceRef.current.deselectCell();
//         }
    
//         const response = await axios.delete(
//           `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-permanently`,
//           { data: { caseIds } }
//         );
    
//         if (response.status === 200) {
//           // Update data
//           const selectedIndices = new Set(selectedRows);
//           const newData = data.filter((_, index) => !selectedIndices.has(index));
          
//           setData(newData);
//           setFilteredData(newData);
//           setCurrentPage(1);
          
//           toast.success(`${caseIds.length} records permanently deleted successfully`);
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         toast.error(`Delete failed: ${error.message}`);
//       } finally {
//         // Ensure selections are cleared even if error occurs
//         setSelectedRows([]);
//         if (hotInstanceRef.current) {
//           hotInstanceRef.current.deselectCell();
//         }
//       }
//     };
    
//     const handleRestoreRecords = async () => {
//       if (selectedRows.length === 0) {
//         toast.warning("No rows selected for restoration.");
//         return;
//       }
      
//       const caseIds = selectedRows.map(rowIndex => data[rowIndex]?.caseId).filter(Boolean);
//       if (!caseIds.length) {
//         toast.error("No valid caseIds found for selected rows.");
//         return;
//       }
    
//       if (!window.confirm("Are you sure you want to restore these records?")) {
//         return;
//       }
    
//       try {
//         const response = await axios.post(
//           `${import.meta.env.VITE_Backend_Base_URL}/kyc/restore-records`,
//           { caseIds }
//         );
        
//         if (response.status === 200) {
//           // Update data
//           const selectedIndices = new Set(selectedRows);
//           const newData = data.filter((_, index) => !selectedIndices.has(index));
          
//           setData(newData);
//           setFilteredData(newData);
//           setSelectedRows([]);
//           setCurrentPage(1);
          
//           // Clear Handsontable selection
//           setTimeout(() => {
//             const instance = hotInstanceRef.current;
//             if (instance) {
//               instance.deselectCell();
//               const selection = instance.getSelected();
//               if (selection) {
//                 selection.forEach(range => {
//                   instance.deselectCell(range.from.row, range.from.col, range.to.row, range.to.col);
//                 });
//               }
//               if (instance.getActiveEditor()) {
//                 instance.getActiveEditor().close();
//               }
//               instance.render();
//             }
//           }, 0);
          
//           toast.success(`${caseIds.length} records restored successfully`);
//         }
//       } catch (error) {
//         console.error("Restore error:", error);
//         toast.error(`Restore failed: ${error.message}`);
//       }
//     }; 
   
//     useEffect(() => {
//       if (selectedRows.length === 0 && checkboxStateRef.current.selectedRow !== null) {
//         // Clear Handsontable selection if parent cleared selections
//         if (hotInstanceRef.current) {
//           hotInstanceRef.current.deselectCell();
//           checkboxStateRef.current.selectedRow = null;
//         }
//       }
//     }, [selectedRows]);
//     const handleDeduceClick = async () => {
//       try {
//         setIsLoading(true);
        
//         // Check if we have valid data to work with
//         if (!filteredData || !Array.isArray(filteredData) || !data || !Array.isArray(data)) {
//           toast.error("Data not loaded yet");
//           return;
//         }
    
//         if (selectedRows.length === 0) {
//           // If no rows selected, find duplicates in all "New Data"/"Pending" records
//           const response = await axios.post(
//             `${import.meta.env.VITE_Backend_Base_URL}/kyc/find-similar-records`,
//             {
//               statusFilter: ["New Data", "Pending"],
//               caseStatusFilter: ["New Pending"],
//               applyFilters: deduceFilters.applyFilters,
//               filters: deduceFilters.applyFilters ? filters : {}
//             }
//           );
          
//           if (response.data?.success && response.data.duplicates?.length > 0) {
//             setData(response.data.duplicates);
//             toast.success(`Found ${response.data.duplicates.length} duplicate records`);
//           } else {
//             toast.info("No duplicate records found");
//           }
//         } 
//         else if (selectedRows.length === 1) {
//           // Existing single-record deduce logic
//           const rowIndex = selectedRows[0];
//           const rowData = data[rowIndex];
          
//           if (!rowData) {
//             toast.error("Selected record not found");
//             return;
//           }
    
//           const response = await axios.post(
//             `${import.meta.env.VITE_Backend_Base_URL}/kyc/find-similar-records`,
//             {
//               product: rowData.product,
//               accountNumber: rowData.accountNumber,
//               requirement: rowData.requirement,
//               caseId: rowData.caseId
//             }
//           );
    
//           if (response.data?.success && response.data.records?.length > 0) {
//             setSimilarRecords(response.data.records);
//             setIsDeduceModalOpen(true);
//           } else {
//             toast.info("No similar historical records found");
//           }
//         }
//         else {
//           // For multiple selected rows
//           const selectedRecords = selectedRows
//             .map(index => data[index])
//             .filter(record => record); // Filter out undefined records
          
//           if (selectedRecords.length === 0) {
//             toast.error("No valid records selected");
//             return;
//           }
    
//           // Client-side duplicate detection
//           const seen = new Set();
//           const duplicates = [];
          
//           selectedRecords.forEach(record => {
//             const key = `${record.product}|${record.accountNumber}|${record.requirement}`;
//             if (seen.has(key)) {
//               duplicates.push(record);
//             } else {
//               seen.add(key);
//             }
//           });
          
//           if (duplicates.length > 0) {
//             setData(duplicates);
//             toast.success(`Found ${duplicates.length} duplicates in selected records`);
//           } else {
//             toast.info("No duplicates found in selected records");
//           }
//         }
//       } catch (error) {
//         console.error("Deduce error:", error);
//         toast.error(error.response?.data?.message || error.message || "Failed to find duplicates");
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//   const handleMasterReset = () => {
//     // Clear local selected rows state
//     setSelectedRows([]);
//     checkboxStateRef.current = {
//       selectedRow: null,
//       isProcessing: false
//     };
  
//     // Clear Handsontable selections
//     if (hotInstanceRef.current) {
//       try {
//         // Clear all checkboxes
//         const data = hotInstanceRef.current.getData();
//         data.forEach((row, rowIndex) => {
//           if (row[0] === true) {
//             hotInstanceRef.current.setDataAtCell(rowIndex, 0, false);
//           }
//         });
        
//         // Clear selections
//         hotInstanceRef.current.deselectCell();
        
//         // Force re-render
//         hotInstanceRef.current.render();
//       } catch (error) {
//         console.error("Error during reset:", error);
//       }
//     }
  
//     // Call parent reset function last
//     if (onMasterReset) onMasterReset();
//   };

//   return (
//     <div>
//       <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-2 rounded shadow-md`}>
//         {isLoading ? (
//           <div className="p-4 text-center">Loading...</div>
//         ) : (
//           <>
//             <CellPreview
//               selectedCellInfo={selectedCellInfo}
//               editingCellValue={editingCellValue}
//               handleCellValueChange={handleCellValueChange}
//               saveCellValue={saveCellValue}
//               isDarkMode={isDarkMode}
//             />
            
//             {updateStatus && (
//               <div className={`mb-2 p-2 rounded text-sm ${updateStatus.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
//                 {updateStatus}
//               </div>
//             )}
  
//             <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center p-1.5 rounded gap-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
//               <div className="flex items-center gap-2">
//                 <button
//   onClick={() => {
//     // Calculate if all filtered rows are currently selected
//     const allFilteredSelected = filteredData.every((item, index) => {
//       const originalIndex = data.findIndex(d => d.caseId === item.caseId);
//       return selectedRows.includes(originalIndex);
//     });

//     if (allFilteredSelected) {
//       // Deselect all
//       setSelectedRows([]);
//       if (hotInstanceRef.current) {
//         const startIndex = (currentPage - 1) * pageSize;
//         const endIndex = Math.min(startIndex + pageSize, filteredData.length);
//         const pageRowIndices = Array.from({ length: endIndex - startIndex }, (_, i) => i);
        
//         pageRowIndices.forEach(rowIndex => {
//           hotInstanceRef.current.setDataAtCell(rowIndex, 0, false);
//         });
//       }
//     } else {
//       // Select all filtered rows
//       const originalIndices = filteredData.map(item => 
//         data.findIndex(d => d.caseId === item.caseId)
//       ).filter(i => i >= 0);
      
//       setSelectedRows(originalIndices);
//       if (hotInstanceRef.current) {
//         const startIndex = (currentPage - 1) * pageSize;
//         const endIndex = Math.min(startIndex + pageSize, filteredData.length);
//         const pageRowIndices = Array.from({ length: endIndex - startIndex }, (_, i) => i);
        
//         pageRowIndices.forEach(rowIndex => {
//           hotInstanceRef.current.setDataAtCell(rowIndex, 0, true);
//         });
//       }
//     }
//   }}
//   className={`px-3 py-1.5 text-sm rounded ${
//     isDarkMode
//       ? selectedRows.length === filteredData.length 
//         ? "bg-gray-600 text-white" 
//         : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//       : selectedRows.length === filteredData.length
//         ? "bg-gray-300 text-gray-700"
//         : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//   }`}
//   disabled={filteredData.length === 0}
// >
//   {selectedRows.length === filteredData.length ? '✕' : '✓'}
// </button>
  
//                 <input
//                   type="text"
//                   placeholder="Search"
//                   className={`border p-1.5 text-sm rounded w-56 ${
//                     isDarkMode
//                       ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
//                       : "bg-white border-gray-300 text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
//                   }`}
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
  
//               <div className="flex items-center gap-4">
//                 {filterType === "deleted" ? (
//                   <>
//                     {role === "admin" && (
//                       <button
//                         onClick={handleRestoreRecords}
//                         className={`px-3 py-1.5 text-sm rounded ${
//                           isDarkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
//                         }`}
//                         disabled={selectedRows.length === 0}
//                       >
//                         Restore
//                       </button>
//                     )}
//                     {role === "admin" && (
//                       <button
//                         onClick={handleDeletePermanently}
//                         className={`px-3 py-1.5 text-sm rounded ${
//                           isDarkMode ? "bg-red-700 text-white" : "bg-red-600 text-white"
//                         }`}
//                         disabled={selectedRows.length === 0}
//                       >
//                         Delete Permanently
//                       </button>
//                     )}
//                   </>
//                 ) : (
//                   <>

//                     {selectedRecord && (role === "admin" || role === "employee") && (
//                       <>
//                       <button
//                         onClick={handleAttachmentClick}
//                         className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
//                         title="View Attachments"
//                       >
//                         <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                       </button>
//                       </>
//                     )}
  
//                     {role === "admin" && (
//                       <button
//                         className={`px-3 py-1.5 text-sm rounded ${
//                           isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
//                         }`}
//                         onClick={handleDeleteSelectedRows}
//                         disabled={selectedRows.length === 0}
//                       >
//                         Delete
//                       </button>
//                     )}
  
//                     {(role === "admin" || role === "employee") && (
//                       <button
//                         className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
//                           isDarkMode
//                             ? "bg-green-600 hover:bg-green-700 text-white"
//                             : "bg-green-500 hover:bg-green-600 text-white"
//                         }`}
//                         onClick={() => setIsExportModalOpen(true)}
//                       >
//                         Download
//                       </button>
//                     )}
//                   </>
//                 )}
  
//                 {(role === "admin" || role === "employee") && (
//                   <button
//                     onClick={handleDeduceClick}
//                     className={`px-3 py-1.5 text-sm rounded ${
//                       isDarkMode
//                         ? "bg-purple-600 hover:bg-purple-700 text-white"
//                         : "bg-purple-500 hover:bg-purple-600 text-white"
//                     }`}
//                     disabled={isLoading || (selectedRows.length > 1 && selectedRows.length !== filteredData.length)}
//                     title="Find similar previous records"
//                   >
//                     {isLoading ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Processing...
//                       </>
//                     ) : 'Deduce'}
//                   </button>
//                 )}
  
//                 <button
//                   onClick={handleMasterReset}
//                   disabled={isLoading}
//                   className={`px-2 py-1 text-sm rounded flex items-center gap-1 ${
//                     isDarkMode
//                       ? "bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-700"
//                       : "bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:bg-gray-200"
//                   }`}
//                   title="Reset all filters and selections"
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Resetting...
//                     </>
//                   ) : (
//                     "Reset All"
//                   )}
//                 </button>
  
//                 <select
//                   className={`border p-1 text-xs rounded ${
//                     isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
//                   }`}
//                   value={pageSize}
//                   onChange={(e) => {
//                     setPageSize(Number(e.target.value));
//                     setCurrentPage(1);
//                   }}
//                 >
//                   {[5, 10, 20, 50, 100].map(size => (
//                     <option key={size} value={size}>{size}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
  
//             <div
//               ref={tableRef}
//               style={{ height: "450px" }}
//               className="mt-2 border border-gray-300 shadow-md rounded-lg overflow-auto"
//             ></div>
  
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               totalItems={filteredData.length}
//               pageSize={pageSize}
//               handlePageChange={handlePageChange}
//               isDarkMode={isDarkMode}
//             />
            
//             <ExcelExportModal
//               isOpen={isExportModalOpen}
//               onClose={handleExportData}
//               headers={headers}
//               initialSelectedColumns={selectedExportColumns}
//               isDarkMode={isDarkMode}
//             />
//           </>
//         )}
        
//         {showAttachment && selectedRecord && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
//             <div className={`relative w-[90%] max-w-3xl mx-auto p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//                   Case Attachments
//                 </h3>
//                 <button
//                   onClick={() => setShowAttachment(false)}
//                   className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
  
//               <AttachmentManager
//                 caseId={selectedRecord.caseId}
//                 role={role}
//                 isDarkMode={isDarkMode}
//                 onClose={() => setShowAttachment(false)}
//                 fetchTrackerData = {fetchTrackerData}
//               />
//             </div>
//           </div>
//         )}
  
//         <AttachmentsModal
//           visible={showAttachments}
//           caseId={selectedCase?.caseId}
//           onClose={() => setShowAttachments(false)}
//         />
  
//         {isDeduceModalOpen && <DeduceModal />}
//         {selectedRecordToCopy && (
//           <CopyFieldsModal 
//             record={selectedRecordToCopy}
//             onClose={() => setSelectedRecordToCopy(null)}
//             selectedRecord={selectedRecord}
//             fetchTrackerData={fetchTrackerData}
//             isDarkMode={isDarkMode}
//           />
//         )}
//       </div>
//     </div>
//   );
   
// };

// const addTableStyles = () => {
//   const styleEl = document.createElement("style");
//   styleEl.innerHTML = `

//   .fa-paperclip {
//   transition: transform 0.2s, color 0.2s;
//   padding: 4px;
// }

// .fa-paperclip:hover {
//   transform: scale(1.2);
//   color: var(--primary-color);
// }
//   .handsontable td .fa-download {
//   transition: transform 0.2s, color 0.2s;
//   padding: 4px;
// }

// /* Add to your global styles */
// .debug-attachment-cell {
//   background-color: rgba(255, 0, 0, 0.1) !important;
//   border: 2px dashed red !important;
// }

// .debug-attachment-icon {
//   background-color: rgba(0, 255, 0, 0.2) !important;
//   border: 1px solid green !important;
// }








//  /* Fix for border overflow with modals */
//     // .handsontable {
//     //   box-sizing: border-box;
//     //   overflow: hidden !important;
//     // }
    
    
//     /* Ensure proper z-index stacking */
//     .handsontable {
//       z-index: 1;
//     }
    
//     /* Fix for border rendering */
//     .handsontable table {
//       border-collapse: separate;
      
//     }




//     // Add to your style element
// .handsontable .wtHolder {
//   overflow: auto !important;
// }

// .copy-field-item {
//   transition: background-color 0.2s;
// }

// .copy-field-item:hover {
//   background-color: rgba(59, 130, 246, 0.1);
// }

// .dark .copy-field-item:hover {
//   background-color: rgba(29, 78, 216, 0.2);
// }




    
//   `;
//   document.head.appendChild(styleEl);
//   return styleEl;
// };

// addTableStyles();

// export default Table;