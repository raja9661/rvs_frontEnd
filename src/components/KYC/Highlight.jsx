import Handsontable from "handsontable";

// Enhanced highlight search renderer with more vibrant colors
export const createEnhancedHighlightRenderer = (searchQuery, isDarkMode) => {
  return function (instance, td, row, col, prop, value, cellProperties) {
    // Default rendering
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    
    // Skip highlighting for empty values or empty search query
    if (!value || !searchQuery || value === "") {
      return td;
    }
    
    // Check if the value contains the search query (case-insensitive)
    const lowerValue = value.toString().toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    
    if (lowerValue.includes(lowerQuery)) {
      // Create HTML with highlighted text
      const textValue = value.toString();
      let highlightedText = "";
      let lastIndex = 0;
      
      // Find all occurrences of the search query
      const regex = new RegExp(lowerQuery, 'gi');
      let match;
      
      while ((match = regex.exec(lowerValue)) !== null) {
        // Add text before the match
        highlightedText += textValue.substring(lastIndex, match.index);
        
        // Add the highlighted match - more vibrant yellow with better contrast
        highlightedText += '<span style="background-color: #FFDD00; color: #000000; font-weight: bold; padding: 2px; border-radius: 2px;">' + 
          textValue.substring(match.index, match.index + match[0].length) + 
          '</span>';
        
        // Update the lastIndex
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      highlightedText += textValue.substring(lastIndex);
      
      // Set the inner HTML
      td.innerHTML = highlightedText;
      
      // Add a subtle background color to the entire cell
      td.style.backgroundColor = isDarkMode ? "#3B3B00" : "#FFFFCC";
    }
    
    return td;
  };
};

// Custom checkbox renderer that selects row
export const createCheckboxRenderer = (handleRowSelection) => {
  return function (instance, td, row, col, prop, value, cellProperties) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!value;
    checkbox.style.margin = "0";
    checkbox.style.padding = "0";
    checkbox.className = "mr-0";

    checkbox.addEventListener("click", function (e) {
      const rowData = instance.getDataAtRow(row);
      instance.setDataAtCell(row, 0, this.checked);

      // Select the whole row if checked
      if (this.checked) {
        instance.selectRows(row);
      }

      e.stopPropagation();
    });

    // Center the checkbox in the cell
    td.innerHTML = "";
    td.style.textAlign = "center";
    td.style.verticalAlign = "middle";
    td.appendChild(checkbox);

    return td;
  };
};

// Improved cell renderer with tooltip and ellipsis
export const createImprovedCellRenderer = (searchQuery, enhancedHighlightRenderer) => {
  return function (instance, td, row, col, prop, value, cellProperties) {
    if (!value) {
      td.innerHTML = "";
      return td;
    }
    
    const textValue = String(value);
    
    // Set tooltip
    td.setAttribute('title', textValue);
    
    // Create a span with ellipsis
    const contentSpan = document.createElement('span');
    contentSpan.className = 'cell-content-ellipsis';
    contentSpan.textContent = textValue;
    
    td.innerHTML = '';
    td.appendChild(contentSpan);
    
    // Apply highlighting if there's a search query
    if (searchQuery && textValue.toLowerCase().includes(searchQuery.toLowerCase())) {
      return enhancedHighlightRenderer(instance, td, row, col, prop, value, cellProperties);
    }
    
    return td;
  };
};

