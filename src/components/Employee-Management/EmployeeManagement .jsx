// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Layout from "../Layout/Layout";

// const EmployeeManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedClientCodes, setSelectedClientCodes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newClientCode, setNewClientCode] = useState(""); // State for new client code input
//   const [clientCodes, setClientCodes] = useState([
//     "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", "NTK-2", "NTK-3", "NTK-4", 
//     "AC", "HAIER", "OD", "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", "SS", 
//     "CCS", "RCA", "UR", "PRA", "JAI", "GL", "AP", "HF", "CV", "VG", "VG-1", 
//     "ATT", "CCC"
//   ]);
//   const [showManageModal, setShowManageModal] = useState(false); // State to control modal visibility

//   // Fetch employees from backend
//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/Empcode`);
//       console.log(response);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   // Assign multiple client codes to an employee
//   const assignClientCodes = async () => {
//     if (!selectedEmployee || selectedClientCodes.length === 0) return alert("Fill all fields");

//     try {
//       setLoading(true);
//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addClientCode`, {
//         employeeName: selectedEmployee,
//         clientCodes: selectedClientCodes,
//       });
//       alert("Client codes assigned successfully!");
//       setSelectedClientCodes([]);
//       fetchEmployees();
//     } catch (error) {
//       console.error("Error assigning client codes:", error);
//       alert("Failed to assign client codes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove a client code from an employee
//   const removeClientCode = async (employeeName, clientCode) => {
//     if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
//     console.log(clientCode);
//     try {
//       setLoading(true);
//       await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/removeClientCode`, {
//         data: { employeeName, clientCode },
//       });
//       fetchEmployees();
//     } catch (error) {
//       console.error("Error removing client code:", error);
//       alert("Failed to remove client code");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle client code selection
//   const handleClientCodeSelection = (e) => {
//     const selectedCode = e.target.value;
//     if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
//       setSelectedClientCodes([...selectedClientCodes, selectedCode]);
//     }
//   };

//   // Remove selected client code
//   const removeSelectedClientCode = (code) => {
//     setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
//   };

//   // Add a new client code to the list
//   const addNewClientCode = () => {
//     if (newClientCode.trim() && !clientCodes.includes(newClientCode.trim())) {
//       setClientCodes([...clientCodes, newClientCode.trim()]);
//       setNewClientCode(""); // Clear input after adding
//     } else {
//       alert("Client code already exists or is invalid.");
//     }
//   };

//   // Remove a client code from the list
//   const removeClientCodeFromList = (code) => {
//     if (window.confirm(`Are you sure you want to remove ${code}?`)) {
//       setClientCodes(clientCodes.filter(c => c !== code));
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
//         <h1 className="text-2xl font-bold mb-5">Employee Management</h1>

//         {/* Assign Client Codes */}
//         <div className="mb-4">
//           <label className="block font-semibold">Select Employee:</label>
//           <select
//             className="border p-2 w-full rounded"
//             value={selectedEmployee}
//             onChange={(e) => setSelectedEmployee(e.target.value)}
//           >
//             <option value="">Select an Employee</option>
//             {employees.map((emp) => (
//               <option key={emp._id} value={emp.name}>
//                 {emp.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block font-semibold">Client Codes:</label>
//           <select
//             className="border p-2 w-full rounded"
//             onChange={handleClientCodeSelection}
//           >
//             <option value="">Select a Client Code</option>
//             {clientCodes.map((code) => (
//               <option key={code} value={code}>
//                 {code}
//               </option>
//             ))}
//           </select>
//           <div className="mt-2">
//             {selectedClientCodes.map((code) => (
//               <span key={code} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded m-1">
//                 {code}
//                 <button
//                   className="ml-2 text-red-500 hover:text-red-700"
//                   onClick={() => removeSelectedClientCode(code)}
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
//           onClick={assignClientCodes}
//           disabled={loading}
//         >
//           {loading ? "Processing..." : "Assign Client Codes"}
//         </button>

//         {/* Employee Table */}
//         <h2 className="text-xl font-bold mt-6">Employee List</h2>
//         <table className="w-full border mt-3">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Employee Name</th>
//               <th className="border p-2">Client Codes</th>
//             </tr>
//           </thead>
//           <tbody>
//             {employees.map((emp) => (
//               <tr key={emp._id} className="border">
//                 <td className="border p-2">{emp.name}</td>
//                 <td className="border p-2">
//                   {emp.clientCodes.map((code) => (
//                     <span key={code} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded m-1">
//                       {code}
//                       <button
//                         className="ml-2 text-red-500 hover:text-red-700"
//                         onClick={() => removeClientCode(emp.name, code)}
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Manage Client Codes Modal */}
//       {showManageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h2 className="text-xl font-bold mb-4">Manage Client Codes</h2>

