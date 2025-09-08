// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {  
//   UserCircle, LayoutDashboard, Users, CheckSquare, LogOut, 
//   Settings, Sun, Moon, Activity, FileCheck, UserCheck, 
//   ShoppingCart, Store, Lock, ShieldCheck, Menu, X, ChevronLeft, ChevronRight, Columns, HelpCircle
// } from "lucide-react";
// import axios from "axios";
// import ProfileHeader from "./ProfileHeader";
// import Logo from "../../assets/logo.jpeg";

// const Layout = ({ children }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState("");
//   const userRole = sessionStorage.getItem("role");
//   const [showProfile, setShowProfile] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     const savedState = localStorage.getItem("sidebarCollapsed");
//     return savedState === "true";
//   });
//   const [sidebarHovered, setSidebarHovered] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const savedTheme = localStorage.getItem("theme");
//     return savedTheme === "dark";
//   });
//   const [draggedItem, setDraggedItem] = useState(null);
//   const dragImageRef = useRef(null);
//   const hoverTimeoutRef = useRef(null);

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

//   useEffect(() => {
//     localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
//   }, [sidebarCollapsed]);

//   const handleThemeToggle = () => {
//     const newTheme = !isDarkMode;
//     localStorage.setItem("theme", newTheme ? "dark" : "light");
//     setIsDarkMode(newTheme);
//     window.location.reload();
//   };

//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   const handleSidebarMouseEnter = () => {
//     if (sidebarCollapsed) {
//       // Clear any existing timeout
//       if (hoverTimeoutRef.current) {
//         clearTimeout(hoverTimeoutRef.current);
//       }
//       // Set a small delay before expanding
//       hoverTimeoutRef.current = setTimeout(() => {
//         setSidebarHovered(true);
//       }, 200);
//     }
//   };

//   const handleSidebarMouseLeave = () => {
//     // Clear the timeout if user leaves before delay
//     if (hoverTimeoutRef.current) {
//       clearTimeout(hoverTimeoutRef.current);
//     }
//     setSidebarHovered(false);
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
//           { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
//           { title: "Create User", path: "/newuser", icon: Users },
//           { title: "Tracker", path: "/tracker", icon: Activity },
//           { title: "KYC Management", path: "/kyc", icon: FileCheck },
//           { title: "Employee Management", path: "/empmanager", icon: UserCheck },
//           { title: "Product-Management", path: "/product-management", icon: ShoppingCart },
//           { title: "Vendor-Management", path: "/vandor-management", icon: Store },
//           { title: "Access-Management", path: "/column-management", icon: Lock },
//           { title: "User-Management", path: "/user-management", icon: UserCheck },
//           { title: "Column-Manager", path: "/column-order", icon: Columns },
//           { title: "Help & Support", path: "/support", icon: HelpCircle }
//         ];
//       case "client":
//         return [
//           { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
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
//           { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
//           { title: "KYC Management", path: "/kyc", icon: CheckSquare },
//           { title: "Tracker", path: "/tracker", icon: Users },
//           { title: "Help & Support", path: "/support", icon: Lock },
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

//   // Determine if sidebar should be expanded
//   const isSidebarExpanded = !sidebarCollapsed || sidebarHovered;
//   const sidebarWidth = isSidebarExpanded ? 'w-64' : 'w-16';

//   return (
//     <div className={`flex h-screen transition-colors duration-300 ${
//       isDarkMode 
//         ? 'bg-gray-900' 
//         : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
//     }`}>
//       {/* Desktop Sidebar */}
//       <div 
//         className={`hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out ${sidebarWidth} ${
//           isDarkMode
//             ? 'bg-gray-800 text-white'
//             : 'bg-white/95 backdrop-blur-sm border-r border-gray-200'
//         } relative z-10`}
//         onMouseEnter={handleSidebarMouseEnter}
//         onMouseLeave={handleSidebarMouseLeave}
//       >
//         {/* Sidebar Header */}
//         <div className={`flex items-center justify-between h-20 px-4 ${
//           isDarkMode
//             ? 'bg-gray-900'
//             : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300'
//         }`}>
//           <div className="flex items-center min-w-0 flex-1">
//             <img 
//               src={Logo} 
//               alt="RVS Logo" 
//               className={`h-8 w-32 flex-shrink-0 ${isSidebarExpanded ? 'mr-3' : ''}`}
//             />
//             {/* <span className={`font-bold text-lg whitespace-nowrap transition-all duration-300 ${
//               isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
//             }`}>
//               RVS
//             </span> */}
//           </div>
          
