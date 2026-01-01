export type InvoiceItem = {
  id: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  invoiceDate: string;
  customerName: string;
  items: InvoiceItem[];
  cgst: number;
  sgst: number;
};
