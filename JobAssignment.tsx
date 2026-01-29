
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Invoice, Staff, JobStatus } from '../types';
import { UserCheck, CheckCircle, Clock } from 'lucide-react';

const JobAssignment: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<'pending' | 'complete'>('pending');

  useEffect(() => {
    setInvoices(storage.getInvoices());
    setStaff(storage.getStaff());
  }, []);

  const photographers = staff.filter(s => s.position === 'Photographer' || s.position === 'Videographer');
  const editors = staff.filter(s => s.position === 'Editor');

  const filteredInvoices = filter === 'pending' 
    ? invoices.filter(inv => inv.invoice_photo_status !== JobStatus.COMPLETED || inv.invoice_edit_status !== JobStatus.COMPLETED)
    : invoices.filter(inv => inv.invoice_photo_status === JobStatus.COMPLETED && inv.invoice_edit_status === JobStatus.COMPLETED);

  const updateAssignment = (invoiceId: string, role: 'photographer' | 'editor', staffName: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        if (role === 'photographer') {
          return { 
            ...inv, 
            invoice_photographer: staffName, 
            invoice_photo_status: staffName ? JobStatus.IN_PROGRESS : undefined 
          };
        } else {
          return { 
            ...inv, 
            invoice_editor: staffName, 
            invoice_edit_status: staffName ? JobStatus.IN_PROGRESS : undefined 
          };
        }
      }
      return inv;
    });
    setInvoices(updated);
    storage.saveInvoices(updated);
  };

  const markComplete = (invoiceId: string, role: 'photo' | 'edit') => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        if (role === 'photo') return { ...inv, invoice_photo_status: JobStatus.COMPLETED };
        return { ...inv, invoice_edit_status: JobStatus.COMPLETED };
      }
      return inv;
    });
    setInvoices(updated);
    storage.saveInvoices(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Assign Job kepada Staff</h2>
        <p className="text-gray-400">Tugaskan photographer dan editor untuk setiap invois</p>
      </header>

      <div className="flex gap-4">
        <button 
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1a1a2e] text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Assignment
        </button>
        <button 
          onClick={() => setFilter('complete')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'complete' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#1a1a2e] text-gray-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Complete
        </button>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Invois</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Photographer</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status Photo</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Editor</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a4a]">
            {filteredInvoices.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tiada projek untuk dipaparkan.</td></tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.invoice_client}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={inv.invoice_photographer || ''}
                      onChange={(e) => updateAssignment(inv.id, 'photographer', e.target.value)}
                      className="input-dark px-2 py-1.5 rounded-lg text-sm w-40"
                    >
                      <option value="">-- Tiada --</option>
                      {photographers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {inv.invoice_photographer && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          inv.invoice_photo_status === JobStatus.COMPLETED ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {inv.invoice_photo_status}
                        </span>
                        {inv.invoice_photo_status !== JobStatus.COMPLETED && (
                          <button 
                            onClick={() => markComplete(inv.id, 'photo')}
                            className="text-green-400 hover:text-green-300" title="Mark Selesai"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={inv.invoice_editor || ''}
                      onChange={(e) => updateAssignment(inv.id, 'editor', e.target.value)}
                      className="input-dark px-2 py-1.5 rounded-lg text-sm w-40"
                    >
                      <option value="">-- Tiada --</option>
                      {editors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {inv.invoice_editor && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          inv.invoice_edit_status === JobStatus.COMPLETED ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {inv.invoice_edit_status}
                        </span>
                        {inv.invoice_edit_status !== JobStatus.COMPLETED && (
                          <button 
                            onClick={() => markComplete(inv.id, 'edit')}
                            className="text-green-400 hover:text-green-300" title="Mark Selesai"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobAssignment;
