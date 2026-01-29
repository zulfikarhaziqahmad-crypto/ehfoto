
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storageService';
import { Staff, Invoice, Payroll, JobStatus } from '../types';
import { Banknote, CheckCircle2, Search, Calendar, FileText, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const PayrollManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<Payroll[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedJobs, setSelectedJobs] = useState<{ invoice_id: string; role: 'photo' | 'edit'; amount: number }[]>([]);
  const [viewPayroll, setViewPayroll] = useState<Payroll | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStaff(storage.getStaff());
    setInvoices(storage.getInvoices());
    setPayrollHistory(storage.getPayroll());
  }, []);

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // Get completed jobs for the selected staff that haven't been paid yet
  const availableJobs = invoices.flatMap(inv => {
    const jobs = [];
    if (inv.invoice_photographer === selectedStaff?.name && inv.invoice_photo_status === JobStatus.COMPLETED && !inv.invoice_photo_paid) {
      jobs.push({ inv, role: 'photo' as const, label: 'Photographer' });
    }
    if (inv.invoice_editor === selectedStaff?.name && inv.invoice_edit_status === JobStatus.COMPLETED && !inv.invoice_edit_paid) {
      jobs.push({ inv, role: 'edit' as const, label: 'Editor' });
    }
    return jobs;
  });

  const toggleJob = (invoice_id: string, role: 'photo' | 'edit', defaultAmount: number) => {
    const isSelected = selectedJobs.some(j => j.invoice_id === invoice_id && j.role === role);
    if (isSelected) {
      setSelectedJobs(selectedJobs.filter(j => !(j.invoice_id === invoice_id && j.role === role)));
    } else {
      setSelectedJobs([...selectedJobs, { invoice_id, role, amount: 0 }]);
    }
  };

  const updateJobAmount = (invoice_id: string, role: 'photo' | 'edit', amount: number) => {
    setSelectedJobs(selectedJobs.map(j => (j.invoice_id === invoice_id && j.role === role ? { ...j, amount } : j)));
  };

  const handlePayStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || selectedJobs.length === 0) return;

    const totalAmount = selectedJobs.reduce((sum, j) => sum + j.amount, 0);

    const paymentJobs = selectedJobs.map(sj => {
      const inv = invoices.find(i => i.id === sj.invoice_id)!;
      return {
        invoice_id: sj.invoice_id,
        invoice_number: inv.invoice_number,
        role: sj.role === 'photo' ? 'Photographer' : 'Editor',
        description: inv.invoice_detail,
        amount: sj.amount
      };
    });

    const newPayment: Payroll = {
      id: crypto.randomUUID(),
      payment_staff_id: selectedStaff.id,
      payment_staff_name: selectedStaff.name,
      payment_amount: totalAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_jobs: paymentJobs
    };

    // Update invoices to mark as paid to staff
    const updatedInvoices = invoices.map(inv => {
      const photoPayment = selectedJobs.find(sj => sj.invoice_id === inv.id && sj.role === 'photo');
      const editPayment = selectedJobs.find(sj => sj.invoice_id === inv.id && sj.role === 'edit');
      return {
        ...inv,
        invoice_photo_paid: photoPayment ? true : inv.invoice_photo_paid,
        invoice_edit_paid: editPayment ? true : inv.invoice_edit_paid
      };
    });

    const updatedPayroll = [...payrollHistory, newPayment];
    setPayrollHistory(updatedPayroll);
    setInvoices(updatedInvoices);
    storage.savePayroll(updatedPayroll);
    storage.saveInvoices(updatedInvoices);

    // Record as transaction
    const txs = storage.getTransactions();
    txs.push({
      id: crypto.randomUUID(),
      transaction_type: 'Perbelanjaan',
      transaction_description: `Gaji Staff (Per-Job): ${selectedStaff.name}`,
      transaction_amount: totalAmount,
      transaction_date: new Date().toISOString().split('T')[0]
    });
    storage.saveTransactions(txs);

    setSelectedJobs([]);
    setSelectedStaffId('');
    alert('Pembayaran gaji per-job berjaya direkodkan.');
  };

  const handleSavePayslip = async () => {
    if (payslipRef.current) {
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, 
        height: 1123, 
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `payslip-${viewPayroll?.payment_staff_name}-${viewPayroll?.payment_date}.png`;
      link.click();
    }
  };

  const deletePayroll = (id: string) => {
    if (window.confirm('Padam rekod pembayaran ini?')) {
      const updated = payrollHistory.filter(p => p.id !== id);
      setPayrollHistory(updated);
      storage.savePayroll(updated);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Pengurusan Gaji Per-Job</h2>
        <p className="text-gray-400">Bayar staff berdasarkan tugasan (invois) yang telah selesai</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Select and Pay */}
        <div className="lg:col-span-1">
          <div className="card-dark rounded-2xl p-6 sticky top-6 border border-[#2a2a4a]">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <Banknote className="w-5 h-5 text-green-400" /> Proses Bayaran
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Pilih Staff</label>
                <select 
                  value={selectedStaffId}
                  onChange={(e) => { setSelectedStaffId(e.target.value); setSelectedJobs([]); }}
                  className="w-full px-4 py-3 rounded-xl input-dark font-bold"
                  required
                >
                  <option value="">-- Pilih Staff --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {selectedStaffId && (
                <div className="space-y-4">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Tugasan Selesai (Unpaid)</label>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {availableJobs.length === 0 ? (
                      <p className="text-gray-500 text-xs italic">Tiada tugasan baru untuk dibayar.</p>
                    ) : (
                      availableJobs.map(({ inv, role, label }) => {
                        const isChecked = selectedJobs.some(j => j.invoice_id === inv.id && j.role === role);
                        return (
                          <div key={`${inv.id}-${role}`} className={`p-3 rounded-xl border transition-all ${isChecked ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#0f0f1a] border-[#2a2a4a]'}`}>
                            <div className="flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => toggleJob(inv.id, role, 0)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="flex-1">
                                <p className="text-xs font-black text-white uppercase">{inv.invoice_number}</p>
                                <p className="text-[10px] text-gray-400 leading-tight mb-2">{inv.invoice_detail}</p>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md">{label}</span>
                                
                                {isChecked && (
                                  <div className="mt-3">
                                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Amaun Bayaran (RM)</label>
                                    <input 
                                      type="number" 
                                      value={selectedJobs.find(j => j.invoice_id === inv.id && j.role === role)?.amount || 0}
                                      onChange={(e) => updateJobAmount(inv.id, role, parseFloat(e.target.value) || 0)}
                                      className="w-full px-3 py-1.5 rounded-lg input-dark text-xs font-black text-green-400"
                                      placeholder="0.00"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#2a2a4a]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Jumlah Bersih:</span>
                      <span className="text-2xl font-black text-green-400">RM {selectedJobs.reduce((s, j) => s + j.amount, 0).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handlePayStaff}
                      disabled={selectedJobs.length === 0}
                      className="w-full py-3 rounded-xl bg-green-600 text-white font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
                    >
                      Sahkan Bayaran
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-dark rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4a]">
            <div className="p-4 border-b border-[#2a2a4a] bg-[#1a1a2e] flex items-center justify-between">
              <h3 className="font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Sejarah Pembayaran
              </h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#0f0f1a]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tugasan Paid</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarikh</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Jumlah (RM)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a4a]">
                {payrollHistory.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Tiada rekod pembayaran.</td></tr>
                ) : (
                  payrollHistory.slice().reverse().map(p => (
                    <tr key={p.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-black text-sm">{p.payment_staff_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-black">{p.payment_jobs.length} Job</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-bold uppercase">{p.payment_date}</td>
                      <td className="px-6 py-4 text-right text-green-400 font-black text-lg">RM {p.payment_amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setViewPayroll(p)} className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={() => deletePayroll(p.id)} className="p-2 text-red-500/60 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      {viewPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[850px] flex flex-col gap-4 animate-in zoom-in-95 mt-20 mb-20">
            {/* A4 Payslip Container */}
            <div 
              ref={payslipRef} 
              className="bg-white text-gray-800 shadow-2xl mx-auto overflow-hidden relative border"
              style={{ width: '794px', height: '1123px', padding: '60px' }}
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-indigo-700 tracking-tighter uppercase italic">EH FOTO ARTWORK</h2>
                <p className="text-gray-600 font-bold text-sm tracking-wide mt-1 uppercase">Kuching, Sarawak</p>
                <p className="text-gray-600 font-bold text-sm tracking-wide">TEL: 0189653673</p>
                <div className="h-1.5 bg-indigo-700 w-32 mx-auto mt-4"></div>
              </div>

              <div className="flex justify-between items-start mb-12">
                <div className="max-w-[50%]">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">SLIP GAJI STAFF:</h3>
                  <p className="font-black text-2xl text-gray-900 leading-tight mb-1">{viewPayroll.payment_staff_name}</p>
                  <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">TARIKH BAYARAN: {viewPayroll.payment_date}</p>
                </div>
                <div className="text-right">
                   <div className="relative">
                    <h1 className="text-6xl font-black text-gray-50 absolute right-0 -top-12 -z-10 select-none opacity-40 uppercase">PAYSLIP</h1>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-tighter">REKOD ID: <span className="text-gray-900 ml-3 font-mono">{viewPayroll.id.slice(0, 8).toUpperCase()}</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-4 border-gray-900 text-left">
                      <th className="py-4 text-xs uppercase font-black tracking-widest text-gray-900">Tugasan / Invois</th>
                      <th className="py-4 text-xs uppercase font-black tracking-widest text-gray-900">Peranan</th>
                      <th className="py-4 text-xs uppercase font-black tracking-widest text-right text-gray-900">Komisen (RM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewPayroll.payment_jobs.map((job, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-5">
                          <p className="font-black text-gray-800 text-lg uppercase tracking-tighter">{job.invoice_number}</p>
                          <p className="text-xs text-gray-500 font-bold">{job.description}</p>
                        </td>
                        <td className="py-5">
                           <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-600 rounded">{job.role}</span>
                        </td>
                        <td className="py-5 text-right font-black text-gray-900 text-lg">{job.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-900">
                      <td colSpan={2} className="py-6 text-sm font-black text-right uppercase tracking-widest">JUMLAH GAJI BERSIH:</td>
                      <td className="py-6 text-4xl font-black text-right text-green-600 tracking-tighter">RM {viewPayroll.payment_amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="absolute bottom-32 left-[60px] right-[60px]">
                <div className="flex justify-between items-end">
                   <div className="text-center w-[200px]">
                      <div className="h-0.5 bg-gray-900 w-full mb-2"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Disediakan Oleh</p>
                      <p className="text-[8px] text-gray-400 font-bold">EH FOTO ARTWORK ADMIN</p>
                   </div>
                   <div className="text-center w-[200px]">
                      <div className="h-0.5 bg-gray-900 w-full mb-2"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Diterima Oleh</p>
                      <p className="text-[8px] text-gray-400 font-bold">{viewPayroll.payment_staff_name}</p>
                   </div>
                </div>

                <div className="mt-20 text-center">
                  <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
                  <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                    * Slip ini adalah rekod rasmi pembayaran komisen tugasan untuk EH Foto Artwork.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-[794px] mx-auto w-full">
              <button onClick={() => setViewPayroll(null)} className="flex-1 py-4 rounded-2xl bg-gray-800 text-white font-black hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs">Tutup</button>
              <button 
                onClick={handleSavePayslip} 
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs"
              >
                <ImageIcon className="w-5 h-5" /> Simpan Slip (PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
