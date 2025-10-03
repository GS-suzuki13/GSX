import { ClientReturn } from '../types';
import { parseDateLocal } from './date';

export const groupByMonth = (returns: ClientReturn[]) => {
  const map = new Map<
    string,
    { key: string; label: string; items: ClientReturn[] }
  >();

  returns.forEach((r) => {
    const dt = parseDateLocal(r.data);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        items: [],
      });
    }
    map.get(key)!.items.push(r);
  });

  return Array.from(map.values()).map((m) => ({
    ...m,
    items: m.items.sort(
      (a, b) => parseDateLocal(a.data).getTime() - parseDateLocal(b.data).getTime()
    ),
  }));
};
