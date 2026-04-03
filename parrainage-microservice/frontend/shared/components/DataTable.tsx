import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'Aucune donnée à afficher.',
}: DataTableProps<T>) {
  return (
    <div className="card-navy overflow-hidden">
      <table className="min-w-full text-xs md:text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-navy-800">
            {columns.map((col) => (
              <th key={col.key as string} className="py-2 px-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-navy-900/80 hover:bg-navy-800/40 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key as string} className="py-2 px-3 text-slate-200">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-xs text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

