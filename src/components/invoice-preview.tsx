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
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-2xl rounded-2xl overflow-hidden border-2 border-black">
            <header className="p-6 print-bg-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-red-600">MATESHWARI EXPORTS</h1>
                        <p className="text-black">Mfrs. & Wholesale : All types of Jeans & Cotton Pa</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-black mt-1">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
                
                <Separator className="my-4 bg-black print-border-gray" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-black mb-1">Bill To:</p>
                        <p className="font-bold text-lg text-black">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                </div>
            </header>
            <main className="p-0 border-t border-black print-border-gray">
                <Table>
                    <TableHeader className="print-border-gray">
                        <TableRow className="border-b-2 border-black print-border-gray">
                            <TableHead className="w-[80px] text-center font-bold text-black border-x border-black px-2">S.No.</TableHead>
                            <TableHead className="font-bold text-black border-r border-black px-2">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-black border-r border-black px-2">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-black border-r border-black px-2">Rate</TableHead>
                            <TableHead className="text-right font-bold text-black border-r border-black px-2">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => i.description) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="border-b border-black/20 print-border-gray">
                                    <TableCell className="text-center py-2 font-medium text-black border-x border-black px-2">{index + 1}</TableCell>
                                    <TableCell className="font-medium py-2 text-black border-r border-black px-2">{item.description || 'Not specified'}</TableCell>
                                    <TableCell className="text-right py-2 text-black border-r border-black px-2">{item.quantity || 0}</TableCell>
                                    <TableCell className="text-right py-2 text-black border-r border-black px-2">{formatCurrency(item.rate || 0)}</TableCell>
                                    <TableCell className="text-right font-semibold py-2 text-black border-r border-black px-2">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground border-x border-black">
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                                    <p>Your bill items will appear here.</p>
                                    <p className="text-sm">Start by adding items using the form.</p>
                                </TableCell>
                            </TableRow>
                        )}
                         <TableRow className="border-t-2 border-black">
                            <TableCell colSpan={3} className="border-x border-black p-0"></TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">Subtotal</TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">{formatCurrency(subtotal)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell colSpan={3} className="border-x border-black p-0"></TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">CGST ({invoice.cgst || 0}%)</TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">{formatCurrency(cgstAmount)}</TableCell>
                        </TableRow>
                         <TableRow>
                            <TableCell colSpan={3} className="border-x border-black p-0"></TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">SGST ({invoice.sgst || 0}%)</TableCell>
                            <TableCell className="text-right font-bold text-black border-r border-black px-2 py-1">{formatCurrency(sgstAmount)}</TableCell>
                        </TableRow>
                        <TableRow className="border-y-2 border-black bg-muted/50">
                            <TableCell colSpan={3} className="border-x border-black p-0"></TableCell>
                            <TableCell className="text-right font-bold text-xl text-black border-r border-black px-2 py-2">Grand Total</TableCell>
                            <TableCell className="text-right font-bold text-xl text-black border-r border-black px-2 py-2">{formatCurrency(grandTotal)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </main>
            <footer className="p-6 print-bg-white border-t border-black print-border-gray">
                <div className="text-center w-full text-xs">
                    <p className="font-semibold text-black">Thank you for your business!</p>
                    <p className="text-black">MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
