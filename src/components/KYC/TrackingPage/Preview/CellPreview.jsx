import React from 'react';

const CellPreview = ({
  selectedCellInfo,
  editingCellValue,
  handleCellValueChange,
  saveCellValue,
  isDarkMode
}) => {
  if (!selectedCellInfo) return null;

  return (
    <div className={`mb-2 border rounded p-2 ${isDarkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"}`}>
      <div className="flex justify-between items-center mb-1">
        <div className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          {selectedCellInfo.header}
        </div>
        {selectedCellInfo.isEditable && (
          <button 
            onClick={saveCellValue} 
            className={`px-2 py-0.5 text-xs font-medium rounded ${
              isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={editingCellValue === selectedCellInfo.value}
          >
            Save
          </button>
        )}
      </div>
      {selectedCellInfo.isEditable ? (
        <textarea
          className={`w-full p-1 rounded border ${
            isDarkMode 
              ? "bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500" 
              : "bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500"
          }`}
          value={editingCellValue}
          onChange={handleCellValueChange}
          rows={2}
          style={{ resize: "vertical", minHeight: "60px" }}
        />
      ) : (
        <div className="cell-preview-content p-1 max-h-24 overflow-y-auto whitespace-pre-wrap word-break-word">
  {typeof selectedCellInfo.value === 'object' && selectedCellInfo.value !== null ? (
    <pre className="text-xs text-gray-500">{JSON.stringify(selectedCellInfo.value, null, 2)}</pre>
  ) : (
    selectedCellInfo.value || <span className="text-gray-400 italic text-xs">No data</span>
  )}
</div>

      )}
    </div>
  );
};

// Add preview-related styles
export const addCellPreviewStyles = () => {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .cell-preview-content {
      font-size: 13px;
      word-break: break-word;
    }
    
    /* Word breaking in preview */
    .word-break-word {
      word-break: break-word;
    }
    
    /* Preview area styles */
    textarea:focus {
      outline: none;
      border-color: #4b89ff;
      box-shadow: 0 0 0 2px rgba(75, 137, 255, 0.25);
    }
  `;
  document.head.appendChild(styleEl);
  return styleEl;
};

export default CellPreview;