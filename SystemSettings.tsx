
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { googleSheetsService } from '../services/googleSheetsService';
import { SystemConfig } from '../types';
import { Settings, Share2, CloudSync, Copy, CheckCircle2, AlertCircle, ExternalLink, Download, ShieldCheck } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(storage.getConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveConfig(config);
    setMessage({ text: 'Tetapan berjaya disimpan.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSync = async () => {
    if (!config.google_sheets_url) {
      setMessage({ text: 'Sila masukkan URL Webhook Google Apps Script.', type: 'error' });
      return;
    }

    setIsSyncing(true);
    try {
      await googleSheetsService.syncAllData(config.google_sheets_url);
      setConfig(storage.getConfig()); 
      setMessage({ text: 'Data berjaya di-sync ke Google Sheets!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Gagal melakukan sinkronisasi.', type: 'error' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleBackupDownload = () => {
    const backupData = {
      staff: storage.getStaff(),
      inventory: storage.getInventory(),
      loans: storage.getLoans(),
      invoices: storage.getInvoices(),
      claims: storage.getClaims(),
      transactions: storage.getTransactions(),
      payroll: storage.getPayroll(),
      export_date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EHFOTO_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setMessage({ text: 'Backup JSON berjaya dimuat turun.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const appsScriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  function updateSheet(name, rows) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    sheet.clear();
    if (rows && rows.length > 0) {
      var keys = Object.keys(rows[0]);
      sheet.appendRow(keys);
      var values = rows.map(function(row) {
        return keys.map(function(key) { return JSON.stringify(row[key]); });
      });
      sheet.getRange(2, 1, values.length, keys.length).setValues(values);
    }
  }

  updateSheet("Staff", data.staff);
  updateSheet("Invoices", data.invoices);
  updateSheet("Inventory", data.inventory);
  updateSheet("Loans", data.loans);
  updateSheet("Claims", data.claims);
  updateSheet("Transactions", data.transactions);

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Konfigurasi Sistem</h2>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Urus integrasi cloud dan keselamatan data syarikat</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={saveSettings} className="card-dark rounded-3xl p-8 border border-[#2a2a4a] shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Share2 className="w-5 h-5 text-indigo-400" /> Google Sheets Sync
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">URL Apps Script Web App</label>
                <input 
                  type="url" 
                  value={config.google_sheets_url}
                  onChange={(e) => setConfig({...config, google_sheets_url: e.target.value})}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-4 py-3 rounded-xl input-dark font-mono text-xs text-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="autosync"
                  checked={config.auto_sync}
                  onChange={(e) => setConfig({...config, auto_sync: e.target.checked})}
                  className="w-4 h-4 rounded border-[#2a2a4a] text-indigo-600 bg-[#0f0f1a]"
                />
                <label htmlFor="autosync" className="text-xs text-gray-500 font-black uppercase tracking-widest cursor-pointer">Auto-sync Data secara berkala</label>
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Status Sinkronisasi:</p>
                <p className="text-indigo-400 font-black font-mono text-sm tracking-tighter">TERAKHIR: {config.last_sync_date}</p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-top-2 ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-[#2a2a4a] text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                >
                  Simpan URL
                </button>
                <button 
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className={`flex-1 py-4 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CloudSync className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Cloud'}
                </button>
              </div>
            </div>
          </form>

          <div className="card-dark rounded-3xl p-8 border border-[#2a2a4a] shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" /> Keselamatan Data Lokal
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
              Walaupun data di-sync ke cloud, anda digalakkan untuk memuat turun salinan backup secara manual ke dalam storan peranti anda sekurang-kurangnya sekali sebulan.
            </p>
            <button 
              onClick={handleBackupDownload}
              className="w-full py-4 rounded-xl bg-green-600/10 text-green-400 border border-green-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Muat Turun Backup (.JSON)
            </button>
          </div>
        </div>

        <div className="card-dark rounded-3xl p-8 border border-[#2a2a4a] flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Panduan Integrasi</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(appsScriptCode);
                alert('Kod Apps Script berjaya disalin!');
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase border border-indigo-500/20 flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all"
            >
              <Copy className="w-3 h-3" /> Salin Skrip
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-3">
              {[
                "Buka Spreadsheet di Google Sheets",
                "Extensions > Apps Script",
                "Paste skrip yang telah disalin",
                "Deploy > New Deployment",
                "Type: Web App",
                "Access: Anyone (Penting!)",
                "Copy URL Web App ke kotak input di sebelah"
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black flex items-center justify-center border border-indigo-500/20 shrink-0">{i+1}</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#0a0a14] rounded-2xl border border-[#2a2a4a] overflow-x-auto relative">
              <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-gray-700 uppercase">JavaScript / Apps Script</div>
              <pre className="text-[9px] text-gray-600 font-mono leading-relaxed select-all">
                {appsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
