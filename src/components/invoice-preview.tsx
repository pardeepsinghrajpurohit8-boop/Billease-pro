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

  const wordify = (num: number): string => {
    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];
    const s = num.toString();
    if (s.length > 9) return 'overflow';
    const n = ('000000000' + s).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' crore ' : '';
    str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' lakh ' : '';
    str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' thousand ' : '';
    str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' hundred ' : '';
    str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().replace(/\s+/g, ' ').toUpperCase() + ' ONLY';
  }
  
  const grandTotalInWords = useMemo(() => wordify(Math.floor(grandTotal)), [grandTotal]);

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-end gap-2 mb-4 no-print">
            <Button onClick={onPrint} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-lg rounded-none overflow-hidden border">
            <header className="p-6 print-bg-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-red-600">MATESHWARI EXPORTS</h1>
                        <p className="text-black text-xs">Mfrs. & Wholesale : All types of Jeans & Cotton PANT</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-black text-xl">BILL</p>
                        <p className="text-sm text-black mt-1">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
                
                <Separator className="my-4 bg-gray-300 print-border-gray" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-black mb-1">Bill To:</p>
                        <p className="font-bold text-lg text-black">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                </div>
            </header>
            <main className="px-6 py-2 border-t border-gray-300 print-border-gray">
                <Table>
                    <TableHeader className="print-border-gray">
                        <TableRow className="border-b-2 border-black print-border-gray">
                            <TableHead className="w-[50px] text-center font-bold text-black px-2">S.No.</TableHead>
                            <TableHead className="font-bold text-black px-2">Item Description</TableHead>
                            <TableHead className="text-right font-bold text-black px-2">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-black px-2">Rate</TableHead>
                            <TableHead className="text-right font-bold text-black px-2">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => i.description) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="border-0">
                                    <TableCell className="text-center py-1 font-medium text-black px-2">{index + 1}</TableCell>
                                    <TableCell className="font-medium py-1 text-black px-2">{item.description || 'Not specified'}</TableCell>
                                    <TableCell className="text-right py-1 text-black px-2">{item.quantity || 0}</TableCell>
                                    <TableCell className="text-right py-1 text-black px-2">{formatCurrency(item.rate || 0)}</TableCell>
                                    <TableCell className="text-right font-semibold py-1 text-black px-2">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground border-x-0">
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                                    <p>Your bill items will appear here.</p>
                                    <p className="text-sm">Start by adding items using the form.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </main>

            <div className="px-6 py-2 border-t-2 border-black">
                <div className="grid grid-cols-12">
                    <div className="col-span-7 pr-4">
                        <p className="font-bold text-sm">Total in words:</p>
                        <p className="text-xs font-semibold">{grandTotalInWords}</p>
                    </div>
                    <div className="col-span-5">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="font-bold">Subtotal</span>
                                <span className="font-bold">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CGST ({invoice.cgst || 0}%)</span>
                                <span>{formatCurrency(cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SGST ({invoice.sgst || 0}%)</span>
                                <span>{formatCurrency(sgstAmount)}</span>
                            </div>
                            <Separator className="my-1 bg-black" />
                            <div className="flex justify-between">
                                <span className="font-bold text-lg">Grand Total</span>
                                <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="p-4 print-bg-white border-t border-gray-300 print-border-gray">
                <div className="text-center w-full text-xs">
                    <p className="font-semibold text-black">Thank you for your business!</p>
                    <p className="text-black">MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