//             {/* Add New Client Code */}
//             <div className="mb-4">
//               <label className="block font-semibold">Add New Client Code:</label>
//               <div className="flex">
//                 <input
//                   type="text"
//                   className="border p-2 w-full rounded-l"
//                   placeholder="Enter new client code"
//                   value={newClientCode}
//                   onChange={(e) => setNewClientCode(e.target.value)}
//                 />
//                 <button
//                   className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-700"
//                   onClick={addNewClientCode}
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>

//             {/* Manage Client Codes List */}
//             <div className="mb-4">
//               <label className="block font-semibold">Client Codes:</label>
//               <div className="mt-2">
//                 {clientCodes.map((code) => (
//                   <span key={code} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded m-1">
//                     {code}
//                     <button
//                       className="ml-2 text-red-500 hover:text-red-700"
//                       onClick={() => removeClientCodeFromList(code)}
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Close Button */}
//             <button
//               className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
//               onClick={() => setShowManageModal(false)}
//             >
//               Close
//             </button>
//           </div>
          
//         </div>
//       )}
//       {/* Manage Button */}
//       <button
//           className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 ml-40 mt-5 mb-4"
//           onClick={() => setShowManageModal(true)}
//         >
//           Manage Client Codes
//         </button>
//     </Layout>
//   );
// };

// export default EmployeeManagement;

// // import React, { useState, useEffect } from "react";
// // import axios from "axios";
// // import Layout from "../components/Layout/Layout";

// // const EmployeeManagement = () => {
// //   const [employees, setEmployees] = useState([]);
// //   const [selectedEmployee, setSelectedEmployee] = useState("");
// //   const [selectedClientCodes, setSelectedClientCodes] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   const clientCodes = [
// //     "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", "NTK-2", "NTK-3", "NTK-4", 
// //     "AC", "HAIER", "OD", "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", "SS", 
// //     "CCS", "RCA", "UR", "PRA", "JAI", "GL", "AP", "HF", "CV", "VG", "VG-1", 
// //     "ATT", "CCC"
// //   ];

// //   // Fetch employees from backend
// //   useEffect(() => {
// //     fetchEmployees();
// //   }, []);

// //   const fetchEmployees = async () => {
// //     try {
// //       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/access/getEmployee`);
// //       console.log(response);
// //       setEmployees(response.data);
// //     } catch (error) {
// //       console.error("Error fetching employees:", error);
// //     }
// //   };

// //   // Assign multiple client codes to an employee
// //   const assignClientCodes = async () => {
// //     if (!selectedEmployee || selectedClientCodes.length === 0) return alert("Fill all fields");

// //     try {
// //       setLoading(true);
// //       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/access/addClientCode`, {
// //         employeeName: selectedEmployee,
// //         clientCodes: selectedClientCodes,
// //       });
// //       alert("Client codes assigned successfully!");
// //       setSelectedClientCodes([]);
// //       fetchEmployees();
// //     } catch (error) {
// //       console.error("Error assigning client codes:", error);
// //       alert("Failed to assign client codes");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Remove a client code from an employee
// //   const removeClientCode = async (employeeName, clientCode) => {
// //     if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
// //     console.log(clientCode);
// //     try {
// //       setLoading(true);
// //       await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/access/removeClientCode`, {
// //         data: { employeeName, clientCode },
// //       });
// //       fetchEmployees();
// //     } catch (error) {
// //       console.error("Error removing client code:", error);
// //       alert("Failed to remove client code");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle client code selection
// //   const handleClientCodeSelection = (e) => {
// //     const selectedCode = e.target.value;
// //     if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
// //       setSelectedClientCodes([...selectedClientCodes, selectedCode]);
// //     }
// //   };

// //   // Remove selected client code
// //   const removeSelectedClientCode = (code) => {
    
// //     setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
// //   };

// //   return (
// //     <Layout>
// //         <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
// //       <h1 className="text-2xl font-bold mb-5">Employee Management</h1>

