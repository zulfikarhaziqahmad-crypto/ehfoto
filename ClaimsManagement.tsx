
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Claim, ClaimStatus } from '../types';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const ClaimsManagement: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filter, setFilter] = useState<ClaimStatus | 'ALL'>('ALL');

  useEffect(() => {
    setClaims(storage.getClaims());
  }, []);

  const handleAction = (id: string, status: ClaimStatus) => {
    const feedback = prompt(status === ClaimStatus.APPROVED ? 'Catatan kelulusan (opsional):' : 'Sebab penolakan:');
    if (status === ClaimStatus.REJECTED && !feedback) return;

    const updated = claims.map(c => {
      if (c.id === id) {
        return {
          ...c,
          claim_status: status,
          claim_response: feedback || '',
          claim_processed_date: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    setClaims(updated);
    storage.saveClaims(updated);

    // If approved, add to transactions
    if (status === ClaimStatus.APPROVED) {
      const claim = claims.find(c => c.id === id);
      if (claim) {
        const txs = storage.getTransactions();
        txs.push({
          id: crypto.randomUUID(),
          transaction_type: 'Perbelanjaan',
          transaction_description: `Claim Staff: ${claim.claim_staff_name} (${claim.claim_type})`,
          transaction_amount: claim.claim_amount,
          transaction_date: new Date().toISOString().split('T')[0]
        });
        storage.saveTransactions(txs);
      }
    }
  };

  const filteredClaims = filter === 'ALL' ? claims : claims.filter(c => c.claim_status === filter);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Tuntutan Staff (Claims)</h2>
        <p className="text-gray-400">Semak dan luluskan tuntutan perbelanjaan staff</p>
      </header>

      <div className="flex gap-4">
        {(['ALL', ClaimStatus.PENDING, ClaimStatus.APPROVED, ClaimStatus.REJECTED] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
            }`}
          >
            {s === 'ALL' ? 'Semua' : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClaims.length === 0 ? (
          <div className="card-dark rounded-2xl p-12 text-center text-gray-500 italic">
            Tiada rekod tuntutan untuk status ini.
          </div>
        ) : (
          filteredClaims.slice().reverse().map(claim => (
            <div key={claim.id} className="card-dark rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 border-l-4 border-[#2a2a4a]">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    claim.claim_status === ClaimStatus.APPROVED ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    claim.claim_status === ClaimStatus.REJECTED ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {claim.claim_status}
                  </span>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{claim.claim_date}</p>
                </div>
                <h4 className="text-xl font-bold text-white">{claim.claim_staff_name}</h4>
                <p className="text-indigo-400 font-black text-sm uppercase">{claim.claim_type}</p>
                <p className="text-gray-400">{claim.claim_description}</p>
              </div>

              <div className="flex flex-col items-end justify-between min-w-[200px]">
                <div className="text-right">
                  <p className="text-3xl font-black text-white">RM {claim.claim_amount.toFixed(2)}</p>
                </div>

                {claim.claim_status === ClaimStatus.PENDING ? (
                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={() => handleAction(claim.id, ClaimStatus.REJECTED)}
                      className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs uppercase hover:bg-red-500/20 transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Tolak
                    </button>
                    <button 
                      onClick={() => handleAction(claim.id, ClaimStatus.APPROVED)}
                      className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold text-xs uppercase hover:bg-green-600 transition-all flex items-center justify-center gap-1 shadow-lg shadow-green-900/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Lulus
                    </button>
                  </div>
                ) : (
                  <div className="text-right mt-4 text-xs text-gray-500 italic">
                    Diproses pada: {claim.claim_processed_date}
                    {claim.claim_response && <p className="mt-1 text-gray-400 font-medium">"{claim.claim_response}"</p>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClaimsManagement;
