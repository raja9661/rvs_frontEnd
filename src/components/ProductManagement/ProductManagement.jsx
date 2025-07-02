// // import React, { useState, useEffect } from 'react';
// // import ReactPaginate from 'react-paginate';
// // import Layout from '../Layout/Layout';
// // import axios from "axios";


// // const ProductManagement = () => {
// //   const [productName, setProductName] = useState('');
// //   const [updatedProduct, setUpdatedProduct] = useState('');
// //   const [correctUPN, setCorrectUPN] = useState('');
// //   const [productType, setProductType] = useState('');
// //   const [products, setProducts] = useState([]);
// //   const [warning, setWarning] = useState('');
// //   const [editProductId, setEditProductId] = useState(null);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [pageCount, setPageCount] = useState(0);
// //   const [currentPage, setCurrentPage] = useState(0);
// //   const limit = 20; // Number of products per page

// //   // Fetch products with search and pagination
// //   const fetchProducts = async (page = 1, search = '') => {
// //     try {
// //       const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getall?page=${page}&limit=${limit}&search=${search}`);
// //       const data = await response.json();
// //       setProducts(data.products);
// //       setPageCount(data.totalPages);
// //       setCurrentPage(data.currentPage - 1); // react-paginate uses zero-based index
// //     } catch (error) {
// //       console.error('Error fetching products:', error);
// //     }
// //   };
// //   // Fetch products on component mount and when search query changes
// //   useEffect(() => {
// //     fetchProducts(1, searchQuery);
// //   }, [searchQuery]);

// //   // Handle page change
// //   const handlePageClick = (event) => {
// //     fetchProducts(event.selected + 1, searchQuery);
// //   };

// //   // Add or update a product
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     const productData = {
// //       productName,
// //       updatedProduct,
// //       correctUPN,
// //       productType,
// //     };

// //     try {
// //       let response;
// //       if (editProductId) {
// //         // Update existing product
// //         response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/edit/${editProductId}`, {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify(productData),
// //         });
// //       } else {
// //         // Add new product
// //         response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/add`, {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify(productData),
// //         });
// //       }

// //       const result = await response.json();
// //       if (response.ok) {
// //         setWarning('');
// //         fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
// //         clearInputFields();
// //         setEditProductId(null); // Reset edit mode
// //       } else {
// //         setWarning(result.message);
// //       }
// //     } catch (error) {
// //       console.error('Error submitting product:', error);
// //     }
// //   };

// //   // Edit a product
// //   const handleEdit = (product) => {
// //     setProductName(product.productName);
// //     setUpdatedProduct(product.updatedProduct);
// //     setCorrectUPN(product.correctUPN);
// //     setProductType(product.productType);
// //     setEditProductId(product._id); // Set the product ID being edited
// //   };

// //   // Delete a product
// //   const handleDelete = async (id) => {
// //     try {
// //       const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/delete/${id}`, {
// //         method: 'DELETE',
// //       });
// //       const result = await response.json();
// //       if (response.ok) {
// //         fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
// //       } else {
// //         console.error('Error deleting product:', result.message);
// //       }
// //     } catch (error) {
// //       console.error('Error deleting product:', error);
// //     }
// //   };

// //   // Clear input fields
// //   const clearInputFields = () => {
// //     setProductName('');
// //     setUpdatedProduct('');
// //     setCorrectUPN('');
// //     setProductType('');
// //   };

// //   return (
// //     <Layout>
// //       <div className="container mx-auto p-4">
// //       {/* <h1 className="text-3xl font-bold text-center mb-6">Product Management</h1> */}

// //       {/* Add/Edit Product Form */}
// //       <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
// //         <h2 className="text-xl font-semibold mb-4">{editProductId ? 'Edit Product' : 'Add Product'}</h2>
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //           <div>
// //             <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
// //             <input
// //               type="text"
// //               value={productName}
// //               onChange={(e) => setProductName(e.target.value)}
// //               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-gray-700 text-sm font-bold mb-2">Updated Product</label>
// //             <input
// //               type="text"
// //               value={updatedProduct}
// //               onChange={(e) => setUpdatedProduct(e.target.value)}
// //               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-gray-700 text-sm font-bold mb-2">Correct UPN</label>
// //             <input
// //               type="text"
// //               value={correctUPN}
// //               onChange={(e) => setCorrectUPN(e.target.value)}
// //               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-gray-700 text-sm font-bold mb-2">Product Type</label>
// //             <input
// //               type="text"
// //               value={productType}
// //               onChange={(e) => setProductType(e.target.value)}
// //               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
// //               required
// //             />
// //           </div>
// //         </div>
// //         <div className="flex justify-end mt-4">
// //           <button
// //             type="submit"
// //             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
// //           >
// //             {editProductId ? 'Update Product' : 'Add Product'}
// //           </button>
// //         </div>
// //       </form>

// //       {/* Display warning if any */}
// //       {warning && <p className="text-red-500 text-center mb-4">{warning}</p>}

// //       {/* Search Bar */}
// //       <div className="mb-4">
// //         <input
// //           type="text"
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)}
// //           placeholder="Search products..."
// //           className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
// //         />
// //       </div>


