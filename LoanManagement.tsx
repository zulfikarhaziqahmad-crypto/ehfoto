
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Loan, Staff, Inventory } from '../types';
import { History, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react';

const LoanManagement: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'Dipinjam' | 'Dipulangkan'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoans(storage.getLoans());
    setStaffList(storage.getStaff());
    setInventoryList(storage.getInventory());
  }, []);

  const returnLoan = (id: string) => {
    if (!window.confirm('Sahkan barang telah dikembalikan dengan selamat?')) return;
    
    const updated = loans.map(l => l.id === id ? { ...l, loan_status: 'Dipulangkan' as const } : l);
    setLoans(updated);
    storage.saveLoans(updated);
  };

  const isOverdue = (returnDate: string, status: string) => {
    if (status === 'Dipulangkan') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(returnDate);
    return dDate < today;
  };

  const filteredLoans = loans.filter(l => {
    const matchesFilter = filter === 'ALL' || l.loan_status === filter;
    const matchesSearch = l.loan_staff.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.loan_item.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Tracking Pinjaman Barang</h2>
          <p className="text-gray-400">Pantau status peralatan yang berada di tangan staff</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'Dipinjam', 'Dipulangkan'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                filter === s 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-[#1a1a2e] text-gray-400 border-[#2a2a4a] hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'Semua' : s}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-dark rounded-2xl p-6 border-l-4 border-amber-500 shadow-xl">
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Belum Pulang</h3>
            <p className="text-3xl font-black text-white mt-1">{loans.filter(l => l.loan_status === 'Dipinjam').length}</p>
          </div>
          <div className="card-dark rounded-2xl p-6 border-l-4 border-red-500 shadow-xl">
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Melebihi Tarikh (Overdue)</h3>
            <p className="text-3xl font-black text-white mt-1">
              {loans.filter(l => isOverdue(l.loan_return_date, l.loan_status)).length}
            </p>
          </div>
          
          <div className="card-dark rounded-2xl p-6 border border-[#2a2a4a]">
            <h3 className="text-white font-black text-xs uppercase mb-4 tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" /> Carian Pantas
            </h3>
            <input 
              type="text"
              placeholder="Cari nama staff / barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl input-dark text-sm font-medium"
            />
          </div>
        </div>

        {/* Main Table Area */}
        <div className="lg:col-span-3">
          <div className="card-dark rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff & Item</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempoh Pinjaman</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a4a]">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-500 italic">
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="w-10 h-10 opacity-20" />
                          <span>Tiada rekod pinjaman ditemui.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.slice().reverse().map(loan => {
                      const overdue = isOverdue(loan.loan_return_date, loan.loan_status);
                      return (
                        <tr key={loan.id} className="hover:bg-[#1a1a2e]/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-white font-black text-sm uppercase tracking-tight">{loan.loan_staff}</p>
                            <p className="text-indigo-400 text-xs font-bold">{loan.loan_item}</p>
                            {loan.loan_purpose && (
                              <p className="text-[10px] text-gray-500 mt-1 italic">Event: {loan.loan_purpose}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                                <Clock className="w-3 h-3 text-green-500" /> Pinjam: {loan.loan_date}
                              </p>
                              <p className={`text-[10px] font-bold uppercase flex items-center gap-2 ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                                <Clock className={`w-3 h-3 ${overdue ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} /> Jangka: {loan.loan_return_date}
                                {overdue && <AlertCircle className="w-3 h-3" />}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                              loan.loan_status === 'Dipinjam' 
                              ? (overdue ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20') 
                              : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                              {overdue ? 'LEWAT (OVERDUE)' : loan.loan_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {loan.loan_status === 'Dipinjam' ? (
                              <button 
                                onClick={() => returnLoan(loan.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Sah Pulang
                              </button>
                            ) : (
                              <div className="text-gray-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Dikembalikan
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
