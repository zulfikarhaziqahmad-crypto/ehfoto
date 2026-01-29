
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, ArrowLeftRight, 
  ClipboardCheck, FileText, Banknote, Receipt, 
  BarChart3, UserCircle, LogOut, Camera, Settings
} from 'lucide-react';
import { UserType, Staff } from '../types';

interface DashboardLayoutProps {
  user: { type: UserType; data?: Staff };
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Staff', icon: Users, path: '/staff' },
    { name: 'Inventori', icon: Package, path: '/inventory' },
    { name: 'Pinjaman Barang', icon: ArrowLeftRight, path: '/loans' },
    { name: 'Assign Job', icon: ClipboardCheck, path: '/jobs' },
    { name: 'Dashboard Staff', icon: UserCircle, path: '/staff-view' },
    { name: 'Invois', icon: FileText, path: '/invoices' },
    { name: 'Gaji Staff', icon: Banknote, path: '/payroll' },
    { name: 'Claims Staff', icon: Receipt, path: '/claims' },
    { name: 'Laporan Kewangan', icon: BarChart3, path: '/finance' },
    { name: 'Tetapan Sistem', icon: Settings, path: '/settings' },
  ];

  const staffMenu = [
    { name: 'Dashboard Saya', icon: UserCircle, path: '/' },
  ];

  const menuItems = user.type === UserType.ADMIN ? adminMenu : staffMenu;

  return (
    <div className="h-full w-full flex overflow-hidden">
      <aside className="w-64 bg-[#0f0f1a] border-r border-[#2a2a4a] flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-[#2a2a4a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-[#0a0a14] rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-white">EH Foto</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Management</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                ? 'bg-indigo-500/20 text-indigo-400 border-l-4 border-indigo-500' 
                : 'text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2a2a4a]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#0a0a14]">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
