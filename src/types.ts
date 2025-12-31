export type Category = "Phone" | "Charger";
export type PaymentMode = "Cash" | "Online" | "EMI";

export interface InvoiceItem {
  category: Category;
  item_name: string;
  quantity: number;
  price: number;
  serial_number?: string;

  imei_1?: string;
  imei_2?: string;

  charger_included?: boolean;
  charger_name?: string;
  charger_serial_number?: string;
}

export interface InvoicePayload {
  customer_name: string;
  customer_address: string;
  items: InvoiceItem[];
  payment_mode: PaymentMode;
}

export interface InvoiceHistoryItem {
  id: string;
  invoice_number: string;
  date: string;
  customer_name: string;
  payment_mode: PaymentMode;
  pdf_url: string;
}
