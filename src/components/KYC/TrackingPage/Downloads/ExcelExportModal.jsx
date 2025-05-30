

// import { useState, useEffect } from "react";

// const ExcelExportModal = ({
//   isOpen,
//   onClose,
//   headers,
//   initialSelectedColumns,
//   isDarkMode,
// }) => {
//   const [selectedColumns, setSelectedColumns] = useState(initialSelectedColumns);
//   const [exportFormat, setExportFormat] = useState("excel"); // Default to excel

//   // These columns will be selected by default
//   const defaultSelectedColumns = ['updatedProductName', 'accountNumber','requirement'];

//   useEffect(() => {
//     if (isOpen) {
//       // Merge default columns with any initially selected columns
//       const mergedColumns = [...new Set([
//         ...defaultSelectedColumns,
//         ...initialSelectedColumns
//       ].filter(col => headers.includes(col)))];
//       setSelectedColumns(mergedColumns);

//       // Prevent background scrolling when modal is open
//       document.body.style.overflow = 'hidden';
//     } else {
//       // Restore scrolling when modal is closed
//       document.body.style.overflow = 'auto';
//     }

//     // Cleanup function to ensure scroll is restored
//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, [isOpen, initialSelectedColumns, headers]);

//   const toggleColumn = (header) => {
//     setSelectedColumns((prev) =>
//       prev.includes(header)
//         ? prev.filter((h) => h !== header)
//         : [...prev, header]
//     );
//   };
  
//   const toggleAllColumns = (selectAll) => {
//     setSelectedColumns(selectAll ? [...headers] : []);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0    flex items-center justify-center z-[9999] p-4" style={{ backdropFilter: 'blur(2px)' }}>
//       <div
//         className={`p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col ${
//           isDarkMode ? "bg-gray-800" : "bg-white"
//         } relative`}
//       >
//         {/* Close button in the top-right corner */}
//         <button 
//           onClick={() => onClose(false)} 
//           className={`absolute top-2 right-2 rounded-full p-1 hover:bg-opacity-80 ${
//             isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-200"
//           }`}
//           aria-label="Close"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//           </svg>
//         </button>

//         <h2
//           className={`text-lg font-semibold mb-4 ${
//             isDarkMode ? "text-white" : "text-gray-800"
//           }`}
//         >
//           Export Options
//         </h2>
        
//         {/* Export format selection */}
// <div className="mb-4">
//   <label className={`block mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
//     Export Format:
//   </label>
//   <div className="flex space-x-4">
//     {['excel','csv', 'text'].map((format) => (
//       <label key={format} className="flex items-center">
//         <input
//           type="radio"
//           name="exportFormat"
//           value={format}
//           checked={exportFormat === format}
//           onChange={() => setExportFormat(format)}
//           className="mr-2"
//         />
//         <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
//           {format.toUpperCase()}
//         </span>
//       </label>
//     ))}
//   </div>
// </div>

//         {/* Column selection */}
//         <div className="mb-4 flex items-center">
//           <input
//             type="checkbox"
//             id="select-all-columns"
//             checked={selectedColumns.length === headers.length}
//             onChange={(e) => toggleAllColumns(e.target.checked)}
//             className={`mr-2 ${isDarkMode ? "accent-blue-500" : ""}`}
//           />
//           <label
//             htmlFor="select-all-columns"
//             className={isDarkMode ? "text-gray-200" : "text-gray-700"}
//           >
//             Select All Columns
//           </label>
//         </div>

//         <div className={`flex-1 overflow-y-auto pr-2 mb-4 ${
//           isDarkMode ? "scrollbar-dark" : "scrollbar-light"
//         }`}>
//           <div className="grid grid-cols-1 gap-2">
//             {headers.map((header) => (
//               <div key={header} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id={`col-${header}`}
//                   checked={selectedColumns.includes(header)}
//                   onChange={() => toggleColumn(header)}
//                   className={`mr-2 ${isDarkMode ? "accent-blue-500" : ""}`}
//                 />
//                 <label
//                   htmlFor={`col-${header}`}
//                   className={isDarkMode ? "text-gray-200" : "text-gray-700"}
//                 >
//                   {header}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex justify-end space-x-3 mt-2">
//           <button
//             onClick={() => onClose(false)}
//             className={`px-4 py-2 rounded transition-colors ${
//               isDarkMode
//                 ? "bg-gray-600 hover:bg-gray-700 text-white"
//                 : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//             }`}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onClose(true, selectedColumns, exportFormat)}
//             className={`px-4 py-2 rounded transition-colors ${
//               isDarkMode
//                 ? "bg-blue-600 hover:bg-blue-700 text-white"
//                 : "bg-blue-500 hover:bg-blue-600 text-white"
//             } ${selectedColumns.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
//             disabled={selectedColumns.length === 0}
//           >
//             Export ({selectedColumns.length})
//           </button>
//         </div>

