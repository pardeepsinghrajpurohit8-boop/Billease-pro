'use client';

import type { Invoice } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Building } from 'lucide-react';
import { useMemo } from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
  onSave: () => void;
  onPrint: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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
            <Button onClick={onPrint} variant="default">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-2xl rounded-xl border-2 border-primary/20">
            <CardHeader className="bg-primary/5 print-bg-white p-8 rounded-t-xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-md">
                           <Building className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight">MATESHWARI EXPORTS</h1>
                            <p className="text-muted-foreground">Mfrs. & Wholesale : All types of Jeans & Cotton Pa</p>
                            <p className="text-muted-foreground text-sm">Jaipur, Rajasthan</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">BILL</p>
                        <p className="text-sm text-muted-foreground">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>
                
                <Separator className="my-4 bg-primary/20" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-muted-foreground mb-1">Bill To:</p>
                        <p className="font-bold text-base text-primary">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30 print-border-gray">
                        <TableRow className="border-b-primary/20">
                            <TableHead className="w-[80px] text-center font-bold text-primary">S.No.</TableHead>
                            <TableHead className="font-bold text-primary">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-primary">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-primary">Rate</TableHead>
                            <TableHead className="text-right font-bold text-primary">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item, index) => (
                            <TableRow key={item.id} className="print-border-gray border-b-muted/50">
                                <TableCell className="text-center py-3 font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium py-3">{item.description || 'Not specified'}</TableCell>
                                <TableCell className="text-right py-3">{item.quantity || 0}</TableCell>
                                <TableCell className="text-right py-3">{formatCurrency(item.rate || 0)}</TableCell>
                                <TableCell className="text-right font-semibold py-3">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {invoice.items.length === 0 || (invoice.items.length === 1 && !invoice.items[0].description) ? (
                    <div className="text-center p-12 text-muted-foreground">
                        <p>Add items to the bill to see them here.</p>
                    </div>
                ) : null}
            </CardContent>
            <CardFooter className="p-8 bg-primary/5 print-bg-white flex-col items-stretch rounded-b-xl">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm space-y-2 text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">CGST ({invoice.cgst || 0}%)</span>
                          <span className="font-medium">{formatCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">SGST ({invoice.sgst || 0}%)</span>
                          <span className="font-medium">{formatCurrency(sgstAmount)}</span>
                      </div>
                      <Separator className="my-2 bg-primary/20" />
                      <div className="flex justify-between items-center text-xl">
                          <span className="font-bold text-primary">Grand Total</span>
                          <span className="font-bold text-accent">{formatCurrency(grandTotal)}</span>
                      </div>
                  </div>
                </div>
                <Separator className="my-6 bg-primary/20" />
                <div className="text-center w-full text-muted-foreground text-xs">
                    <p>Thank you for your business!</p>
                    <p className="font-semibold">MATESHWARI EXPORTS</p>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
