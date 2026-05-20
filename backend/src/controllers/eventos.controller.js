const Evento = require("../../models/Evento");

// GET todos os eventos
exports.getAll = async (req, res) => {
  try {
    const eventos = await Evento.findAll({
      order: [["data", "ASC"]],
    });

    res.json(eventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
};

// GET evento por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    res.json(evento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
};

// POST novo evento
exports.create = async (req, res) => {
  try {
    const evento = await Evento.create(req.body);

    res.json({ success: true, evento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
};

// PUT editar evento
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    await evento.update(req.body);

    res.json({ success: true, evento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar evento" });
  }
};

// DELETE evento
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    await evento.destroy();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir evento" });
  }
};