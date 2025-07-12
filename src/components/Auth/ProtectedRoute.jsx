import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const roleRoutes = {
  
  admin: [
    "/live-dashboard",
    "/kyc",
    "/single",
    "/excel-upload",
    "/tracker",
    "/support",
    "/column-order",
    "/newuser",
    "/empmanager",
    "/vandor-management",
    "/product-management",
    "/column-management",
    "/user-management"
  ],
  employee: [
    "/live-dashboard",
    "/kyc",
    "/single",
    "/excel-upload",
    "/tracker",
    "/support"
  ],

  client: [
    "/live-dashboard",
    "/kyc",
    "/single",
    "/excel-upload",
    "/tracker",
  ]
};

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const location = useLocation();
  const currentPath = location.pathname;

  // No token found → redirect to login
  if (!token) return <Navigate to="/" replace />;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      sessionStorage.clear();
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    sessionStorage.clear();
    return <Navigate to="/" replace />;
  }

  // Check role-based access
  const allowedRoutes = roleRoutes[role];
  if (!allowedRoutes || !allowedRoutes.includes(currentPath)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;



// import { Navigate, Outlet } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";


// const ProtectedRoute = () => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   try {
//     const decodedToken = jwtDecode(token);
//     const currentTime = Date.now() / 1000; // Convert to seconds

//     if (decodedToken.exp < currentTime) {
//       localStorage.clear();
//       return <Navigate to="/" replace />;
//     }
//   } catch (error) {
//     console.error("Invalid token:", error);
//     localStorage.clear();
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;
