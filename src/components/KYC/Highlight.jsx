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