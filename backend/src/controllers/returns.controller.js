const Return = require("../../models/Return");
const User = require("../../models/User");

exports.getAll = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.clientUser);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const filter = { userId: user.user };
    if (req.query.repasseId) filter.repasseId = req.query.repasseId; // 🔹 filtro opcional

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

    // Inclui o repasseId, se vier do frontend
    const newReturn = await Return.create({
      ...req.body,
      userId: user.user,
      repasseId: req.body.repasseId || null,
    });

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
      where: { userId: user.user, data: date },
    });
    if (!rendimento)
      return res.status(404).json({ error: "Rendimento não encontrado" });

    await rendimento.update(req.body);
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
      where: { userId: user.user, data: date },
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
