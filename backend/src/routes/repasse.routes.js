const express = require("express");
const router = express.Router();
const { fecharRepasse, getRepasses } = require("../controllers/repasse.controller");

// Fechar repasse
router.post("/close/:userId", async (req, res) => {
  try {
    const repasse = await fecharRepasse(req.params.userId);

    // Formata para o front
    const formattedRepasse = {
      id: repasse.id,
      label: `${repasse.numero}º Repasse`,
      start: repasse.dataInicio,
      end: repasse.dataFim,
    };

    res.json(formattedRepasse); // Retorna direto
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Listar repasses
router.get("/:userId", async (req, res) => {
  try {
    const repasses = await getRepasses(req.params.userId);
    res.json({ success: true, repasses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
