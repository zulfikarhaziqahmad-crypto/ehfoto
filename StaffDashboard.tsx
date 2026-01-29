
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Staff, Invoice, JobStatus } from '../types';
import { UserCheck, Award, Briefcase, Activity } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setStaff(storage.getStaff());
    setInvoices(storage.getInvoices());
  }, []);

  const getStaffStats = (staffName: string) => {
    const photoJobs = invoices.filter(inv => inv.invoice_photographer === staffName);
    const editJobs = invoices.filter(inv => inv.invoice_editor === staffName);
    
    const completedPhoto = photoJobs.filter(j => j.invoice_photo_status === JobStatus.COMPLETED).length;
    const completedEdit = editJobs.filter(j => j.invoice_edit_status === JobStatus.COMPLETED).length;

    return {
      total: photoJobs.length + editJobs.length,
      completed: completedPhoto + completedEdit,
      pending: (photoJobs.length + editJobs.length) - (completedPhoto + completedEdit)
    };
  };

  return (
    <div className="p-6 space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-white">Prestasi Staff</h2>
        <p className="text-gray-400">Ringkasan tugasan dan aktiviti semua staff</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.length === 0 ? (
          <div className="col-span-full card-dark rounded-2xl p-12 text-center text-gray-500 italic">
            Tiada staff untuk dipaparkan. Sila tambah staff di menu Pengurusan Staff.
          </div>
        ) : (
          staff.map(s => {
            const stats = getStaffStats(s.name);
            return (
              <div key={s.id} className="card-dark rounded-2xl p-6 border border-[#2a2a4a] hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">{s.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-[#0a0a14] rounded-xl border border-[#2a2a4a]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total</p>
                    <p className="text-xl font-black text-white">{stats.total}</p>
                  </div>
                  <div className="text-center p-3 bg-[#0a0a14] rounded-xl border border-[#2a2a4a]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Selesai</p>
                    <p className="text-xl font-black text-green-400">{stats.completed}</p>
                  </div>
                  <div className="text-center p-3 bg-[#0a0a14] rounded-xl border border-[#2a2a4a]">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Pending</p>
                    <p className="text-xl font-black text-amber-400">{stats.pending}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase">Progress Kerja</span>
                    <span className="text-indigo-400 font-black">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#0a0a14] rounded-full overflow-hidden border border-[#2a2a4a]">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