// //       {/* Assign Client Codes */}
// //       <div className="mb-4">
// //         <label className="block font-semibold">Select Employee:</label>
// //         <select
// //           className="border p-2 w-full rounded"
// //           value={selectedEmployee}
// //           onChange={(e) => setSelectedEmployee(e.target.value)}
// //         >
// //           <option value="">Select an Employee</option>
// //           {employees.map((emp) => (
// //             <option key={emp._id} value={emp.name}>
// //               {emp.name}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <div className="mb-4">
// //         <label className="block font-semibold">Client Codes:</label>
// //         <select
// //           className="border p-2 w-full rounded"
// //           onChange={handleClientCodeSelection}
// //         >
// //           <option value="">Select a Client Code</option>
// //           {clientCodes.map((code) => (
// //             <option key={code} value={code}>
// //               {code}
// //             </option>
// //           ))}
// //         </select>
// //         <div className="mt-2">
// //           {selectedClientCodes.map((code) => (
// //             <span key={code} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded m-1">
// //               {code}
// //               <button
// //                 className="ml-2 text-red-500 hover:text-red-700"
// //                 onClick={() => removeSelectedClientCode(code)}
// //               >
// //                 ×
// //               </button>
// //             </span>
// //           ))}
// //         </div>
// //       </div>

// //       <button
// //         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
// //         onClick={assignClientCodes}
// //         disabled={loading}
// //       >
// //         {loading ? "Processing..." : "Assign Client Codes"}
// //       </button>

// //       {/* Employee Table */}
// //       <h2 className="text-xl font-bold mt-6">Employee List</h2>
// //       <table className="w-full border mt-3">
// //         <thead>
// //           <tr className="bg-gray-200">
// //             <th className="border p-2">Employee Name</th>
// //             <th className="border p-2">Client Codes</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {employees.map((emp) => (
// //             <tr key={emp._id} className="border">
// //               <td className="border p-2">{emp.name}</td>
// //               <td className="border p-2">
// //                 {emp.clientCodes.map((code) => (
// //                   <span key={code} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded m-1">
// //                     {code}
// //                     <button
// //                       className="ml-2 text-red-500 hover:text-red-700"
// //                       onClick={() => removeClientCode(emp.name, code)}
// //                     >
// //                       ×
// //                     </button>
// //                   </span>
// //                 ))}
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //     </Layout>
// //   );
// // };
// mapping/Empcode
// // export default EmployeeManagement;


/////////////////////////////////////////////////////////////////////////////////original///////////////////////////


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Layout from "../Layout/Layout";

// const EmployeeManagement = () => {
//   const [mappings, setMappings] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedClientCodes, setSelectedClientCodes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newClientCode, setNewClientCode] = useState("");
//   const [clientCodes, setClientCodes] = useState([
//     "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", "NTK-2", "NTK-3", "NTK-4", 
//     "AC", "HAIER", "OD", "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", "SS", 
//     "CCS", "RCA", "UR", "PRA", "JAI", "GL", "AP", "HF", "CV", "VG", "VG-1", 
//     "ATT", "CCC"
//   ]);
//   const [showManageModal, setShowManageModal] = useState(false);

//   useEffect(() => {
//     fetchMappings();
//     fetchEmployeeNames();
//   }, []);

//   const fetchMappings = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/Empcode`);
//       setMappings(response.data);
//     } catch (error) {
//       console.error("Error fetching mappings:", error);
//       alert("Failed to fetch employee-client mappings");
//     }
//   };

//   const fetchEmployeeNames = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employee names:", error);
//       alert("Failed to fetch employee names");
//     }
//   };

//   const assignClientCodes = async () => {
//     if (!selectedEmployee || selectedClientCodes.length === 0) {
//       return alert("Please select an employee and at least one client code");
//     }

//     try {
//       setLoading(true);
//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addClientCode`, {
//         employeeName: selectedEmployee,
//         clientCodes: selectedClientCodes,
//       });
//       alert("Client codes assigned successfully!");
//       setSelectedClientCodes([]);
//       fetchMappings();
//     } catch (error) {
//       console.error("Error assigning client codes:", error);
//       // alert(error.response?.data?.message || "Failed to assign client codes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeClientCode = async (employeeName, clientCode) => {
//     if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
    
//     try {
//       setLoading(true);
//       await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/removeClientCode`, {
//         data: { employeeName, clientCode },
//       });
//       fetchMappings();
//     } catch (error) {
//       console.error("Error removing client code:", error);
//       alert(error.response?.data?.message || "Failed to remove client code");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClientCodeSelection = (e) => {
//     const selectedCode = e.target.value;
//     if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
//       setSelectedClientCodes([...selectedClientCodes, selectedCode]);
//     }
//   };

