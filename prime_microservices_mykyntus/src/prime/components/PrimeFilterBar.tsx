import { Search, Filter } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface PrimeFilterBarProps {
  onSearch?: (query: string) => void;
  filters?: {
    name: string;
    options: FilterOption[];
    value: string;
    onChange: (val: string) => void;
  }[];
}

export function PrimeFilterBar({ onSearch, filters }: PrimeFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl shadow-sm border border-default mb-6">
      {onSearch && (
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-default rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-app text-primary placeholder:text-muted"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
      
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center text-muted text-sm font-medium">
            <Filter className="w-4 h-4 mr-1.5" />
            Filters:
          </div>
          {filters.map((filter) => (
            <select
              key={filter.name}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border border-default rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-app text-primary"
            >
              <option value="">All {filter.name}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
