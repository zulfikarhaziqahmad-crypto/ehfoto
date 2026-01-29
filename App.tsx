
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import StaffManagement from './components/StaffManagement';
import InventoryManagement from './components/InventoryManagement';
import LoanManagement from './components/LoanManagement';
import JobAssignment from './components/JobAssignment';
import InvoiceManagement from './components/InvoiceManagement';
import PayrollManagement from './components/PayrollManagement';
import ClaimsManagement from './components/ClaimsManagement';
import FinanceManagement from './components/FinanceManagement';
import SystemSettings from './components/SystemSettings';
import StaffDashboard from './components/StaffDashboard';
import StaffPortal from './components/StaffPortal';
import { UserType, Staff } from './types';
import { storage } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<{ type: UserType; data?: Staff } | null>(null);

  useEffect(() => {
    // Initial check for session (optional)
    const savedUser = localStorage.getItem('eh_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (type: UserType, data?: Staff) => {
    const sessionUser = { type, data };
    setUser(sessionUser);
    localStorage.setItem('eh_session', JSON.stringify(sessionUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eh_session');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<DashboardLayout user={user} onLogout={handleLogout} />}>
          {user.type === UserType.ADMIN ? (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/loans" element={<LoanManagement />} />
              <Route path="/jobs" element={<JobAssignment />} />
              <Route path="/invoices" element={<InvoiceManagement />} />
              <Route path="/payroll" element={<PayrollManagement />} />
              <Route path="/claims" element={<ClaimsManagement />} />
              <Route path="/finance" element={<FinanceManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/staff-view" element={<StaffDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<StaffPortal staff={user.data!} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
