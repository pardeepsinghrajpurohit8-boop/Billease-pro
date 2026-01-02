'use client';

import { useEffect, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nanoid } from 'nanoid';

import type { Invoice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  invoice: Invoice;
  onUpdate: (data: Partial<Invoice>) => void;
}

const invoiceSchema = z.object({
  id: z.string(),
  invoiceDate: z.string(),
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(0, 'Quantity must be non-negative'),
      rate: z.number().min(0, 'Rate must be non-negative'),
    })
  ).min(1, 'At least one item is required'),
  cgst: z.number().min(0).max(100),
  sgst: z.number().min(0).max(100),
  paidByAccount: z.number().min(0).optional(),
  paidInCash: z.number().min(0).optional(),
  dueAmount: z.number().min(0).optional(),
});

export function InvoiceForm({ invoice, onUpdate }: InvoiceFormProps) {
  const formMethods = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice,
  });

  const {
    register,
    control,
    reset,
    getValues,
    setValue,
    watch,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  
  useEffect(() => {
    reset(invoice);
  }, [invoice, reset]);

  const handleFormChange = () => {
    const values = getValues();
    onUpdate(values);
  };
  
  const watchedItems = watch('items');
  const watchedTaxes = watch(['cgst', 'sgst']);
  const watchedPayments = watch(['paidByAccount', 'paidInCash']);

  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const cgstAmount = subtotal * ((watchedTaxes[0] || 0) / 100);
    const sgstAmount = subtotal * ((watchedTaxes[1] || 0) / 100);
    const grandTotal = subtotal + cgstAmount + sgstAmount;
    const paidByAccount = watchedPayments[0] || 0;
    const paidInCash = watchedPayments[1] || 0;
    const dueAmount = grandTotal - paidByAccount - paidInCash;
    setValue('dueAmount', Math.max(0, dueAmount));
  }, [watchedItems, watchedTaxes, watchedPayments, setValue]);


  return (
    <FormProvider {...formMethods}>
        <form 
          onChange={handleFormChange}
          onSubmit={(e) => e.preventDefault()} 
          className="space-y-6"
        >
            <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Enter the customer's information and bill date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" {...register('customerName')} placeholder="Enter customer's name" />
                </div>
                <div>
                    <Label htmlFor="invoiceDate">Bill Date</Label>
                    <Input id="invoiceDate" type="date" {...register('invoiceDate')} />
                </div>
                </div>
            </CardContent>
            </Card>
            
            <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Bill Items</CardTitle>
                <CardDescription>Add or remove items from the bill.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start bg-muted/50 p-3 rounded-lg border">
                        <div className='col-span-12'>
                            <Label>Item #{index + 1}</Label>
                        </div>

                        <div className='col-span-6'>
                            <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                            <Input
                                id={`items.${index}.quantity`}
                                type="number"
                                placeholder="Quantity"
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            />
                        </div>
                        
                        <div className='col-span-6'>
                            <Label htmlFor={`items.${index}.rate`}>Rate</Label>
                            <Input
                                id={`items.${index}.rate`}
                                type="number"
                                placeholder="Rate"
                                {...register(`items.${index}.rate`, { valueAsNumber: true })}
                            />
                        </div>

                        <div className='col-span-12 flex justify-end'>
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove item</span>
                            </Button>
                        </div>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ id: nanoid(), quantity: 1, rate: 0 })}
                    className="w-full"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </CardContent>
            </Card>
            
            <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Taxes & Payments</CardTitle>
                <CardDescription>Tax rates and payment details.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cgst">CGST (%)</Label>
                  <Input id="cgst" type="number" {...register('cgst', { valueAsNumber: true })} placeholder="e.g., 2.5" />
                </div>
                <div>
                  <Label htmlFor="sgst">SGST (%)</Label>
                  <Input id="sgst" type="number" {...register('sgst', { valueAsNumber: true })} placeholder="e.g., 2.5" />
                </div>
                 <div>
                    <Label htmlFor="paidByAccount">Paid by Account</Label>
                    <Input id="paidByAccount" type="number" {...register('paidByAccount', { valueAsNumber: true })} placeholder="Amount" />
                </div>
                <div>
                    <Label htmlFor="paidInCash">Paid in Cash</Label>
                    <Input id="paidInCash" type="number" {...register('paidInCash', { valueAsNumber: true })} placeholder="Amount" />
                </div>
                 <div className="col-span-2">
                    <Label htmlFor="dueAmount">Due Amount</Label>
                    <Input id="dueAmount" type="number" {...register('dueAmount', { valueAsNumber: true })} placeholder="Remaining balance" readOnly className="bg-muted/50" />
                </div>
            </CardContent>
            </Card>
        </form>
    </FormProvider>
  );
}