//   const removeSelectedClientCode = (code) => {
//     setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
//   };

//   const addNewClientCode = () => {
//     const trimmedCode = newClientCode.trim();
//     if (!trimmedCode) return;
    
//     if (!clientCodes.includes(trimmedCode)) {
//       setClientCodes([...clientCodes, trimmedCode]);
//       setNewClientCode("");
//     } else {
//       alert("Client code already exists");
//     }
//   };

//   const removeClientCodeFromList = (code) => {
//     if (window.confirm(`Are you sure you want to remove ${code} from the global list?`)) {
//       setClientCodes(clientCodes.filter(c => c !== code));
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-6xl mx-auto p-5 bg-white shadow-md rounded-lg">
//         {/* <h1 className="text-2xl font-bold mb-5">Employee Client Code Management</h1> */}

//         {/* Assign Client Codes Section */}
//         <div className="mb-8 p-4 border rounded-lg bg-gray-50">
//           <h2 className="text-lg font-semibold mb-3">Assign Client Codes</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block font-medium mb-1">Select Employee:</label>
//               <select
//                 className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//               >
//                 <option value="">Select an Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp._id} value={emp.name}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block font-medium mb-1">Select Client Codes:</label>
//               <select
//                 className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
//                 onChange={handleClientCodeSelection}
//                 disabled={!selectedEmployee}
//               >
//                 <option value="">Select a Client Code</option>
//                 {clientCodes.map((code) => (
//                   <option key={code} value={code}>
//                     {code}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <div className="mt-3">
//             <label className="block font-medium mb-1">Selected Client Codes:</label>
//             <div className="flex flex-wrap gap-2 min-h-12 p-2 border rounded bg-white">
//               {selectedClientCodes.length > 0 ? (
//                 selectedClientCodes.map((code) => (
//                   <span key={code} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
//                     {code}
//                     <button
//                       className="ml-2 text-red-500 hover:text-red-700"
//                       onClick={() => removeSelectedClientCode(code)}
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))
//               ) : (
//                 <span className="text-gray-400">No client codes selected</span>
//               )}
//             </div>
//           </div>

//           <button
//             className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${
//               loading || !selectedEmployee || selectedClientCodes.length === 0
//                 ? "opacity-50 cursor-not-allowed"
//                 : ""
//             }`}
//             onClick={assignClientCodes}
//             disabled={loading || !selectedEmployee || selectedClientCodes.length === 0}
//           >
//             {loading ? "Processing..." : "Assign Client Codes"}
//           </button>
//         </div>

//         {/* Mappings Table */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center mb-3">
//             <h2 className="text-lg font-semibold">Current Assignments</h2>
//             <button
//               className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
//               onClick={() => setShowManageModal(true)}
//             >
//               Manage Client Codes
//             </button>
//           </div>
          
//           <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border p-2 text-left">Employee</th>
//                   <th className="border p-2 text-left">Assigned Client Codes</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {mappings.length > 0 ? (
//                   mappings.map((mapping) => (
//                     <tr key={mapping._id} className="border hover:bg-gray-50">
//                       <td className="border p-2">{mapping.name || mapping.EmployeeName}</td>
//                       <td className="border p-2">
//                         <div className="flex flex-wrap gap-2">
//                           {(mapping.clientCodes || mapping.clientCode || []).map((code) => (
//                             <span 
//                               key={code} 
//                               className="inline-flex items-center bg-green-100 text-green-800 text-sm px-2 py-1 rounded cursor-pointer hover:bg-green-200"
//                               onClick={() => removeClientCode(mapping.name || mapping.EmployeeName, code)}
//                               title={`Click to remove ${code}`}
//                             >
//                               {code}
//                               <span className="ml-1 text-red-500 hover:text-red-700">×</span>
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="2" className="border p-2 text-center text-gray-500">
//                       No assignments found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Manage Client Codes Modal */}
//       {showManageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Manage Client Codes</h2>
//               <button
//                 className="text-gray-500 hover:text-gray-700"
//                 onClick={() => setShowManageModal(false)}
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="mb-6">
//               <label className="block font-medium mb-2">Add New Client Code:</label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   className="border p-2 flex-grow rounded focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter new code"
//                   value={newClientCode}
//                   onChange={(e) => setNewClientCode(e.target.value.toUpperCase())}
//                   onKeyPress={(e) => e.key === 'Enter' && addNewClientCode()}
//                 />
//                 <button
//                   className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                   onClick={addNewClientCode}
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block font-medium mb-2">Available Client Codes:</label>
//               <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
//                 {clientCodes.length > 0 ? (
//                   <div className="grid grid-cols-2 gap-2">
//                     {clientCodes.map((code) => (
//                       <div key={code} className="flex justify-between items-center bg-gray-100 p-2 rounded">
//                         <span>{code}</span>
//                         <button
//                           className="text-red-500 hover:text-red-700"
//                           onClick={() => removeClientCodeFromList(code)}
//                         >
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-center py-2">No client codes available</p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                 onClick={() => setShowManageModal(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Layout>
//   );
// };

