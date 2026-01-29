
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Inventory } from '../types';
import { PackagePlus, Trash2 } from 'lucide-react';

const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    item_category: 'Kamera',
    item_quantity: 1,
    item_condition: 'Baru'
  });

  useEffect(() => {
    setItems(storage.getInventory());
  }, []);

  const categories = ['all', 'Kamera', 'Lensa', 'Pencahayaan', 'Aksesori', 'Lain-lain'];

  const filteredItems = filter === 'all' ? items : items.filter(i => i.item_category === filter);

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Inventory = { ...formData, id: crypto.randomUUID() };
    const updated = [...items, newItem];
    setItems(updated);
    storage.saveInventory(updated);
    setIsModalOpen(false);
    setFormData({ item_name: '', item_category: 'Kamera', item_quantity: 1, item_condition: 'Baru' });
  };

  const deleteItem = (id: string) => {
    if (confirm('Padam item ini?')) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      storage.saveInventory(updated);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pengurusan Inventori</h2>
          <p className="text-gray-400">Urus peralatan dan barang syarikat</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <PackagePlus className="w-5 h-5" /> Tambah Item
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map(c => (
          <button 
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap capitalize ${
              filter === c ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[#1a1a2e] text-gray-400 border border-transparent'
            }`}
          >
            {c === 'all' ? 'Semua' : c}
          </button>
        ))}
      </div>

      <div className="card-dark rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#1a1a2e] border-b border-[#2a2a4a]">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Nama Item</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Kategori</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Kuantiti</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Keadaan</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-400">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a4a]">
            {filteredItems.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tiada item dijumpai.</td></tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{item.item_name}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-sm border border-indigo-500/20">{item.item_category}</span></td>
                  <td className="px-6 py-4 text-gray-400">{item.item_quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-sm font-medium ${
                      item.item_condition === 'Baru' ? 'bg-green-500/10 text-green-400' :
                      item.item_condition === 'Baik' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {item.item_condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300">
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
          <div className="w-full max-w-lg card-dark rounded-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-6">Tambah Item Inventori</h3>
            <form onSubmit={addItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nama Item</label>
                <input 
                  type="text" 
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  required 
                  className="w-full px-4 py-3 rounded-xl input-dark" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
                  <select 
                    value={formData.item_category}
                    onChange={(e) => setFormData({...formData, item_category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl input-dark"
                  >
                    <option>Kamera</option>
                    <option>Lensa</option>
                    <option>Pencahayaan</option>
                    <option>Aksesori</option>
                    <option>Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Kuantiti</label>
                  <input 
                    type="number" 
                    value={formData.item_quantity}
                    onChange={(e) => setFormData({...formData, item_quantity: parseInt(e.target.value)})}
                    required 
                    min="1"
                    className="w-full px-4 py-3 rounded-xl input-dark" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Keadaan</label>
                <select 
                  value={formData.item_condition}
                  onChange={(e) => setFormData({...formData, item_condition: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl input-dark"
                >
                  <option>Baru</option>
                  <option>Baik</option>
                  <option>Sederhana</option>
                  <option>Perlu Baiki</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#2a2a4a] text-gray-300 font-semibold hover:bg-[#3a3a5a]">Batal</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
