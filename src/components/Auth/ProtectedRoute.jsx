import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (decodedToken.exp < currentTime) {
      localStorage.clear();
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
