export interface Customer {
  id: number;
  business_id?: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export interface CustomerCreateInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface Order {
  id: number;
  business_id?: number;
  customer_id: number;
  order_code?: string;
  description: string;
  amount: number;
  status: string;
  order_date: string;
  due_date: string;
  customer?: Customer;
}

export interface OrderCreateInput {
  customer_id: number;
  description: string;
  amount: number;
  status?: string;
  order_date: string;
  due_date: string;
}

export interface Measurement {
  id: number;
  business_id?: number;
  customer_id: number;
  garment_type: string;
  gender?: string | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  shoulder?: number | null;
  sleeve?: number | null;
  inseam?: number | null;
  neck?: number | null;
  bust?: number | null;
  hip?: number | null;
  armhole?: number | null;
  sleeve_length?: number | null;
  sleeve_round?: number | null;
  length?: number | null;
  neck_depth?: number | null;
  neck_width?: number | null;
  collar?: number | null;
  thigh?: number | null;
  knee?: number | null;
  ankle?: number | null;
  bottom_width?: number | null;
  rise?: number | null;
  flare?: number | null;
  upper_chest?: number | null;
  under_bust?: number | null;
  calf?: number | null;
  image?: string | null;
  notes?: string | null;
  created_at?: string;
  [key: string]: any;
}

export type InvoiceStatus = "pending" | "paid" | "unpaid";
export type PaymentType = "cash" | "online";

export interface PaymentRecord {
  id: number;
  invoice_id: number;
  customer_id: number;
  order_id?: number;
  amount: number;
  payment_type: string;
  reference?: string;
  notes?: string;
  payment_date: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  business_id?: number;
  invoice_number?: string;
  customer_id: number;
  order_id: number;
  amount: number;
  status: InvoiceStatus;
  payment_type: PaymentType;
  notes?: string;
  created_at?: string;
  paid_amount?: number;
  remaining_amount?: number;
  payments?: PaymentRecord[];
}

export interface InventoryItem {
  id: number;
  business_id?: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  price: number;
  supplier?: string | null;
  created_at?: string | null;
}

export interface BusinessProfile {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  gst_number?: string | null;
  logo_url?: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  business_id?: number | null;
  is_admin?: boolean;
  is_superadmin?: boolean;
}