// export default EmployeeManagement;



//////////////////////////////////////////////////////////upgraded UI/////////////////////////////////////////////


import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { Users, Plus, X, Settings, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

const EmployeeManagement = () => {
  const [mappings, setMappings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedClientCodes, setSelectedClientCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newClientCode, setNewClientCode] = useState("");
  const [clientCodes, setClientCodes] = useState([
    "BK", "SATNAM", "OG", "DEE", "KM", "ILC", "PRO", "NTK-2", "NTK-3", "NTK-4", 
    "AC", "HAIER", "OD", "PMC", "MT", "TG", "VEN", "SK", "RF", "ALT", "SS", 
    "CCS", "RCA", "UR", "PRA", "JAI", "GL", "AP", "HF", "CV", "VG", "VG-1", 
    "ATT", "CCC"
  ]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchMappings(), fetchEmployeeNames()]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchMappings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/Empcode`);
      setMappings(response.data);
      return response;
    } catch (error) {
      console.error("Error fetching mappings:", error);
      return Promise.reject(error);
    }
  };

  const fetchEmployeeNames = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/getEmpName`);
      setEmployees(response.data);
      return response;
    } catch (error) {
      console.error("Error fetching employee names:", error);
      return Promise.reject(error);
    }
  };

  const assignClientCodes = async () => {
    if (!selectedEmployee || selectedClientCodes.length === 0) {
      return showNotification("Please select an employee and at least one client code", "error");
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/mapping/addClientCode`, {
        employeeName: selectedEmployee,
        clientCodes: selectedClientCodes,
      });
      showNotification("Client codes assigned successfully!", "success");
      setSelectedClientCodes([]);
      fetchMappings();
    } catch (error) {
      console.error("Error assigning client codes:", error);
      showNotification(error.response?.data?.message || "Failed to assign client codes", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeClientCode = async (employeeName, clientCode) => {
    if (!window.confirm(`Remove ${clientCode} from ${employeeName}?`)) return;
    
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/mapping/removeClientCode`, {
        data: { employeeName, clientCode },
      });
      fetchMappings();
      showNotification(`Removed ${clientCode} from ${employeeName}`, "success");
    } catch (error) {
      console.error("Error removing client code:", error);
      showNotification(error.response?.data?.message || "Failed to remove client code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClientCodeSelection = (e) => {
    const selectedCode = e.target.value;
    if (selectedCode && !selectedClientCodes.includes(selectedCode)) {
      setSelectedClientCodes([...selectedClientCodes, selectedCode]);
    }
  };

  const removeSelectedClientCode = (code) => {
    setSelectedClientCodes(selectedClientCodes.filter(c => c !== code));
  };

  const addNewClientCode = () => {
    const trimmedCode = newClientCode.trim();
    if (!trimmedCode) return;
    
    if (!clientCodes.includes(trimmedCode)) {
      setClientCodes([...clientCodes, trimmedCode]);
      setNewClientCode("");
      showNotification(`Added new client code: ${trimmedCode}`, "success");
    } else {
      showNotification("Client code already exists", "error");
    }
  };

  const removeClientCodeFromList = (code) => {
    if (window.confirm(`Are you sure you want to remove ${code} from the global list?`)) {
      setClientCodes(clientCodes.filter(c => c !== code));
      showNotification(`Removed ${code} from client code list`, "success");
    }
  };

  const showNotification = (message, type) => {
    // In a real app, you might use a toast library
    alert(message);
  };

  return (
    <Layout>
      <div className="w-auto mx-auto space-y-4">
        {/* Header */}
        {/* <div className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm'
        } rounded p-6 shadow-xl transition-colors duration-200`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>Employee Management</h2>
              <p className={`mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Assign and manage client codes for your team</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <Users className={`w-5 h-5 mr-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Management Portal</span>
              </div>
            </div>
          </div>
        </div> */}

        {isLoading ? (
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white/95 backdrop-blur-sm'
          } rounded p-6 shadow-xl flex justify-center items-center h-64`}>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Assign Client Codes Section */}
            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white/95 backdrop-blur-sm'
            } rounded p-6 shadow-xl transition-colors duration-200`}>
              <div className="flex items-center mb-4">
                <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Assign Client Codes</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Select Employee:</label>
                  <select
                    className={`w-full p-3 rounded-lg transition-colors border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500`}
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">Select an Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Select Client Codes:</label>
                  <select
                    className={`w-full p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500 ${!selectedEmployee ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onChange={handleClientCodeSelection}
                    disabled={!selectedEmployee}
                  >
                    <option value="">Select a Client Code</option>
                    {clientCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Selected Client Codes:</label>
                <div className={`flex flex-wrap gap-2 min-h-16 p-3 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  {selectedClientCodes.length > 0 ? (
                    selectedClientCodes.map((code) => (
                      <span key={code} className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-blue-900/40 text-blue-300 border border-blue-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {code}
                        <button
                          className={`ml-2 rounded-full p-0.5 ${
                            isDarkMode 
                              ? 'hover:bg-blue-800 text-blue-300' 
                              : 'hover:bg-blue-200 text-blue-700'
                          }`}
                          onClick={() => removeSelectedClientCode(code)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No client codes selected
                    </span>
                  )}
                </div>
              </div>

              <button
                className={`px-5 py-2.5 rounded-lg font-medium text-white transition-all ${
                  loading || !selectedEmployee || selectedClientCodes.length === 0
                    ? (isDarkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed')
                    : (isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700')
                }`}
                onClick={assignClientCodes}
                disabled={loading || !selectedEmployee || selectedClientCodes.length === 0}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assign Client Codes
                  </span>
                )}
              </button>
            </div>

            {/* Mappings Table */}
            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white/95 backdrop-blur-sm'
            } rounded p-6 shadow-xl transition-colors duration-200`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Users className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Current Assignments</h2>
                </div>
                <button
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setShowManageModal(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Client Codes
                </button>
              </div>
              
              <div className="overflow-x-auto rounded-lg border overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <th className={`p-4 text-left font-semibold ${
                        isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
                      }`}>Employee</th>
                      <th className={`p-4 text-left font-semibold ${
                        isDarkMode ? 'text-gray-200 border-gray-600' : 'text-gray-700 border-gray-200'
                      }`}>Assigned Client Codes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.length > 0 ? (
                      mappings.map((mapping, index) => (
                        <tr key={mapping._id} className={`${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700/50' 
                            : 'hover:bg-gray-50 border-gray-200'
                        } ${index !== mappings.length - 1 ? 'border-b' : ''}`}>
                          <td className={`p-4 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>{mapping.name || mapping.EmployeeName}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {(mapping.clientCodes || mapping.clientCode || []).map((code) => (
                                <span 
                                  key={code} 
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    isDarkMode 
                                      ? 'bg-green-900/30 text-green-300 border border-green-800 hover:bg-green-900/50' 
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  } cursor-pointer`}
                                  onClick={() => removeClientCode(mapping.name || mapping.EmployeeName, code)}
                                  title={`Click to remove ${code}`}
                                >
                                  {code}
                                  <X className={`w-3 h-3 ml-1.5 ${
                                    isDarkMode ? 'text-green-400' : 'text-green-700'
                                  }`} />
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className={`p-6 text-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                            <p>No assignments found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manage Client Codes Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl w-full max-w-md transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center">
                <Settings className={`w-5 h-5 mr-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Manage Client Codes</h2>
              </div>
              <button
                className={`rounded-full p-1 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setShowManageModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Add New Client Code:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-grow p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter new code"
                    value={newClientCode}
                    onChange={(e) => setNewClientCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && addNewClientCode()}
                  />
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                      isDarkMode 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                    }`}
                    onClick={addNewClientCode}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Available Client Codes:</label>
                <div className={`border rounded-lg max-h-60 overflow-y-auto ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {clientCodes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 p-3">
                      {clientCodes.sort().map((code) => (
                        <div key={code} className={`flex justify-between items-center p-2 rounded ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                            {code}
                          </span>
                          <button
                            className={`rounded-full p-1 transition-colors ${
                              isDarkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                                : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                            }`}
                            onClick={() => removeClientCodeFromList(code)}
                            title={`Remove ${code}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-center py-6 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>No client codes available</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                  onClick={() => setShowManageModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EmployeeManagement;