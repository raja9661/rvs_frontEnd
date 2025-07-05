import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute"; // Import the ProtectedRoute component
import LoginPage from "./components/Auth/LoginPage";
import Admindashboard from "./components/Dashboard/Admindashboard";
import RootUserDashBoard from "./components/Dashboard/RootUserDashBoard";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/about" element={<About/>} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tracker" element={<TrackerTable />} />
          <Route path="/support" element={<HelpSupportPanel />} />
          <Route path="/column-order" element={<ColumnManager />} />
          <Route path="/excel-upload" element={<ExcelTable />} />
          <Route path="/single" element={<SingleUpload />} />
          <Route path="/newuser" element={<CreateUser/>}/>
          <Route path="/kyc" element={<KYCform />} />
          <Route path="/empmanager" element={<EmployeeManagement />} />
          <Route path="/rootuser-dashboard" element={<RootUserDashBoard />} />
          <Route path="/admin-dashboard" element={<Admindashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/vandor-management" element={<VandorManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/column-management" element={<ManageEmployeeColumn />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/live-dashboard" element={<LiveDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