//           <div className="flex items-center space-x-2">
//             {isSidebarExpanded && (
//               <button
//                 onClick={handleThemeToggle}
//                 className={`p-2 rounded-lg transition-colors ${
//                   isDarkMode
//                     ? 'text-white hover:bg-gray-700'
//                     : 'text-gray-600 hover:bg-white/20'
//                 }`}
//               >
//                 {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//               </button>
//             )}
            
//             <button
//               onClick={toggleSidebar}
//               className={`p-2 rounded-lg transition-colors ${
//                 isDarkMode
//                   ? 'text-white hover:bg-gray-700'
//                   : 'text-gray-600 hover:bg-white/20'
//               }`}
//             >
//               {sidebarCollapsed ? 
//                 <ChevronRight className="w-4 h-4" /> : 
//                 <ChevronLeft className="w-4 h-4" />
//               }
//             </button>
//           </div>
//         </div>

//         {/* Sidebar Navigation */}
//         <div className="flex flex-col flex-1">
//           <nav className="flex-1 px-2 py-4 space-y-1">
//             {getMenuItems().map((item) => {
//               const Icon = item.icon;
//               return (
//                 <div key={item.path} className="relative group">
//                   <button
//                     onClick={() => navigate(item.path)}
//                     draggable="true"
//                     onDragStart={(e) => handleDragStart(e, item)}
//                     onDragEnd={handleDragEnd}
//                     className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
//                       location.pathname === item.path
//                         ? isDarkMode
//                           ? 'bg-blue-600 text-white shadow-md'
//                           : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
//                         : isDarkMode
//                           ? 'text-gray-300 hover:bg-gray-700'
//                           : 'text-gray-600 hover:bg-gray-100'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5 flex-shrink-0" />
                    
//                     <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${
//                       isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
//                     }`}>
//                       {item.title}
//                     </span>
//                   </button>
                  
//                   {/* Tooltip for collapsed state */}
//                   {sidebarCollapsed && !sidebarHovered && (
//                     <div className={`absolute left-full ml-2 px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50 
//                       opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
//                       isDarkMode
//                         ? 'bg-gray-700 text-white border border-gray-600'
//                         : 'bg-white text-gray-800 border border-gray-200'
//                     }`}>
//                       {item.title}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </nav>
          
//           {/* Theme toggle for collapsed state */}
//           {sidebarCollapsed && !sidebarHovered && (
//             <div className="px-2 pb-4">
//               <button
//                 onClick={handleThemeToggle}
//                 className={`w-full p-3 rounded-lg transition-colors ${
//                   isDarkMode
//                     ? 'text-white hover:bg-gray-700'
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile header and content */}
//       <div 
//         className="flex flex-col flex-1 min-w-0"
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//       >
//         {/* Mobile header */}
//         <div className={`md:hidden flex items-center justify-between p-4 z-10 ${
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
//         <main className={`flex-1 overflow-y-auto p-2 ${
//           isDarkMode
//             ? 'bg-gray-900'
//             : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
//         } relative`}>
//           {/* Pattern overlay that sits behind content */}
//           {!isDarkMode && (
//             <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none" 
//               style={{
//                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23F0F0F0' d='M0 0l24 24M24 0l-24 24'/%3E%3C/svg%3E")`,
//                 backgroundSize: '24px 24px'
//               }}>
//             </div>
//           )}
          
