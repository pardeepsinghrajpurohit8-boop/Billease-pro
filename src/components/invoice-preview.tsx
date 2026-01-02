'use client';

import type { Invoice } from '@/lib/types';
import { Card } from '@/components/ui/card';
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
            <header className="p-4 print-bg-white border-b-2 border-black">
                <div className="flex justify-between items-start">
                    <div className="text-center w-full">
                        <h1 className="text-xl font-extrabold tracking-tight text-red-600">MATESHWARI EXPORTS</h1>
                        <p className="text-black text-xs">Mfrs. & Wholesale : All types of Jeans</p>
                    </div>
                </div>
                
                <div className="flex justify-between text-sm mt-4">
                     <div>
                        <p className="font-semibold text-black mb-1">Bill To:</p>
                        <p className="font-bold text-base text-black">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-black">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
            </header>
            <main className="px-4">
                <Table>
                    <TableHeader className="print-border-gray">
                        <TableRow className="border-b-2 border-black print-border-gray">
                            <TableHead className="w-[50px] text-center font-bold text-black p-2 h-8">S.No.</TableHead>
                            <TableHead className="text-right font-bold text-black p-2 h-8">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-black p-2 h-8">Rate</TableHead>
                            <TableHead className="w-[120px] text-right font-bold text-black p-2 h-8">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => i.quantity > 0 || i.rate > 0) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="border-0 border-b border-gray-300 print-border-gray h-8">
                                    <TableCell className="text-center p-2 font-medium text-black align-top">{index + 1}</TableCell>
                                    <TableCell className="text-right p-2 text-black align-top">{item.quantity || ''}</TableCell>
                                    <TableCell className="text-right p-2 text-black align-top">{item.rate ? formatCurrency(item.rate) : ''}</TableCell>
                                    <TableCell className="text-right font-semibold p-2 text-black align-top">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center p-8 text-muted-foreground h-[200px]">
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                                    <p>Your bill items will appear here.</p>
                                    <p className="text-sm">Start by adding items using the form.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </main>

            <div className="px-4 py-2 border-t-2 border-black">
                <div className="grid grid-cols-12">
                    <div className="col-span-7 pr-4 border-r border-black">
                        <p className="font-bold text-sm">Total in words:</p>
                        <p className="text-xs font-semibold">{grandTotal > 0 ? grandTotalInWords : ''}</p>
                    </div>
                    <div className="col-span-5 pl-4">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold">Subtotal</span>
                                <span className="font-semibold text-right w-[120px]">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CGST ({invoice.cgst || 0}%)</span>
                                <span className="text-right w-[120px]">{formatCurrency(cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SGST ({invoice.sgst || 0}%)</span>
                                <span className="text-right w-[120px]">{formatCurrency(sgstAmount)}</span>
                            </div>
                            <Separator className="my-1 bg-black" />
                            <div className="flex justify-between">
                                <span className="font-bold text-lg">Grand Total</span>
                                <span className="font-bold text-lg text-right w-[120px]">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="p-4 print-bg-white border-t-2 border-black">
                <div className="text-center w-full text-xs">
                    <p className="font-semibold text-black">Thank you for your business!</p>
                    <p className="text-black">MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
