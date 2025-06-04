// import { useState, useEffect } from "react";
// import axios from "axios";

// function SingleUpload({ isDarkMode }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     product: "",
//     accountNumber: "",
//     requirement: "",
//     clientId: ""
//   });

//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [message, setMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [productOptions, setProductOptions] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [clientCodes, setClientCodes] = useState([]);

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     fetchProductName();
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
//   }, []);
//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//       }
//     };
//     fetchClientCodes();
//   }, []);
//   const normalizeInput = (input) => {
//     return input.trim().toUpperCase().replace(/\s+/g, ""); // "  bk " → "BK", "sat nam" → "SATNAM"
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(formData.clientId))
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (name === "product") {
//       const filtered = productOptions.filter(product => 
//         product.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//     }
//   };

//   const handleProductSelect = (product) => {
//     setFormData({ ...formData, product });
//     setFilteredProducts([]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     if (!user) {
//       setMessage("User is not logged in!");
//       setIsSubmitting(false);
//       return;
//     }

//     // Validate client ID for employees/admins
//     if ((userRole === "employee" || userRole === "admin") && !formData.clientId) {
//       setMessage("Client ID is required!");
//       setIsSubmitting(false);
//       return;
//     }

//     const payload = { 
//       ...formData, 
//       userId: user.userId
//     };

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`,
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (response.status === 200) {
//         setMessage("KYC data uploaded successfully!");
//         setFormData({ 
//           name: "", 
//           product: "", 
//           accountNumber: "", 
//           requirement: "",
//           clientId: "" 
//         });
//       } else {
//         setMessage(response.data.message || "Failed to upload data.");
//       }
//     } catch (error) {
//       setMessage(error.response?.data?.message || "Failed to upload data.");
//       console.error("Upload error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//     isDarkMode 
//       ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
//       : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
//   }`;

//   return (
//     <div className="space-y-5">
//       {user && (
//         <div className={`p-3 rounded-lg ${
//           isDarkMode 
//             ? 'bg-gray-700/50 text-gray-300' 
//             : 'bg-blue-50 text-gray-700'
//         }`}>
//           <span className="text-sm">Logged in as: <span className="font-medium">{user.name}</span> ({userRole})</span>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Client ID field (only for employee/admin) */}
//         {(userRole === "employee" || userRole === "admin") && (
//   <div className="relative">
//     <input
//       type="text"
//       name="clientId"
//       value={formData.clientId}
//       onChange={handleChange}
//       placeholder="Enter the Code"
//       required
//       className={inputStyles}
//     />
//     {formData.clientId && filteredClientCodes.length > 0 && (
//       <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
//         isDarkMode 
//           ? "bg-gray-800 border border-gray-700" 
//           : "bg-white border border-gray-200"
//       }`}>
//         {filteredClientCodes.map((code, index) => (
//           <div
//             key={index}
//             onClick={() => setFormData({ ...formData, clientId: code })}
//             className={`p-2 cursor-pointer hover:bg-blue-50 ${
//               isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
//             }`}
//           >
//             {code}
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// )}
//         {/* {(userRole === "employee" || userRole === "admin") && (
//           <div>
//             <input
//               type="text"
//               name="clientId"
//               value={formData.clientId}
//               onChange={handleChange}
//               placeholder="Enter Client ID"
//               required
//               className={inputStyles}
//             />
//           </div>
//         )} */}

//         <div>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter Name"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div className="relative">
//           <input
//             type="text"
//             name="product"
//             value={formData.product}
//             onChange={handleChange}
//             placeholder="Select Product"
//             required
//             className={inputStyles}
//           />
//           {filteredProducts.length > 0 && (
//             <div className={`absolute z-10 w-full max-h-40 overflow-y-auto ${
//               isDarkMode 
//                 ? 'bg-gray-700 border border-gray-600 text-white' 
//                 : 'bg-white border border-gray-200 text-gray-900'
//             }`}>
//               {filteredProducts.map((product, index) => (
//                 <div 
//                   key={index} 
//                   onClick={() => handleProductSelect(product)}
//                   className={`p-2 cursor-pointer hover:bg-gray-100 ${
//                     isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   {product}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div>
//           <input
//             type="number"
//             name="accountNumber"
//             value={formData.accountNumber}
//             onChange={handleChange}
//             placeholder="Enter Account Number"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div>
//           <input
//             type="text"
//             name="requirement"
//             value={formData.requirement}
//             onChange={handleChange}
//             placeholder="Enter Requirement"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={isSubmitting}
//           className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
//             isDarkMode
//               ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
//               : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
//           }`}
//         >
//           {isSubmitting ? "Uploading..." : "Upload"}
//         </button>
//       </form>

//       {message && (
//         <div
//           className={`p-4 rounded-lg text-sm ${
//             message.includes("successfully")
//               ? (isDarkMode ? 'bg-green-800/40 text-green-300' : 'bg-green-100 text-green-800')
//               : (isDarkMode ? 'bg-red-800/40 text-red-300' : 'bg-red-100 text-red-800')
//           }`}
//         >
//           {message}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SingleUpload;

/////////////////////////////////////////////////////////////////////////////main////////////////////////

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";

// function SingleUpload({ isDarkMode }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     product: "",
//     accountNumber: "",
//     requirement: "",
//     clientId: ""
//   });

//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [message, setMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [productOptions, setProductOptions] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
//   const [showProducts, setShowProducts] = useState(false);

//   const clientCodeRef = useRef(null);
//   const productRef = useRef(null);

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     fetchProductName();
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//       }
//     };
//     fetchClientCodes();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//       if (productRef.current && !productRef.current.contains(event.target)) {
//         setShowProducts(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const normalizeInput = (input) => {
//     return input.trim().toUpperCase().replace(/\s+/g, "");
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(formData.clientId))
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (name === "product") {
//       const filtered = productOptions.filter(product => 
//         product.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//       setShowProducts(true);
//     }
    
//     if (name === "clientId") {
//       setShowClientCodes(true);
//     }
//   };

//   const handleProductSelect = (product) => {
//     setFormData({ ...formData, product });
//     setShowProducts(false);
//     // Focus back on the input after selection
//     setTimeout(() => productRef.current.querySelector('input').focus(), 0);
//   };

//   const handleClientCodeSelect = (code) => {
//     setFormData({ ...formData, clientId: code });
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     if (!user) {
//       setMessage("User is not logged in!");
//       setIsSubmitting(false);
//       return;
//     }

//     if ((userRole === "employee" || userRole === "admin") && !formData.clientId) {
//       setMessage("Client ID is required!");
//       setIsSubmitting(false);
//       return;
//     }

//     const payload = { 
//       ...formData, 
//       userId: user.userId
//     };

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`,
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (response.status === 200) {
//         setMessage("KYC data uploaded successfully!");
//         setFormData({ 
//           name: "", 
//           product: "", 
//           accountNumber: "", 
//           requirement: "",
//           clientId: "" 
//         });
//       } else {
//         setMessage(response.data.message || "Failed to upload data.");
//       }
//     } catch (error) {
//       setMessage(error.response?.data?.message || "Failed to upload data.");
//       console.error("Upload error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//     isDarkMode 
//       ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
//       : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
//   }`;

//   return (
//     <div className="space-y-5">
//       {user && (
//         <div className={`p-3 rounded-lg ${
//           isDarkMode 
//             ? 'bg-gray-700/50 text-gray-300' 
//             : 'bg-blue-50 text-gray-700'
//         }`}>
//           <span className="text-sm">Logged in as: <span className="font-medium">{user.name}</span> ({userRole})</span>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {(userRole === "employee" || userRole === "admin") && (
//           <div className="relative" ref={clientCodeRef}>
//             <input
//               type="text"
//               name="clientId"
//               value={formData.clientId}
//               onChange={handleChange}
//               onFocus={() => setShowClientCodes(true)}
//               placeholder="Enter the Code"
//               required
//               className={inputStyles}
//             />
//             {showClientCodes && formData.clientId && filteredClientCodes.length > 0 && (
//               <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
//                 isDarkMode 
//                   ? "bg-gray-800 border border-gray-700" 
//                   : "bg-white border border-gray-200"
//               }`}>
//                 {filteredClientCodes.map((code, index) => (
//                   <div
//                     key={index}
//                     onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                     onClick={() => handleClientCodeSelect(code)}
//                     className={`p-2 cursor-pointer hover:bg-blue-50 ${
//                       isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
//                     }`}
//                   >
//                     {code}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter Name"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div className="relative" ref={productRef}>
//           <input
//             type="text"
//             name="product"
//             value={formData.product}
//             onChange={handleChange}
//             onFocus={() => setShowProducts(true)}
//             placeholder="Select Product"
//             required
//             className={inputStyles}
//           />
//           {showProducts && filteredProducts.length > 0 && (
//             <div className={`absolute z-10 w-full max-h-40 overflow-y-auto ${
//               isDarkMode 
//                 ? 'bg-gray-700 border border-gray-600 text-white' 
//                 : 'bg-white border border-gray-200 text-gray-900'
//             }`}>
//               {filteredProducts.map((product, index) => (
//                 <div 
//                   key={index}
//                   onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                   onClick={() => handleProductSelect(product)}
//                   className={`p-2 cursor-pointer hover:bg-gray-100 ${
//                     isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   {product}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div>
//           <input
//             type="number"
//             name="accountNumber"
//             value={formData.accountNumber}
//             onChange={handleChange}
//             placeholder="Enter Account Number"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div>
//           <input
//             type="text"
//             name="requirement"
//             value={formData.requirement}
//             onChange={handleChange}
//             placeholder="Enter Requirement"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={isSubmitting}
//           className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
//             isDarkMode
//               ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
//               : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
//           }`}
//         >
//           {isSubmitting ? "Uploading..." : "Upload"}
//         </button>
//       </form>

//       {message && (
//         <div
//           className={`p-4 rounded-lg text-sm ${
//             message.includes("successfully")
//               ? (isDarkMode ? 'bg-green-800/40 text-green-300' : 'bg-green-100 text-green-800')
//               : (isDarkMode ? 'bg-red-800/40 text-red-300' : 'bg-red-100 text-red-800')
//           }`}
//         >
//           {message}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SingleUpload;


//////////////////////////////////////////////updated UI/////////////////////////////////


// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { AlertCircle, CheckCircle, X } from "lucide-react";

// function SingleUpload({ isDarkMode }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     product: "",
//     accountNumber: "",
//     requirement: "",
//     clientId: ""
//   });

//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [productOptions, setProductOptions] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
//   const [showProducts, setShowProducts] = useState(false);
  
//   // Toast state
//   const [toast, setToast] = useState({
//     show: false,
//     message: "",
//     type: "success", // success or error
//   });

//   const clientCodeRef = useRef(null);
//   const productRef = useRef(null);

//   const fetchProductName = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
//       setProductOptions(response.data.map(p => p.productName));
//     } catch (error) {
//       console.error("Error fetching products:", error);
//       showToast("Failed to load products", "error");
//     }
//   };

//   useEffect(() => {
//     fetchProductName();
//     const role = localStorage.getItem("role");
//     setUserRole(role);
    
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchClientCodes = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//         setClientCodes(response.data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch client codes:", error);
//         showToast("Failed to load client codes", "error");
//       }
//     };
//     fetchClientCodes();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//       if (productRef.current && !productRef.current.contains(event.target)) {
//         setShowProducts(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Auto-hide toast after 3 seconds
//   useEffect(() => {
//     if (toast.show) {
//       const timer = setTimeout(() => {
//         setToast({ ...toast, show: false });
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   const showToast = (message, type = "success") => {
//     setToast({
//       show: true,
//       message,
//       type,
//     });
//   };

//   const normalizeInput = (input) => {
//     return input.trim().toUpperCase().replace(/\s+/g, "");
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(formData.clientId))
//   );

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (name === "product") {
//       const filtered = productOptions.filter(product => 
//         product.toLowerCase().includes(value.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//       setShowProducts(true);
//     }
    
//     if (name === "clientId") {
//       setShowClientCodes(true);
//     }
//   };

//   const handleProductSelect = (product) => {
//     setFormData({ ...formData, product });
//     setShowProducts(false);
//     // Focus back on the input after selection
//     setTimeout(() => productRef.current.querySelector('input').focus(), 0);
//   };

//   const handleClientCodeSelect = (code) => {
//     setFormData({ ...formData, clientId: code });
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     if (!user) {
//       showToast("User is not logged in!", "error");
//       setIsSubmitting(false);
//       return;
//     }

//     if ((userRole === "employee" || userRole === "admin") && !formData.clientId) {
//       showToast("Client ID is required!", "error");
//       setIsSubmitting(false);
//       return;
//     }

//     const payload = { 
//       ...formData, 
//       userId: user.userId
//     };

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`,
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       if (response.status === 200) {
//         showToast("KYC data uploaded successfully!", "success");
//         setFormData({ 
//           name: "", 
//           product: "", 
//           accountNumber: "", 
//           requirement: "",
//           clientId: "" 
//         });
//       } else {
//         showToast(response.data.message || "Failed to upload data.", "error");
//       }
//     } catch (error) {
//       showToast(error.response?.data?.message || "Failed to upload data.", "error");
//       console.error("Upload error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//     isDarkMode 
//       ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
//       : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
//   }`;

//   return (
//     <div className="space-y-5 relative">
//       {/* Toast Notification */}
//       {toast.show && (
//         <div 
//           className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 animate-fade-in-down ${
//             toast.type === "success" 
//               ? (isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 border-l-4 border-green-500 text-green-800')
//               : (isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 border-l-4 border-red-500 text-red-800')
//           }`}
//         >
//           <div className="flex items-center justify-between p-4">
//             <div className="flex items-center">
//               {toast.type === "success" ? (
//                 <CheckCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-green-300' : 'text-green-500'}`} />
//               ) : (
//                 <AlertCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`} />
//               )}
//               <p className="text-sm font-medium">{toast.message}</p>
//             </div>
//             <button 
//               onClick={() => setToast({ ...toast, show: false })}
//               className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {user && (
//         <div className={`p-3 rounded-lg ${
//           isDarkMode 
//             ? 'bg-gray-700/50 text-gray-300' 
//             : 'bg-blue-50 text-gray-700'
//         }`}>
//           <span className="text-sm">Logged in as: <span className="font-medium">{user.name}</span> ({userRole})</span>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {(userRole === "employee" || userRole === "admin") && (
//           <div className="relative" ref={clientCodeRef}>
//             <input
//               type="text"
//               name="clientId"
//               value={formData.clientId}
//               onChange={handleChange}
//               onFocus={() => setShowClientCodes(true)}
//               placeholder="Enter the Client Code"
//               required
//               className={inputStyles}
//             />
//             {showClientCodes && formData.clientId && filteredClientCodes.length > 0 && (
//               <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
//                 isDarkMode 
//                   ? "bg-gray-800 border border-gray-700" 
//                   : "bg-white border border-gray-200"
//               }`}>
//                 {filteredClientCodes.map((code, index) => (
//                   <div
//                     key={index}
//                     onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                     onClick={() => handleClientCodeSelect(code)}
//                     className={`p-2 cursor-pointer hover:bg-blue-50 ${
//                       isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
//                     }`}
//                   >
//                     {code}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter Name"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div className="relative" ref={productRef}>
//           <input
//             type="text"
//             name="product"
//             value={formData.product}
//             onChange={handleChange}
//             onFocus={() => setShowProducts(true)}
//             placeholder="Select Product"
//             required
//             className={inputStyles}
//           />
//           {showProducts && filteredProducts.length > 0 && (
//             <div className={`absolute z-10 w-full max-h-40 overflow-y-auto ${
//               isDarkMode 
//                 ? 'bg-gray-700 border border-gray-600 text-white' 
//                 : 'bg-white border border-gray-200 text-gray-900'
//             }`}>
//               {filteredProducts.map((product, index) => (
//                 <div 
//                   key={index}
//                   onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                   onClick={() => handleProductSelect(product)}
//                   className={`p-2 cursor-pointer hover:bg-gray-100 ${
//                     isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   {product}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div>
//           <input
//             type="text"
//             name="accountNumber"
//             value={formData.accountNumber}
//             onChange={handleChange}
//             placeholder="Enter Account Number"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <div>
//           <input
//             type="text"
//             name="requirement"
//             value={formData.requirement}
//             onChange={handleChange}
//             placeholder="Enter Requirement"
//             required
//             className={inputStyles}
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={isSubmitting}
//           className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
//             isDarkMode
//               ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
//               : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
//           }`}
//         >
//           {isSubmitting ? "Uploading..." : "Upload"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default SingleUpload;




///////////////////////////////////////////////////////////reset //////////////////////////////////


import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, X, RotateCcw } from "lucide-react";

function SingleUpload({ isDarkMode }) {
  const [formData, setFormData] = useState({
    name: "",
    product: "",
    accountNumber: "",
    requirement: "",
    clientId: ""
  });

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [clientCodes, setClientCodes] = useState([]);
  const [showClientCodes, setShowClientCodes] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success or error
  });

  const clientCodeRef = useRef(null);
  const productRef = useRef(null);

  const fetchProductName = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/getProductname`);
      setProductOptions(response.data.map(p => p.productName));
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to load products", "error");
    }
  };

  useEffect(() => {
    fetchProductName();
    const role = localStorage.getItem("role");
    setUserRole(role);
    
    const getUser = localStorage.getItem("loginUser");
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data);
    }
  }, []);

  useEffect(() => {
    const fetchClientCodes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
        setClientCodes(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch client codes:", error);
        showToast("Failed to load client codes", "error");
      }
    };
    fetchClientCodes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
        setShowClientCodes(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProducts(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const normalizeInput = (input) => {
    return input.trim().toUpperCase().replace(/\s+/g, "");
  };
  
  const filteredClientCodes = clientCodes.filter(code => 
    normalizeInput(code).includes(normalizeInput(formData.clientId))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "product") {
      const filtered = productOptions.filter(product => 
        product.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProducts(true);
    }
    
    if (name === "clientId") {
      setShowClientCodes(true);
    }
  };

  const handleProductSelect = (product) => {
    setFormData({ ...formData, product });
    setShowProducts(false);
    // Focus back on the input after selection
    setTimeout(() => productRef.current.querySelector('input').focus(), 0);
  };

  const handleClientCodeSelect = (code) => {
    setFormData({ ...formData, clientId: code });
    setShowClientCodes(false);
    // Focus back on the input after selection
    setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
  };

  const handleReset = () => {
    setFormData({ 
      name: "", 
      product: "", 
      accountNumber: "", 
      requirement: "",
      clientId: "" 
    });
    setShowClientCodes(false);
    setShowProducts(false);
    showToast("Form fields have been reset", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      showToast("User is not logged in!", "error");
      setIsSubmitting(false);
      return;
    }

    if ((userRole === "employee" || userRole === "admin") && !formData.clientId) {
      showToast("Client ID is required!", "error");
      setIsSubmitting(false);
      return;
    }

    const payload = { 
      ...formData, 
      userId: user.userId
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/single-upload`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        showToast("KYC data uploaded successfully!", "success");
        setFormData({ 
          name: "", 
          product: "", 
          accountNumber: "", 
          requirement: "",
          clientId: "" 
        });
      } else {
        showToast(response.data.message || "Failed to upload data.", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to upload data.", "error");
      console.error("Upload error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
    isDarkMode 
      ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
      : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
  }`;

  // Check if form has any data to determine if reset button should be enabled
  const hasFormData = Object.values(formData).some(value => value.trim() !== "");

  return (
       <div className="space-y-5 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg transition-all duration-300 transform translate-y-0 animate-fade-in-down ${
            toast.type === "success" 
              ? (isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 border-l-4 border-green-500 text-green-800')
              : (isDarkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 border-l-4 border-red-500 text-red-800')
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {toast.type === "success" ? (
                <CheckCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-green-300' : 'text-green-500'}`} />
              ) : (
                <AlertCircle className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-red-300' : 'text-red-500'}`} />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {user && (
        <div className={`p-3 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700/50 text-gray-300' 
            : 'bg-blue-50 text-gray-700'
        }`}>
          <span className="text-sm">Logged in as: <span className="font-medium">{user.name}</span> ({userRole})</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(userRole === "employee" || userRole === "admin") && (
          <div className="relative" ref={clientCodeRef}>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              onFocus={() => setShowClientCodes(true)}
              placeholder="Enter the Client Code"
              required
              className={inputStyles}
            />
            {showClientCodes && formData.clientId && filteredClientCodes.length > 0 && (
              <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
                isDarkMode 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-white border border-gray-200"
              }`}>
                {filteredClientCodes.map((code, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    onClick={() => handleClientCodeSelect(code)}
                    className={`p-2 cursor-pointer hover:bg-blue-50 ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
                    }`}
                  >
                    {code}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Name"
            required
            className={inputStyles}
          />
        </div>

        <div className="relative" ref={productRef}>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            onFocus={() => setShowProducts(true)}
            placeholder="Select Product"
            required
            className={inputStyles}
          />
          {showProducts && filteredProducts.length > 0 && (
            <div className={`absolute z-10 w-full max-h-40 overflow-y-auto ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-900'
            }`}>
              {filteredProducts.map((product, index) => (
                <div 
                  key={index}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  onClick={() => handleProductSelect(product)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                >
                  {product}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Enter Account Number"
            required
            className={inputStyles}
          />
        </div>

        <div>
          <input
            type="text"
            name="requirement"
            value={formData.requirement}
            onChange={handleChange}
            placeholder="Enter Requirement"
            required
            className={inputStyles}
          />
        </div>

        {/* Button Container */}
        <div className="flex gap-3">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
            }`}
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>

          <button 
            type="button"
            onClick={handleReset}
            disabled={!hasFormData || isSubmitting}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
              isDarkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-800 disabled:text-gray-500'
                : 'bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
            } disabled:cursor-not-allowed`}
            title="Reset form fields"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SingleUpload;