
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storageService';
import { Invoice, InvoicePackage } from '../types';
import { FilePlus, Eye, Image as ImageIcon, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    client: '',
    customer_no: '',
    detail: '',
    date: new Date().toISOString().split('T')[0],
    deposit: 0,
    items: [{ name: '', price: 0 }] as InvoicePackage[]
  });

  useEffect(() => {
    setInvoices(storage.getInvoices());
  }, []);

  const generateInvoiceNumber = () => {
    // Find the highest number used so far in the INV-EHFA-XXXX sequence
    const existingNumbers = invoices
      .map(inv => {
        const match = inv.invoice_number.match(/INV-EHFA-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));
    
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `INV-EHFA-${String(nextNum).padStart(4, '0')}`;
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { name: '', price: 0 }] });
  };

  const updateItem = (index: number, field: keyof InvoicePackage, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'price' ? parseFloat(value) : value };
    setFormData({ ...formData, items: updatedItems });
  };

  const saveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.items.reduce((sum, item) => sum + item.price, 0);
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoice_number: generateInvoiceNumber(),
      invoice_client: formData.client,
      invoice_customer_no: formData.customer_no,
      invoice_detail: formData.detail,
      invoice_date: formData.date,
      invoice_items: formData.items,
      invoice_total: total,
      invoice_deposit: formData.deposit,
      invoice_status: 'Belum Dibayar'
    };
    
    setInvoices(prev => {
      const updated = [...prev, newInvoice];
      storage.saveInvoices(updated);
      return updated;
    });
    
    setIsModalOpen(false);
    setFormData({ client: '', customer_no: '', detail: '', date: new Date().toISOString().split('T')[0], deposit: 0, items: [{ name: '', price: 0 }] });
  };

  const markPaid = (id: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, invoice_status: 'Dibayar' as const } : inv);
      storage.saveInvoices(updated);
      return updated;
    });
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Padam invois ini?')) {
      setInvoices(prev => {
        const updated = prev.filter(i => i.id !== id);
        storage.saveInvoices(updated);
        return updated;
      });
    }
  };

  const handleSaveImage = async () => {
    if (invoiceRef.current) {
      // Capture A4 proportions precisely
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, 
        height: 1123, 
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${viewInvoice?.invoice_number || 'invoice'}.png`;
      link.click();
    }
  };

  const companyInfo = {
    address: "Kuching, Sarawak",
    phone: "0189653673"
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Pengurusan Invois</h2>
          <p className="text-gray-400">Jana dan simpan invois pelanggan dalam format A4</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <FilePlus className="w-5 h-5" /> Jana Invois
        </button>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4a]">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">No. Invois</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pelanggan</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tarikh</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Jumlah (RM)</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a4a]">
            {invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Tiada invois dijana lagi.</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                  <td className="px-6 py-4 text-white font-bold">{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-gray-300 font-medium">{inv.invoice_client}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{inv.invoice_date}</td>
                  <td className="px-6 py-4 text-green-400 font-black">RM {inv.invoice_total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      inv.invoice_status === 'Dibayar' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {inv.invoice_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => setViewInvoice(inv)} className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                    {inv.invoice_status === 'Belum Dibayar' && (
                      <button onClick={() => markPaid(inv.id)} className="text-green-400 hover:text-green-300 font-black text-[10px] uppercase border border-green-500/20 px-2 py-1 rounded hover:bg-green-500/10 transition-all">Mark Paid</button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl card-dark rounded-2xl p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto border border-[#2a2a4a]">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Jana Invois Baru</h3>
            <form onSubmit={saveInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Nama Pelanggan</label>
                  <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="input-dark w-full px-4 py-3 rounded-xl font-medium" required />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">No. Pelanggan</label>
                  <input type="text" value={formData.customer_no} onChange={e => setFormData({...formData, customer_no: e.target.value})} className="input-dark w-full px-4 py-3 rounded-xl font-medium" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Detail Projek (Pengantin)</label>
                <input type="text" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="input-dark w-full px-4 py-3 rounded-xl font-medium" placeholder="cth: Majlis Perkahwinan Ali & Siti" required />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Senarai Item Pakej</label>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        className="input-dark flex-1 px-4 py-2 rounded-lg font-medium" 
                        placeholder="Nama Pakej"
                        required
                      />
                      <input 
                        type="number" 
                        value={item.price} 
                        onChange={e => updateItem(idx, 'price', e.target.value)}
                        className="input-dark w-32 px-4 py-2 rounded-lg font-black" 
                        placeholder="Harga"
                        required
                      />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddItem} className="mt-2 text-indigo-400 text-xs font-black uppercase tracking-widest hover:text-indigo-300">+ Tambah Item Lain</button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2a2a4a]">
                <div>
                   <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Nilai Deposit (RM)</label>
                   <input 
                    type="number" 
                    value={formData.deposit} 
                    onChange={e => setFormData({...formData, deposit: parseFloat(e.target.value) || 0})} 
                    className="input-dark w-full px-4 py-3 rounded-xl font-black" 
                    placeholder="0.00"
                   />
                </div>
                <div className="flex flex-col justify-end text-right">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Jumlah Keseluruhan:</span>
                  <span className="text-2xl font-black text-white">RM {formData.items.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#2a2a4a] text-gray-300 font-bold uppercase text-xs tracking-widest hover:bg-[#3a3a5a] transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20">Simpan Invois</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[850px] flex flex-col gap-4 animate-in zoom-in-95 mt-20 mb-20">
            {/* A4 Container */}
            <div 
              ref={invoiceRef} 
              className="bg-white text-gray-800 shadow-2xl mx-auto overflow-hidden relative border"
              style={{ width: '794px', height: '1123px', padding: '60px' }}
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-indigo-700 tracking-tighter uppercase italic">EH FOTO ARTWORK</h2>
                <p className="text-gray-600 font-bold text-sm tracking-wide mt-1 uppercase">{companyInfo.address}</p>
                <p className="text-gray-600 font-bold text-sm tracking-wide">TEL: {companyInfo.phone}</p>
                <div className="h-1.5 bg-indigo-700 w-32 mx-auto mt-4"></div>
              </div>

              <div className="flex justify-between items-start mb-12">
                <div className="max-w-[50%]">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">DIKELUARKAN KEPADA:</h3>
                  <p className="font-black text-xl text-gray-900 leading-tight mb-1">{viewInvoice.invoice_client}</p>
                  <p className="text-gray-500 font-bold text-sm">{viewInvoice.invoice_customer_no}</p>
                </div>
                <div className="text-right">
                  <div className="relative">
                    <h1 className="text-6xl font-black text-gray-50 absolute right-0 -top-12 -z-10 select-none opacity-40">INVOICE</h1>
                    <div className="space-y-1.5">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">NO. INVOIS: <span className="text-gray-900 ml-3 font-black text-lg">{viewInvoice.invoice_number}</span></p>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">TARIKH: <span className="text-gray-900 ml-3 font-bold">{viewInvoice.invoice_date}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-100 mb-6">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">DETAIL PROJEK</h4>
                  <p className="font-black text-lg text-gray-800">{viewInvoice.invoice_detail}</p>
                </div>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-4 border-gray-900 text-left">
                      <th className="py-4 text-xs uppercase font-black tracking-widest text-gray-900">Deskripsi Item Pakej</th>
                      <th className="py-4 text-xs uppercase font-black tracking-widest text-right text-gray-900">Jumlah (RM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.invoice_items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-5 font-bold text-gray-800 text-lg">{item.name}</td>
                        <td className="py-5 text-right font-black text-gray-900 text-lg">{item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Calculations */}
              <div className="absolute bottom-32 left-[60px] right-[60px]">
                <div className="flex flex-col items-end border-t-2 border-gray-100 pt-6">
                  <div className="flex justify-between w-[300px] mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center">JUMLAH KASAR:</span>
                    <span className="text-lg font-black text-gray-900">RM {viewInvoice.invoice_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-[300px] mb-4 text-indigo-600">
                    <span className="text-[10px] font-black uppercase tracking-widest self-center">DEPOSIT:</span>
                    <span className="text-lg font-black">- RM {(viewInvoice.invoice_deposit || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-[350px] bg-indigo-700 p-5 rounded-xl text-white shadow-xl">
                    <span className="text-[10px] font-black uppercase self-center tracking-widest">BAKI PERLU DIBAYAR:</span>
                    <span className="text-3xl font-black">RM {(viewInvoice.invoice_total - (viewInvoice.invoice_deposit || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-20 text-center">
                  <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
                  <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                    * Dokumen ini adalah cetakan komputer secara automatik dari sistem EH Foto Artwork. Tandatangan tidak diperlukan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-[794px] mx-auto w-full">
              <button onClick={() => setViewInvoice(null)} className="flex-1 py-4 rounded-2xl bg-gray-800 text-white font-black hover:bg-gray-700 transition-colors uppercase tracking-widest text-xs">Tutup</button>
              <button 
                onClick={handleSaveImage} 
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/30 uppercase tracking-widest text-xs"
              >
                <ImageIcon className="w-5 h-5" /> Simpan Imej (PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
