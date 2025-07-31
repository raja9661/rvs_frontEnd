import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from "xlsx";
import { AlertCircle } from 'lucide-react';


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
  const [ReferBy, setReferBy] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  // New states for client code dropdown
  const [clientCodes, setClientCodes] = useState([]);
  const [showClientCodes, setShowClientCodes] = useState(false);
  const clientCodeRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    const role = sessionStorage.getItem("role");
    setUserRole(role);
    if (getUser) setUser(JSON.parse(getUser));

    // Fetch client codes
    fetchClientCodes();

    // Clean up event listeners when component unmounts
    return () => {
      document.removeEventListener('dragover', preventDefaults);
      document.removeEventListener('drop', preventDefaults);
    };
  }, []);

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

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

  const handleDragEnter = (e) => {
    preventDefaults(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    preventDefaults(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    preventDefaults(e);
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFileType(file)) {
        setSelectedFile(file);
        setResults(null);
        setProgress({ step: 0, message: "", recordCount: 0 });
      } else {
        toast.error("Please upload only Excel or CSV files");
      }
    }
  };

  const validateFileType = (file) => {
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return validTypes.includes(file.type) || ['xls', 'xlsx', 'csv'].includes(fileExtension);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFileType(file)) {
      setSelectedFile(file);
      setResults(null);
      setProgress({ step: 0, message: "", recordCount: 0 });
    } else {
      toast.error("Please upload only Excel or CSV files");
    }
  };

  const handleClientIdChange = (e) => {
    setClientId(e.target.value);
    setShowClientCodes(true);
  };

  const handleInputChange = (e) => {
    setReferBy(e.target.value);
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
      formData.append("ReferBy", ReferBy);
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
          ipAddress: extractResponse.data.ipAddress,
          ReferBy
        }
      );

      if (!processResponse.data.success) throw new Error(processResponse.data.message);

      // Complete
      setResults(processResponse.data.results);
      toast.success(
        <div>
          <div>Processing complete!</div>
          <div className="text-sm mt-1">
            {processResponse.data.results.total} total,{processResponse.data.results.inserted} inserted, {processResponse.data.results.duplicates} duplicates, 
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
    if (!ReferBy) {
      toast.error("Please enter 'Refer By' information.");
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
      return Math.min(100, Math.round((processed / progress.recordCount) * 100));
    }
    return progress.step * 33; // 33% per steps
  };

  // Enhanced input style to match SingleUpload
  const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
    isDarkMode 
      ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
      : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
  }`;

  const dropAreaStyles = `border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
    isDragging 
      ? 'border-blue-500 bg-blue-100/20' 
      : isDarkMode 
        ? 'border-gray-600 hover:border-gray-500' 
        : 'border-gray-300 hover:border-gray-400'
  } ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`;

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      rounded-lg p-6 space-y-5 border`}>
        <div className="flex gap-5">
      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Upload Excel File
      </h3>

