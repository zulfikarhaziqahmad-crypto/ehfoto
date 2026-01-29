
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Staff } from '../types';
import { UserPlus, Trash2 } from 'lucide-react';

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    password: '',
    position: 'Photographer',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setStaff(storage.getStaff());
  }, []);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if staff_id already exists
    const existingStaff = staff.find(s => s.staff_id.toLowerCase() === formData.staff_id.toLowerCase());
    if (existingStaff) {
      alert('ID Staff ini sudah digunakan. Sila gunakan ID lain.');
      return;
    }

    // Unique internal ID using timestamp + random
    const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    const newStaff: Staff = {
      ...formData,
      id: newId
    };
    
    setStaff(prevStaff => {
      const updated = [...prevStaff, newStaff];
      storage.saveStaff(updated);
      return updated;
    });
    
    setIsModalOpen(false);
    setFormData({
      staff_id: '',
      name: '',
      password: '',
      position: 'Photographer',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteStaff = (id: string) => {
    if (window.confirm('Padam staff ini?')) {
      setStaff(prevStaff => {
        const updated = prevStaff.filter(s => s.id !== id);
        storage.saveStaff(updated);
        return updated;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Pengurusan Staff</h2>
          <p className="text-gray-400">Tambah dan urus maklumat staff syarikat</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl text-white font-bold text-sm uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30"
        >
          <UserPlus className="w-5 h-5" /> Tambah Staff
        </button>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a4a]">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">ID Staff</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nama</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Jawatan</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Telefon</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tarikh Mula</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a4a]">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Tiada staff dijumpai. Klik "Tambah Staff" untuk mula.</td>
              </tr>
            ) : (
              staff.map(s => (
                <tr key={s.id} className="hover:bg-[#1a1a2e]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full font-mono border border-indigo-500/20 font-bold uppercase">{s.staff_id}</span>
                  </td>
                  <td className="px-6 py-4 text-white font-bold">{s.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm font-medium">{s.position}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm font-medium">{s.phone}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm font-medium">{s.hire_date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteStaff(s.id)} 
                      className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Padam Staff"
                    >
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
          <div className="w-full max-w-lg card-dark rounded-2xl p-8 animate-in zoom-in-95 duration-200 border border-[#2a2a4a]">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Tambah Staff Baru</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">ID Staff</label>
                  <input 
                    type="text" 
                    value={formData.staff_id}
                    onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                    required 
                    className="w-full px-4 py-3 rounded-xl input-dark font-black uppercase tracking-widest text-indigo-400" 
                    placeholder="cth: EH001" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Kata Laluan</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                    className="w-full px-4 py-3 rounded-xl input-dark font-medium" 
                    placeholder="Kata laluan" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Nama Penuh</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="w-full px-4 py-3 rounded-xl input-dark font-medium" 
                  placeholder="cth: Ahmad Shazwan" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Jawatan</label>
                  <select 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl input-dark font-medium"
                  >
                    <option>Photographer</option>
                    <option>Videographer</option>
                    <option>Editor</option>
                    <option>Admin</option>
                    <option>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">No. Telefon</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                    className="w-full px-4 py-3 rounded-xl input-dark font-medium" 
                    placeholder="012-3456789" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Tarikh Mula Kerja</label>
                <input 
                  type="date" 
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  required 
                  className="w-full px-4 py-3 rounded-xl input-dark font-medium" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#2a2a4a] text-gray-300 font-bold uppercase text-xs tracking-widest hover:bg-[#3a3a5a] transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20">Simpan Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