// //       {/* Product List */}
// //       <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
// //         <h2 className="text-xl font-semibold mb-4">Product List</h2>
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full bg-white">
// //             <thead>
// //               <tr>
// //                 <th className="py-2 px-4 border-b">Product Name</th>
// //                 <th className="py-2 px-4 border-b">Updated Product</th>
// //                 <th className="py-2 px-4 border-b">Correct UPN</th>
// //                 <th className="py-2 px-4 border-b">Product Type</th>
// //                 <th className="py-2 px-4 border-b">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {products.map((product) => (
// //                 <tr key={product._id} className="hover:bg-gray-100">
// //                   <td className="py-2 px-4 border-b">{product.productName}</td>
// //                   <td className="py-2 px-4 border-b">{product.updatedProduct}</td>
// //                   <td className="py-2 px-4 border-b">{product.correctUPN}</td>
// //                   <td className="py-2 px-4 border-b">{product.productType}</td>
// //                   <td className="py-2 px-4 border-b">
// //                     <button
// //                       onClick={() => handleEdit(product)}
// //                       className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
// //                     >
// //                       Edit
// //                     </button>
// //                     <button
// //                       onClick={() => handleDelete(product._id)}
// //                       className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
// //                     >
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* Pagination */}
// //         <ReactPaginate
// //           previousLabel={'Previous'}
// //           nextLabel={'Next'}
// //           breakLabel={'...'}
// //           pageCount={pageCount}
// //           marginPagesDisplayed={2}
// //           pageRangeDisplayed={5}
// //           onPageChange={handlePageClick}
// //           containerClassName={'flex justify-center mt-4'}
// //           activeClassName={'bg-blue-500 text-white'}
// //           pageClassName={'mx-1 px-3 py-1 border rounded'}
// //           previousClassName={'mx-1 px-3 py-1 border rounded'}
// //           nextClassName={'mx-1 px-3 py-1 border rounded'}
// //           disabledClassName={'opacity-50 cursor-not-allowed'}
// //         />
// //       </div>
// //     </div>
// //     </Layout>
// //   );
// // };

// // export default ProductManagement;

// /////////////////////////////////////////////////////////////////////////////////////////updated code UI/////////////////////////

// import React, { useState, useEffect } from 'react';
// import ReactPaginate from 'react-paginate';
// import Layout from '../Layout/Layout';
// import { FileText, Package, Search, Edit2, Trash2, Plus, RefreshCcw } from 'lucide-react';

// const ProductManagement = () => {
//   const [productName, setProductName] = useState('');
//   const [updatedProduct, setUpdatedProduct] = useState('');
//   const [correctUPN, setCorrectUPN] = useState('');
//   const [productType, setProductType] = useState('');
//   const [products, setProducts] = useState([]);
//   const [warning, setWarning] = useState('');
//   const [editProductId, setEditProductId] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [pageCount, setPageCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(0);
//   const limit = 20; // Number of products per page
  
