import { useEffect, useMemo, useState } from 'react';
import { CSVHandler } from '../utils/csvHandler';
import { ClientReturn, User } from '../types';
import { groupByMonth } from '../utils/grouping';
import { parseDateLocal } from '../utils/date';

export const useClientReturns = (user: User) => {
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await CSVHandler.getClientReturns(user.user);
        setReturns(
          data.map((r: ClientReturn) => ({
            ...r,
            percentual: +r.percentual,
            variacao: +r.variacao,
            rendimento: +r.rendimento,
          }))
        );
      } catch (err) {
        console.error('[useClientReturns] Erro ao carregar retornos:', err);
      }
    })();
  }, [user]);

  const derived = useMemo(() => {
    const total = returns.reduce((sum, r) => sum + (r.rendimento || 0), 0);
    const last = returns.at(-1);
    const monthsGrouped = groupByMonth(returns).sort((a, b) => a.key.localeCompare(b.key));
    const current = monthsGrouped.find((m) => m.key === selectedMonth) ?? monthsGrouped.at(-1) ?? null;

    const chart = (current?.items.length ? current.items : returns)
      .sort((a, b) => parseDateLocal(a.data).getTime() - parseDateLocal(b.data).getTime())
      .map((r) => ({
        month: parseDateLocal(r.data).toLocaleDateString('pt-BR', { day: '2-digit' }),
        value: r.rendimento,
      }));

    return { total, last, monthsGrouped, current, chart };
  }, [returns, selectedMonth]);

  // Atualiza mês selecionado automaticamente
  useEffect(() => {
    if (!derived.monthsGrouped.length) return setSelectedMonth(null);
    if (!selectedMonth || !derived.monthsGrouped.some((m) => m.key === selectedMonth)) {
      setSelectedMonth(derived.monthsGrouped.at(-1)?.key ?? null);
    }
  }, [derived.monthsGrouped, selectedMonth]);

  return {
    returns,
    selectedMonth,
    setSelectedMonth,
    ...derived
  };
};
