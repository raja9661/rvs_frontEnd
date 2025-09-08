// ImpersonationBanner.jsx
import { useEffect, useState } from 'react';

const ImpersonationBanner = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  useEffect(() => {
    // Check if we have original admin credentials stored
    const originalAdminToken = sessionStorage.getItem('originalAdminToken');
    const isImpersonating = !!originalAdminToken;
    setIsImpersonating(isImpersonating);
    
    if (isImpersonating) {
      const user = JSON.parse(localStorage.getItem('loginUser') || '{}');
      setImpersonatedUser(user);
    }
  }, []);

  const exitImpersonation = () => {
    const originalToken = sessionStorage.getItem('originalAdminToken');
    const originalRole = sessionStorage.getItem('originalAdminRole');
    const originalUser = localStorage.getItem('originalAdminUser');
    
    if (originalToken && originalRole && originalUser) {
      // Restore original admin credentials
      sessionStorage.setItem('token', originalToken);
      sessionStorage.setItem('role', originalRole);
      localStorage.setItem('loginUser', originalUser);
      
      // Clear impersonation data
      sessionStorage.removeItem('originalAdminToken');
      sessionStorage.removeItem('originalAdminRole');
      localStorage.removeItem('originalAdminUser');
      
      // Refresh the page
      window.location.reload();
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-800 p-2 text-center">
      <div className="container mx-auto flex justify-between items-center">
        <span>
          You are currently viewing as {impersonatedUser?.name} ({impersonatedUser?.role})
        </span>
        <button 
          onClick={exitImpersonation}
          className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Exit Impersonation
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;