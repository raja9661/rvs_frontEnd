import React from 'react';

const Pagination = ({ 
  pagination, 
  handlePageChange,
  isDarkMode,
  setendItem,
  setstartItem
}) => {
  const { page, pageSize, total, totalPages } = pagination;

  // Generate page numbers (same as before)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Calculate item range
 
  setstartItem(total > 0 ? (page - 1) * pageSize + 1 : 0)
  setendItem(Math.min(page * pageSize, total))

  return (
    <div className={`flex items-center justify-between mt-4 ${
      isDarkMode ? "text-gray-200" : "text-gray-800"
    }`}>
      <div className="flex items-center gap-1">
        <button
          className={`p-2 rounded ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          } ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        >
          &laquo;
        </button>
        <button
          className={`p-2 rounded ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          } ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          &lt;
        </button>
        
        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3">...</span>
          ) : (
            <button
              key={`page-${pageNum}`}
              className={`p-2 min-w-[40px] rounded ${
                page === pageNum 
                  ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                  : (isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200")
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          )
        ))}
        
        <button
          className={`p-2 rounded ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          } ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          &gt;
        </button>
        <button
          className={`p-2 rounded ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          } ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        >
          &raquo;
        </button>
      </div>
      
      {/* <div className="text-sm">
        {total > 0 ? (
          <span>
            Showing <span className="font-medium">{startItem}-{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> items
          </span>
        ) : (
          'No items to display'
        )}
      </div> */}
    </div>
  );
};

// const Pagination = ({ 
//   currentPage, 
//   totalPages, 
//   totalItems, 
//   pageSize, 
//   handlePageChange, 
//   isDarkMode 
// }) => {
//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;
    
//     if (totalPages <= maxVisiblePages) {
//       // Show all pages if there are few
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       // Show a subset of pages with ellipses
//       if (currentPage <= 3) {
//         // Near the start
//         for (let i = 1; i <= 4; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push('...');
//         pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         // Near the end
//         pageNumbers.push(1);
//         pageNumbers.push('...');
//         for (let i = totalPages - 3; i <= totalPages; i++) {
//           pageNumbers.push(i);
//         }
//       } else {
//         // In the middle
//         pageNumbers.push(1);
//         pageNumbers.push('...');
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push('...');
//         pageNumbers.push(totalPages);
//       }
//     }
    
//     return pageNumbers;
//   };

//   // Calculate total items and current range
//   const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
//   const endItem = Math.min(currentPage * pageSize, totalItems);

//   return (
//     <div 
//       className={`custom-pagination ${
//         isDarkMode ? "text-gray-200" : "text-gray-800"
//       }`}
//     >
//       <button
//         className={`pagination-button ${
//           isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
//         } ${currentPage === 1 ? "disabled" : ""}`}
//         onClick={() => handlePageChange(1)}
//         disabled={currentPage === 1}
//       >
//         &laquo;
//       </button>
//       <button
//         className={`pagination-button ${
//           isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
//         } ${currentPage === 1 ? "disabled" : ""}`}
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         &lt;
//       </button>
      
//       {getPageNumbers().map((page, index) => (
//         page === '...' ? (
//           <span key={`ellipsis-${index}`} className="mx-1">...</span>
//         ) : (
//           <button
//             key={`page-${page}`}
//             className={`pagination-button ${
//               currentPage === page ? "active" :
//               isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
//             }`}
//             onClick={() => handlePageChange(page)}
//           >
//             {page}
//           </button>
//         )
//       ))}
      
//       <button
//         className={`pagination-button ${
//           isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
//         } ${currentPage === totalPages ? "disabled" : ""}`}
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         &gt;
//       </button>
//       <button
//         className={`pagination-button ${
//           isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
//         } ${currentPage === totalPages ? "disabled" : ""}`}
//         onClick={() => handlePageChange(totalPages)}
//         disabled={currentPage === totalPages}
//       >
//         &raquo;
//       </button>
      
//       <div className="pagination-info">
//         {totalItems > 0 ? 
//           `Showing ${startItem}-${endItem} of ${totalItems} items` : 
//           'No items to display'
//         }
//       </div>
//     </div>
//   );
// };

// Add pagination styles to document
export const addPaginationStyles = () => {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .pagination-button {
      padding: 4px 12px; /* Smaller buttons */
      margin: 0 2px;
      border-radius: 4px;
      font-size: 12px;
      font-weight:600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pagination-button.active {
      background-color: #3B82F6;
      color: white;
      font-weight: bold;
    }
    .pagination-button:hover:not(.active):not(.disabled) {
      background-color: #374151;
      color:#fff;
    }
    .pagination-button.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .custom-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 8px;
      user-select: none;
    }
    .pagination-info {
      margin: 0 12px;
      font-size: 13px;
      font-weight:600;
    }
  `;
  document.head.appendChild(styleEl);
  return styleEl;
};

export default Pagination;