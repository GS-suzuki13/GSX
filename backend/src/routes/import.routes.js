const express = require("express");
const router = express.Router();
const multer = require("multer");
const { UPLOAD_DIR } = require("../utils/fileManager");
const { importReturns } = require("../controllers/import.controller");

// Configuração do Multer
const upload = multer({ dest: UPLOAD_DIR });

// Rota de importação
router.post("/:id", upload.single("file"), importReturns);

module.exports = router;
