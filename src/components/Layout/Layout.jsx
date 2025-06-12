
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {  
//   UserCircle, LayoutDashboard, Users, CheckSquare, LogOut, 
//   Settings, Sun, Moon, Activity, FileCheck, UserCheck, 
//   ShoppingCart, Store, Lock, ShieldCheck, Menu, X 
// } from "lucide-react";
// import axios from "axios";
// import ProfileHeader from "./ProfileHeader";
// import Logo from "../../assets/logo.jpeg";

// const Layout = ({ children }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState("");
//   const userRole = localStorage.getItem("role");
//   const [showProfile, setShowProfile] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem("theme");
//     return savedTheme === "dark";
//   });
//   const [draggedItem, setDraggedItem] = useState(null);
//   const dragImageRef = useRef(null);

//   useEffect(() => {
//     // Create a transparent drag image
//     const dragImage = new Image();
//     dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
//     dragImageRef.current = dragImage;
//   }, []);

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     const data = JSON.parse(getUser);
//     setUser(data);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("theme", isDarkMode ? "dark" : "light");
//     document.body.className = isDarkMode ? "dark" : "light";
//   }, [isDarkMode]);

//   const handleThemeToggle = () => {
//     const newTheme = !isDarkMode;
//     localStorage.setItem("theme", newTheme ? "dark" : "light");
//     setIsDarkMode(newTheme);
//     window.location.reload();
//   };

//   const getMenuItems = () => {
//     switch (userRole) {
//       case "root":
//         return [
//           { title: "Home", path: "/rootuser-dashboard", icon: LayoutDashboard },
//           { title: "Dashboard", path: "/dummyitems", icon: LayoutDashboard },
//           { title: "Create User", path: "/newuser", icon: Users },
//         ];
//       case "admin":
//         return [
//           { title: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
//           { title: "Create User", path: "/newuser", icon: Users },
//           { title: "Tracker", path: "/tracker", icon: Activity },
//           { title: "KYC Management", path: "/kyc", icon: FileCheck },
//           { title: "Employee Management", path: "/empmanager", icon: UserCheck },
//           { title: "Product-Management", path: "/product-management", icon: ShoppingCart },
//           { title: "Vandor-Management", path: "/vandor-management", icon: Store },
//           { title: "Access-Management", path: "/column-management", icon: Lock },
//           { title: "User-Management", path: "/user-management", icon: UserCheck },
//         ];
//       case "client":
//         return [
//           { title: "Dashboard", path: "/client-dashboard", icon: LayoutDashboard },
//           { title: "KYC", path: "/kyc", icon: CheckSquare },
//           { title: "Tracker", path: "/tracker", icon: Activity },
//         ];
//       case "customer":
//         return [
//           { title: "Dashboard", path: "/customer-dashboard", icon: LayoutDashboard },
//           { title: "Orders", path: "/customer-orders", icon: CheckSquare },
//         ];
//       case "employee":
//         return [
//           { title: "Dashboard", path: "/employee-dashboard", icon: LayoutDashboard },
//           { title: "KYC Management", path: "/kyc", icon: CheckSquare },
//           { title: "Tracker", path: "/tracker", icon: Users },
//         ];
//       case "vendor":
//         return [
//           { title: "Dashboard", path: "/vendor-dashboard", icon: LayoutDashboard },
//         ];
//       default:
//         return [];
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const userId = user.userId;
//       const response = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/auth/logout`,
//         { userId }
//       );
//       localStorage.removeItem("token");
//       localStorage.removeItem("role");
//       localStorage.removeItem("loginUser");
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Error fetching login history:", error);
//     }
//   };

//   const handleNavigation = (path) => {
//     navigate(path);
//     setMobileMenuOpen(false);
//   };

//   const handleDragStart = (e, item) => {
//     setDraggedItem(item);
//     e.dataTransfer.setData("text/uri-list", window.location.origin + item.path);
//     e.dataTransfer.setData("text/plain", item.title);
//     e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    
//     // Add visual feedback
//     e.currentTarget.style.opacity = "0.4";
//   };

//   const handleDragEnd = (e) => {
//     e.currentTarget.style.opacity = "1";
//     setDraggedItem(null);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     if (draggedItem) {
//       window.open(draggedItem.path, "_blank");
//     }
//   };

//   return (
//     <div className={`flex h-screen transition-colors duration-300 ${
//       isDarkMode 
//         ? 'bg-gray-900' 
//         : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
//     }`}>
//       {/* Desktop Sidebar */}
//       <div className={`hidden md:flex flex-col w-64 h-screen transition-colors duration-300 ${
//         isDarkMode
//           ? 'bg-gray-800 text-white'
//           : 'bg-white/95 backdrop-blur-sm border-r border-gray-200'
//       }`}>
//         {/* Sidebar Header */}
//         <div className={`flex items-center justify-between h-20 px-6 ${
//           isDarkMode
//             ? 'bg-gray-900'
//             : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300'
//         }`}>
//           <img src={Logo} alt="RVS Logo" className={`h-12`}/>
//           <button
//             onClick={handleThemeToggle}
//             className={`p-2 rounded-lg transition-colors ${
//               isDarkMode
//                 ? 'text-white hover:bg-gray-700'
//                 : 'text-gray-600 hover:bg-white/20'
//             }`}
//           >
//             {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//           </button>
//         </div>

//         {/* Sidebar Navigation */}
//         <div className="flex flex-col flex-1 overflow-y-auto">
//           <nav className="flex-1 px-4 py-4 space-y-2">
//             {getMenuItems().map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.path}
//                   onClick={() => navigate(item.path)}
//                   draggable="true"
//                   onDragStart={(e) => handleDragStart(e, item)}
//                   onDragEnd={handleDragEnd}
//                   className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
//                     location.pathname === item.path
//                       ? isDarkMode
//                         ? 'bg-blue-600 text-white shadow-md'
//                         : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
//                       : isDarkMode
//                         ? 'text-gray-300 hover:bg-gray-700'
//                         : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5 mr-3" />
//                   {item.title}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Mobile header and content */}
//       <div 
//         className="flex flex-col flex-1"
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//       >
//         {/* Mobile header */}
//         <div className={`md:hidden flex items-center justify-between p-4 z-50 ${
//           isDarkMode
//             ? 'bg-gray-800'
//             : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
//         }`}>
//           <div className="flex items-center">
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className={`mr-3 p-2 rounded-lg ${
//                 isDarkMode
//                   ? 'text-white hover:bg-gray-700'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//             <img src={Logo} alt="RVS Logo" className={`h-12`}/>
//           </div>
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleThemeToggle}
//               className={`p-2 rounded-lg ${
//                 isDarkMode
//                   ? 'text-white hover:bg-gray-700'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Overlay */}
//         {mobileMenuOpen && (
//           <div className={`md:hidden fixed inset-0 z-50 ${
//             isDarkMode ? 'bg-black/50' : 'bg-gray-600/50'
//           }`} onClick={() => setMobileMenuOpen(false)}>
//             <div 
//               className={`fixed top-0 left-0 h-full w-64 z-60 overflow-y-auto shadow-xl transition-transform duration-300 transform ${
//                 mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
//               } ${
//                 isDarkMode
//                   ? 'bg-gray-800 text-white'
//                   : 'bg-white text-gray-800'
//               }`}
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Mobile Menu Header */}
//               <div className={`flex items-center justify-between p-4 ${
//                 isDarkMode
//                   ? 'bg-gray-900'
//                   : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300'
//               }`}>
//                 <img src={Logo} alt="RVS Logo" className={`h-12`}/>
//                 <button
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`p-2 rounded-lg ${
//                     isDarkMode
//                       ? 'text-white hover:bg-gray-700'
//                       : 'text-gray-600 hover:bg-white/20'
//                   }`}
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Mobile Menu Items */}
//               <div className="p-4 space-y-2">
//                 {getMenuItems().map((item) => {
//                   const Icon = item.icon;
//                   return (
//                     <button
//                       key={item.path}
//                       onClick={() => handleNavigation(item.path)}
//                       draggable="true"
//                       onDragStart={(e) => handleDragStart(e, item)}
//                       onDragEnd={handleDragEnd}
//                       className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
//                         location.pathname === item.path
//                           ? isDarkMode
//                             ? 'bg-blue-600 text-white shadow-md'
//                             : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
//                           : isDarkMode
//                             ? 'text-gray-300 hover:bg-gray-700'
//                             : 'text-gray-600 hover:bg-gray-100'
//                       }`}
//                     >
//                       <Icon className="w-5 h-5 mr-3" />
//                       {item.title}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main content */}
//         <main className={`flex-1 overflow-y-auto p-2 relative ${
//           isDarkMode
//             ? 'bg-gray-900'
//             : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
//         }`}>
//           <div className=" z-[50] mb-2 relative"> 
//             <ProfileHeader />
//           </div>
//           {!isDarkMode && (
//             <div className="absolute inset-0 bg-repeat opacity-10 z-0"
//               style={{
//                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23F0F0F0' d='M0 0l24 24M24 0l-24 24'/%3E%3C/svg%3E")`,
//                 backgroundSize: '24px 24px'
//               }}>
//             </div>
//           )}
//           <div className="relative z-10">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;


