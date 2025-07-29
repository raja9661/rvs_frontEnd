import React, { useState } from "react";

const CopyFieldsModal = ({ headers, onClose, onSelectFields, isDarkMode }) => {
  const [selectedFields, setSelectedFields] = useState([]);

  const formatHeaderDisplay = (header) => {
    if (!header) return '';
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  const toggleField = (field, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
      <div className={`rounded-lg shadow-xl w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Fields to Copy
          </h3>
        </div>
        
        <div className={`p-4 max-h-96 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="space-y-2">
            {headers
              .filter(header => !['_id', 'caseId', 'dedupBy'].includes(header))
              .map(header => (
                <label 
                  key={header} 
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedFields.includes(header)
                      ? isDarkMode 
                        ? 'bg-blue-700' 
                        : 'bg-blue-100'
                      : isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(header)}
                    onChange={(e) => toggleField(header, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={`mr-2 ${isDarkMode ? 'accent-blue-500' : ''}`}
                  />
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                    {formatHeaderDisplay(header)}
                  </span>
                </label>
              ))}
          </div>
        </div>
        
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-2`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSelectFields(selectedFields)}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={selectedFields.length === 0}
          >
            Select {selectedFields.length} Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyFieldsModal;





// import React, { useEffect, useState, useMemo, useCallback } from "react";

// const CopyFieldsModal = ({ headers, onClose, onSelectFields, isDarkMode }) => {
//   const [selectedFields, setSelectedFields] = useState([]);

//   const formatHeaderDisplay = (header) => {
//     if (!header) return '';
    
    
//     // Simple formatting - you can expand this as needed
//     return header
//       .replace(/([A-Z])/g, ' $1') // Add space before capital letters
//       .replace(/_/g, ' ') // Replace underscores with spaces
//       .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
//       .trim();
//   };
  
//   const toggleField = (field) => {
//     setSelectedFields(prev => 
//       prev.includes(field) 
//         ? prev.filter(f => f !== field)
//         : [...prev, field]
//     );
//   };
  
//   return (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
//       <div className={`rounded-lg shadow-xl w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
//         <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//           <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             Select Fields to Copy
//           </h3>
//         </div>
        
//         <div className={`p-4 max-h-96 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
//           <div className="space-y-2">
//             {headers
//               .filter(header => !['_id', 'caseId',  'dedupBy'].includes(header))
//               .map(header => (
//                 <div 
//                   key={header} 
//                   className={`flex items-center p-2 rounded cursor-pointer ${
//                     selectedFields.includes(header)
//                       ? isDarkMode 
//                         ? 'bg-blue-700' 
//                         : 'bg-blue-100'
//                       : isDarkMode 
//                         ? 'hover:bg-gray-700' 
//                         : 'hover:bg-gray-100'
//                   }`}
//                   onClick={() => toggleField(header)}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedFields.includes(header)}
//                     onChange={() => toggleField(header)}
//                     className={`mr-2 ${isDarkMode ? 'accent-blue-500' : ''}`}
//                   />
//                   <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
//                     {formatHeaderDisplay(header)}
//                   </span>
//                 </div>
//               ))}
//           </div>
//         </div>
        
//         <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-2`}>
//           <button
//             onClick={onClose}
//             className={`px-4 py-2 rounded-md ${
//               isDarkMode 
//                 ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onSelectFields(selectedFields)}
//             className={`px-4 py-2 rounded-md ${
//               isDarkMode 
//                 ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                 : 'bg-blue-500 text-white hover:bg-blue-600'
//             }`}
//             disabled={selectedFields.length === 0}
//           >
//             Select {selectedFields.length} Fields
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CopyFieldsModal;