
export enum UserType {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export enum JobStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'Dalam Proses',
  COMPLETED = 'Selesai'
}

export enum ClaimStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Staff {
  id: string;
  staff_id: string;
  name: string;
  password?: string;
  phone: string;
  position: string;
  hire_date: string;
}

export interface Inventory {
  id: string;
  item_name: string;
  item_category: string;
  item_quantity: number;
  item_condition: string;
}

export interface Loan {
  id: string;
  loan_staff: string;
  loan_item: string;
  loan_date: string;
  loan_return_date: string;
  loan_status: 'Dipinjam' | 'Dipulangkan';
  loan_purpose?: string;
}

export interface InvoicePackage {
  name: string;
  price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_customer_no: string;
  invoice_client: string;
  invoice_detail: string;
  invoice_date: string;
  invoice_items: InvoicePackage[];
  invoice_total: number;
  invoice_deposit?: number;
  invoice_status: 'Belum Dibayar' | 'Dibayar';
  invoice_photographer?: string;
  invoice_editor?: string;
  invoice_photo_status?: JobStatus;
  invoice_edit_status?: JobStatus;
  invoice_photo_paid?: boolean;
  invoice_edit_paid?: boolean;
}

export interface Payroll {
  id: string;
  payment_staff_id: string;
  payment_staff_name: string;
  payment_amount: number;
  payment_date: string;
  payment_jobs: {
    invoice_id: string;
    invoice_number: string;
    role: string;
    description: string;
    amount: number;
  }[];
}

export interface Claim {
  id: string;
  claim_staff_id: string;
  claim_staff_name: string;
  claim_type: string;
  claim_description: string;
  claim_amount: number;
  claim_date: string;
  claim_receipt?: string;
  claim_status: ClaimStatus;
  claim_response?: string;
  claim_processed_date?: string;
}

export interface Transaction {
  id: string;
  transaction_type: 'Pendapatan' | 'Perbelanjaan';
  transaction_description: string;
  transaction_amount: number;
  transaction_date: string;
}

export interface SystemConfig {
  google_sheets_url: string;
  last_sync_date: string;
  auto_sync: boolean;
}
