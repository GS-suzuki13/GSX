const Return = require("../../models/Return");
const User = require("../../models/User");

exports.getAll = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const filter = { userId }; // agora filter já usa o id
    if (req.query.repasseId) filter.repasseId = req.query.repasseId;

    const returns = await Return.findAll({ where: filter });
    res.json(returns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar rendimentos" });
  }
};

exports.create = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.clientUser);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const newReturn = await Return.create({
      ...req.body,
      userId: user.id,
      repasseId: req.body.repasseId || null,
    });

    await user.update({ data_modificacao: new Date() });

    res.json({ success: true, return: newReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar rendimento" });
  }
};

exports.update = async (req, res) => {
  try {
    const { clientUser, date } = req.params;
    const user = await User.findByPk(clientUser);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const rendimento = await Return.findOne({
      where: { userId: user.id, data: date },
    });
    if (!rendimento)
      return res.status(404).json({ error: "Rendimento não encontrado" });

    await rendimento.update(req.body);
    await user.update({ data_modificacao: new Date() });

    res.json({ success: true, return: rendimento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar rendimento" });
  }
};


exports.remove = async (req, res) => {
  try {
    const { clientUser, date } = req.params;
    const user = await User.findByPk(clientUser);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const rendimento = await Return.findOne({
      where: { userId: user.id, data: date },
    });
    if (!rendimento)
      return res.status(404).json({ error: "Rendimento não encontrado" });

    await rendimento.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir rendimento" });
  }
};
