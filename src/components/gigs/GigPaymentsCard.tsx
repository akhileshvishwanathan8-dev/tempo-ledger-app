import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Banknote, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GigPayment, useCreatePayment, useUpdatePayment, useDeletePayment } from '@/hooks/useGigDetails';

const paymentModes = ['Bank Transfer', 'Cash', 'Cheque', 'UPI', 'Card'];

interface GigPaymentsCardProps {
  gigId: string;
  payments: GigPayment[];
  isLoading: boolean;
}

export function GigPaymentsCard({ gigId, payments, isLoading }: GigPaymentsCardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<GigPayment | null>(null);

  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [tdsDeducted, setTdsDeducted] = useState('');
  const [notes, setNotes] = useState('');

  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTds = payments.reduce((sum, p) => sum + (p.tds_deducted || 0), 0);

  const resetForm = () => {
    setAmount('');
    setPaymentMode('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setReferenceNumber('');
    setTdsDeducted('');
    setNotes('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment.mutateAsync({
      gig_id: gigId,
      amount: parseFloat(amount),
      payment_mode: paymentMode || null,
      payment_date: paymentDate,
      reference_number: referenceNumber || null,
      tds_deducted: tdsDeducted ? parseFloat(tdsDeducted) : null,
      notes: notes || null,
    });
    setAddOpen(false);
    resetForm();
  };

  const handleEditClick = (payment: GigPayment) => {
    setSelectedPayment(payment);
    setAmount(String(payment.amount));
    setPaymentMode(payment.payment_mode || '');
    setPaymentDate(payment.payment_date);
    setReferenceNumber(payment.reference_number || '');
    setTdsDeducted(payment.tds_deducted ? String(payment.tds_deducted) : '');
    setNotes(payment.notes || '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    await updatePayment.mutateAsync({
      id: selectedPayment.id,
      gigId,
      amount: parseFloat(amount),
      payment_mode: paymentMode || null,
      payment_date: paymentDate,
      reference_number: referenceNumber || null,
      tds_deducted: tdsDeducted ? parseFloat(tdsDeducted) : null,
      notes: notes || null,
    });
    setEditOpen(false);
    setSelectedPayment(null);
    resetForm();
  };

  const handleDeleteClick = (payment: GigPayment) => {
    setSelectedPayment(payment);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;
    await deletePayment.mutateAsync({ id: selectedPayment.id, gigId });
    setDeleteOpen(false);
    setSelectedPayment(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const PaymentForm = ({ onSubmit, isPending, submitLabel }: { onSubmit: (e: React.FormEvent) => void; isPending: boolean; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tds">TDS Deducted (₹)</Label>
          <Input
            id="tds"
            type="number"
            value={tdsDeducted}
            onChange={e => setTdsDeducted(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Date</Label>
          <Input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMode">Mode</Label>
          <Select value={paymentMode} onValueChange={setPaymentMode}>
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {paymentModes.map(mode => (
                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reference">Reference Number</Label>
        <Input
          id="reference"
          value={referenceNumber}
          onChange={e => setReferenceNumber(e.target.value)}
          placeholder="Transaction ID, cheque number, etc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Payments Received</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-green-400">{formatCurrency(totalPayments)}</span>
            {totalTds > 0 && (
              <span className="ml-2 text-orange-400">(TDS: {formatCurrency(totalTds)})</span>
            )}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm onSubmit={handleAddSubmit} isPending={createPayment.isPending} submitLabel="Record Payment" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No payments recorded</div>
        ) : (
          payments.map(payment => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  {payment.payment_mode === 'Cash' ? (
                    <Banknote className="w-4 h-4 text-green-400" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.payment_mode || 'Payment'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(payment.payment_date), 'MMM d, yyyy')}
                    </span>
                    {payment.reference_number && (
                      <span className="text-xs text-muted-foreground">
                        Ref: {payment.reference_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-semibold text-green-400">
                    +{formatCurrency(payment.amount)}
                  </span>
                  {payment.tds_deducted && payment.tds_deducted > 0 && (
                    <p className="text-xs text-orange-400">TDS: {formatCurrency(payment.tds_deducted)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditClick(payment)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(payment)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setSelectedPayment(null); resetForm(); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm onSubmit={handleEditSubmit} isPending={updatePayment.isPending} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {formatCurrency(selectedPayment?.amount || 0)} payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePayment.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