//   // Get theme from localStorage (synced with Layout component)
//   const [isDarkMode, setIsDarkMode] = useState(false);
  
//   useEffect(() => {
//     // Check localStorage for theme
//     setIsDarkMode(localStorage.getItem("theme") === "dark");
    
//     // Listen for theme changes
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Fetch products with search and pagination
//   const fetchProducts = async (page = 1, search = '') => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getall?page=${page}&limit=${limit}&search=${search}`);
//       const data = await response.json();
//       setProducts(data.products);
//       setPageCount(data.totalPages);
//       setCurrentPage(data.currentPage - 1); // react-paginate uses zero-based index
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   };
  
//   // Fetch products on component mount and when search query changes
//   useEffect(() => {
//     fetchProducts(1, searchQuery);
//   }, [searchQuery]);

//   // Handle page change
//   const handlePageClick = (event) => {
//     fetchProducts(event.selected + 1, searchQuery);
//   };

//   // Add or update a product
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const productData = {
//       productName,
//       updatedProduct,
//       correctUPN,
//       productType,
//     };

//     try {
//       let response;
//       if (editProductId) {
//         // Update existing product
//         response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/edit/${editProductId}`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(productData),
//         });
//       } else {
//         // Add new product
//         response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/add`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(productData),
//         });
//       }

//       const result = await response.json();
//       if (response.ok) {
//         setWarning('');
//         fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
//         clearInputFields();
//         setEditProductId(null); // Reset edit mode
//       } else {
//         setWarning(result.message);
//       }
//     } catch (error) {
//       console.error('Error submitting product:', error);
//     }
//   };

//   // Edit a product
//   const handleEdit = (product) => {
//     setProductName(product.productName);
//     setUpdatedProduct(product.updatedProduct);
//     setCorrectUPN(product.correctUPN);
//     setProductType(product.productType);
//     setEditProductId(product._id); // Set the product ID being edited
//   };

//   // Delete a product
//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/delete/${id}`, {
//         method: 'DELETE',
//       });
//       const result = await response.json();
//       if (response.ok) {
//         fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
//       } else {
//         console.error('Error deleting product:', result.message);
//       }
//     } catch (error) {
//       console.error('Error deleting product:', error);
//     }
//   };

//   // Clear input fields
//   const clearInputFields = () => {
//     setProductName('');
//     setUpdatedProduct('');
//     setCorrectUPN('');
//     setProductType('');
//   };

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto space-y-4">
//         {/* Header */}
//         {/* <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-6 shadow-xl`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className={`text-2xl md:text-3xl font-bold ${
//                 isDarkMode ? 'text-blue-400' : 'text-blue-600'
//               }`}>Product Management</h2>
//               <p className={`mt-2 ${
//                 isDarkMode ? 'text-gray-400' : 'text-gray-600'
//               }`}>Manage and organize your product catalog efficiently</p>
//             </div>
//             <div className="mt-4 md:mt-0">
//               <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
//                 isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
//               }`}>
//                 <Package className={`w-5 h-5 mr-2 ${
//                   isDarkMode ? 'text-blue-400' : 'text-blue-500'
//                 }`} />
//                 <span className={`text-sm font-medium ${
//                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>Product Catalog</span>
//               </div>
//             </div>
//           </div>
//         </div> */}

//         {/* Add/Edit Product Form */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-6 shadow-xl`}>
//           <div className="flex items-center mb-4">
//             <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//             <h2 className={`text-xl font-semibold ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             }`}>{editProductId ? 'Edit Product' : 'Add Product'}</h2>
//           </div>
          
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Product Name
//                 </label>
//                 <input
//                   type="text"
//                   value={productName}
//                   onChange={(e) => setProductName(e.target.value)}
//                   className={`w-full px-4 py-2 rounded-lg border ${
//                     isDarkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                       : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                   } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Updated Product
//                 </label>
//                 <input
//                   type="text"
//                   value={updatedProduct}
//                   onChange={(e) => setUpdatedProduct(e.target.value)}
//                   className={`w-full px-4 py-2 rounded-lg border ${
//                     isDarkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                       : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                   } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Correct UPN
//                 </label>
//                 <input
//                   type="text"
//                   value={correctUPN}
//                   onChange={(e) => setCorrectUPN(e.target.value)}
//                   className={`w-full px-4 py-2 rounded-lg border ${
//                     isDarkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                       : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                   } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   Product Type
//                 </label>
//                 <input
//                   type="text"
//                   value={productType}
//                   onChange={(e) => setProductType(e.target.value)}
//                   className={`w-full px-4 py-2 rounded-lg border ${
//                     isDarkMode 
//                       ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                       : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                   } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
//                   required
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end mt-6 gap-3">
//               {editProductId && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     clearInputFields();
//                     setEditProductId(null);
//                   }}
//                   className={`flex items-center px-4 py-2 rounded-lg ${
//                     isDarkMode 
//                       ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                       : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                   } transition-colors`}
//                 >
//                   <RefreshCcw className="w-4 h-4 mr-2" />
//                   Cancel
//                 </button>
//               )}
//               <button
//                 type="submit"
//                 className={`flex items-center px-4 py-2 rounded-lg font-medium ${
//                   isDarkMode
//                     ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                     : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
//                 } transition-colors`}
//               >
//                 {editProductId ? (
//                   <>
//                     <Edit2 className="w-4 h-4 mr-2" />
//                     Update Product
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add Product
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Display warning if any */}
//         {warning && (
//           <div className={`${
//             isDarkMode 
//               ? 'bg-red-900/30 border border-red-700' 
//               : 'bg-red-50 border border-red-200'
//           } rounded-lg p-4 flex items-start`}>
//             <div className={`p-1 rounded-full ${isDarkMode ? 'bg-red-800' : 'bg-red-100'} mr-3 mt-0.5`}>
//               <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
//             </div>
//             <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{warning}</p>
//           </div>
//         )}

