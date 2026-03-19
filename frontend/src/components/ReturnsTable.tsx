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

  // formata automaticamente datas tipo 2026-02-27
  const formatIfDate = (value: any) => {
    if (typeof value !== 'string') return value;

    // detecta padrão yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }

    return value;
  };

  return (
    <div className="max-h-[280px] overflow-y-auto overflow-x-auto rounded-lg">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr className="border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-semibold ${getAlignClass(col.align)}`}
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
                className="border-b last:border-0 hover:bg-gray-100 transition"
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
                className="px-4 py-6 text-center text-gray-500"
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