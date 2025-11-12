export const calculateNextRepasseBusinessDays = (dataCadastro: string, repasses: { end: string }[] = []) => {
  const lastRepasseEnd = repasses.length
    ? new Date(repasses[repasses.length - 1].end)
    : new Date(dataCadastro);

  const addBusinessDays = (startDate: Date, diasUteis: number) => {
    const result = new Date(startDate);
    let addedDays = 0;
    while (addedDays < diasUteis) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) addedDays++;
    }
    return result;
  };

  const nextRepasseDate = addBusinessDays(lastRepasseEnd, 30);
  return nextRepasseDate.toLocaleDateString('pt-BR');
};
