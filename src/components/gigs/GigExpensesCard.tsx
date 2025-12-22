import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Receipt, Tag, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GigExpense, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useGigDetails';

const expenseCategories = [
  'Travel',
  'Equipment',
  'Food & Beverages',
  'Accommodation',
  'Marketing',
  'Miscellaneous',
];

interface GigExpensesCardProps {
  gigId: string;
  expenses: GigExpense[];
  isLoading: boolean;
}

export function GigExpensesCard({ gigId, expenses, isLoading }: GigExpensesCardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<GigExpense | null>(null);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense.mutateAsync({
      gig_id: gigId,
      description,
      amount: parseFloat(amount),
      category,
      date,
      paid_by: null,
      receipt_url: null,
    });
    setAddOpen(false);
    resetForm();
  };

  const handleEditClick = (expense: GigExpense) => {
    setSelectedExpense(expense);
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.date);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;
    await updateExpense.mutateAsync({
      id: selectedExpense.id,
      gigId,
      description,
      amount: parseFloat(amount),
      category,
      date,
    });
    setEditOpen(false);
    setSelectedExpense(null);
    resetForm();
  };

  const handleDeleteClick = (expense: GigExpense) => {
    setSelectedExpense(expense);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    await deleteExpense.mutateAsync({ id: selectedExpense.id, gigId });
    setDeleteOpen(false);
    setSelectedExpense(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const ExpenseForm = ({ onSubmit, isPending, submitLabel }: { onSubmit: (e: React.FormEvent) => void; isPending: boolean; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What was the expense for?"
          required
        />
      </div>
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
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <h3 className="font-semibold text-foreground">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-destructive">{formatCurrency(totalExpenses)}</span>
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
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSubmit={handleAddSubmit} isPending={createExpense.isPending} submitLabel="Add Expense" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No expenses recorded</div>
        ) : (
          expenses.map(expense => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {expense.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(expense.date), 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-destructive">
                  -{formatCurrency(expense.amount)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditClick(expense)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(expense)}
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
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setSelectedExpense(null); resetForm(); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSubmit={handleEditSubmit} isPending={updateExpense.isPending} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedExpense?.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExpense.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
