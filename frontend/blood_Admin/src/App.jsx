import { Routes, Route } from 'react-router-dom';
import PageNotFound from './Pages/PageNotFound';
import Sidebar from './Main/Sidebar';
import Navbar from './Main/Navbar'; // Import the Navbar component
import BloodBankDashboard from './Pages/BloodBankDashboard';
import React, { useState } from 'react';
import Login from './Pages/Login'; // Import the Login component
import Campaign from './Pages/Campaign';
import AppointmentScheduler from './Pages/AppointmentScheduler';
import AddBloodInventory from './Pages/AddBloodInventory';
import BloodRequestedDonor from './Pages/BloodRequestedDonor';
import UnderScreenDonor from './Pages/UnderScreenDonor';
import AddDonationDetails from './Pages/AddDonationDetails';
import GetDonationDetails from './Pages/GetDonationDetails';
import AddDonationTestResult from './Pages/AddDonationTestResult';

// Layout component for dashboard pages
function DashboardLayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Sidebar toggle state

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar onToggle={(expanded) => setIsSidebarExpanded(expanded)} />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: isSidebarExpanded ? "240px" : "64px", // Adjust based on sidebar width
          width: "100%",
          transition: "margin-left 0.3s ease", // Smooth transition
        }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div style={{ marginTop: "60px", padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Login Route (No Sidebar or Navbar) */}
      <Route path="/blood-admin" element={<Login />} />

      {/* Routes under /blood-admin */}
      <Route
        path="/blood-admin/*"
        element={
          <DashboardLayout>
            <Routes>
              <Route path="/Dashboard" element={<BloodBankDashboard />} />
              <Route path="/Campaign" element={<Campaign />} />
              <Route path="/AppointmentScheduler" element={<AppointmentScheduler />} />
              <Route path="/AddBloodInventory" element={<AddBloodInventory />} />
              <Route path="/BloodRequestDonor" element={<BloodRequestedDonor />} />
              <Route path="/DonorUnderScreening" element={<UnderScreenDonor />} />
              <Route path="/AddDonationDetails" element={<AddDonationDetails />} />
              <Route path="/GetDonationDetails" element={<GetDonationDetails />} />
              <Route path="/AddDonationTestResult" element={<AddDonationTestResult />} />
            </Routes>
          </DashboardLayout>
        }
      />

      {/* 404 page */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;