'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nanoid } from 'nanoid';

import type { Invoice, InvoiceItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle } from 'lucide-react';

interface InvoiceFormProps {
  invoice: Invoice;
  onUpdate: (data: Invoice) => void;
}

const invoiceSchema = z.object({
  id: z.string(),
  invoiceDate: z.string(),
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(0, 'Quantity must be non-negative'),
      rate: z.number().min(0, 'Rate must be non-negative'),
    })
  ).min(1, 'At least one item is required'),
  cgst: z.number().min(0).max(100),
  sgst: z.number().min(0).max(100),
});

export function InvoiceForm({ invoice, onUpdate }: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  
  useEffect(() => {
    reset(invoice);
  }, [invoice, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
        onUpdate(value as Invoice);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);
  
  return (
    <form className="space-y-6">
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
              {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>}
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
                    <div className='col-span-12'>
                        <Label className='sr-only'>Description</Label>
                        <Input
                            placeholder="Item description"
                            {...register(`items.${index}.description`)}
                        />
                        {errors.items?.[index]?.description && <p className="text-destructive text-sm mt-1">{errors.items[index]?.description?.message}</p>}
                    </div>

                    <div className='col-span-6'>
                        <Label className='sr-only'>Quantity</Label>
                        <Input
                            type="number"
                            placeholder="Quantity"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                    </div>
                    
                    <div className='col-span-6'>
                        <Label className='sr-only'>Rate</Label>
                        <Input
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
                onClick={() => append({ id: nanoid(), description: 'PANT', quantity: 1, rate: 0 })}
                className="w-full"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Taxes</CardTitle>
          <CardDescription>Applicable tax rates.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input id="cgst" type="number" {...register('cgst', { valueAsNumber: true })} placeholder="e.g., 9" />
          </div>
          <div>
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input id="sgst" type="number" {...register('sgst', { valueAsNumber: true })} placeholder="e.g., 9" />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
