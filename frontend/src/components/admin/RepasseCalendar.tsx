import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';

interface ClientWithRepasse extends User {
  proximoRepasse: string;
}

interface CalendarDay {
  day: number | null;
  clients: ClientWithRepasse[];
}

interface RepasseCalendarProps {
  clientesProximoRepasse: ClientWithRepasse[];
}

export default function RepasseCalendar({
  clientesProximoRepasse
}: RepasseCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const parsePtBrDate = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const today = new Date().getDate();

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();

    const days: CalendarDay[] = [];

    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: null, clients: [] });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const clientsInDay = clientesProximoRepasse.filter((client) => {
        const date = parsePtBrDate(client.proximoRepasse);
        return date.getDate() === day;
      });

      days.push({ day, clients: clientsInDay });
    }

    return days;
  }, [clientesProximoRepasse]);

  const currentMonthName = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <>
      <section className="bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white capitalize">
              Calendário de Repasses — {currentMonthName}
            </h3>
            <p className="text-sm text-gray-400">
              Clique em uma data para ver os detalhes dos repasses
            </p>
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-xl px-4 py-2">
            <p className="text-xs text-gray-400">Total no mês</p>
            <p className="text-xl font-bold text-white">
              {clientesProximoRepasse.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] sm:text-xs text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((item, index) => {
            const hasClients = item.clients.length > 0;
            const isSelected = selectedDay?.day === item.day && hasClients;
            const isToday = item.day === today;

            return (
              <button
                key={index}
                type="button"
                disabled={!item.day || !hasClients}
                onClick={() => setSelectedDay(item)}
                className={`
                  min-h-[76px] sm:min-h-[92px] rounded-xl border p-2 text-left transition relative
                  ${
                    item.day
                      ? 'bg-[#0f172a] border-white/5'
                      : 'bg-transparent border-transparent'
                  }
                  ${hasClients ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5' : 'cursor-default'}
                  ${isSelected ? 'border-indigo-500/60 bg-indigo-500/10' : ''}
                  ${isToday ? 'border-yellow-400/70 bg-yellow-400/5' : ''}
                `}
              >
                {item.day && (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`
                          text-xs sm:text-sm font-semibold
                          ${isToday ? 'text-yellow-300' : 'text-white'}
                        `}
                      >
                        {item.day}
                      </span>

                      {hasClients && (
                        <span className="text-[10px] bg-indigo-600/20 text-indigo-300 rounded-full px-1.5">
                          {item.clients.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {item.clients.slice(0, 2).map((client) => (
                        <div
                          key={client.id || client.user}
                          title={`${client.name} - ${client.proximoRepasse}`}
                          className="bg-indigo-500/10 border border-indigo-500/10 rounded-md px-1.5 py-1"
                        >
                          <p className="text-[10px] sm:text-[11px] text-indigo-200 truncate">
                            {client.name}
                          </p>
                        </div>
                      ))}

                      {item.clients.length > 2 && (
                        <p className="text-[10px] text-gray-500">
                          +{item.clients.length - 2}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {clientesProximoRepasse.length === 0 && (
          <div className="mt-5 bg-[#0f172a] border border-white/5 rounded-xl p-4 text-center text-gray-500 text-sm">
            Nenhum repasse previsto para o mês atual.
          </div>
        )}
      </section>

      {selectedDay && selectedDay.clients.length > 0 && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-[#111827] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h4 className="text-white font-semibold text-lg">
                  Repasses do dia {String(selectedDay.day).padStart(2, '0')}
                </h4>
                <p className="text-sm text-gray-400">
                  {selectedDay.clients.length} compromisso(s) previsto(s)
                </p>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[calc(85vh-88px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDay.clients.map((client) => (
                  <div
                    key={client.id || client.user}
                    className="bg-[#0f172a] border border-white/5 rounded-xl p-4"
                  >
                    <p className="text-white font-medium">{client.name}</p>

                    <p className="text-gray-400 text-sm mt-1">
                      Usuário: {client.user}
                    </p>

                    <p className="text-gray-400 text-sm">
                      Repasse: {client.proximoRepasse}
                    </p>

                    <p className="text-gray-400 text-sm">
                      Aportado:{' '}
                      {Number(client.valor_aportado || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>

                    <p className="text-gray-400 text-sm">
                      Contrato: {client.percentual_contrato || 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}