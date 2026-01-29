
import { storage } from './storageService';

export const googleSheetsService = {
  syncAllData: async (webhookUrl: string) => {
    if (!webhookUrl) throw new Error('URL Webhook tidak sah.');

    const payload = {
      staff: storage.getStaff(),
      inventory: storage.getInventory(),
      loans: storage.getLoans(),
      invoices: storage.getInvoices(),
      claims: storage.getClaims(),
      transactions: storage.getTransactions(),
      payroll: storage.getPayroll(),
      timestamp: new Date().toLocaleString()
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Essential for Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Update last sync in config
      const config = storage.getConfig();
      config.last_sync_date = new Date().toLocaleString();
      storage.saveConfig(config);

      return true;
    } catch (error) {
      console.error('Gagal sync ke Google Sheets:', error);
      throw error;
    }
  }
};