//         {/* Search and List Section */}
//         <div className={`${
//           isDarkMode 
//             ? 'bg-gray-800 border-gray-700' 
//             : 'bg-white/95 backdrop-blur-sm'
//         } rounded-lg p-6 shadow-xl`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//             <div className="flex items-center">
//               <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//               <h2 className={`text-xl font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>Product List</h2>
//             </div>
            
//             {/* Search Bar with icon */}
//             <div className="mt-4 md:mt-0 relative w-full md:w-64">
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                 <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
//               </div>
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search products..."
//                 className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
//                   isDarkMode 
//                     ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
//                     : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
//                 } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
//               />
//             </div>
//           </div>
          
//           {/* Product Table */}
//           <div className="overflow-x-auto">
//             <table className={`w-full border-collapse ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//               <thead>
//                 <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
//                   <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Product Name</th>
//                   <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Updated Product</th>
//                   <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Correct UPN</th>
//                   <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Product Type</th>
//                   <th className={`py-3 px-4 text-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {products.length > 0 ? (
//                   products.map((product) => (
//                     <tr 
//                       key={product._id} 
//                       className={`${
//                         isDarkMode 
//                           ? 'hover:bg-gray-700 border-gray-700' 
//                           : 'hover:bg-gray-50 border-gray-200'
//                       } transition-colors`}
//                     >
//                       <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.productName}</td>
//                       <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.updatedProduct}</td>
//                       <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.correctUPN}</td>
//                       <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.productType}</td>
//                       <td className={`py-3 px-4 border-b text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//                         <button
//                           onClick={() => handleEdit(product)}
//                           className={`inline-flex items-center mr-2 px-3 py-1 rounded ${
//                             isDarkMode 
//                               ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400' 
//                               : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
//                           } transition-colors`}
//                         >
//                           <Edit2 className="w-4 h-4 mr-1" />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(product._id)}
//                           className={`inline-flex items-center px-3 py-1 rounded ${
//                             isDarkMode 
//                               ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
//                               : 'bg-red-100 hover:bg-red-200 text-red-700'
//                           } transition-colors`}
//                         >
//                           <Trash2 className="w-4 h-4 mr-1" />
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td 
//                       colSpan="5" 
//                       className={`py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
//                     >
//                       No products found. Try a different search term or add a new product.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {pageCount > 0 && (
//             <ReactPaginate
//               previousLabel={
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </div>
//               }
//               nextLabel={
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               }
//               breakLabel={'...'}
//               pageCount={pageCount}
//               marginPagesDisplayed={1}
//               pageRangeDisplayed={3}
//               onPageChange={handlePageClick}
//               containerClassName={`flex justify-center items-center mt-6 gap-1`}
//               activeClassName={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
//               pageClassName={`px-3 py-1 rounded-md ${
//                 isDarkMode 
//                   ? 'text-gray-300 hover:bg-gray-700' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               } cursor-pointer transition-colors`}
//               previousClassName={`px-2 py-1 rounded-md ${
//                 isDarkMode 
//                   ? 'text-gray-300 hover:bg-gray-700' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               } cursor-pointer transition-colors`}
//               nextClassName={`px-2 py-1 rounded-md ${
//                 isDarkMode 
//                   ? 'text-gray-300 hover:bg-gray-700' 
//                   : 'text-gray-700 hover:bg-gray-100'
//               } cursor-pointer transition-colors`}
//               disabledClassName={`opacity-50 cursor-not-allowed`}
//               breakClassName={`px-3 py-1 rounded-md ${
//                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
//               }`}
//             />
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ProductManagement;




