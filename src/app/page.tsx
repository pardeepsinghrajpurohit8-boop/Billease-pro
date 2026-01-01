'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Invoice } from '@/lib/types';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePlus2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScrollArea } from '@/components/ui/scroll-area';

const getInitialInvoice = (): Invoice => ({
  id: nanoid(),
  customerName: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  items: [{ id: nanoid(), description: '', quantity: 1, rate: 0 }],
  cgst: 9,
  sgst: 9,
});

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice>(getInitialInvoice());
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdate = useCallback((newInvoiceData: Invoice) => {
    setInvoice(newInvoiceData);
  }, []);

  const handleSave = () => {
    // This functionality is currently not used but can be expanded later.
    toast({
      title: 'Action Triggered',
      description: 'Save functionality can be implemented here.',
      className: 'bg-accent text-accent-foreground',
    });
  };

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
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        let finalHeight = height;
        if (height > pdfHeight) {
          finalHeight = pdfHeight;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, width, finalHeight);
        pdf.save('bill.pdf');
      });
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <main className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <FilePlus2 className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">BillEase Pro</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNew} variant="outline">
            <FilePlus2 className="mr-2 h-4 w-4" /> New Bill
          </Button>
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-5 overflow-hidden">
        <ScrollArea className="lg:col-span-2 md:col-span-1 h-full">
          <InvoiceForm invoice={invoice} onUpdate={handleUpdate} />
        </ScrollArea>

        <div className="lg:col-span-3 md:col-span-1 bg-background p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
          <InvoicePreview invoice={invoice} onSave={handleSave} onPrint={handlePrint} />
        </div>
      </div>
    </main>
  );
}
