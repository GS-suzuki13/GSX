const fs = require("fs");
const conversor = require("../../services/conversor");

exports.importReturns = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const clientUser = req.params.clientUser;
    const filePath = req.file.path;

    const result = await conversor(filePath, clientUser);

    fs.unlinkSync(filePath);
    res.json(result);
  } catch (err) {
    console.error("Erro ao importar histórico:", err);
    res.status(500).json({ error: "Erro ao importar histórico" });
  }
};
