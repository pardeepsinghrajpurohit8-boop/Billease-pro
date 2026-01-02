'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Invoice } from '@/lib/types';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePlus2, ReceiptText, Save, List } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getInitialInvoice = (): Invoice => ({
  id: nanoid(),
  customerName: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  items: [{ id: nanoid(), quantity: 1, rate: 0 }],
  cgst: 2.5,
  sgst: 2.5,
  paidByAccount: 0,
  paidInCash: 0,
  dueAmount: 0,
});

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice>(getInitialInvoice());
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (error) {
        console.error("Failed to save invoices to localStorage", error);
      }
    }
  }, [invoices, isMounted]);

  const handleUpdate = useCallback((newInvoiceData: Partial<Invoice>) => {
    setSelectedInvoice(prev => ({...prev, ...newInvoiceData}));
  }, []);

  const handleNew = () => {
    setSelectedInvoice(getInitialInvoice());
    toast({
      title: 'New Bill',
      description: 'New bill form has been created.',
    });
  };
  
  const handleSave = () => {
    const existingIndex = invoices.findIndex(inv => inv.id === selectedInvoice.id);
    if (existingIndex !== -1) {
      const updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = selectedInvoice;
      setInvoices(updatedInvoices);
       toast({
        title: 'Bill Updated',
        description: 'The bill has been successfully updated.',
      });
    } else {
      setInvoices(prev => [...prev, selectedInvoice]);
       toast({
        title: 'Bill Saved',
        description: 'The bill has been successfully saved.',
      });
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
    }
  }

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
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSave} variant="secondary">
                          <Save className="mr-2 h-4 w-4" /> Save Bill
                      </Button>
                      <Button onClick={handleNew} variant="default">
                          <FilePlus2 className="mr-2 h-4 w-4" /> New Bill
                      </Button>
                    </div>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                       <InvoiceForm invoice={selectedInvoice} onUpdate={handleUpdate} />
                       
                       <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Saved Bills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {invoices.length > 0 ? (
                            <ul className="space-y-2">
                              {invoices.map(inv => (
                                <li key={inv.id}>
                                  <Button 
                                    variant={selectedInvoice.id === inv.id ? "secondary" : "ghost"} 
                                    className="w-full justify-start"
                                    onClick={() => handleSelectInvoice(inv.id)}
                                  >
                                    {inv.customerName || 'Untitled Bill'} - {new Date(inv.invoiceDate).toLocaleDateString('en-GB')}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No saved bills yet.</p>
                          )}
                        </CardContent>
                       </Card>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <InvoicePreview invoice={selectedInvoice} onPrint={handlePrint} />
                </div>
            </div>
        </main>
    </div>
  );
}