// Create styles for the table based on theme
export const createTableStyles = (isDarkMode) => {
  // Theme-specific styles for the table
  const themeStyles = isDarkMode
    ? {
        // Dark theme
        background: "#1F2937",
        text: "#E5E7EB",
        headerBg: "#111827",
        headerText: "#9CA3AF",
        rowHighlight: "#374151",
        border: "#4B5563",
        // hover: "#374151",
      }
    : {
        // Light theme
        background: "#FFFFFF",
        text: "#111827",
        headerBg: "#F3F4F6",
        headerText: "#374151",
        rowHighlight: "#EFF6FF",
        border: "#E5E7EB",
      };

  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .handsontable-${isDarkMode ? "dark" : "light"} .handsontable {
      background-color: ${themeStyles.background};
      color: ${themeStyles.text};
      font-size: 12px; /* Smaller font size */
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .handsontable th {
      background-color: ${themeStyles.headerBg};
      color: ${themeStyles.headerText};
      border-color: ${themeStyles.border};
      font-weight: bold;
      vertical-align: middle;
      text-align: left;
      font-size: 11px !important;
      line-height: 1.2 !important;
      white-space: break-spaces !important; /* Allow text wrapping */
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .handsontable td {
      background-color: ${themeStyles.background};
      color: ${themeStyles.text};
      border-color: ${themeStyles.border};
      padding: 2px 4px !important; /* Compact padding */
      height: 22px !important; /* Smaller row height */
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .handsontable-${
      isDarkMode ? "dark" : "light"
    } .handsontable .ht_master .wtHolder {
      background-color: ${themeStyles.background};
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .handsontable .htDimmed {
      color: ${themeStyles.headerText};
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .handsontable .current {
      background-color: ${themeStyles.rowHighlight};
    }
    .handsontable-${
      isDarkMode ? "dark" : "light"
    } .handsontable tbody tr:hover {
      background-color: ${themeStyles.rowHighlight};
    }
    .handsontable-${
      isDarkMode ? "dark" : "light"
    } .handsontable tbody tr:nth-child(even) {
      background-color: ${isDarkMode ? "#2D3748" : "#F9FAFB"};
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .cell-tooltip {
      position: relative;
    }
    .handsontable-${isDarkMode ? "dark" : "light"} .cell-tooltip:hover:after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 0;
      background: ${isDarkMode ? "#4B5563" : "#374151"};
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      white-space: normal;
      max-width: 200px;
      z-index: 1000;
    }
    .cell-content-ellipsis {
      max-width: 80px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    /* Custom dropdown styling */
    .custom-dropdown {
      background-color: ${isDarkMode ? "#2D3748" : "#FFFFFF"};
      color: ${isDarkMode ? "#E5E7EB" : "#111827"};
      border: 1px solid ${isDarkMode ? "#4B5563" : "#D1D5DB"};
      font-size: 12px;
    }
    /* Two-line header styles */
    .two-line-header {
      width: 100%;
      height: 100%;
      white-space: normal;
    }
    .two-line-header-top, .two-line-header-bottom {
      display: block;
      text-align: center;
    }
  `;
  document.head.appendChild(styleEl);
  
  return styleEl;
};

// export const createTableStyles = (isDarkMode) => {
//   const themeStyles = isDarkMode
//     ? {
//         // Dark theme
//         background: "#1a1a2e",
//         text: "#e6e6e6",
//         headerBg: "#16213e",
//         headerText: "#ffffff",
//         headerHover: "#0f3460",
//         rowHighlight: "#2a2a4a",
//         border: "#3a3a5a",
//         dropdownBg: "#1e1e3d",
//         dropdownText: "#f8f8f8",
//         dropdownHover: "#2d2d5d",
//         scrollbar: "#4a4a6a",
//         scrollbarHover: "#5a5a7a",
//         stripedRow: "#232340"
//       }
//     : {
//         // Light theme
//         background: "#ffffff",
//         text: "#333333",
//         headerBg: "#f0f2f5",
//         headerText: "#2d3748",
//         headerHover: "#e2e8f0",
//         rowHighlight: "#f8fafc",
//         border: "#e2e8f0",
//         dropdownBg: "#ffffff",
//         dropdownText: "#4a5568",
//         dropdownHover: "#edf2f7",
//         scrollbar: "#cbd5e0",
//         scrollbarHover: "#a0aec0",
//         stripedRow: "#f9fafb"
//       };

//   const styleEl = document.createElement("style");
//   styleEl.innerHTML = `
//     /* Base table styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable {
//       background-color: ${themeStyles.background};
//       color: ${themeStyles.text};
//       font-size: 13px;
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//     }

//     /* Header styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable th {
//       background-color: ${themeStyles.headerBg} !important;
//       color: ${themeStyles.headerText} !important;
//       border-color: ${themeStyles.border} !important;
//       font-weight: 400;
//       vertical-align: middle;
//       text-align: left;
//       font-size: 12px !important;
//       line-height: 1.3 !important;
//       padding: 8px 10px !important;
//       white-space: nowrap;
//       position: sticky;
//       top: 0;
//       z-index: 5;
//       transition: background-color 0.2s;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable th:hover {
//       background-color: ${themeStyles.headerHover} !important;
//     }

//     /* Cell styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable td {
//       background-color: ${themeStyles.background};
//       color: ${themeStyles.text};
//       border-color: ${themeStyles.border};
//       padding: 6px 10px !important;
//       height: auto !important;
//       font-size: 13px;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//       vertical-align: middle;
//     }

//     /* Row highlighting */
//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable .current {
//       background-color: ${themeStyles.rowHighlight} !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable tbody tr:hover {
//       background-color: ${themeStyles.rowHighlight} !important;
//     }

//     /* Striped rows */
//     .handsontable-${isDarkMode ? "dark" : "light"} .handsontable tbody tr:nth-child(even) {
//       background-color: ${themeStyles.stripedRow} !important;
//     }

//     /* Dropdown menu styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} .htDropdownMenu {
//       background-color: ${themeStyles.dropdownBg} !important;
//       color: ${themeStyles.dropdownText} !important;
//       border: 1px solid ${themeStyles.border} !important;
//       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//       border-radius: 4px;
//       padding: 4px 0;
//       max-height: 300px !important;
//       overflow-y: auto !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htDropdownMenu table {
//       background-color: transparent !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htDropdownMenu td {
//       padding: 8px 12px !important;
//       color: ${themeStyles.dropdownText} !important;
//       background-color: transparent !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htDropdownMenu td:hover {
//       background-color: ${themeStyles.dropdownHover} !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htDropdownMenu td.current {
//       background-color: ${themeStyles.rowHighlight} !important;
//     }

//     /* Scrollbar styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} ::-webkit-scrollbar {
//       width: 8px;
//       height: 8px;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} ::-webkit-scrollbar-track {
//       background: ${themeStyles.background};
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} ::-webkit-scrollbar-thumb {
//       background: ${themeStyles.scrollbar};
//       border-radius: 4px;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} ::-webkit-scrollbar-thumb:hover {
//       background: ${themeStyles.scrollbarHover};
//     }

//     /* Context menu styles */
//     .handsontable-${isDarkMode ? "dark" : "light"} .htContextMenu {
//       background-color: ${themeStyles.dropdownBg} !important;
//       border: 1px solid ${themeStyles.border} !important;
//       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htContextMenu table tbody tr td {
//       color: ${themeStyles.dropdownText} !important;
//       padding: 8px 12px !important;
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .htContextMenu table tbody tr td:hover {
//       background-color: ${themeStyles.dropdownHover} !important;
//     }

//     /* Frozen columns border */
//     .handsontable-${isDarkMode ? "dark" : "light"} .ht_clone_left .wtBorder {
//       border-right: 2px solid ${themeStyles.border} !important;
//     }

//     /* Responsive adjustments */
//     @media (max-width: 768px) {
//       .handsontable-${isDarkMode ? "dark" : "light"} .handsontable th {
//         font-size: 11px !important;
//         padding: 6px 8px !important;
//       }
      
//       .handsontable-${isDarkMode ? "dark" : "light"} .handsontable td {
//         font-size: 12px !important;
//         padding: 5px 8px !important;
//       }
//     }

//     /* Loading indicator */
//     @keyframes spin {
//       0% { transform: rotate(0deg); }
//       100% { transform: rotate(360deg); }
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .loading-indicator {
//       position: absolute;
//       top: 50%;
//       left: 50%;
//       transform: translate(-50%, -50%);
//       z-index: 100;
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       background-color: ${isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'};
//       padding: 12px 16px;
//       border-radius: 6px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//     }

//     .handsontable-${isDarkMode ? "dark" : "light"} .loading-spinner {
//       border: 3px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
//       border-top: 3px solid ${isDarkMode ? '#ffffff' : '#1976d2'};
//       border-radius: 50%;
//       width: 20px;
//       height: 20px;
//       animation: spin 1s linear infinite;
//     }
//   `;
  
//   document.head.appendChild(styleEl);
//   return styleEl;
// };

// export const createTableStyles = (isDarkMode) => {
//   const themeStyles = isDarkMode ? {
//     headerBg: "#1a237e",
//     headerText: "#ffffff",
//     headerHover: "#303f9f"
//   } : {
//     headerBg: "#1976d2",
//     headerText: "#ffffff",
//     headerHover: "#2196f3"
//   };

//   const styleEl = document.createElement("style");
//   styleEl.innerHTML = `
//     /* Header styles */
//     .handsontable th {
//       background-color: ${themeStyles.headerBg} !important;
//       color: ${themeStyles.headerText} !important;
//       font-weight: 600 !important;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//       font-size: 11px !important;
//       padding: 8px 4px !important;
//       border-bottom: 2px solid ${isDarkMode ? '#303f9f' : '#64b5f6'} !important;
//       position: sticky;
//       top: 0;
//       z-index: 5;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
    
//     .handsontable th:hover {
//       background-color: ${themeStyles.headerHover} !important;
//     }
    
//     /* Column resize handle */
//     .ht_clone_top .wtHider .ht_master .wtHolder {
//       overflow: visible !important;
//     }
    
//     .ht_master .wtHider {
//       overflow: visible !important;
//     }
    
//     /* Dropdown styles */
//     .htDropdownMenu {
//       max-height: 300px !important;
//       overflow-y: auto !important;
//       z-index: 10000 !important;
//       box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//       border: 1px solid ${isDarkMode ? '#555' : '#ddd'};
//     }
    
//     .htDropdownMenu table {
//       background: ${isDarkMode ? '#333' : '#fff'};
//     }
    
//     .htDropdownMenu td {
//       padding: 6px 10px !important;
//       border-bottom: 1px solid ${isDarkMode ? '#444' : '#eee'};
//     }
    
//     .htDropdownMenu td.current {
//       background: ${isDarkMode ? '#1976d2' : '#e3f2fd'} !important;
//     }
    
//     /* Frozen columns border */
//     .ht_clone_left .wtBorder {
//       border-right: 2px solid ${isDarkMode ? '#555' : '#ddd'};
//     }
//   `;
  
//   document.head.appendChild(styleEl);
//   return styleEl;
// };

// Format headers for display
export const formatHeaderDisplay = (headers) => {
  return headers.map(header => {
    // Keep short headers as is
    if (header === "☑" || header.length <= 3) return header;

    const headerMapping = {
      caseId: "Case Id",
      attachments:"Attachments",
      updatedProductName: "Updated Product Name",
      remarks: "Remarks",
      name: "Name",
      details: "Details",
      details1: "Details 1",
      priority: "Priority",
      correctUPN: "Correct UPN",
      product: "Product",
      accountNumberDigit: "Account Number Digit",
      requirement: "Requirement",
      updatedRequirement: "Updated Requirement",
      accountNumber: "Account Number",
      bankCode: "Bank Code",
      clientCode: "Client Code",
      vendorName: "Vendor Name",
      dateIn: "Date In",
      dateOutInDay:"Date Out In Day",
      sentDateInDay:"Sent Date In Day",
      vendorStatus:"Vendor Status",
      dateInDate: "Date In Date",
      isRechecked:"Is Rechecked",
      status: "Status",
      caseStatus: "Case Status",
      productType: "Product Type",
      listByEmployee: "List By Employee",
      dateOut: "Date Out",
      sentBy: "Sent By",
      autoOrManual: "Auto or Manual",
      caseDoneBy: "Case Done By",
      clientTAT: "Client TAT",
      customerCare: "Customer Care",
      sentDate: "Sent Date",
      clientType: "Client Type",
      dedupBy: "Dedup By",
      ipAddress:"IP Address"
    };     
    
    return headerMapping[header] || header;
  });
};

// Get column widths based on content
export const getColumnWidths = (headers) => {
  return headers.map(header => {
    if (header === "☑") return 30; // Checkbox column
    if (["id", "status"].includes(header)) return 60; // Narrow columns
    return 80; // Default width for all other columns
  });
};