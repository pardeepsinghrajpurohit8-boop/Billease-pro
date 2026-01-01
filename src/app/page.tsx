'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Invoice } from '@/lib/types';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePlus2, BookOpen, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const getInitialInvoice = (): Invoice => ({
  id: nanoid(),
  invoiceNumber: String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
  customerName: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  items: [{ id: nanoid(), description: '', quantity: 1, rate: 0 }],
  cgst: 9,
  sgst: 9,
});

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice>(getInitialInvoice());
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedInvoices = localStorage.getItem('savedInvoices');
      if (storedInvoices) {
        setSavedInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error('Failed to load invoices from localStorage', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load saved invoices.',
      });
    }
  }, [toast]);

  const handleUpdate = useCallback((newInvoiceData: Invoice) => {
    setInvoice(newInvoiceData);
  }, []);

  const handleSave = () => {
    const existingIndex = savedInvoices.findIndex((inv) => inv.id === invoice.id);
    let newSavedInvoices;
    if (existingIndex !== -1) {
      newSavedInvoices = [...savedInvoices];
      newSavedInvoices[existingIndex] = invoice;
    } else {
      newSavedInvoices = [...savedInvoices, invoice];
    }
    setSavedInvoices(newSavedInvoices);
    localStorage.setItem('savedInvoices', JSON.stringify(newSavedInvoices));
    toast({
      title: 'Invoice Saved',
      description: `Invoice for ${invoice.customerName || 'N/A'} has been saved.`,
      className: 'bg-accent text-accent-foreground',
    });
  };

  const handleNew = () => {
    setInvoice(getInitialInvoice());
    toast({
      title: 'New Invoice',
      description: 'New invoice form has been created.',
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
        pdf.save('invoice.pdf');
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
            <FilePlus2 className="mr-2 h-4 w-4" /> New Invoice
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
