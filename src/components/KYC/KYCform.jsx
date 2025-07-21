import React, { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import { useNavigate } from "react-router-dom";
import SingleUpload from "./CaseUpload-Methods/SingleUpload";
import FileUpload from "./CaseUpload-Methods/FileUpload";
import { FileText, Users, ArrowUpDown, FileCheck, AlertCircle } from "lucide-react";

const KYCform = () => {
  const [isMultiple, setIsMultiple] = useState(false);
  const navigate = useNavigate();
  
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

  return (
    <Layout>
        <div className="w-auto mx-auto space-y-2">   

          
          {/* Application Type Selection */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white/95 backdrop-blur-sm'
          } rounded p-6 shadow-xl`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Select Application Type</h2>
              
              <div className={`flex items-center mt-4 md:mt-0 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              } p-3 rounded-lg`}>
                <span className={`${
                  !isMultiple 
                    ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold') 
                    : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                } transition-colors`}>Single Apply</span>
                
                <div
                  className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all mx-4 ${
                    isMultiple 
                      ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500') 
                      : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                  onClick={() => setIsMultiple(!isMultiple)}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
                    isMultiple ? 'translate-x-7' : ''
                  }`} />
                </div>
                
                <span className={`${
                  isMultiple 
                    ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold') 
                    : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                } transition-colors`}>Multiple Apply</span>
              </div>
            </div>
            
            {!isMultiple && (
              <SingleUpload isDarkMode={isDarkMode} />
            )}
          </div>

          {/* Multiple Application Section */}
          {isMultiple && (
            <div className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white/95 backdrop-blur-sm'
            } rounded-xl p-6 shadow-xl`}>
              <div className="flex items-center mb-6">
                <ArrowUpDown className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Choose Upload Method</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileUpload isDarkMode={isDarkMode} />
                
                <div className={`${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                } rounded-lg p-6 space-y-5`}>
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Upload via Excel</h3>
                  
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload multiple applications at once using our Excel template.
                  </p>
                  
                  <div className="flex items-center">
                    <div className={`mr-4 p-3 rounded-lg ${
                      isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Excel Template
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        For bulk uploading applications
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white'
                    }`} 
                    onClick={() => navigate("/excel-upload")}
                  >
                    📊 Apply Using Excel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      {/* </div> */}
    </Layout>
  );
};

export default KYCform;



// import React, { useState, useEffect } from "react";
// import Layout from "../Layout/Layout";
// import { useNavigate } from "react-router-dom";
// import SingleUpload from "./CaseUpload-Methods/SingleUpload";
// import FileUpload from "./CaseUpload-Methods/FileUpload";
// import { FileText, Users, ArrowUpDown, FileCheck, AlertCircle } from "lucide-react";

// const KYCform = () => {
//   const [isMultiple, setIsMultiple] = useState(false);
//   const navigate = useNavigate();
  
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

//   return (
//     <Layout>
//         <div className="max-w-7xl mx-auto space-y-2">   

          
//           {/* Application Type Selection */}
//           <div className={`${
//             isDarkMode 
//               ? 'bg-gray-800 border-gray-700' 
//               : 'bg-white/95 backdrop-blur-sm'
//           } rounded p-6 shadow-xl`}>
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//               <h2 className={`text-xl font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>Select Application Type</h2>
              
//               <div className={`flex items-center mt-4 md:mt-0 ${
//                 isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
//               } p-3 rounded-lg`}>
//                 <span className={`${
//                   !isMultiple 
//                     ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold') 
//                     : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
//                 } transition-colors`}>Single Apply</span>
                
//                 <div
//                   className={`relative w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all mx-4 ${
//                     isMultiple 
//                       ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500') 
//                       : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
//                   }`}
//                   onClick={() => setIsMultiple(!isMultiple)}
//                 >
//                   <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
//                     isMultiple ? 'translate-x-7' : ''
//                   }`} />
//                 </div>
                
//                 <span className={`${
//                   isMultiple 
//                     ? (isDarkMode ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold') 
//                     : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
//                 } transition-colors`}>Multiple Apply</span>
//               </div>
//             </div>
            
//             {!isMultiple && (
//               <SingleUpload isDarkMode={isDarkMode} />
//             )}
//           </div>

//           {/* Multiple Application Section */}
//           {isMultiple && (
//             <div className={`${
//               isDarkMode 
//                 ? 'bg-gray-800 border-gray-700' 
//                 : 'bg-white/95 backdrop-blur-sm'
//             } rounded-xl p-6 shadow-xl`}>
//               <div className="flex items-center mb-6">
//                 <ArrowUpDown className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 <h3 className={`text-lg font-semibold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>Choose Upload Method</h3>
//               </div>
              
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <FileUpload isDarkMode={isDarkMode} />
                
//                 <div className={`${
//                   isDarkMode 
//                     ? 'bg-gray-800 border border-gray-700' 
//                     : 'bg-white border border-gray-200'
//                 } rounded-lg p-6 space-y-5`}>
//                   <h3 className={`text-xl font-semibold ${
//                     isDarkMode ? 'text-white' : 'text-gray-900'
//                   }`}>Upload via Excel</h3>
                  
//                   <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                     Upload multiple applications at once using our Excel template.
//                   </p>
                  
//                   <div className="flex items-center">
//                     <div className={`mr-4 p-3 rounded-lg ${
//                       isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-100'
//                     }`}>
//                       <FileText className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
//                     </div>
//                     <div>
//                       <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         Excel Template
//                       </h4>
//                       <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
//                         For bulk uploading applications
//                       </p>
//                     </div>
//                   </div>
                  
//                   <button 
//                     className={`w-full py-3 rounded-lg font-medium transition-all ${
//                       isDarkMode
//                         ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
//                         : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white'
//                     }`} 
//                     onClick={() => navigate("/excel-upload")}
//                   >
//                     📊 Apply Using Excel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       {/* </div> */}
//     </Layout>
//   );
// };

// export default KYCform;