//           {/* Content with correct z-index layering */}
//           <div className="relative">
//             {/* Profile header that works in both themes */}
//             <div className="mb-2">
//               <ProfileHeader />
//             </div>
            
//             {/* Main children content */}
//             <div>
//               {children}
//             </div>
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
  ShoppingCart, Store, Lock, ShieldCheck, Menu, X, ChevronLeft, ChevronRight, Columns, HelpCircle
} from "lucide-react";
import axios from "axios";
import ProfileHeader from "./ProfileHeader";
import Logo from "../../assets/logo.jpeg";
import ImpersonationBanner from "../Auth/ImpersonationBanner";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("");
  const userRole = sessionStorage.getItem("role");
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Gmail-style sidebar state - persistent across navigation
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem("sidebarExpanded");
    return savedState !== "false"; // Default to expanded
  });
  
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

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarExpanded", sidebarExpanded.toString());
  }, [sidebarExpanded]);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    setIsDarkMode(newTheme);
    window.location.reload();
  };

  // Simple Gmail-style toggle - just expand/collapse
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
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
          { title: "Column-Manager", path: "/column-order", icon: Columns },
          { title: "Help & Support", path: "/support", icon: HelpCircle },
          { title: "Client-Tracker", path: "/client-track", icon: Users },
        ];
      case "client":
        return [
          { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
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
          { title: "Dashboard", path: "/live-dashboard", icon: LayoutDashboard },
          { title: "KYC Management", path: "/kyc", icon: CheckSquare },
          { title: "Tracker", path: "/tracker", icon: Users },
          { title: "Help & Support", path: "/support", icon: Lock },
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

  // Simple sidebar state - expanded or collapsed
  const sidebarWidth = sidebarExpanded ? 'w-64' : 'w-16';

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-cyan-300 via-rose-200 to-blue-100'
    }`}>
      {/* <ImpersonationBanner /> */}
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out ${sidebarWidth} ${
          isDarkMode
            ? 'bg-gray-800 text-white'
            : 'bg-white/95 backdrop-blur-sm border-r border-gray-200'
        } relative z-10 shadow-lg`}
      >
        {/* Sidebar Header - Always visible */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          isDarkMode
            ? 'bg-gray-900 border-gray-700'
            : 'bg-gradient-to-tr from-blue-100 via-rose-200 to-cyan-300 border-gray-200'
        }`}>
          <div className="flex items-center min-w-0 flex-1">
            {/* Gmail-style hamburger menu */}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${sidebarExpanded ? 'mr-2' : 'mr-0'} ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-white/20'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            

            {/* Logo -*/}
<img 
  src={Logo} 
  alt="RVS Logo" 
  className={`h-8 w-auto transition-all duration-300 ${
    sidebarExpanded ?  'block mr-3' : 'hidden'
  }`}
/>
          </div>
          
          {/* Theme toggle - Only when expanded */}
          {sidebarExpanded && (
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-white/20'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 px-2 py-4 space-y-1 ">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path} className="relative group">
                  <button
                    onClick={() => navigate(item.path)}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? isDarkMode
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    
                    {/* Text label - Only when expanded */}
                    {sidebarExpanded && (
                      <span className="ml-3 whitespace-nowrap">
                        {item.title}
                      </span>
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarExpanded && (
                    <div className={`absolute left-full ml-2 px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      {item.title}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* Theme toggle for collapsed state */}
          {!sidebarExpanded && (
            <div className="px-2 pb-4">
              <button
                onClick={handleThemeToggle}
                className={`w-full p-3 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile header and content */}
      <div 
        className="flex flex-col flex-1 min-w-0"
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
            <img src={Logo} alt="RVS Logo" className="h-8 w-auto"/>
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
                <img src={Logo} alt="RVS Logo" className="h-8 w-auto"/>
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
                      className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? isDarkMode
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
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
        } relative transition-all duration-300`}>
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