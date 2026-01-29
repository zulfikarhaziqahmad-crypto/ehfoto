
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Users, FileText, Package, Clock, TrendingUp, Zap, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ staff: 0, invoices: 0, inventory: 0, loans: 0, unpaidInvoices: 0 });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const staff = storage.getStaff();
    const invoices = storage.getInvoices();
    const inventory = storage.getInventory();
    const loans = storage.getLoans().filter(l => l.loan_status === 'Dipinjam');
    const unpaid = invoices.filter(i => i.invoice_status === 'Belum Dibayar').length;

    setStats({
      staff: staff.length,
      invoices: invoices.length,
      inventory: inventory.length,
      loans: loans.length,
      unpaidInvoices: unpaid
    });

    setRecentInvoices(invoices.slice(-5).reverse());
    setActiveLoans(loans.slice(0, 5));

    return () => clearInterval(timer);
  }, []);

  const cards = [
    { label: 'Jumlah Staff', value: stats.staff, icon: Users, color: 'bg-indigo-500/20 text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'Jumlah Invois', value: stats.invoices, icon: FileText, color: 'bg-green-500/20 text-green-400', border: 'border-green-500/30' },
    { label: 'Item Inventori', value: stats.inventory, icon: Package, color: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/30' },
    { label: 'Pinjaman Aktif', value: stats.loans, icon: Clock, color: 'bg-purple-500/20 text-purple-400', border: 'border-purple-500/30' },
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Ringkasan Eksekutif</h2>
          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
            <Calendar className="w-3 h-3 text-indigo-500" />
            {currentTime.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            <span className="mx-2 text-gray-700">|</span>
            <Clock className="w-3 h-3 text-indigo-500" />
            {currentTime.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link to="/invoices" className="px-4 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
            Urus Invois
          </Link>
          <Link to="/settings" className="px-4 py-2 rounded-xl bg-[#1a1a2e] text-gray-400 border border-[#2a2a4a] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
            Tetapan Sistem
          </Link>
        </div>
      </header>

      {/* Critical Alerts */}
      {stats.unpaidInvoices > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between animate-pulse shadow-lg shadow-amber-900/5">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Perhatian: Terdapat {stats.unpaidInvoices} invois yang masih belum dibayar!
            </p>
          </div>
          <Link to="/invoices" className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1 hover:underline">
            Semak Sekarang <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`card-dark rounded-2xl p-6 border-b-4 ${card.border} hover:scale-[1.02] transition-all shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">{card.label}</p>
            <p className="text-4xl font-black text-white mt-2 tracking-tighter">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark rounded-3xl p-8 shadow-2xl border border-[#2a2a4a]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Clock className="w-5 h-5 text-amber-400" /> Log Pinjaman Aktif
            </h3>
            <Link to="/loans" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-4">
            {activeLoans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600 opacity-20">
                <Package className="w-12 h-12 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Tiada rekod</p>
              </div>
            ) : (
              activeLoans.map(loan => (
                <div key={loan.id} className="flex items-center justify-between p-4 bg-[#0f0f1a] rounded-2xl border border-[#2a2a4a] hover:border-amber-500/30 transition-all">
                  <div>
                    <p className="text-white font-black text-sm uppercase">{loan.loan_staff}</p>
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">{loan.loan_item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pulang Pada:</p>
                    <p className="text-xs font-black text-amber-500 uppercase tracking-tighter">{loan.loan_return_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-dark rounded-3xl p-8 shadow-2xl border border-[#2a2a4a]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Aliran Invois Terkini
            </h3>
            <Link to="/invoices" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-4">
            {recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600 opacity-20">
                <FileText className="w-12 h-12 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Tiada rekod</p>
              </div>
            ) : (
              recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-[#0f0f1a] rounded-2xl border border-[#2a2a4a] hover:border-indigo-500/30 transition-all">
                  <div>
                    <p className="text-white font-black text-sm uppercase">{inv.invoice_number}</p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{inv.invoice_client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-green-400 tracking-tighter">RM {inv.invoice_total.toLocaleString()}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${inv.invoice_status === 'Dibayar' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {inv.invoice_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
