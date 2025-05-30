import React from 'react'
import Layout from '../Layout/Layout'
import { Link } from "react-router-dom";

const RootUserDashBoard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-700 flex flex-col items-center justify-center p-10 w-full">
      <div className="w-full text-center text-white py-16">
        <h1 className="text-6xl font-extrabold mb-6">Welcome, Root-User!</h1>
        <p className="text-xl mb-10 max-w-3xl mx-auto text-yellow-300">
          Manage users, review KYC requests, and oversee system activities efficiently with our advanced admin dashboard.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        <Link to="/newuser" className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition duration-300 text-xl text-center">
          Create Users
        </Link>
        <Link to="/kyc-requests" className="px-6 py-3 bg-green-400 text-black font-semibold rounded-lg shadow-lg hover:bg-green-500 transition duration-300 text-xl text-center">
          KYC Requests
        </Link>
        <Link to="/logdetail" className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition duration-300 text-xl text-center">
          System Logs
        </Link>
        <Link to="/settings" className="px-6 py-3 bg-purple-400 text-black font-semibold rounded-lg shadow-lg hover:bg-purple-500 transition duration-300 text-xl text-center">
          Settings
        </Link>
      </div>
    </div>
    </Layout>
  )
}

export default RootUserDashBoard

{/* <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, Admin!</h1>
        <p className="text-gray-600 mb-6">Manage users, review KYC requests, and oversee system activities efficiently.</p>
        
        <div className="grid grid-cols-2 gap-6">
          <Link to="/manage-users" className="bg-blue-500 text-white py-3 rounded-lg shadow hover:bg-blue-600 transition">
            Manage Users
          </Link>
          <Link to="/kyc-requests" className="bg-green-500 text-white py-3 rounded-lg shadow hover:bg-green-600 transition">
            KYC Requests
          </Link>
          <Link to="/system-logs" className="bg-yellow-500 text-white py-3 rounded-lg shadow hover:bg-yellow-600 transition">
            System Logs
          </Link>
          <Link to="/settings" className="bg-purple-500 text-white py-3 rounded-lg shadow hover:bg-purple-600 transition">
            Settings
          </Link>
        </div>
      </div>
    </div> */}