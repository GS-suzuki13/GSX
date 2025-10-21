const { Op } = require("sequelize");
const User = require("../../models/User");
const Return = require("../../models/Return");
const Repasse = require("../../models/Repasse");

// Adiciona dias úteis
function addDiasUteis(startDate, diasUteis) {
  const result = new Date(startDate);
  let addedDays = 0;
  while (addedDays < diasUteis) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) addedDays++; // Ignora sábados e domingos
  }
  return result;
}

// Fecha um repasse
async function fecharRepasse(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Usuário não encontrado");

  const ultimoRepasse = await Repasse.findOne({
    where: { userId },
    order: [["numero", "DESC"]],
  });

  const dataInicio = ultimoRepasse
    ? new Date(ultimoRepasse.dataFim)
    : new Date(user.data_cadastro);

  if (isNaN(dataInicio.getTime())) {
    throw new Error(
      `Data inválida para dataInicio: ${
        ultimoRepasse ? ultimoRepasse.dataFim : user.data_cadastro
      }`
    );
  }

  const dataFim = addDiasUteis(dataInicio, 30);
  const dataInicioStr = dataInicio.toISOString().split("T")[0];
  const dataFimStr = dataFim.toISOString().split("T")[0];

  const repasse = await Repasse.create({
    userId,
    numero: ultimoRepasse ? ultimoRepasse.numero + 1 : 1,
    dataInicio: dataInicioStr,
    dataFim: dataFimStr,
  });

  await Return.update(
    { repasseId: repasse.id },
    {
      where: {
        userId,
        data: {
          [Op.between]: [dataInicioStr, dataFimStr],
        },
      },
    }
  );
  
  await user.update({ data_modificacao: new Date() });

  return repasse;
}


// Lista todos os repasses de um usuário
async function getRepasses(userId) {
  const repasses = await Repasse.findAll({
    where: { userId },
    order: [["numero", "ASC"]],
  });

  return repasses.map(r => ({
    id: r.id,
    label: `${r.numero}º Repasse`,
    start: r.dataInicio,
    end: r.dataFim,
  }));
}

module.exports = { fecharRepasse, getRepasses };
