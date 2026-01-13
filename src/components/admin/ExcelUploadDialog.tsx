import { useState, useCallback, useMemo } from 'react';
import { read, utils, WorkSheet } from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Trash2,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ParsedRow {
  data: Record<string, any>;
  errors: string[];
  rowIndex: number;
}

interface ExcelUploadDialogProps {
  onImport: (data: any[], type: 'gigs' | 'expenses' | 'payments') => Promise<void>;
  trigger?: React.ReactNode;
}

type ImportType = 'gigs' | 'expenses' | 'payments';

const EXPECTED_COLUMNS: Record<ImportType, { required: string[]; optional: string[] }> = {
  gigs: {
    required: ['title', 'date', 'venue', 'city'],
    optional: ['start_time', 'end_time', 'quoted_amount', 'confirmed_amount', 'status', 'organizer_name', 'organizer_phone', 'organizer_email', 'notes']
  },
  expenses: {
    required: ['description', 'amount', 'category'],
    optional: ['date', 'gig_title', 'notes']
  },
  payments: {
    required: ['gig_title', 'amount'],
    optional: ['payment_date', 'payment_mode', 'reference_number', 'tds_deducted', 'notes']
  }
};

export function ExcelUploadDialog({ onImport, trigger }: ExcelUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [importType, setImportType] = useState<ImportType>('gigs');
  const [isImporting, setIsImporting] = useState(false);

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setColumns([]);
  };

  const validateRow = (row: Record<string, any>, type: ImportType): string[] => {
    const errors: string[] = [];
    const { required } = EXPECTED_COLUMNS[type];
    
    // Check required fields
    for (const field of required) {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Type-specific validation
    if (type === 'gigs' || type === 'expenses' || type === 'payments') {
      if (row.amount && isNaN(Number(row.amount))) {
        errors.push('Amount must be a number');
      }
      if (row.quoted_amount && isNaN(Number(row.quoted_amount))) {
        errors.push('Quoted amount must be a number');
      }
      if (row.confirmed_amount && isNaN(Number(row.confirmed_amount))) {
        errors.push('Confirmed amount must be a number');
      }
    }

    if (type === 'gigs' && row.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$|^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(String(row.date)) && isNaN(Date.parse(String(row.date)))) {
        errors.push('Invalid date format (use YYYY-MM-DD)');
      }
    }

    return errors;
  };

  const parseExcel = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet: WorkSheet = workbook.Sheets[sheetName];
      
      // Get raw data with headers
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) {
        toast.error('File must have headers and at least one data row');
        return;
      }

      // First row is headers
      const headers = jsonData[0].map((h: any) => 
        String(h).toLowerCase().trim().replace(/\s+/g, '_')
      );
      setColumns(headers);

      // Parse data rows
      const rows: ParsedRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const rowData = jsonData[i];
        if (!rowData || rowData.every((cell: any) => !cell)) continue; // Skip empty rows
        
        const data: Record<string, any> = {};
        headers.forEach((header: string, idx: number) => {
          data[header] = rowData[idx] ?? '';
        });

        const errors = validateRow(data, importType);
        rows.push({ data, errors, rowIndex: i + 1 });
      }

      setParsedData(rows);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Failed to parse Excel file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error('Please upload an Excel file (.xlsx, .xls) or CSV');
        return;
      }
      setFile(selectedFile);
      parseExcel(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error('Please upload an Excel file (.xlsx, .xls) or CSV');
        return;
      }
      setFile(droppedFile);
      parseExcel(droppedFile);
    }
  }, [importType]);

  const validRows = useMemo(() => 
    parsedData.filter(row => row.errors.length === 0),
    [parsedData]
  );

  const errorRows = useMemo(() => 
    parsedData.filter(row => row.errors.length > 0),
    [parsedData]
  );

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsImporting(true);
    setStep('importing');

    try {
      const dataToImport = validRows.map(row => row.data);
      await onImport(dataToImport, importType);
      toast.success(`Successfully imported ${validRows.length} ${importType}`);
      setOpen(false);
      resetState();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Data from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import gigs, expenses, or payments
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            {/* Import Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What are you importing?</label>
              <Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gigs">Gigs</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Columns */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Expected columns for {importType}:</p>
              <div className="flex flex-wrap gap-1">
                {EXPECTED_COLUMNS[importType].required.map(col => (
                  <Badge key={col} variant="default" className="text-xs">
                    {col} *
                  </Badge>
                ))}
                {EXPECTED_COLUMNS[importType].optional.map(col => (
                  <Badge key={col} variant="secondary" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('excel-input')?.click()}
            >
              <input
                id="excel-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground mb-1">
                Drop your Excel file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 min-h-0 space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">{validRows.length} valid</span>
              </div>
              {errorRows.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{errorRows.length} with errors</span>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={resetState} className="ml-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Preview Table */}
            <ScrollArea className="flex-1 border border-border rounded-lg max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-12">Status</TableHead>
                    {columns.slice(0, 5).map(col => (
                      <TableHead key={col} className="capitalize">
                        {col.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    {columns.length > 5 && (
                      <TableHead className="text-muted-foreground">
                        +{columns.length - 5} more
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, idx) => (
                    <TableRow 
                      key={idx}
                      className={cn(
                        row.errors.length > 0 && "bg-red-500/5"
                      )}
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {row.rowIndex}
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <div className="group relative">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <div className="absolute left-6 top-0 hidden group-hover:block z-10 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg">
                              <p className="text-xs text-red-400 font-medium mb-1">Errors:</p>
                              <ul className="text-xs text-muted-foreground space-y-0.5">
                                {row.errors.map((err, i) => (
                                  <li key={i}>• {err}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        )}
                      </TableCell>
                      {columns.slice(0, 5).map(col => (
                        <TableCell key={col} className="text-sm max-w-[150px] truncate">
                          {String(row.data[col] || '-')}
                        </TableCell>
                      ))}
                      {columns.length > 5 && (
                        <TableCell className="text-xs text-muted-foreground">
                          ...
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={resetState}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={validRows.length === 0}
                className="gap-2"
              >
                Import {validRows.length} rows
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Importing data...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your file
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}