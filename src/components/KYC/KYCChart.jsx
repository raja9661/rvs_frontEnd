import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FaCheckCircle, FaClock, FaClipboardList } from "react-icons/fa";

const socket = io(import.meta.env.VITE_Backend_Base_URL); // Ensure the correct backend URL

const KYCChart = () => {
  const [stats, setStats] = useState([]);
  const [dailyVerifications, setDailyVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dailyRes, monthlyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/summary`),
          axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/daily`),
          axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/monthly`),
        ]);

        setStats([
          { title: "Today KYC Requests", value: statsRes.data.dailyKYCCount, icon: FaClipboardList, color: "bg-blue-100" },  
          { title: "Total KYC Requests", value: statsRes.data.totalKYCCount, icon: FaClipboardList, color: "bg-blue-100"},
          { title: "Approved KYC", value: statsRes.data.approvedKYCCount, icon: FaCheckCircle, color: "bg-green-100"},
          { title: "Pending KYC", value: statsRes.data.pendingKYCCount, icon: FaClock, color: "bg-yellow-100"},
        ]);

        setDailyVerifications(dailyRes.data);
        setVerificationStats(monthlyRes.data);
      } catch (error) {
        console.error("Error fetching KYC stats:", error);
      }
    };

    fetchData();

    // WebSocket: Listen for real-time updates
    const handleKYCStatsUpdate = (updatedStats) => {
    //   console.log("Received updated KYC stats:", updatedStats);
      setStats([
        { title: "Today KYC Requests", value: updatedStats.dailyKYCCount, icon: FaClipboardList, color: "bg-blue-100" }, 
        { title: "Total KYC Requests", value: updatedStats.totalKYCCount, icon: FaClipboardList, color: "bg-blue-100" },
        { title: "Approved KYC", value: updatedStats.approvedKYCCount, icon: FaCheckCircle, color: "bg-green-100" },
        { title: "Pending KYC", value: updatedStats.pendingKYCCount, icon: FaClock, color: "bg-yellow-100" },
      ]);
    };

    socket.on("kycStatsUpdated", handleKYCStatsUpdate);

    // Cleanup: Remove only event listener, do NOT disconnect the socket
    return () => {
      socket.off("kycStatsUpdated", handleKYCStatsUpdate);
    };

  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg shadow-lg p-6 flex items-center justify-between bg-white">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Verification Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" />
                <Bar dataKey="pending" fill="#FBBF24" />
                <Bar dataKey="rejected" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Verifications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVerifications}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="verifications" stroke="#2196F3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCChart;
