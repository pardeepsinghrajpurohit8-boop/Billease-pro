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

const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(0);
  }
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
    const paidByAccount = invoice.paidByAccount || 0;
    const paidInCash = invoice.paidInCash || 0;
    const totalPaid = paidByAccount + paidInCash;
    const dueAmount = grandTotal - totalPaid;

    return { subtotal, cgstAmount, sgstAmount, grandTotal, totalPaid, dueAmount };
  }, [invoice]);

  const { subtotal, cgstAmount, sgstAmount, grandTotal } = calculations;

  const wordify = (num: number): string => {
    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = [
        '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];
    const s = Math.floor(num).toString();
    if (s.length > 9) return 'overflow';
    const nMatch = ('000000000' + s).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nMatch) return '';
    const [, n1, n2, n3, n4, n5] = nMatch;
    
    let str = '';
    str += (n1 != '00') ? (a[Number(n1)] || b[n1[0]] + ' ' + a[n1[1]]).trim() + ' crore ' : '';
    str += (n2 != '00') ? (a[Number(n2)] || b[n2[0]] + ' ' + a[n2[1]]).trim() + ' lakh ' : '';
    str += (n3 != '00') ? (a[Number(n3)] || b[n3[0]] + ' ' + a[n3[1]]).trim() + ' thousand ' : '';
    str += (n4 != '0') ? (a[Number(n4)] || b[n4[0]] + ' ' + a[n4[1]]).trim() + ' hundred ' : '';
    str += (n5 != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n5)] || b[n5[0]] + ' ' + a[n5[1]]).trim() : '';

    const rupees = str.trim().replace(/\s+/g, ' ');
    
    const paisa = Math.round((num - Math.floor(num)) * 100);
    let paisaStr = '';
    if (paisa > 0) {
        paisaStr += ((rupees !== '') ? ' and ' : '') + (a[paisa] || b[Math.floor(paisa / 10)] + ' ' + a[paisa % 10]).trim() + ' paisa';
    }

    return (rupees + paisaStr).toUpperCase() + ' ONLY';
  }
  
  const grandTotalInWords = useMemo(() => wordify(grandTotal), [grandTotal]);

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-end gap-2 mb-4 no-print">
            <Button onClick={onPrint} variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
        </div>
        <Card id="invoice-preview" className="print-bg-white print-text-black w-full shadow-lg rounded-none overflow-hidden border-2 border-black">
            <header className="p-8 print-bg-white border-b-2 border-black">
                <div className="flex justify-between items-start">
                    <div className="text-center w-full">
                        <h1 className="text-2xl font-extrabold tracking-tight text-red-600">MATESHWARI EXPORTS</h1>
                        <p className="text-black text-sm">Mfrs. & Wholesale : All types of Jeans</p>
                    </div>
                </div>
                
                <div className="flex justify-between text-base mt-6">
                     <div>
                        <p className="font-semibold text-black mb-1">Bill To:</p>
                        <p className="font-bold text-lg text-black">{invoice.customerName || 'Customer Name'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-black">Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                </div>
            </header>
            <main>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-black">
                            <TableHead className="w-[60px] text-center font-bold text-black p-2 h-10 border-r-2 border-black">S.No.</TableHead>
                            <TableHead className="text-right font-bold text-black p-2 h-10 border-r-2 border-black">Quantity</TableHead>
                            <TableHead className="text-right font-bold text-black p-2 h-10 border-r-2 border-black">Rate</TableHead>
                            <TableHead className="w-[150px] text-right font-bold text-black p-2 h-10">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.length > 0 && invoice.items.some(i => (i.quantity || 0) > 0 || (i.rate || 0) > 0) ? (
                            invoice.items.map((item, index) => (
                                <TableRow key={item.id} className="border-b-2 border-black">
                                    <TableCell className="text-center p-2 font-medium text-black align-top border-r-2 border-black h-10">{index + 1}</TableCell>
                                    <TableCell className="text-right p-2 text-black align-top border-r-2 border-black">{item.quantity || ''}</TableCell>
                                    <TableCell className="text-right p-2 text-black align-top border-r-2 border-black">{item.rate ? formatCurrency(item.rate) : ''}</TableCell>
                                    <TableCell className="text-right font-semibold p-2 text-black align-top">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow className="border-b-2 border-black">
                                <TableCell colSpan={4} className="text-center p-8 text-muted-foreground h-[240px] align-middle">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="font-semibold">Your bill items will appear here.</p>
                                    <p className="text-sm">Start by adding items using the form.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </main>
            <div className="border-t-2 border-black">
                <div className="grid grid-cols-12">
                    <div className="col-span-7 pr-4 p-4">
                         <div className="space-y-1 text-sm">
                            <p className="font-bold text-base mb-2">Total in words:</p>
                            <p className="text-sm font-semibold leading-relaxed">{grandTotal > 0 ? grandTotalInWords : ''}</p>
                        </div>
                    </div>
                    <div className="col-span-5 p-4 border-l-2 border-black">
                        <div className="space-y-2 text-base">
                            <div className="flex justify-between font-medium">
                                <span>Subtotal</span>
                                <span className="text-right w-[150px]">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CGST ({invoice.cgst || 0}%)</span>
                                <span className="text-right w-[150px]">{formatCurrency(cgstAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SGST ({invoice.sgst || 0}%)</span>
                                <span className="text-right w-[150px]">{formatCurrency(sgstAmount)}</span>
                            </div>
                            <Separator className="my-2 bg-black" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Grand Total</span>
                                <span className="text-right w-[150px]">{formatCurrency(grandTotal)}</span>
                            </div>
                            <Separator className="my-2 bg-gray-400" />
                            <div className="flex justify-between">
                                <span>Paid (Account)</span>
                                <span className="text-right w-[150px]">{formatCurrency(invoice.paidByAccount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Paid (Cash)</span>
                                <span className="text-right w-[150px]">{formatCurrency(invoice.paidInCash)}</span>
                            </div>
                             <div className="flex justify-between font-semibold text-red-600">
                                <span>Due Amount</span>
                                <span className="text-right w-[150px]">{formatCurrency(invoice.dueAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="p-8 print-bg-white border-t-2 border-black">
                <div className="text-center w-full">
                    <p className="font-bold text-base text-black">Thank you for your business!</p>
                    <p className="text-sm text-black mt-1">MATESHWARI EXPORTS</p>
                </div>
            </footer>
        </Card>
    </div>
  );
}
