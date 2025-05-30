import React, { useState,useEffect } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';  // Import necessary icons


const Profile = () => {
  const [user,setUser] = useState('')  
  const [isOpen, setIsOpen] = useState(false);
  useEffect(()=>{
      const getUser = localStorage.getItem("loginUser");
      const data = JSON.parse(getUser);
      setUser(data)
    },[])

  return (
    // <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl">
        <div>
          <h2 className="text-3xl font-bold text-black text-center">Profile</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 text-black">
            <User className="h-5 w-5 text-black" />
            <h3 className="text-sm">Name: <span className="font-semibold">{user.name}</span></h3>
          </div>

          <div className="flex items-center space-x-4 text-black">
            <Mail className="h-5 w-5 text-black" />
            <h3 className="text-sm">Email: <span className="font-semibold">{user.email}</span></h3>
          </div>

          <div className="flex items-center space-x-4 text-black">
            <Phone className="h-5 w-5 text-black" />
            <h3 className="text-sm">Phone No.: <span className="font-semibold">{user.phoneNumber}</span></h3>
          </div>

          <div className="flex items-center space-x-4 text-black">
            <Shield className="h-5 w-5 text-black" />
            <h3 className="text-sm">Role: <span className="font-semibold">{user.role}</span></h3>
          </div>
        </div>

        <button
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-black font-medium rounded-lg transition-colors"
          onClick={() => setIsOpen(true)}
        >
          Reset Password
        </button>

        {/* Render the ResetPasswordPopup here */}
        {/* <ResetPasswordPopup id={userData._id} isOpen={isOpen} setIsOpen={setIsOpen} /> */}
      </div>
    // </div>
  );
};

export default Profile;
