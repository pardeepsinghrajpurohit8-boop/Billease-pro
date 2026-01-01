'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nanoid } from 'nanoid';

import type { Invoice, InvoiceItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from './ui/separator';

interface InvoiceFormProps {
  invoice: Invoice;
  onUpdate: (data: Invoice) => void;
}

const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
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
  
  // Reset form when the invoice prop changes from outside
  useEffect(() => {
    reset(invoice);
  }, [invoice, reset]);

  const watchedValues = watch();
  useEffect(() => {
    // To prevent updating state on initial render before form is fully ready
    if(JSON.stringify(watchedValues) !== JSON.stringify(invoice)) {
        onUpdate(watchedValues as Invoice);
    }
  }, [watchedValues, onUpdate, invoice]);
  
  return (
    <form className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" {...register('customerName')} placeholder="Enter customer's name" />
              {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>}
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" {...register('invoiceDate')} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className='hidden md:grid grid-cols-12 gap-4 items-center mb-2'>
                <Label className="col-span-5">Description</Label>
                <Label className="col-span-2">Qty</Label>
                <Label className="col-span-3">Rate</Label>
                <Label className="col-span-2"></Label>
            </div>
            {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start bg-muted/50 p-2 rounded-lg">
                    <div className='col-span-12 md:col-span-5'>
                        <Label className='md:hidden'>Description</Label>
                        <Input
                            placeholder="Item description"
                            {...register(`items.${index}.description`)}
                            className="bg-background"
                        />
                        {errors.items?.[index]?.description && <p className="text-destructive text-sm mt-1">{errors.items[index]?.description?.message}</p>}
                    </div>

                    <div className='col-span-4 md:col-span-2'>
                        <Label className='md:hidden'>Quantity</Label>
                        <Input
                            type="number"
                            placeholder="1"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="bg-background"
                        />
                    </div>
                    
                    <div className='col-span-8 md:col-span-3'>
                        <Label className='md:hidden'>Rate</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            {...register(`items.${index}.rate`, { valueAsNumber: true })}
                             className="bg-background"
                        />
                    </div>

                    <div className='col-span-12 md:col-span-2 flex justify-end items-center h-10'>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={() => append({ id: nanoid(), description: '', quantity: 1, rate: 0 })}
                className="w-full"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Taxes</CardTitle>
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
