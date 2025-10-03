export const parseDateLocal = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match
    ? new Date(+match[1], +match[2] - 1, +match[3])
    : new Date(dateStr);
};
