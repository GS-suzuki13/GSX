interface MonthTabsProps {
  months: { key: string; label: string }[];
  selected: string | null;
  onSelect: (key: string) => void;
}

export default function MonthTabs({ months, selected, onSelect }: MonthTabsProps) {
  if (!months.length) return <div className="text-[#4A5568]">Nenhum rendimento disponível</div>;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {months.map((m) => (
        <button
          key={m.key}
          onClick={() => onSelect(m.key)}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border transition ${
            selected === m.key ? 'bg-[#00A676] text-white' : 'bg-white text-[#1A2433] border-[#E2E8F0]'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
