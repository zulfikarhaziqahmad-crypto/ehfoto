
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Staff, Invoice, Loan, JobStatus, Claim, ClaimStatus, Inventory } from '../types';
import { LayoutDashboard, Briefcase, Box, Wallet, Send, CheckCircle2, Clock, Settings, ShieldCheck, UserCircle, Plus } from 'lucide-react';

interface StaffPortalProps {
  staff: Staff;
}

const StaffPortal: React.FC<StaffPortalProps> = ({ staff }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'loans' | 'salary' | 'claims' | 'settings'>('overview');
  const [myJobs, setMyJobs] = useState<{ role: string; invoice: Invoice }[]>([]);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [allPayroll, setAllPayroll] = useState<any[]>([]);

  useEffect(() => {
    const invoices = storage.getInvoices();
    const loans = storage.getLoans().filter(l => l.loan_staff === staff.name);
    const claims = storage.getClaims().filter(c => c.claim_staff_id === staff.id);
    const payroll = storage.getPayroll().filter(p => p.payment_staff_id === staff.id);

    const relatedJobs: any[] = [];
    invoices.forEach(inv => {
      if (inv.invoice_photographer === staff.name) relatedJobs.push({ role: 'Photographer', invoice: inv });
      if (inv.invoice_editor === staff.name) relatedJobs.push({ role: 'Editor', invoice: inv });
    });

    setMyJobs(relatedJobs);
    setMyLoans(loans);
    setMyClaims(claims);
    setAllPayroll(payroll);
  }, [staff]);

  const updateJobStatus = (invoiceId: string, role: string) => {
    const updated = storage.getInvoices().map(inv => {
      if (inv.id === invoiceId) {
        if (role === 'Photographer') return { ...inv, invoice_photo_status: JobStatus.COMPLETED };
        return { ...inv, invoice_edit_status: JobStatus.COMPLETED };
      }
      return inv;
    });
    storage.saveInvoices(updated);
    // Refresh
    setMyJobs(prev => prev.map(j => {
      if (j.invoice.id === invoiceId) {
        const updatedInv = { ...j.invoice };
        if (role === 'Photographer') updatedInv.invoice_photo_status = JobStatus.COMPLETED;
        else updatedInv.invoice_edit_status = JobStatus.COMPLETED;
        return { ...j, invoice: updatedInv };
      }
      return j;
    }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Portal Staff: {staff.name}</h2>
          <p className="text-gray-400">Selamat datang, {staff.position} (ID: <span className="text-indigo-400 font-mono uppercase font-black">{staff.staff_id}</span>)</p>
        </div>
        <div className="flex bg-[#0f0f1a] p-1 rounded-xl border border-[#2a2a4a] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'jobs', icon: Briefcase, label: 'Job Saya' },
            { id: 'loans', icon: Box, label: 'Pinjaman' },
            { id: 'salary', icon: Wallet, label: 'Gaji' },
            { id: 'claims', icon: Send, label: 'Claims' },
            { id: 'settings', icon: Settings, label: 'Tetapan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-dark rounded-2xl p-6 border-l-4 border-indigo-500">
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Job Aktif</h3>
              <p className="text-3xl font-bold text-white mt-1">{myJobs.filter(j => 
                (j.role === 'Photographer' && j.invoice.invoice_photo_status !== JobStatus.COMPLETED) ||
                (j.role === 'Editor' && j.invoice.invoice_edit_status !== JobStatus.COMPLETED)
              ).length}</p>
            </div>
            <div className="card-dark rounded-2xl p-6 border-l-4 border-amber-500">
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Barang Dipinjam</h3>
              <p className="text-3xl font-bold text-white mt-1">{myLoans.filter(l => l.loan_status === 'Dipinjam').length}</p>
            </div>
            <div className="card-dark rounded-2xl p-6 border-l-4 border-green-500">
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Claim Pending</h3>
              <p className="text-3xl font-bold text-white mt-1">{myClaims.filter(c => c.claim_status === ClaimStatus.PENDING).length}</p>
            </div>
          </div>
          
          <div className="card-dark rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Job Terkini</h3>
            <div className="space-y-4">
              {myJobs.length === 0 ? <p className="text-center text-gray-500 py-8 italic">Tiada job ditugaskan.</p> : (
                myJobs.slice(0, 5).map((job, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-xl border border-[#2a2a4a]">
                    <div>
                      <h4 className="text-white font-bold">{job.invoice.invoice_detail}</h4>
                      <p className="text-xs text-indigo-400 uppercase font-black">{job.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      (job.role === 'Photographer' ? job.invoice.invoice_photo_status : job.invoice.invoice_edit_status) === JobStatus.COMPLETED
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {(job.role === 'Photographer' ? job.invoice.invoice_photo_status : job.invoice.invoice_edit_status) || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {myJobs.length === 0 ? <p className="text-center text-gray-500 py-12">Tiada tugasan aktif untuk anda.</p> : (
            myJobs.map((job, idx) => {
              const status = job.role === 'Photographer' ? job.invoice.invoice_photo_status : job.invoice.invoice_edit_status;
              const isCompleted = status === JobStatus.COMPLETED;
              return (
                <div key={idx} className={`card-dark rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${isCompleted ? 'border-green-500/50' : 'border-amber-500/50'}`}>
                  <div>
                    <h4 className="text-white font-bold text-lg">{job.invoice.invoice_detail}</h4>
                    <p className="text-indigo-400 font-black text-xs uppercase mb-1 tracking-widest">{job.role}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                      <span className="flex items-center gap-1 uppercase"><Clock className="w-3 h-3" /> TARIKH: {job.invoice.invoice_date}</span>
                      <span className="flex items-center gap-1 uppercase"><UserCircle className="w-3 h-3" /> CLIENT: {job.invoice.invoice_client}</span>
                    </div>
                  </div>
                  {!isCompleted && (
                    <button 
                      onClick={() => updateJobStatus(job.invoice.id, job.role)}
                      className="px-6 py-3 rounded-xl bg-green-600/20 text-green-400 border border-green-500/30 font-bold text-sm uppercase flex items-center gap-2 hover:bg-green-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Tanda Selesai
                    </button>
                  )}
                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-500 font-black uppercase text-sm tracking-widest">
                      <ShieldCheck className="w-5 h-5" /> JOB SELESAI
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'claims' && (
        <ClaimsTab staff={staff} myClaims={myClaims} setMyClaims={setMyClaims} />
      )}

      {activeTab === 'loans' && (
        <LoansTab staff={staff} myLoans={myLoans} setMyLoans={setMyLoans} />
      )}

      {activeTab === 'salary' && (
        <div className="space-y-4">
           {allPayroll.length === 0 ? <p className="text-center text-gray-500 py-12 italic">Tiada rekod pembayaran lagi.</p> : (
             allPayroll.reverse().map(p => (
                <div key={p.id} className="card-dark rounded-2xl p-6 flex justify-between items-center border-l-4 border-green-500/50">
                  <div>
                    <h4 className="text-white font-black text-lg uppercase tracking-tight">Gaji / Komisen Job</h4>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">DIBAYAR PADA: {p.payment_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-400">RM {p.payment_amount.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Gaji Bersih</p>
                  </div>
                </div>
             ))
           )}
        </div>
      )}

      {activeTab === 'settings' && <SettingsTab staff={staff} />}
    </div>
  );
};

const LoansTab: React.FC<{ staff: Staff; myLoans: Loan[]; setMyLoans: any }> = ({ staff, myLoans, setMyLoans }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [formData, setFormData] = useState({
    loan_item: '',
    loan_date: new Date().toISOString().split('T')[0],
    loan_return_date: '',
    purpose: ''
  });

  useEffect(() => {
    setInventory(storage.getInventory());
  }, []);

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loan_item) {
        alert('Sila pilih item untuk dipinjam.');
        return;
    }
    const newLoan: Loan = {
      id: crypto.randomUUID(),
      loan_staff: staff.name,
      loan_item: formData.loan_item,
      loan_date: formData.loan_date,
      loan_return_date: formData.loan_return_date,
      loan_status: 'Dipinjam',
      loan_purpose: formData.purpose
    };

    const allLoans = storage.getLoans();
    const updatedAll = [...allLoans, newLoan];
    storage.saveLoans(updatedAll);
    
    setMyLoans([...myLoans, newLoan]);
    setIsModalOpen(false);
    setFormData({
      loan_item: '',
      loan_date: new Date().toISOString().split('T')[0],
      loan_return_date: '',
      purpose: ''
    });
  };

  // Group inventory by category
  const groupedInventory = inventory.reduce((acc, item) => {
    if (item.item_quantity > 0) {
      if (!acc[item.item_category]) acc[item.item_category] = [];
      acc[item.item_category].push(item);
    }
    return acc;
  }, {} as Record<string, Inventory[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase shadow-lg shadow-indigo-500/20 tracking-widest flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Pinjam Barang
        </button>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4a]">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
            <tr>
              <th className="px-6 py-4 text-xs uppercase font-black text-gray-400 tracking-widest">Item</th>
              <th className="px-6 py-4 text-xs uppercase font-black text-gray-400 tracking-widest">Tarikh Pinjam</th>
              <th className="px-6 py-4 text-xs uppercase font-black text-gray-400 tracking-widest">Jangka Pulang</th>
              <th className="px-6 py-4 text-xs uppercase font-black text-gray-400 tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a4a]">
            {myLoans.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Tiada rekod pinjaman aktif.</td></tr>
            ) : (
              myLoans.slice().reverse().map(loan => (
                <tr key={loan.id} className="hover:bg-[#1a1a2e]/50">
                  <td className="px-6 py-4 text-white font-bold">{loan.loan_item}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm font-medium">{loan.loan_date}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm font-medium">{loan.loan_return_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      loan.loan_status === 'Dipinjam' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {loan.loan_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg card-dark rounded-2xl p-8 animate-in zoom-in-95 border border-[#2a2a4a]">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Pinjam Barang Baru</h3>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Nama Staff (Auto)</label>
                <input 
                  type="text" 
                  value={staff.name} 
                  disabled 
                  className="input-dark w-full px-4 py-3 rounded-xl font-bold opacity-60" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Pilih Item (Mengikut Kategori)</label>
                <select 
                  value={formData.loan_item} 
                  onChange={e => setFormData({...formData, loan_item: e.target.value})}
                  className="input-dark w-full px-4 py-3 rounded-xl font-bold"
                  required
                >
                  <option value="">-- Pilih Item --</option>
                  {Object.entries(groupedInventory).map(([category, items]) => (
                    <optgroup key={category} label={category.toUpperCase()} className="bg-[#1a1a2e] text-indigo-400 font-black text-xs">
                      {items.map(item => (
                        <option key={item.id} value={item.item_name} className="bg-[#0f0f1a] text-white font-medium">
                          {item.item_name} ({item.item_condition})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Tarikh Pinjam</label>
                  <input 
                    type="date" 
                    value={formData.loan_date} 
                    onChange={e => setFormData({...formData, loan_date: e.target.value})}
                    className="input-dark w-full px-4 py-3 rounded-xl" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Jangka Pulang</label>
                  <input 
                    type="date" 
                    value={formData.loan_return_date} 
                    onChange={e => setFormData({...formData, loan_return_date: e.target.value})}
                    className="input-dark w-full px-4 py-3 rounded-xl" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Tujuan / Event</label>
                <textarea 
                  value={formData.purpose} 
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  className="input-dark w-full px-4 py-3 rounded-xl h-24" 
                  placeholder="cth: Wedding Ali & Siti / Event Kuching Fest" 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#2a2a4a] text-gray-300 font-bold uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold uppercase text-xs shadow-lg shadow-indigo-500/20 tracking-widest">Pinjam Barang</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsTab: React.FC<{ staff: Staff }> = ({ staff }) => {
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // In a real app, we'd verify 'old' password. Here we simplify.
    if (passwords.new !== passwords.confirm) {
      setError('Kata laluan baru tidak sepadan!');
      return;
    }
    
    if (passwords.new.length < 4) {
      setError('Kata laluan mesti sekurang-kurangnya 4 aksara.');
      return;
    }

    const allStaff = storage.getStaff();
    const updatedStaffList = allStaff.map(s => {
      if (s.id === staff.id) {
        return { ...s, password: passwords.new };
      }
      return s;
    });

    storage.saveStaff(updatedStaffList);
    setSuccess('Kata laluan berjaya dikemaskini!');
    setPasswords({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-dark rounded-2xl p-8 border border-[#2a2a4a]">
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" /> Tukar Kata Laluan
        </h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Kata Laluan Baru</label>
            <input 
              type="password" 
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              required
              className="w-full px-4 py-3 rounded-xl input-dark font-medium"
              placeholder="Masukkan kata laluan baru"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Sahkan Kata Laluan Baru</label>
            <input 
              type="password" 
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              required
              className="w-full px-4 py-3 rounded-xl input-dark font-medium"
              placeholder="Ulang kata laluan baru"
            />
          </div>
          {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
          {success && <p className="text-green-400 text-sm font-bold">{success}</p>}
          <button 
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 mt-2"
          >
            Kemaskini Kata Laluan
          </button>
        </form>
      </div>

      <div className="card-dark rounded-2xl p-8 border border-[#2a2a4a] flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-purple-400" /> Maklumat Profil
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nama Penuh</p>
                <p className="text-white font-bold">{staff.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ID Staff</p>
                <p className="text-indigo-400 font-black uppercase tracking-widest">{staff.staff_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Jawatan</p>
                <p className="text-white font-bold">{staff.position}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Telefon</p>
                <p className="text-white font-bold">{staff.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tarikh Mula Kerja</p>
              <p className="text-white font-bold">{staff.hire_date}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <p className="text-xs text-indigo-400 font-medium">Sila hubungi Admin EH Foto sekiranya terdapat ralat pada maklumat profil anda.</p>
        </div>
      </div>
    </div>
  );
};

const ClaimsTab: React.FC<{ staff: Staff; myClaims: Claim[]; setMyClaims: any }> = ({ staff, myClaims, setMyClaims }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Minyak', desc: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const submitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newClaim: Claim = {
      id: crypto.randomUUID(),
      claim_staff_id: staff.id,
      claim_staff_name: staff.name,
      claim_type: formData.type,
      claim_description: formData.desc,
      claim_amount: formData.amount,
      claim_date: formData.date,
      claim_status: ClaimStatus.PENDING
    };
    const updated = [...myClaims, newClaim];
    setMyClaims(updated);
    const allClaims = storage.getClaims();
    storage.saveClaims([...allClaims, newClaim]);
    setIsModalOpen(false);
    setFormData({ type: 'Minyak', desc: '', amount: 0, date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase shadow-lg shadow-indigo-500/20 tracking-widest"
        >
          + Hantar Claim Baru
        </button>
      </div>

      <div className="space-y-4">
        {myClaims.length === 0 ? <p className="text-center text-gray-500 py-12">Tiada rekod claim.</p> : (
          myClaims.reverse().map(claim => (
            <div key={claim.id} className="card-dark rounded-2xl p-6 border-l-4 border-[#2a2a4a]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-white font-bold">{claim.claim_type}</h4>
                  <p className="text-gray-400 text-sm">{claim.claim_description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">RM {claim.claim_amount.toFixed(2)}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    claim.claim_status === ClaimStatus.APPROVED ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    claim.claim_status === ClaimStatus.REJECTED ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {claim.claim_status}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 font-bold uppercase mt-2">Tarikh: {claim.claim_date}</p>
              {claim.claim_response && (
                <div className="mt-3 p-3 bg-[#0a0a14] rounded-lg border border-[#2a2a4a]">
                   <p className="text-[10px] text-indigo-400 font-black uppercase mb-1 tracking-widest">Feedback Admin:</p>
                   <p className="text-xs text-gray-400 italic">"{claim.claim_response}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg card-dark rounded-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Hantar Claim Baru</h3>
            <form onSubmit={submitClaim} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Jenis Claim</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="input-dark w-full px-4 py-3 rounded-xl font-bold"
                >
                  <option>Minyak</option>
                  <option>Tol</option>
                  <option>Parking</option>
                  <option>Makan</option>
                  <option>Peralatan</option>
                  <option>Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Keterangan</label>
                <textarea 
                  value={formData.desc} 
                  onChange={e => setFormData({...formData, desc: e.target.value})}
                  className="input-dark w-full px-4 py-3 rounded-xl h-24" 
                  placeholder="Terangkan perbelanjaan ini..." 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Jumlah (RM)</label>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="input-dark w-full px-4 py-3 rounded-xl font-black" 
                    step="0.01" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Tarikh</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="input-dark w-full px-4 py-3 rounded-xl" 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#2a2a4a] text-gray-300 font-bold uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold uppercase text-xs shadow-lg shadow-indigo-500/20 tracking-widest">Hantar Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPortal;
