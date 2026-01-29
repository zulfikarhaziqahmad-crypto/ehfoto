
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Transaction, Invoice, Payroll } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet, CalendarDays } from 'lucide-react';

const FinanceManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const txs = storage.getTransactions();
    const invoices = storage.getInvoices().filter(i => i.invoice_status === 'Dibayar');
    const payroll = storage.getPayroll();

    // Calculate overall summary
    let totalIncome = txs.filter(t => t.transaction_type === 'Pendapatan').reduce((s, t) => s + t.transaction_amount, 0);
    totalIncome += invoices.reduce((s, i) => s + i.invoice_total, 0);

    let totalExpense = txs.filter(t => t.transaction_type === 'Perbelanjaan').reduce((s, t) => s + t.transaction_amount, 0);
    totalExpense += payroll.reduce((s, p) => s + p.payment_amount, 0);

    setTransactions(txs);
    setSummary({ income: totalIncome, expense: totalExpense, net: totalIncome - totalExpense });

    // --- Group Data by Month ---
    const monthlyData: Record<string, { monthKey: string; monthLabel: string; income: number; expense: number }> = {};

    const getMonthInfo = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      const monthNames = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      };
    };

    // 1. Process Manual Transactions
    txs.forEach(t => {
      const info = getMonthInfo(t.transaction_date);
      if (!info) return;
      if (!monthlyData[info.key]) monthlyData[info.key] = { monthKey: info.key, monthLabel: info.label, income: 0, expense: 0 };
      
      if (t.transaction_type === 'Pendapatan') {
        monthlyData[info.key].income += t.transaction_amount;
      } else {
        monthlyData[info.key].expense += t.transaction_amount;
      }
    });

    // 2. Process Paid Invoices (Income)
    invoices.forEach(inv => {
      const info = getMonthInfo(inv.invoice_date);
      if (!info) return;
      if (!monthlyData[info.key]) monthlyData[info.key] = { monthKey: info.key, monthLabel: info.label, income: 0, expense: 0 };
      monthlyData[info.key].income += inv.invoice_total;
    });

    // 3. Process Payroll (Expense)
    payroll.forEach(p => {
      const info = getMonthInfo(p.payment_date);
      if (!info) return;
      if (!monthlyData[info.key]) monthlyData[info.key] = { monthKey: info.key, monthLabel: info.label, income: 0, expense: 0 };
      monthlyData[info.key].expense += p.payment_amount;
    });

    // Convert to array and sort by monthKey
    const sortedData = Object.values(monthlyData)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(item => ({
        name: item.monthLabel,
        Income: item.income,
        Expense: item.expense
      }));

    // If no data, show at least current month with zero values
    if (sortedData.length === 0) {
      const info = getMonthInfo(new Date().toISOString())!;
      sortedData.push({ name: info.label, Income: 0, Expense: 0 });
    }

    setChartData(sortedData);
  }, []);

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Laporan Kewangan</h2>
        <p className="text-gray-400">Analisis prestasi bulanan dan aliran tunai syarikat</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-dark rounded-2xl p-6 border-l-4 border-green-500 shadow-lg group hover:bg-[#1a1a2e] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Jumlah Pendapatan</p>
              <p className="text-2xl font-black text-white">RM {summary.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        <div className="card-dark rounded-2xl p-6 border-l-4 border-red-500 shadow-lg group hover:bg-[#1a1a2e] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Jumlah Perbelanjaan</p>
              <p className="text-2xl font-black text-white">RM {summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        <div className="card-dark rounded-2xl p-6 border-l-4 border-indigo-500 shadow-lg group hover:bg-[#1a1a2e] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Baki Bersih</p>
              <p className={`text-2xl font-black ${summary.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                RM {summary.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark rounded-2xl p-8 shadow-xl flex flex-col h-[450px] border border-[#2a2a4a]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" /> Prestasi Bulanan
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a4a" />
                <XAxis 
                  dataKey="name" 
                  stroke="#4a4a6a" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#4a4a6a" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `RM${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ 
                    backgroundColor: '#16162a', 
                    borderRadius: '12px', 
                    border: '1px solid #2a2a4a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  labelStyle={{ color: '#818cf8', fontWeight: '900', marginBottom: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`RM ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-dark rounded-2xl p-8 shadow-xl overflow-hidden border border-[#2a2a4a]">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Transaksi Terkini</h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                 <Wallet className="w-12 h-12 opacity-10 mb-4" />
                 <p className="italic text-sm font-medium tracking-wide">Tiada transaksi direkodkan.</p>
              </div>
            ) : (
              transactions.slice(-6).reverse().map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-[#0a0a14] rounded-xl border border-[#2a2a4a] hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      t.transaction_type === 'Pendapatan' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {t.transaction_type === 'Pendapatan' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-tight">{t.transaction_description}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.transaction_date}</p>
                    </div>
                  </div>
                  <p className={`font-black text-lg ${t.transaction_type === 'Pendapatan' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.transaction_type === 'Pendapatan' ? '+' : '-'} RM {t.transaction_amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          {transactions.length > 0 && (
            <button className="w-full mt-6 py-3 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] hover:text-indigo-400 transition-colors">
              Lihat Semua Transaksi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
