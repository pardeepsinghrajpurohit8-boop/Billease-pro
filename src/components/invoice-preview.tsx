'use client';

import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';
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
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-2xl rounded-2xl overflow-hidden border-2 border-primary/20">
            <header className="p-8 bg-primary/5 print-bg-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-red-600">MATESHWARI EXPORTS</h1>
                        <p className="text-black">Mfrs. & Wholesale : All types of Jeans & Cotton Pa</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-black mt-1">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
                
                <Separator className="my-6 bg-primary/20 print-border-gray" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-black mb-1">Bill To:</p>
                        <p className="font-bold text-lg text-black">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                </div>
            </header>
            <main className="p-0 border-t border-primary/20 print-border-gray">
                <Table>
                    <TableHeader className="bg-muted/50 print-border-gray">
                        <TableRow className="border-b border-black print-border-gray">
                            <TableHead className="w-[80px] text-center font-bold text-black">S.No.</TableHead>
                            <TableHead className="font-bold text-black">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-black">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-black">Rate</TableHead>
                            <TableHead className="text-right font-bold text-black">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => i.description) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="border-b border-black/20 print-border-gray">
                                    <TableCell className="text-center py-4 font-medium text-black">{index + 1}</TableCell>
                                    <TableCell className="font-medium py-4 text-black">{item.description || 'Not specified'}</TableCell>
                                    <TableCell className="text-right py-4 text-black">{item.quantity || 0}</TableCell>
                                    <TableCell className="text-right py-4 text-black">{formatCurrency(item.rate || 0)}</TableCell>
                                    <TableCell className="text-right font-semibold py-4 text-black">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
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
            <footer className="p-8 bg-primary/5 print-bg-white border-t border-black print-border-gray">
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-3 text-sm">
                      <div className="flex justify-between">
                          <span className="text-black">Subtotal</span>
                          <span className="font-medium text-black">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-black">CGST ({invoice.cgst || 0}%)</span>
                          <span className="font-medium text-black">{formatCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-black">SGST ({invoice.sgst || 0}%)</span>
                          <span className="font-medium text-black">{formatCurrency(sgstAmount)}</span>
                      </div>
                      <Separator className="my-2 bg-black print-border-gray" />
                      <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-black">Grand Total</span>
                          <span className="font-bold text-xl text-black">{formatCurrency(grandTotal)}</span>
                      </div>
                  </div>
                </div>
                <Separator className="my-6 bg-primary/20 print-border-gray" />
                <div className="text-center w-full text-muted-foreground text-xs">
                    <p className="font-semibold text-black">Thank you for your business!</p>
                    <p className="text-black">MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
