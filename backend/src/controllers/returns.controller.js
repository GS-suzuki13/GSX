const Return = require("../../models/Return");
const User = require("../../models/User");

exports.getAll = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const where = {
      userId,
    };

    if (req.query.repasseId) {
      where.repasseId = req.query.repasseId;
    }

    const returns = await Return.findAll({
      where,
      order: [["data", "ASC"]],
    });

    return res.json(returns);

  } catch (err) {
    console.error("GET RETURNS");
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.create = async (req, res) => {

  try {

    const { id: userId } = req.params;

    const {
      data,
      percentual,
      variacao,
      rendimento,
      repasseId
    } = req.body;

    if (!data || percentual == null || variacao == null || rendimento == null) {
      return res.status(400).json({
        error: "Dados obrigatórios não informados.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const novo = await Return.create({
      data,
      percentual,
      variacao,
      rendimento,
      repasseId: repasseId || null,
      userId,
    });

    await user.update({
      data_modificacao: new Date(),
    });

    return res.status(201).json({
      success: true,
      return: novo,
    });

  } catch (err) {

    console.error("CREATE RETURN");
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });

  }

};

exports.update = async (req, res) => {

  try {

    const { id: userId, date } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const rendimento = await Return.findOne({
      where: {
        userId,
        data: date,
      },
    });

    if (!rendimento) {
      return res.status(404).json({
        error: "Rendimento não encontrado",
      });
    }

    const {
      percentual,
      variacao,
      rendimento: valor,
      repasseId,
    } = req.body;

    await rendimento.update({
      percentual,
      variacao,
      rendimento: valor,
      repasseId,
    });

    await user.update({
      data_modificacao: new Date(),
    });

    return res.json({
      success: true,
      return: rendimento,
    });

  } catch (err) {

    console.error("UPDATE RETURN");
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });

  }

};

exports.remove = async (req, res) => {

  try {

    const { id: userId, date } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    const rendimento = await Return.findOne({
      where: {
        userId,
        data: date,
      },
    });

    if (!rendimento) {
      return res.status(404).json({
        error: "Rendimento não encontrado",
      });
    }

    await rendimento.destroy();

    await user.update({
      data_modificacao: new Date(),
    });

    return res.json({
      success: true,
    });

  } catch (err) {

    console.error("DELETE RETURN");
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });

  }

};