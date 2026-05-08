import React from 'react';
import type { ClientReturn } from '../types';

interface Column {
  key: keyof ClientReturn | string;
  label: string;
  render?: (value: any, row: ClientReturn) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface ReturnsTableProps {
  data: ClientReturn[];
  columns: Column[];
}

export default function ReturnsTable({ data, columns }: ReturnsTableProps) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const formatIfDate = (value: any) => {
    if (typeof value !== 'string') return value;

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }

    return value;
  };

  return (
    <div className="max-h-[320px] overflow-y-auto overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-gray-300">
        <thead className="sticky top-0 bg-[#111827] text-gray-400 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium tracking-wide ${getAlignClass(col.align)}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr
                key={row.id ?? index}
                className="border-t border-white/5 hover:bg-white/5 transition"
              >
                {columns.map((col) => {
                  const rawValue = (row as any)[col.key];
                  const value = formatIfDate(rawValue);

                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${getAlignClass(col.align)}`}
                    >
                      {col.render ? col.render(rawValue, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                Nenhum dado encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}