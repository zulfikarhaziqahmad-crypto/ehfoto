
import { Staff, Inventory, Loan, Invoice, Payroll, Claim, Transaction, SystemConfig } from '../types';

const STORAGE_KEYS = {
  STAFF: 'eh_staff',
  INVENTORY: 'eh_inventory',
  LOAN: 'eh_loan',
  INVOICE: 'eh_invoice',
  PAYROLL: 'eh_payroll',
  CLAIM: 'eh_claim',
  TRANSACTION: 'eh_transaction',
  CONFIG: 'eh_config'
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
  getStaff: () => get<Staff>(STORAGE_KEYS.STAFF),
  saveStaff: (data: Staff[]) => save(STORAGE_KEYS.STAFF, data),
  
  getInventory: () => get<Inventory>(STORAGE_KEYS.INVENTORY),
  saveInventory: (data: Inventory[]) => save(STORAGE_KEYS.INVENTORY, data),
  
  getLoans: () => get<Loan>(STORAGE_KEYS.LOAN),
  saveLoans: (data: Loan[]) => save(STORAGE_KEYS.LOAN, data),
  
  getInvoices: () => get<Invoice>(STORAGE_KEYS.INVOICE),
  saveInvoices: (data: Invoice[]) => save(STORAGE_KEYS.INVOICE, data),
  
  getPayroll: () => get<Payroll>(STORAGE_KEYS.PAYROLL),
  savePayroll: (data: Payroll[]) => save(STORAGE_KEYS.PAYROLL, data),
  
  getClaims: () => get<Claim>(STORAGE_KEYS.CLAIM),
  saveClaims: (data: Claim[]) => save(STORAGE_KEYS.CLAIM, data),
  
  getTransactions: () => get<Transaction>(STORAGE_KEYS.TRANSACTION),
  saveTransactions: (data: Transaction[]) => save(STORAGE_KEYS.TRANSACTION, data),

  getConfig: (): SystemConfig => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : { google_sheets_url: '', last_sync_date: '-', auto_sync: false };
  },
  saveConfig: (config: SystemConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
};
