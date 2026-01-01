'use client';

import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Building, FileText } from 'lucide-react';
import { useMemo } from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
  onPrint: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export function InvoicePreview({ invoice, onPrint }: InvoicePreviewProps) {
  const calculations = useMemo(() => {
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const cgstAmount = subtotal * ((invoice.cgst || 0) / 100);
    const sgstAmount = subtotal * ((invoice.sgst || 0) / 100);
    const grandTotal = subtotal + cgstAmount + sgstAmount;
    return { subtotal, cgstAmount, sgstAmount, grandTotal };
  }, [invoice]);

  const { subtotal, cgstAmount, sgstAmount, grandTotal } = calculations;

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-end gap-2 mb-4 no-print">
            <Button onClick={onPrint} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-2xl rounded-2xl overflow-hidden border-2 border-primary/10">
            <header className="p-8 bg-primary/5 print-bg-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-destructive">MATESHWARI EXPORTS</h1>
                        <p className="text-muted-foreground">Mfrs. & Wholesale : All types of Jeans & Cotton Pa</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-primary/80">BILL</p>
                        <p className="text-sm text-muted-foreground mt-1">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
                
                <Separator className="my-6 bg-primary/10" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-muted-foreground mb-1">Bill To:</p>
                        <p className="font-bold text-lg text-primary">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                </div>
            </header>
            <main className="p-0">
                <Table>
                    <TableHeader className="bg-muted/50 print-border-gray">
                        <TableRow className="border-b-primary/10">
                            <TableHead className="w-[80px] text-center font-bold text-primary/90">S.No.</TableHead>
                            <TableHead className="font-bold text-primary/90">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-primary/90">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-primary/90">Rate</TableHead>
                            <TableHead className="text-right font-bold text-primary/90">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => i.description) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="print-border-gray border-b-muted/50">
                                    <TableCell className="text-center py-4 font-medium print-text-black">{index + 1}</TableCell>
                                    <TableCell className="font-medium py-4">{item.description || 'Not specified'}</TableCell>
                                    <TableCell className="text-right py-4 print-text-black">{item.quantity || 0}</TableCell>
                                    <TableCell className="text-right py-4 print-text-black">{formatCurrency(item.rate || 0)}</TableCell>
                                    <TableCell className="text-right font-semibold py-4 print-text-black">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-12 text-muted-foreground">
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                                    <p>Your bill items will appear here.</p>
                                    <p className="text-sm">Start by adding items using the form.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </main>
            <footer className="p-8 bg-primary/5 print-bg-white">
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-3 text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium print-text-black">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">CGST ({invoice.cgst || 0}%)</span>
                          <span className="font-medium print-text-black">{formatCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">SGST ({invoice.sgst || 0}%)</span>
                          <span className="font-medium print-text-black">{formatCurrency(sgstAmount)}</span>
                      </div>
                      <Separator className="my-2 bg-primary/10" />
                      <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-primary">Grand Total</span>
                          <span className="font-bold text-xl print-text-black">{formatCurrency(grandTotal)}</span>
                      </div>
                  </div>
                </div>
                <Separator className="my-6 bg-primary/10" />
                <div className="text-center w-full text-muted-foreground text-xs">
                    <p className="font-semibold">Thank you for your business!</p>
                    <p>MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
