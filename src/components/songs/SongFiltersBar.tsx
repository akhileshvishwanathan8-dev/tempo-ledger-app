import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SongFilters } from '@/hooks/useSongs';

interface SongFiltersBarProps {
  filters: SongFilters;
  onFiltersChange: (filters: SongFilters) => void;
  ragas: string[];
  talas: string[];
}

export function SongFiltersBar({ filters, onFiltersChange, ragas, talas }: SongFiltersBarProps) {
  const hasActiveFilters = filters.search || (filters.raga && filters.raga !== 'all') || (filters.tala && filters.tala !== 'all');

  const clearFilters = () => {
    onFiltersChange({ search: '', raga: 'all', tala: 'all' });
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search songs..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-muted/50 border-border"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex gap-2">
        <Select
          value={filters.raga || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, raga: value })}
        >
          <SelectTrigger className="flex-1 bg-muted/50 border-border h-9">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Raga" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border">
            <SelectItem value="all">All Ragas</SelectItem>
            {ragas.map((raga) => (
              <SelectItem key={raga} value={raga}>{raga}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.tala || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, tala: value })}
        >
          <SelectTrigger className="flex-1 bg-muted/50 border-border h-9">
            <SelectValue placeholder="Tala" />
          </SelectTrigger>
          <SelectContent className="glass-card border-border">
            <SelectItem value="all">All Talas</SelectItem>
            {talas.map((tala) => (
              <SelectItem key={tala} value={tala}>{tala}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={clearFilters}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
