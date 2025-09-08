

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../../assets/logo.jpeg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ userId: "", password: "", });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auto Logout if Token Expired
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decodedToken.exp < currentTime) {
          localStorage.clear();
          toast.error("Session expired. Please login again.");
          navigate("/");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.clear();
        navigate("/");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/auth/login`,
        loginData
      );

      toast.success(res.data.message);
      const user = res.data.user;
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.user.role);
      localStorage.setItem("loginUser", JSON.stringify(res.data.user));

      // Role-based navigation
      switch (res.data.user.role) {
        case "root":
          navigate("/rootuser-dashboard");
          break;
        case "admin":
          navigate("/live-dashboard");
          break;
        case "client":
          navigate("/live-dashboard");
          break;
        case "employee":
        case "subemployee":
          navigate("/live-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center_ justify-start bg-gradient-to-br from-purple-500 to-blue-600" style={{backgroundImage:"URL(https://rvsdoc1.s3.ap-south-1.amazonaws.com/bg-img.jpg)", backgroundSize:"cover", backgroundPosition:"top", backgroundRepeat:"no-repeat"}}>
      <div className="p-4 flex flex-col md:flex-row w-full md:w-[55%] bg-[rgba(0,0,0,0.5)]">

        {/* Welcome Section - Shows above login on mobile, shows on right on desktop */}
        {/* <div className="w-full md:order-2 px-4 text-center md:mb-0">     
          <h1 className="text-5xl font-semibold text-white mb-2">Welcome</h1>
          <p className="text-lg text-white"> RVS: Partnering with Trust, Delivering with Excellence </p>
          
          <div className="hidden md:flex justify-center items-center mt-20 w-full">
            <img src={Business} alt="RVS Doc Business Partners"  className="mx-auto md:mx-0 max-w-full h-100" />
          </div>
        </div> */}

        {/* Login Card */}
        <div className="w-full md:order-1 mx-auto_ p-4 flex flex-col items-center justify-center">
          
          <div className="flex justify-center md:justify-start mt-2 mb-4" style={{flexDirection:"column", textAlign:"center"}}>     
            <h1 className="text-4xl md:text-6xl font-semibold text-white mb-2">Welcome</h1>
            <p className="text-md md:text-xl text-white mt-2 mb-4"> RVS: Partnering with Trust, Delivering with Excellence </p>
          </div>
          <div className="flex justify-center md:justify-start mt-1 mb-4 md:mb-10">
            <img src={Logo} alt="RVS Logo" className="h-15 md:h-18" />
          </div>
          
          <div className="w-full px-4">
            <div className="bg-white rounded-lg shadow-lg py-8 px-8 max-w-lg mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
                Sign in
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="mb-5">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      name="userId"
                      value={loginData.userId}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      placeholder="Enter email or user ID"
                      required
                    />
                  </div>
                </div>

                {/* Password Input with Toggle */}
                <div className="mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      placeholder="Enter your password"
                      required
                    />
                    <span
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
                    </span>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold tracking-wider hover:opacity-90 transition-opacity ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </button>
              </form>
            </div>
            
            {/* Footer Links */}
            <div className="flex justify-center">
              <div className="mt-6 md:mt-6 space-x-8 relative bg-gradient-to-r text-xs md:text-md from-purple-500 to-blue-600 py-4 px-4 md:px-8 rounded-2xl">
                <Link to="/About" className="text-white rounded-full hover:text-black transition-colors hover:bg-white p-0 my-0 md:p-2 md:px-3 md:my-2 ">About us</Link>
                <Link to="/about#Contact" className="text-white rounded-full hover:text-black transition-colors hover:bg-white p-0 my-0 md:p-2 md:px-3 md:my-2">Contact us</Link>
                <a href="mailto:info@rvsdoc.com" className="text-white rounded-full hover:text-black transition-colors hover:bg-white p-0 my-0 md:p-2 md:px-3 md:my-2">info@rvsdoc.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className='fixed right-0 bottom-0 text-gray-300 text-sm bg-gray-900 p-1.5 px-2'>Design & developed by : <a href='https://www.ufsnetworks.com/' className='text-amber-300 hover:text-blue-500 hover:underline'>Unified Consultancy Services</a></div> */}
    </div>
  );
}