//         {/* Custom scrollbar styles */}
//         <style jsx global>{`
//           .scrollbar-dark::-webkit-scrollbar {
//             width: 8px;
//           }
//           .scrollbar-dark::-webkit-scrollbar-track {
//             background: #374151;
//             border-radius: 4px;
//           }
//           .scrollbar-dark::-webkit-scrollbar-thumb {
//             background: #4B5563;
//             border-radius: 4px;
//           }
//           .scrollbar-dark::-webkit-scrollbar-thumb:hover {
//             background: #6B7280;
//           }
          
//           .scrollbar-light::-webkit-scrollbar {
//             width: 8px;
//           }
//           .scrollbar-light::-webkit-scrollbar-track {
//             background: #F3F4F6;
//             border-radius: 4px;
//           }
//           .scrollbar-light::-webkit-scrollbar-thumb {
//             background: #D1D5DB;
//             border-radius: 4px;
//           }
//           .scrollbar-light::-webkit-scrollbar-thumb:hover {
//             background: #9CA3AF;
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// export default ExcelExportModal;


import React, { useState, useEffect } from "react";

const ExcelExportModal = ({
  isOpen,
  onClose,
  headers,
  initialSelectedColumns,
  isDarkMode,
}) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [exportFormat, setExportFormat] = useState("excel");

  //  These columns will be selected by default
  const defaultSelectedColumns = ['updatedProductName', 'accountNumber','requirement'];

  useEffect(() => {
    if (isOpen) {
      // Merge default columns with any initially selected columns
      const mergedColumns = [...new Set([
        ...defaultSelectedColumns,
        ...initialSelectedColumns
      ].filter(col => headers.includes(col)))];
      setSelectedColumns(mergedColumns);

      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to ensure scroll is restored
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialSelectedColumns, headers]);

  const handleColumnToggle = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedColumns(headers.filter((h) => h !== "☑"));
    } else {
      setSelectedColumns([]);
    }
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      alert("Please select at least one column to export");
      return;
    }
    onClose(true, selectedColumns, exportFormat);
  };

  if (!isOpen) return null;

  // Original styling
  const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '5% 0',
    zIndex: 9999,
  };

  return (
    <div style={modalBackdropStyle}>
      <div className={`p-6 rounded-lg shadow-lg w-96 relative ${
        isDarkMode ? "bg-gray-700" : "bg-white"
      }`}>
        <button 
          onClick={() => onClose(false)} 
          className={`absolute top-2 right-2 text-xl ${
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          ✖
        </button>

        <h2 className={`text-xl font-bold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}>
          Export Data
        </h2>

        <div className="space-y-4">
          <div>
            <label className={`block mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className={`w-full border p-2 rounded ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="text">Text (.txt)</option>
            </select>
          </div>

          <div>
            <label className={`flex items-center mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              <input
                type="checkbox"
                checked={selectedColumns.length === headers.filter(h => h !== "☑").length}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Select All Columns
            </label>

            <div className={`max-h-60 overflow-y-auto border rounded ${
              isDarkMode ? "border-gray-600" : "border-gray-300"
            }`}>
              {headers
                .filter((h) => h !== "☑")
                .map((header) => (
                  <label
                    key={header}
                    className={`flex items-center p-2 border-b ${
                      isDarkMode 
                        ? "border-gray-600 hover:bg-gray-600" 
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(header)}
                      onChange={() => handleColumnToggle(header)}
                      className="mr-2"
                    />
                    <span className={isDarkMode ? "text-gray-200" : "text-gray-800"}>
                      {header}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => onClose(false)}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className={`px-4 py-2 rounded ${
              isDarkMode
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelExportModal;