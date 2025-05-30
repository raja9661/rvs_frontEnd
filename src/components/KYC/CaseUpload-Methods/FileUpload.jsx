// // components/FileUpload.js - Complete Component
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import * as XLSX from "xlsx";

// function FileUpload({ isDarkMode }) {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [user, setUser] = useState(null);
//   const [userRole, setUserRole] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [clientId, setClientId] = useState("");
//   const [progress, setProgress] = useState({
//     step: 0, // 0 = not started, 1 = uploading, 2 = extracting, 3 = processing
//     message: "",
//     recordCount: 0
//   });
//   const [results, setResults] = useState(null);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = localStorage.getItem("role");
//     setUserRole(role);
//     if (getUser) setUser(JSON.parse(getUser));
//   }, []);

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//     setResults(null);
//     setProgress({ step: 0, message: "", recordCount: 0 });
//   };

//   const handleFileUpload = async () => {
//     if (!validateInputs()) return;
    
//     setIsUploading(true);
//     setProgress({ ...progress, step: 1, message: "Uploading file..." });
    
//     try {
//       // Step 1: Upload file
//       const formData = new FormData();
//       formData.append("file", selectedFile);
//       formData.append("userId", user.userId);
//       if (userRole === "employee" || userRole === "admin") {
//         formData.append("clientId", clientId);
//       }

//       const uploadResponse = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-file`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (!uploadResponse.data.success) throw new Error(uploadResponse.data.message);

//       // Step 2: Extract data
//       setProgress({ ...progress, step: 2, message: "Extracting data..." });
//       console.log("Response:",uploadResponse.data.fileKey)
//       const extractResponse = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/extract-data/${uploadResponse.data.fileKey}`,
//         { userId: user.userId, clientId }
//       );

//       if (!extractResponse.data.success) throw new Error(extractResponse.data.message);

//       // Step 3: Process records
//       setProgress({
//         step: 3,
//         message: `Processing records (0/${extractResponse.data.recordCount})`,
//         recordCount: extractResponse.data.recordCount
//       });

//       const processResponse = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/process-records/${uploadResponse.data.fileKey}`,
//         { 
//           userId: user.userId, 
//           clientId,
//           ipAddress: extractResponse.data.ipAddress
//         }
//       );

//       if (!processResponse.data.success) throw new Error(processResponse.data.message);

//       // Complete
//       setResults(processResponse.data.results);
//       toast.success(
//         <div>
//           <div>Processing complete!</div>
//           <div className="text-sm mt-1">
//             {processResponse.data.results.inserted} inserted, {processResponse.data.results.duplicates} duplicates, 
//             {processResponse.data.results.failed} failed
//           </div>
//         </div>
//       );
      
//       // Reset form
//       resetForm();
//     } catch (error) {
//       console.error("Upload process error:", error);
//       toast.error(error.response?.data?.message || error.message || "Processing failed");
//       setProgress({ step: 0, message: "", recordCount: 0 });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const validateInputs = () => {
//     if (!selectedFile) {
//       toast.error("Please select a file first.");
//       return false;
//     }
//     if (!user) {
//       toast.error("User details not found. Please log in.");
//       return false;
//     }
//     if ((userRole === "employee" || userRole === "admin") && !clientId) {
//       toast.error("Please enter Client ID.");
//       return false;
//     }
//     return true;
//   };

//   const resetForm = () => {
//     setSelectedFile(null);
//     setClientId("");
//     setProgress({ step: 0, message: "", recordCount: 0 });
//     const fileInput = document.querySelector('input[type="file"]');
//     if (fileInput) fileInput.value = "";
//   };

//   const downloadTemplate = () => {
//     const worksheetData = [
//       ["Name", "Product", "Account Number", "Requirement"],
//     ];
  
//     const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "KYC_Template.xlsx";
//     link.click();
  
//     toast.success("Template downloaded successfully!");
//   };

//   const getProgressPercentage = () => {
//     if (progress.step === 3 && progress.recordCount > 0) {
//       const processed = parseInt(progress.message.match(/\((\d+)\//)?.[1] || 0);
//       return Math.min(100, Math.round((processed / progress.recordCount)) * 100);
//     }
//     return progress.step * 33; // 33% per steps
//   };

//   return (
//     <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
//       rounded-lg p-6 space-y-5 border`}>
//       <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//         Upload Excel File
//       </h3>

//       {user && (
//         <div className={`p-3 rounded-lg ${
//           isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-blue-50 text-gray-700'
//         }`}>
//           <span className="text-sm">
//             Logged in as: <span className="font-medium">{user.name}</span>{' '}
//             <span className="text-xs opacity-75">({user.email}) - {userRole}</span>
//           </span>
//         </div>
//       )}

