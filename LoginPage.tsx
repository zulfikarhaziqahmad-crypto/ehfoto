
import React, { useState } from 'react';
import { UserType, Staff } from '../types';
import { storage } from '../services/storageService';
import { Camera } from 'lucide-react';

interface LoginPageProps {
  onLogin: (type: UserType, data?: Staff) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin login
    if (identifier.toLowerCase() === 'admin' && password === 'admin123') {
      onLogin(UserType.ADMIN);
      return;
    }

    // Staff login
    const allStaff = storage.getStaff();
    const foundStaff = allStaff.find(
      s => s.staff_id.toLowerCase() === identifier.toLowerCase() && s.password === password
    );

    if (foundStaff) {
      onLogin(UserType.STAFF, foundStaff);
    } else {
      setError('Staff ID atau kata laluan tidak sah');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-[#0a0a14]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0a0a14] rounded-2xl flex items-center justify-center">
              <Camera className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EH Foto Artwork</h1>
          <p className="text-gray-400">Photography & Artwork Services</p>
        </div>
        <div className="card-dark rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-center">Log Masuk</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Admin ID / Staff ID</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl input-dark" 
                placeholder="Masukkan admin ID atau staff ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kata Laluan</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl input-dark" 
                placeholder="Masukkan kata laluan"
                required
              />
            </div>
            {error && <div className="text-red-400 text-sm text-center py-2">{error}</div>}
            <button 
              type="submit" 
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold mt-6 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              Log Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