////////////////////////////////////////////////////////////////////////////////////Confirm while deleting //////////////////////////////////
import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import Layout from '../Layout/Layout';
import { FileText, Package, Search, Edit2, Trash2, Plus, RefreshCcw, AlertTriangle, CheckCircle } from 'lucide-react';

const ProductManagement = () => {
  const [productName, setProductName] = useState('');
  const [updatedProduct, setUpdatedProduct] = useState('');
  const [correctUPN, setCorrectUPN] = useState('');
  const [productType, setProductType] = useState('');
  const [products, setProducts] = useState([]);
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 20; // Number of products per page
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Get theme from localStorage (synced with Layout component)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check localStorage for theme
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    
    // Listen for theme changes
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch products with search and pagination
  const fetchProducts = async (page = 1, search = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getall?page=${page}&limit=${limit}&search=${search}`);
      const data = await response.json();
      setProducts(data.products);
      setPageCount(data.totalPages);
      setCurrentPage(data.currentPage - 1); // react-paginate uses zero-based index
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  // Fetch products on component mount and when search query changes
  useEffect(() => {
    fetchProducts(1, searchQuery);
  }, [searchQuery]);

  // Handle page change
  const handlePageClick = (event) => {
    fetchProducts(event.selected + 1, searchQuery);
  };

  // Add or update a product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      productName,
      updatedProduct,
      correctUPN,
      productType,
    };

    try {
      let response;
      if (editProductId) {
        // Update existing product
        response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/edit/${editProductId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } else {
        // Add new product
        response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }

      const result = await response.json();
      if (response.ok) {
        setWarning('');
        setSuccess(editProductId ? 'Product updated successfully!' : 'Product added successfully!');
        fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
        clearInputFields();
        setEditProductId(null); // Reset edit mode
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setWarning(result.message);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  // Edit a product
  const handleEdit = (product) => {
    setProductName(product.productName);
    setUpdatedProduct(product.updatedProduct);
    setCorrectUPN(product.correctUPN);
    setProductType(product.productType);
    setEditProductId(product._id); // Set the product ID being edited
  };

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Delete a product - actual deletion
  const confirmDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_Backend_Base_URL}/mapping/delete/${productToDelete._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        fetchProducts(currentPage + 1, searchQuery); // Refresh the product list
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        setSuccess('Product deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        console.error('Error deleting product:', result.message);
        setWarning(result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setWarning('Failed to delete product. Please try again.');
    }
  };

  // Clear input fields
  const clearInputFields = () => {
    setProductName('');
    setUpdatedProduct('');
    setCorrectUPN('');
    setProductType('');
  };

  return (
    <Layout>
      <div className="w-auto mx-auto space-y-4">
        {/* Add/Edit Product Form */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg p-6 shadow-xl`}>
          <div className="flex items-center mb-4">
            <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{editProductId ? 'Edit Product' : 'Add Product'}</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Updated Product
                </label>
                <input
                  type="text"
                  value={updatedProduct}
                  onChange={(e) => setUpdatedProduct(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Correct UPN
                </label>
                <input
                  type="text"
                  value={correctUPN}
                  onChange={(e) => setCorrectUPN(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Type
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              {editProductId && (
                <button
                  type="button"
                  onClick={() => {
                    clearInputFields();
                    setEditProductId(null);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } transition-colors`}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                } transition-colors`}
              >
                {editProductId ? (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Update Product
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Display warning if any */}
        {warning && (
          <div className={`${
            isDarkMode 
              ? 'bg-red-900/30 border border-red-700' 
              : 'bg-red-50 border border-red-200'
          } rounded-lg p-4 flex items-start`}>
            <div className={`p-1 rounded-full ${isDarkMode ? 'bg-red-800' : 'bg-red-100'} mr-3 mt-0.5`}>
              <AlertTriangle className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{warning}</p>
          </div>
        )}
        
        {/* Display success message if any */}
        {success && (
          <div className={`${
            isDarkMode 
              ? 'bg-green-900/30 border border-green-700' 
              : 'bg-green-50 border border-green-200'
          } rounded-lg p-4 flex items-start`}>
            <div className={`p-1 rounded-full ${isDarkMode ? 'bg-green-800' : 'bg-green-100'} mr-3 mt-0.5`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
          </div>
        )}

        {/* Search and List Section */}
        <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded-lg p-6 shadow-xl`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center">
              <FileText className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Product List</h2>
            </div>
            
            {/* Search Bar with icon */}
            <div className="mt-4 md:mt-0 relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-200 outline-none transition-colors`}
              />
            </div>
          </div>
          
          {/* Product Table */}
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead>
                <tr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}>
                  <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Product Name</th>
                  <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Updated Product</th>
                  <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Correct UPN</th>
                  <th className={`py-3 px-4 text-left border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Product Type</th>
                  <th className={`py-3 px-4 text-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr 
                      key={product._id} 
                      className={`${
                        isDarkMode 
                          ? 'hover:bg-gray-700 border-gray-700' 
                          : 'hover:bg-gray-50 border-gray-200'
                      } transition-colors`}
                    >
                      <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.productName}</td>
                      <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.updatedProduct}</td>
                      <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.correctUPN}</td>
                      <td className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>{product.productType}</td>
                      <td className={`py-3 px-4 border-b text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                          onClick={() => handleEdit(product)}
                          className={`inline-flex items-center mr-2 px-3 py-1 rounded ${
                            isDarkMode 
                              ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400' 
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                          } transition-colors`}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className={`inline-flex items-center px-3 py-1 rounded ${
                            isDarkMode 
                              ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          } transition-colors`}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="5" 
                      className={`py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      No products found. Try a different search term or add a new product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 0 && (
            <ReactPaginate
              previousLabel={
                <div className="flex items-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              }
              nextLabel={
                <div className="flex items-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              }
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={`flex justify-center items-center mt-6 gap-1`}
              activeClassName={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
              pageClassName={`px-3 py-1 rounded-md ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } cursor-pointer transition-colors`}
              previousClassName={`px-2 py-1 rounded-md ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } cursor-pointer transition-colors`}
              nextClassName={`px-2 py-1 rounded-md ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              } cursor-pointer transition-colors`}
              disabledClassName={`opacity-50 cursor-not-allowed`}
              breakClassName={`px-3 py-1 rounded-md ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-500'} opacity-75`}></div>
            </div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div 
              className={`inline-block align-bottom ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
            >
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                    isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                    <Trash2 className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Are you sure you want to delete <span className="font-medium">{productToDelete?.productName}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductManagement;