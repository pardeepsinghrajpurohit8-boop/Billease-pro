'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Invoice } from '@/lib/types';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePlus2, ReceiptText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const getInitialInvoice = (): Invoice => ({
  id: nanoid(),
  customerName: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  items: [{ id: nanoid(), quantity: 1, rate: 0 }],
  cgst: 2.5,
  sgst: 2.5,
});

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice>(getInitialInvoice());
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdate = useCallback((newInvoiceData: Partial<Invoice>) => {
    setInvoice(prev => ({...prev, ...newInvoiceData}));
  }, []);

  const handleNew = () => {
    setInvoice(getInitialInvoice());
    toast({
      title: 'New Bill',
      description: 'New bill form has been created.',
    });
  };

  const handlePrint = () => {
    const input = document.getElementById('invoice-preview');
    if (input) {
      html2canvas(input, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        let finalHeight = height > pdfHeight ? pdfHeight : height;

        pdf.addImage(imgData, 'PNG', 0, 0, width, finalHeight);
        pdf.save('bill.pdf');
      });
    }
  };

  if (!isMounted) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl text-muted-foreground">Loading...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
        <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                           <ReceiptText className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">BillEase Pro</h1>
                    </div>
                    <Button onClick={handleNew} variant="default">
                        <FilePlus2 className="mr-2 h-4 w-4" /> New Bill
                    </Button>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                       <InvoiceForm invoice={invoice} onUpdate={handleUpdate} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <InvoicePreview invoice={invoice} onPrint={handlePrint} />
                </div>
            </div>
        </main>
    </div>
  );
}