//       {(userRole === "employee" || userRole === "admin") && (
//         <div>
//           <input
//             type="text"
//             value={clientId}
//             onChange={(e) => setClientId(e.target.value)}
//             placeholder="Enter Client ID"
//             required
//             className={`w-full p-2 rounded-lg border ${
//               isDarkMode 
//                 ? 'bg-gray-700 border-gray-600 text-white' 
//                 : 'bg-white border-gray-300 text-gray-700'
//             }`}
//           />
//         </div>
//       )}

//       <div className="space-y-4">
//         <input
//           type="file"
//           accept=".xlsx, .xls, .csv"
//           onChange={handleFileChange}
//           className={`block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-lg file:border-0
//             file:text-sm file:font-medium
//             ${isDarkMode
//               ? 'file:bg-gray-600 file:text-white'
//               : 'file:bg-blue-50 file:text-blue-700'
//             }
//             ${isDarkMode
//               ? 'hover:file:bg-gray-500'
//               : 'hover:file:bg-blue-100'
//             }`}
//         />

//         {progress.step > 0 && (
//           <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
//             <div className="mb-3">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>Progress</span>
//                 <span>{getProgressPercentage()}%</span>
//               </div>
//               <div className={`w-full rounded-full h-2.5 ${
//                 isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
//               }`}>
//                 <div
//                   className="bg-blue-600 h-2.5 rounded-full"
//                   style={{ width: `${getProgressPercentage()}%` }}
//                 ></div>
//               </div>
//             </div>
//             <div className="text-sm">
//               {progress.message}
//             </div>
//           </div>
//         )}

//         {results && (
//           <div className={`p-4 rounded-lg ${
//             isDarkMode ? 'bg-gray-700' : 'bg-green-50'
//           }`}>
//             <h4 className="font-medium mb-2">Processing Results:</h4>
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <div>Total Records: <span className="font-medium">{progress.recordCount}</span></div>
//               <div className="text-green-600">Inserted: <span className="font-medium">{results.inserted}</span></div>
//               <div className="text-yellow-600">Duplicates: <span className="font-medium">{results.duplicates}</span></div>
//               <div className="text-red-600">Failed: <span className="font-medium">{results.failed}</span></div>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-3">
//           <button
//             onClick={handleFileUpload}
//             disabled={isUploading || !selectedFile || ((userRole === "employee" || userRole === "admin") && !clientId)}
//             className={`px-4 py-2 rounded-lg font-medium flex-1 ${
//               isDarkMode
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
//                 : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-400 disabled:text-gray-100'
//             }`}
//           >
//             {isUploading ? "Processing..." : "Upload and Process"}
//           </button>
//           <button
//             onClick={downloadTemplate}
//             className={`px-4 py-2 rounded-lg font-medium flex-1 ${
//               isDarkMode
//                 ? 'bg-gray-600 hover:bg-gray-500 text-white'
//                 : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
//             }`}
//           >
//             Download Template
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default FileUpload;



///////////////////////////////////////////////////client code suggestion////////////////////


// components/FileUpload.js - Upgraded with client ID dropdown
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from "xlsx";

