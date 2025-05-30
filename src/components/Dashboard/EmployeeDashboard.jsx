// import React from 'react'
// import Layout from '../Layout/Layout'
// import { Link } from "react-router-dom";


// const EmployeeDashboard = () => {
//   return (
//     <Layout>
//     <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex flex-col items-center justify-center p-10 w-full text-white">
//       <h1 className="text-6xl font-bold mb-6">Welcome, Employee!</h1>
//       <p className="text-lg mb-12">View and process KYC requests efficiently with ease.</p>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-10">
//       <Link to="/updatekyc" className="bg-purple-500 text-white py-6 px-8 rounded-xl shadow-lg hover:bg-purple-600 transition text-xl text-center">
//          Assigned Tasks
//         </Link>
//         <Link to="/pendingkyc" className="bg-green-500 text-white py-6 px-8 rounded-xl shadow-lg hover:bg-green-600 transition text-xl text-center">
//           KYC Requests
//         </Link>
//         <Link to="/newuser" className="bg-blue-500 text-white py-6 px-8 rounded-xl shadow-lg hover:bg-blue-600 transition text-xl text-center">
//           Add Employee
//         </Link>
//       </div>
//     </div>
//     </Layout>
//   )
// }

// export default EmployeeDashboard


////////////////////////////////////////////////


import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { Link } from "react-router-dom";
import { FileText, Activity } from "lucide-react";

const EmployeeDashboard = () => {
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
  
  const sectionStyles = {
    container: `min-h-[calc(100vh-100px)] ${bgGradient} flex flex-col items-center justify-center p-10 w-full ${
      isDarkMode ? 'text-white' : 'text-black'
    }`,
    title: `text-6xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-600'}`,
    subtitle: `text-lg mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`,
    gridContainer: "grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl px-10"
  };

  const sections = [
    {
      title: "KYC Management",
      to: "/kyc",
      icon: FileText,
      bgColor: isDarkMode 
        ? "bg-blue-800 hover:bg-blue-700" 
        : "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Tracker",
      to: "/tracker",
      icon: Activity,
      bgColor: isDarkMode 
        ? "bg-green-800 hover:bg-green-700" 
        : "bg-green-500 hover:bg-green-600"
    }
  ];

  return (
    <Layout>
      <div className={sectionStyles.container}>
        <h1 className={sectionStyles.title}>Welcome, Employee!</h1>
        <p className={sectionStyles.subtitle}>
          Manage and track KYC processes efficiently
        </p>

        <div className={sectionStyles.gridContainer}>
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link 
                key={index}
                to={section.to}
                className={`
                  ${section.bgColor} 
                  text-white 
                  py-8 
                  px-10 
                  rounded-xl 
                  shadow-lg 
                  transition 
                  text-xl 
                  text-center 
                  flex 
                  flex-col 
                  items-center 
                  justify-center 
                  space-y-4
                  transform 
                  hover:-translate-y-2 
                  hover:scale-105
                `}
              >
                <Icon className="w-12 h-12" />
                <span>{section.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;