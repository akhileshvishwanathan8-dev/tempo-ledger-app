import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GigStatus } from '@/hooks/useGigs';

interface GigFiltersProps {
  statusFilter: GigStatus | 'all';
  onStatusChange: (status: GigStatus | 'all') => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

export function GigFilters({
  statusFilter,
  onStatusChange,
  sortOrder,
  onSortChange,
}: GigFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as GigStatus | 'all')}>
        <SelectTrigger className="w-[130px] bg-muted/50 border-border h-9">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent className="glass-card border-border">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="lead">Lead</SelectItem>
          <SelectItem value="quoted">Quoted</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 bg-muted/50 hover:bg-muted"
        onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? (
          <>
            <ArrowUp className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Oldest</span>
          </>
        ) : (
          <>
            <ArrowDown className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Newest</span>
          </>
        )}
      </Button>
    </div>
  );
}