{/* instructions */}
<div className="relative inline-block group">
  <button className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
    isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`}>
    <span className="text-xs font-bold">i</span>
  </button>

  {/* Tooltip on the right side */}
  <div className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-3 w-80 p-4 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none ${
    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
  }`}>
    
    {/* Arrow */}
    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${
      isDarkMode ? 'border-r-gray-800' : 'border-r-white'
    }`}></div>

    <div className="flex items-start">
      <AlertCircle className={`w-5 h-5 mr-2 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      <div>
        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Instructions
        </p>
        <ul className={`mt-2 space-y-1 list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
          <li><strong>All fields are mandatory:</strong> Refer By and Client Code must be filled before uploading the file.</li>
          <li><strong>File Format:</strong> Ensure the uploaded file is in Excel (.xlsx, .xls) or CSV format.</li>
          <li><strong>Smart Validation:</strong> The system will validate the file contents during the upload process.</li>
          <li><strong>Progress Tracking:</strong> You will see the progress of the upload and processing steps.</li>
          <li><strong>Results Summary:</strong> After processing, a summary of the results will be displayed, including total records, inserted, duplicates, and failed records.</li>
          <li><strong>Download Template:</strong> Use the "Download Template" button to get a sample file format for your uploads.</li>
        </ul>
      </div>
    </div>
  </div>
</div>
</div>
      {/* <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Upload Excel File
      </h3> */}

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
            placeholder="* Enter the Client Code"
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
      
      <div className="relative">
        <input
          type="text"
          value={ReferBy}
          onChange={handleInputChange}
          placeholder=" * Refer By"
          className={inputStyles}
        />
      </div>

      <div className="space-y-4">
        {/* Drag and Drop Area */}
        <div 
          ref={dropAreaRef}
          className={dropAreaStyles}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg 
              className={`w-10 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isDragging ? 'Drop your file here' : 'Drag and drop your file here or'}
            </p>
            <label 
              htmlFor="file-upload"
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Browse Files
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Selected file info */}
        {selectedFile && (
          <div className={`p-3 rounded-lg flex items-center justify-between ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className="flex items-center space-x-2">
               <svg 
                className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-blue-500'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className={`p-1 rounded-full ${
                isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-blue-100 text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

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
              <div>Total Records: <span className="font-medium">{results.total}</span></div>
              <div className="text-green-600">Inserted: <span className="font-medium">{results.inserted}</span></div>
              <div className="text-yellow-600">Duplicates: <span className="font-medium">{results.duplicates}</span></div>
              <div className="text-red-600">Failed: <span className="font-medium">{results.failed}</span></div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleFileUpload}
            disabled={isUploading || !selectedFile || ((userRole === "employee" || userRole === "admin") && !clientId) || !ReferBy}
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

// import { useState, useEffect, useRef } from "react";
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
//   const [ReferBy,setReferBy] = useState("")
  
//   // New states for client code dropdown
//   const [clientCodes, setClientCodes] = useState([]);
//   const [showClientCodes, setShowClientCodes] = useState(false);
//   const clientCodeRef = useRef(null);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const role = sessionStorage.getItem("role");
//     setUserRole(role);
//     if (getUser) setUser(JSON.parse(getUser));

//     // Fetch client codes
//     fetchClientCodes();
//   }, []);

//   const fetchClientCodes = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/mapping/clientCodes`);
//       setClientCodes(response.data.data || []);
//     } catch (error) {
//       console.error("Failed to fetch client codes:", error);
//       toast.error("Failed to load client codes");
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (clientCodeRef.current && !clientCodeRef.current.contains(event.target)) {
//         setShowClientCodes(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//     setResults(null);
//     setProgress({ step: 0, message: "", recordCount: 0 });
//   };

//   const handleClientIdChange = (e) => {
//     setClientId(e.target.value);
//     setShowClientCodes(true);
//   };

//    const handleInputChange = (e) => {
//     setReferBy(e.target.value);
//   };

//   const normalizeInput = (input) => {
//     return input.trim().toUpperCase().replace(/\s+/g, "");
//   };
  
//   const filteredClientCodes = clientCodes.filter(code => 
//     normalizeInput(code).includes(normalizeInput(clientId))
//   );

//   const handleClientCodeSelect = (code) => {
//     setClientId(code);
//     setShowClientCodes(false);
//     // Focus back on the input after selection
//     setTimeout(() => clientCodeRef.current.querySelector('input').focus(), 0);
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
//       formData.append("ReferBy", ReferBy);
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
//       console.log("Response:", uploadResponse.data.fileKey);
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
//           ipAddress: extractResponse.data.ipAddress,
//           ReferBy
//         }
//       );

//       if (!processResponse.data.success) throw new Error(processResponse.data.message);

//       // Complete
//       setResults(processResponse.data.results);
//       toast.success(
//         <div>
//           <div>Processing complete!</div>
//           <div className="text-sm mt-1">
//             {processResponse.data.results.total} total,{processResponse.data.results.inserted} inserted, {processResponse.data.results.duplicates} duplicates, 
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
//       if (!ReferBy) {
//     toast.error("Please enter 'Refer By' information.");
//     return false;
//   }
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

//   // Enhanced input style to match SingleUpload
//   const inputStyles = `w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
//     isDarkMode 
//       ? 'bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 placeholder-gray-400' 
//       : 'bg-white border border-gray-200 text-gray-900 focus:ring-blue-400 placeholder-gray-500'
//   }`;

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
//         <div className="relative" ref={clientCodeRef}>
//           <input
//             type="text"
//             value={clientId}
//             onChange={handleClientIdChange}
//             onFocus={() => setShowClientCodes(true)}
//             placeholder="Enter the Client Code"
//             required
//             className={inputStyles}
//           />
//           {showClientCodes && clientId && filteredClientCodes.length > 0 && (
//             <div className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-lg ${
//               isDarkMode 
//                 ? "bg-gray-800 border border-gray-700" 
//                 : "bg-white border border-gray-200"
//             }`}>
//               {filteredClientCodes.map((code, index) => (
//                 <div
//                   key={index}
//                   onMouseDown={(e) => e.preventDefault()} // Prevent input blur
//                   onClick={() => handleClientCodeSelect(code)}
//                   className={`p-2 cursor-pointer hover:bg-blue-50 ${
//                     isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
//                   }`}
//                 >
//                   {code}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//       <div className="relative" >
//           <input
//             type="text"
//             value={ReferBy}
//             onChange={handleInputChange}
//             placeholder="Refer By"
//             className={inputStyles}
//           />
//         </div>

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
//               <div>Total Records: <span className="font-medium">{results.total}</span></div>
//               <div className="text-green-600">Inserted: <span className="font-medium">{results.inserted}</span></div>
//               <div className="text-yellow-600">Duplicates: <span className="font-medium">{results.duplicates}</span></div>
//               <div className="text-red-600">Failed: <span className="font-medium">{results.failed}</span></div>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-3">
//           <button
//             onClick={handleFileUpload}
//             disabled={isUploading || !selectedFile || ((userRole === "employee" || userRole === "admin") && !clientId) || !ReferBy}
//             className={`px-4 py-2 rounded-lg font-medium flex-1 ${
//               isDarkMode
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:text-gray-300'
//                 : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white disabled:from-blue-400 disabled:to-indigo-400 disabled:opacity-70'
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