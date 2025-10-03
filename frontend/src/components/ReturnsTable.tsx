import React from 'react';

type Column<T = any> = {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

interface ReturnsTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  dateOffsetDays?: number;
  className?: string;
}

export default function ReturnsTable<T extends Record<string, any>>({
  data,
  columns,
  dateOffsetDays = 0,
  className = '',
}: ReturnsTableProps<T>) {
  // Tenta parsear yyyy-mm-dd (evita shift de timezone)
  const parseDateLocal = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const s = String(dateStr);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatCell = (row: T, col: Column<T>) => {
    const val = (row as any)[col.key];

    // render customizado se fornecido
    if (col.render) return col.render(val, row);

    // números -> formatar como R$ padrão (2 casas)
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // strings: tenta detectar data yyyy-mm-dd
    if (typeof val === 'string') {
      const dt = parseDateLocal(val);
      if (dt) {
        if (dateOffsetDays) dt.setDate(dt.getDate() + dateOffsetDays);
        return dt.toLocaleDateString('pt-BR');
      }
    }

    // fallback
    return String(val ?? '');
  };

  return (
    <div className={`border rounded-lg overflow-y-auto max-h-[400px] ${className}`}>
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-50">
          <tr className="border-b">
            {columns.map((c, i) => (
              <th
                key={i}
                className={`text-left py-3 px-4 font-medium text-gray-700 text-sm`}
                style={{ textAlign: c.align ?? 'left' }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              {columns.map((c, ci) => (
                <td
                  key={ci}
                  className="py-3 px-4 text-gray-900 text-sm"
                  style={{ textAlign: c.align ?? 'left' }}
                >
                  {formatCell(row, c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