/////////////////////////////////////////////////////////////////////////////resolve white theme overlapping and opening issue////////////


import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {  
  UserCircle, LayoutDashboard, Users, CheckSquare, LogOut, 
  Settings, Sun, Moon, Activity, FileCheck, UserCheck, 
  ShoppingCart, Store, Lock, ShieldCheck, Menu, X 
} from "lucide-react";
import axios from "axios";
import ProfileHeader from "./ProfileHeader";
import Logo from "../../assets/logo.jpeg";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("");
  const userRole = localStorage.getItem("role");
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const dragImageRef = useRef(null);

  useEffect(() => {
    // Create a transparent drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    dragImageRef.current = dragImage;
  }, []);

  useEffect(() => {
    const getUser = localStorage.getItem("loginUser");
    const data = JSON.parse(getUser);
    setUser(data);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    setIsDarkMode(newTheme);
    window.location.reload();
  };

  const getMenuItems = () => {
    switch (userRole) {
      case "root":
        return [
          { title: "Home", path: "/rootuser-dashboard", icon: LayoutDashboard },
          { title: "Dashboard", path: "/dummyitems", icon: LayoutDashboard },
          { title: "Create User", path: "/newuser", icon: Users },
        ];
      case "admin":
        return [
          { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
          { title: "Create User", path: "/newuser", icon: Users },
          { title: "Tracker", path: "/tracker", icon: Activity },
          { title: "KYC Management", path: "/kyc", icon: FileCheck },
          { title: "Employee Management", path: "/empmanager", icon: UserCheck },
          { title: "Product-Management", path: "/product-management", icon: ShoppingCart },
          { title: "Vendor-Management", path: "/vandor-management", icon: Store },
          { title: "Access-Management", path: "/column-management", icon: Lock },
          { title: "User-Management", path: "/user-management", icon: UserCheck },
          // { title: "New-Dashboard", path: "/live-dashboard", icon: LayoutDashboard }
          
        ];
      case "client":
        return [

          { title: "Dashboard", path: "/client-dashboard", icon: LayoutDashboard },
          { title: "KYC", path: "/kyc", icon: CheckSquare },
          { title: "Tracker", path: "/tracker", icon: Activity },
        ];
      case "customer":
        return [
          { title: "Dashboard", path: "/customer-dashboard", icon: LayoutDashboard },
          { title: "Orders", path: "/customer-orders", icon: CheckSquare },
        ];
      case "employee":
        return [
          { title: "New-Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
          { title: "Dashboard", path: "/employee-dashboard", icon: LayoutDashboard },
          { title: "KYC Management", path: "/kyc", icon: CheckSquare },
          { title: "Tracker", path: "/tracker", icon: Users },
        ];
      case "vendor":
        return [
          { title: "Dashboard", path: "/vendor-dashboard", icon: LayoutDashboard },
        ];
      default:
        return [];
    }
  };

  const handleLogout = async () => {
    try {
      const userId = user.userId;
      const response = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/auth/logout`,
        { userId }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginUser");
      window.location.href = "/";
    } catch (error) {
      console.error("Error fetching login history:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/uri-list", window.location.origin + item.path);
    e.dataTransfer.setData("text/plain", item.title);
    e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    
    // Add visual feedback
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      window.open(draggedItem.path, "_blank");
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
    }`}>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col w-64 h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800 text-white'
          : 'bg-white/95 backdrop-blur-sm border-r border-gray-200'
      }`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between h-20 px-6 ${
          isDarkMode
            ? 'bg-gray-900'
            : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300'
        }`}>
          <img src={Logo} alt="RVS Logo" className={`h-12`}/>
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'text-white hover:bg-gray-700'
                : 'text-gray-600 hover:bg-white/20'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-2">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile header and content */}
      <div 
        className="flex flex-col flex-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Mobile header */}
        <div className={`md:hidden flex items-center justify-between p-4 z-10 ${
          isDarkMode
            ? 'bg-gray-800'
            : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
        }`}>
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`mr-3 p-2 rounded-lg ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <img src={Logo} alt="RVS Logo" className={`h-12`}/>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className={`md:hidden fixed inset-0 z-50 ${
            isDarkMode ? 'bg-black/50' : 'bg-gray-600/50'
          }`} onClick={() => setMobileMenuOpen(false)}>
            <div 
              className={`fixed top-0 left-0 h-full w-64 z-60 overflow-y-auto shadow-xl transition-transform duration-300 transform ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              } ${
                isDarkMode
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className={`flex items-center justify-between p-4 ${
                isDarkMode
                  ? 'bg-gray-900'
                  : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300'
              }`}>
                <img src={Logo} alt="RVS Logo" className={`h-12`}/>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-white/20'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Items */}
              <div className="p-4 space-y-2">
                {getMenuItems().map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                        location.pathname === item.path
                          ? isDarkMode
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto p-2 ${
          isDarkMode
            ? 'bg-gray-900'
            : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
        } relative`}>
          {/* Pattern overlay that sits behind content */}
          {!isDarkMode && (
            <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23F0F0F0' d='M0 0l24 24M24 0l-24 24'/%3E%3C/svg%3E")`,
                backgroundSize: '24px 24px'
              }}>
            </div>
          )}
          
          {/* Content with correct z-index layering */}
          <div className="relative">
            {/* Profile header that works in both themes */}
            <div className="mb-2">
              <ProfileHeader />
            </div>
            
            {/* Main children content */}
            <div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;