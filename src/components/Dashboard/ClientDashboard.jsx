// import React from 'react'
// import Layout from '../Layout/Layout'
// import { useNavigate } from "react-router-dom";


// const ClientDashboard = () => {
//   const navigate = useNavigate();

//   return (
//     <Layout>
//     <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white p-6">
//       {/* Hero Section */}
//       <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-10">
//         {/* Left Side - Text Content */}
//         <div className="md:w-1/2 text-center md:text-left">
//           <h1 className="text-5xl font-extrabold leading-tight">
//             Welcome to <span className="text-yellow-300">KYC Portal</span>
//           </h1>
//           <p className="mt-4 text-lg text-gray-200">
//             Verify your identity securely and efficiently with our seamless KYC process.
//           </p>

//           {/* Buttons */}
//           <div className="mt-6 flex flex-col sm:flex-row gap-4">
//             <button
//               onClick={() => navigate("/kyc")}
//               className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition duration-300"
//             >
//               Apply for KYC
//             </button>
//             <button
//               onClick={() => navigate("/track-status-client")}
//               className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition duration-300"
//             >
//               Track KYC Status
//             </button>
//           </div>
//         </div>

//         {/* Right Side - Image */}
//         <div className="md:w-1/2 flex justify-center">
//           <img
//             src="https://media.istockphoto.com/id/1311320069/photo/photo-on-know-your-customer-guidelines-in-financial-services-theme-wooden-cubes-with-the.jpg?s=612x612&w=0&k=20&c=eax03KybTXMVjv_aoPUDsCCKEvvqwNysuk43UKdXceo="
//             alt="KYC Verification"
//             className="rounded-lg shadow-xl w-full max-w-md"
//           />
//         </div>
//       </div>
//     </div>
//     </Layout>
//   )
// }

// export default ClientDashboard


///////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const navigate = useNavigate();
  
  // Get theme from localStorage (synced with Layout component)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Effect to listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Dynamic background and text classes based on theme
  const bgGradient = isDarkMode 
    ? "bg-gradient-to-r from-gray-900 to-gray-800" 
    : "bg-white/95 backdrop-blur-sm";
  
  const textStyles = {
    title: isDarkMode ? "text-white" : "text-gray-900",
    subtitle: isDarkMode ? "text-gray-400" : "text-gray-600",
    highlight: isDarkMode ? "text-yellow-400" : "text-indigo-600"
  };

  return (
    <Layout>
      {/* <div className={`min-h-screen ${bgGradient} flex flex-col items-center justify-center p-6 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}> */}
        {/* Hero Section */}
        <div className={`min-h-[calc(100vh-100px)] max-w-7xl w-full flex flex-col md:flex-row items-center gap-10 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white/95 backdrop-blur-sm rounded-lg shadow-xl'
        } p-8`}>
          {/* Left Side - Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className={`text-5xl font-extrabold leading-tight ${textStyles.title}`}>
              Welcome to <span className={textStyles.highlight}>RVS DOC</span>
            </h1>
            <p className={`mt-4 text-lg ${textStyles.subtitle}`}>
              Verify your identity securely and efficiently with our seamless KYC process.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/kyc")}
                className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ${
                  isDarkMode
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-blue-500 hover:to-cyan-500'
                }`}
              >
                Apply for KYC
              </button>
              <button
                onClick={() => navigate("/client-tracker")}
                className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white border border-gray-200 text-blue-600 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                Track KYC Status
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://media.istockphoto.com/id/1311320069/photo/photo-on-know-your-customer-guidelines-in-financial-services-theme-wooden-cubes-with-the.jpg?s=612x612&w=0&k=20&c=eax03KybTXMVjv_aoPUDsCCKEvvqwNysuk43UKdXceo="
              alt="KYC Verification"
              className={`rounded-lg shadow-xl w-full max-w-md ${
                isDarkMode 
                  ? "opacity-80 hover:opacity-100" 
                  : "opacity-100"
              } transition-opacity duration-300`}
            />
          </div>
        {/* </div> */}
      </div>
    </Layout>
  );
};

export default ClientDashboard;