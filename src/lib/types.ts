export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  items: InvoiceItem[];
  cgst: number;
  sgst: number;
};
