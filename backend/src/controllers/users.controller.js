const User = require("../../models/User");

// GET todos os usuários
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

// POST novo usuário
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

// PUT editar usuário
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await User.findByPk(id);
    if (!found) return res.status(404).json({ error: "Usuário não encontrado" });

    await found.update({
      ...req.body,
      data_modificacao: new Date(),
    });
    
    res.json({ success: true, user: found });
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar usuário" });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await User.findByPk(id);
    if (!found) return res.status(404).json({ error: "Usuário não encontrado" });

    await found.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { user, password } = req.body;

    // busca pelo username
    const found = await User.findOne({ where: { user } });
    if (!found || found.password !== password) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = found.token; 

    res.json({
      id: found.id,
      user: found.user,
      name: found.name,
      cpf: found.cpf,
      email: found.email,
      data_cadastro: found.data_cadastro,
      data_modificacao: found.data_modificacao,
      valor_aportado: found.valor_aportado,
      percentual_contrato: found.percentual_contrato,
      token, // aqui é só uma string normal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login" });
  }
};