function FileUpload({ isDarkMode }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [progress, setProgress] = useState({
    step: 0, // 0 = not started, 1 = uploading, 2 = extracting, 3 = processing
    message: "",
    recordCount: 0
  });
  const [results, setResults] = useState(null);
  
  // New states for client code dropdown
  const [clientCodes, setClientCodes] = useState([]);
  const [showClientCodes, setShowClientCodes] = useState(false);
  const clientCodeRef = useRef(null);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    const role = localStorage.getItem("role");
    setUserRole(role);
    if (getUser) setUser(JSON.parse(getUser));

    // Fetch client codes
    fetchClientCodes();
  }, []);

  const fetchClientCodes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
      setClientCodes(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch client codes:", error);
      toast.error("Failed to load client codes");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
        setShowClientCodes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResults(null);
    setProgress({ step: 0, message: "", recordCount: 0 });
  };

  const handleClientIdChange = (e) => {
    setClientId(e.target.value);
    setShowClientCodes(true);
  };

  const normalizeInput = (input) => {
    return input.trim().toUpperCase().replace(/\s+/g, "");
  };
  
  const filteredClientCodes = clientCodes.filter(code => 
    normalizeInput(code).includes(normalizeInput(clientId))
  );

  const handleClientCodeSelect = (code) => {
    setClientId(code);
    setShowClientCodes(false);
    // Focus back on the input after selection
    setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
  };

  const handleFileUpload = async () => {
    if (!validateInputs()) return;
    
    setIsUploading(true);
    setProgress({ ...progress, step: 1, message: "Uploading file..." });
    
    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", user.userId);
      if (userRole === "employee" || userRole === "admin") {
        formData.append("clientId", clientId);
      }

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-file`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadResponse.data.success) throw new Error(uploadResponse.data.message);

      // Step 2: Extract data
      setProgress({ ...progress, step: 2, message: "Extracting data..." });
      console.log("Response:", uploadResponse.data.fileKey);
      const extractResponse = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/extract-data/${uploadResponse.data.fileKey}`,
        { userId: user.userId, clientId }
      );

      if (!extractResponse.data.success) throw new Error(extractResponse.data.message);

      // Step 3: Process records
      setProgress({
        step: 3,
        message: `Processing records (0/${extractResponse.data.recordCount})`,
        recordCount: extractResponse.data.recordCount
      });

      const processResponse = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/process-records/${uploadResponse.data.fileKey}`,
        { 
          userId: user.userId, 
          clientId,
          ipAddress: extractResponse.data.ipAddress
        }
      );

      if (!processResponse.data.success) throw new Error(processResponse.data.message);

      // Complete
      setResults(processResponse.data.results);
      toast.success(
        <div>
          <div>Processing complete!</div>
          <div className="text-sm mt-1">
            {processResponse.data.results.inserted} inserted, {processResponse.data.results.duplicates} duplicates, 
            {processResponse.data.results.failed} failed
          </div>
        </div>
      );
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error(error.response?.data?.message || error.message || "Processing failed");
      setProgress({ step: 0, message: "", recordCount: 0 });
    } finally {
      setIsUploading(false);
    }
  };

  const validateInputs = () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return false;
    }
    if (!user) {
      toast.error("User details not found. Please log in.");
      return false;
    }
    if ((userRole === "employee" || userRole === "admin") && !clientId) {
      toast.error("Please enter Client ID.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelectedFile(null);
    setClientId("");
    setProgress({ step: 0, message: "", recordCount: 0 });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const downloadTemplate = () => {
    const worksheetData = [
      ["Name", "Product", "Account Number", "Requirement"],
    ];
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "KYC_Template.xlsx";
    link.click();
  
    toast.success("Template downloaded successfully!");
  };

  const getProgressPercentage = () => {
    if (progress.step === 3 && progress.recordCount > 0) {
      const processed = parseInt(progress.message.match(/\((\d+)\//)?.[1] || 0);
      return Math.min(100, Math.round((processed / progress.recordCount)) * 100);
    }
    return progress.step * 33; // 33% per steps
  };

  // Enhanced input style to match SingleUpload
  const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
    isDarkMode 
      ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
      : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
  }`;

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      rounded-lg p-6 space-y-5 border`}>
      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Upload Excel File
      </h3>

      {user && (
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-blue-50 text-gray-700'
        }`}>
          <span className="text-sm">
            Logged in as: <span className="font-medium">{user.name}</span>{' '}
            <span className="text-xs opacity-75">({user.email}) - {userRole}</span>
          </span>
        </div>
      )}

      {(userRole === "employee" || userRole === "admin") && (
        <div className="relative" ref={clientCodeRef}>
          <input
            type="text"
            value={clientId}
            onChange={handleClientIdChange}
            onFocus={() => setShowClientCodes(true)}
            placeholder="Enter the Client Code"
            required
            className={inputStyles}
          />
          {showClientCodes && clientId && filteredClientCodes.length > 0 && (
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

      <div className="space-y-4">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className={`block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            ${isDarkMode
              ? 'file:bg-gray-600 file:text-white'
              : 'file:bg-blue-50 file:text-blue-700'
            }
            ${isDarkMode
              ? 'hover:file:bg-gray-500'
              : 'hover:file:bg-blue-100'
            }`}
        />

        {progress.step > 0 && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className={`w-full rounded-full h-2.5 ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm">
              {progress.message}
            </div>
          </div>
        )}

        {results && (
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-green-50'
          }`}>
            <h4 className="font-medium mb-2">Processing Results:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Records: <span className="font-medium">{progress.recordCount}</span></div>
              <div className="text-green-600">Inserted: <span className="font-medium">{results.inserted}</span></div>
              <div className="text-yellow-600">Duplicates: <span className="font-medium">{results.duplicates}</span></div>
              <div className="text-red-600">Failed: <span className="font-medium">{results.failed}</span></div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleFileUpload}
            disabled={isUploading || !selectedFile || ((userRole === "employee" || userRole === "admin") && !clientId)}
            className={`px-4 py-2 rounded-lg font-medium flex-1 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
            }`}
          >
            {isUploading ? "Processing..." : "Upload and Process"}
          </button>
          <button
            onClick={downloadTemplate}
            className={`px-4 py-2 rounded-lg font-medium flex-1 ${
              isDarkMode
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;