import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoginPage from "./components/Auth/LoginPage";
import KYCform from "./components/KYC/KYCform";
import SingleUpload from "./components/KYC/CaseUpload-Methods/SingleUpload";
import ExcelTable from "./components/KYC/CaseUpload-Methods/ExcelTable";
import TrackerTable from "./components/KYC/TrackingPage/Table/TrackerTable";
import EmployeeManagement from "./components/Employee-Management/EmployeeManagement ";
import VandorManagement from "./components/vandorManagement/VandorManagement";
import ManageEmployeeColumn from "./components/Employee-Management/ManageEmployeeColumn";
import ProductManagement from "./components/ProductManagement/ProductManagement";
import CreateUser from "./components/Auth/CreateUser";
import UserManagement from "./components/User-Management/UserManagement ";
import About from "./components/About/About";
import LiveDashboard from "./components/Dashboard/LiveDashboard";
import HelpSupportPanel from "./components/Auth/HelpSupportPanel";
import ColumnManager from "./components/ColumnManager";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function App() {
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          sessionStorage.clear();
          window.location.href = "/";
        }
      } catch (err) {
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/about" element={<About />} />

        {/* Protected Role-based Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Common routes (admin, employee, client) */}
          <Route path="/live-dashboard" element={<LiveDashboard />} />
          <Route path="/kyc" element={<KYCform />} />
          <Route path="/single" element={<SingleUpload />} />
          <Route path="/excel-upload" element={<ExcelTable />} />
          <Route path="/tracker" element={<TrackerTable />} />

          {/* Admin + Employee */}
          <Route path="/support" element={<HelpSupportPanel />} />

          {/* Admin only */}
          <Route path="/column-order" element={<ColumnManager />} />
          <Route path="/newuser" element={<CreateUser />} />
          <Route path="/empmanager" element={<EmployeeManagement />} />
          <Route path="/vandor-management" element={<VandorManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/column-management" element={<ManageEmployeeColumn />} />
          <Route path="/user-management" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;














// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import ProtectedRoute from "./components/Auth/ProtectedRoute"; // Import the ProtectedRoute component
// import LoginPage from "./components/Auth/LoginPage";
// import KYCform from "./components/KYC/KYCform";
// import SingleUpload from "./components/KYC/CaseUpload-Methods/SingleUpload";
// import ExcelTable from "./components/KYC/CaseUpload-Methods/ExcelTable";
// import TrackerTable from "./components/KYC/TrackingPage/Table/TrackerTable";
// import EmployeeManagement from "./components/Employee-Management/EmployeeManagement ";
// import VandorManagement from "./components/vandorManagement/VandorManagement";
// import ManageEmployeeColumn from "./components/Employee-Management/ManageEmployeeColumn";
// import ProductManagement from "./components/ProductManagement/ProductManagement";
// import CreateUser from "./components/Auth/CreateUser";
// import UserManagement from "./components/User-Management/UserManagement ";
// import About from "./components/About/About";
// import LiveDashboard from "./components/Dashboard/LiveDashboard";
// import HelpSupportPanel from "./components/Auth/HelpSupportPanel";
// import ColumnManager from "./components/ColumnManager";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Route */}
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/about" element={<About/>} />

//         {/* Protected Routes */}
//         <Route element={<ProtectedRoute />}>

//           {/* Common Route for admin , client and employe */}
//           <Route path="/live-dashboard" element={<LiveDashboard />} />
//           <Route path="/kyc" element={<KYCform />} />
//           <Route path="/single" element={<SingleUpload />} />
//           <Route path="/excel-upload" element={<ExcelTable />} />
//           <Route path="/tracker" element={<TrackerTable />} />
//                           {/**************/}

//           {/* Common Route for admin and employe */}
//           <Route path="/support" element={<HelpSupportPanel />} />
//                           {/**************/}

//            {/* Route that only admin can access */}               
//           <Route path="/column-order" element={<ColumnManager />} />
//           <Route path="/newuser" element={<CreateUser/>}/>
//           <Route path="/empmanager" element={<EmployeeManagement />} />
//           <Route path="/vandor-management" element={<VandorManagement />} />
//           <Route path="/product-management" element={<ProductManagement />} />
//           <Route path="/column-management" element={<ManageEmployeeColumn />} />
//           <Route path="/user-management" element={<UserManagement />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
