// import React, { useState, useEffect, useRef } from 'react';
// import { User, ChevronDown, LogOut, Settings } from 'lucide-react';

// const ProfileHeader = () => {
//   const [user, setUser] = useState({
//     name: '',
//     email: '',
//     phoneNumber: '',
//     role: '',
//     userId: ''
//   });
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
  
//   // Get theme from localStorage (synced with Layout component)
//   const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setUser(data);
//     }
//   }, []);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Watch for theme changes
//   useEffect(() => {
//     const handleStorageChange = () => {
//       setIsDarkMode(localStorage.getItem("theme") === "dark");
//     };
    
//     window.addEventListener('storage', handleStorageChange);
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);


//   return (
//     <div className={`w-full px-4 py-2  p-4 rounded  flex justify-between items-center shadow-md ${
//       isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
//     }`}>
//       <div className="flex items-center">
//         <h1 className={`text-xl font-bold ${
//           isDarkMode ? 'text-blue-400' : 'text-blue-700'
//         }`}>
//           KYC Tracker
//         </h1>
//       </div>
      
//       <div className="relative" ref={dropdownRef}>
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
//             isDarkMode 
//               ? 'hover:bg-gray-700 focus:bg-gray-700' 
//               : 'hover:bg-gray-100 focus:bg-gray-100'
//           }`}
//         >
//           <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
//             isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
//           }`}>
//             <User className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//           </div>
//           <div className="text-sm font-medium hidden md:block">{user.name || 'User'}</div>
//           <ChevronDown className="h-4 w-4" />
//         </button>
        
//         {isOpen && (
//           <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50 ${
//             isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
//           }`}>
//             <div className="p-4 border-b border-opacity-20 border-gray-300">
//               <div className="flex items-center space-x-3">
//                 <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
//                   isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
//                 }`}>
//                   <User className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
//                 </div>
//                 <div>
//                   <p className="font-medium">{user.name || 'User'}</p>
//                   <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {user.email || 'user@example.com'}
//                   </p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-2">
//               <div className={`p-3 rounded-md ${
//                 isDarkMode ? 'text-gray-300' : 'text-gray-700'
//               }`}>
//                 <div className="text-xs font-semibold uppercase mb-2 opacity-60">User Info</div>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm opacity-70">Role:</span>
//                     <span className="text-sm font-medium">{user.role || 'User'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm opacity-70">User ID:</span>
//                     <span className="text-sm font-medium">{user.userId || 'N/A'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm opacity-70">Phone:</span>
//                     <span className="text-sm font-medium">{user.phoneNumber || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-2 pt-0">
//               <button className={`flex items-center w-full space-x-2 p-2 rounded-md text-sm ${
//                 isDarkMode 
//                   ? 'hover:bg-gray-700 text-gray-300' 
//                   : 'hover:bg-gray-100 text-gray-700'
//               }`}>
//                 <LogOut className="h-4 w-4" />
//                 <span>Log out</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileHeader;

///////////////////////////////////////////


import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, LogOut, Settings } from 'lucide-react';
import axios from 'axios';  // Import axios for logout API request

 const ProfileHeader = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    userId: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    
    if (getUser) {
      const data = JSON.parse(getUser);
      setUser(data);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // **Updated handleLogout function**
  const handleLogout = async () => {
    try {
      const userId = user.userId; // Get userId from state
      await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/auth/logout`, { userId });
      
      // Clear user data and token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginUser");
      
      // Redirect to login page or home
      window.location.href = "/";  // Or you can use useNavigate() if it's within a React Router setup
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
      <div className={`w-full px-4 py-2 p-4 rounded flex justify-between items-center shadow-md ${
        isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
      }`}>
      <div className="flex items-center">
        <h1 className={`text-xl font-bold ${
          isDarkMode ? 'text-blue-400' : 'text-blue-700'
        }`}>
          {/* KYC Tracker */}
        </h1>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700 focus:bg-gray-700' 
              : 'hover:bg-gray-100 focus:bg-gray-100'
          }`}
        >
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
          }`}>
            <User className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          {/* <div className="text-sm font-medium hidden md:block">{user.name || 'User'}</div> */}
          <div className="text-sm font-medium hidden md:block">{user.userId || 'User'}</div>
          <ChevronDown className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50 ${
            isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
          }`}>
            <div className="p-4 border-b border-opacity-20 border-gray-300">
              <div className="flex items-center space-x-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                }`}>
                  <User className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-medium">{user.userId || 'User'}</p>
                  {/* <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email || 'user@example.com'}
                  </p> */}
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <div className={`p-3 rounded-md ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <div className="text-xs font-semibold uppercase mb-2 opacity-60">User Info</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-70">Role:</span>
                    <span className="text-sm font-medium">{user.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-70">User Name:</span>
                    <span className="text-sm font-medium">{user.name || 'N/A'}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-sm opacity-70">Phone:</span>
                    <span className="text-sm font-medium">{user.phoneNumber || 'N/A'}</span>
                  </div> */}
                </div>
              </div>
            </div>
            
            <div className="p-2 pt-0">
              {/* **Updated logout button** */}
              <button
                onClick={handleLogout} // Added the handleLogout function here
                className={`flex items-center w-full space-x-2 p-2 rounded-md text-sm ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;


