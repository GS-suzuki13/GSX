// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const csvParser = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const multer = require("multer");
const conversor = require("./conversor");

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Diretórios e arquivos
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const USERS_FILE = path.join(DATA_DIR, "users.csv");

// Criação de pastas, se necessário
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Upload config
const upload = multer({ dest: UPLOAD_DIR });

/* =============== HELPERS =============== */
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return resolve([]);
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function writeCSV(filePath, header, records) {
  const writer = createObjectCsvWriter({ path: filePath, header });
  return writer.writeRecords(records);
}

function ensureClientFile(clientUser) {
  // garante que o nome do arquivo termine em .csv
  let filename = clientUser.endsWith(".csv") ? clientUser : `${clientUser}.csv`;
  const clientFile = path.join(DATA_DIR, filename);

  if (!fs.existsSync(clientFile)) {
    fs.writeFileSync(
      clientFile,
      "data,percentual,variacao,rendimento\n",
      "utf8"
    );
  }
  return clientFile;
}

/* =============== USERS =============== */
app.get("/users", async (req, res) => {
  try {
    const users = await readCSV(USERS_FILE);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ler users.csv" });
  }
});

app.post("/users", async (req, res) => {
  try {
    let users = await readCSV(USERS_FILE);
    const newUser = { ...req.body };

    if (!newUser.percentual_contrato) {
      newUser.percentual_contrato = 3;
    }

    users.push(newUser);

    const headers = [
      { id: "user", title: "user" },
      { id: "password", title: "password" },
      { id: "token", title: "token" },
      { id: "name", title: "name" },
      { id: "cpf", title: "cpf" },
      { id: "email", title: "email" },
      { id: "data_cadastro", title: "data_cadastro" },
      { id: "valor_aportado", title: "valor_aportado" },
      { id: "percentual_contrato", title: "percentual_contrato" },
    ];

    await writeCSV(USERS_FILE, headers, users);
    ensureClientFile(newUser.user);

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar usuário" });
  }
});

// POST login
app.post("/login", async (req, res) => {
  const { user, password } = req.body;
  try {
    const users = await readCSV(USERS_FILE);
    const found = users.find((u) => u.user === user && u.password === password);
    if (found) {
      res.json(found);
    } else {
      res.status(401).json({ error: "Usuário ou senha inválidos" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login" });
  }
});

/* =============== RETURNS =============== */
app.get("/returns/:clientUser", async (req, res) => {
  try {
    const clientFile = ensureClientFile(req.params.clientUser);
    const returns = await readCSV(clientFile);
    res.json(returns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ler returns CSV" });
  }
});

app.post("/returns/:clientUser", async (req, res) => {
  try {
    const clientFile = ensureClientFile(req.params.clientUser);
    const returns = await readCSV(clientFile);

    const newReturn = req.body;
    returns.push(newReturn);

    await writeCSV(
      clientFile,
      [
        { id: "data", title: "data" },
        { id: "percentual", title: "percentual" },
        { id: "variacao", title: "variacao" },
        { id: "rendimento", title: "rendimento" },
      ],
      returns
    );

    res.json({ success: true, return: newReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar rendimento" });
  }
});

/* =============== IMPORTAR HISTÓRICO =============== */
app.post("/returns/import/:clientUser", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const clientUser = req.params.clientUser;
    const clientFile = ensureClientFile(clientUser);

    const filePath = req.file.path;
    const convertedReturns = await conversor(filePath);

    if (!Array.isArray(convertedReturns)) {
      console.error("Conversor retornou inválido:", convertedReturns);
      return res.status(500).json({ error: "Erro no formato do arquivo importado" });
    }

    const existingReturns = await readCSV(clientFile);
    const existingDates = new Set(existingReturns.map(r => r.data));
    const newReturns = convertedReturns.filter(r => !existingDates.has(r.data));

    const allReturns = [...existingReturns, ...newReturns];

    await writeCSV(
      clientFile,
      [
        { id: "data", title: "data" },
        { id: "percentual", title: "percentual" },
        { id: "variacao", title: "variacao" },
        { id: "rendimento", title: "rendimento" },
      ],
      allReturns
    );

    fs.readdirSync(UPLOAD_DIR).forEach(file => {
      fs.unlinkSync(path.join(UPLOAD_DIR, file));
    });

    res.json({ success: true, added: newReturns.length });
  } catch (err) {
    console.error("Erro ao importar histórico:", err);
    res.status(500).json({ error: "Erro ao importar histórico" });
  }
});

/* =============== SERVER =============== */
app.listen(PORT, " localhost", () => {
  console.log(`Servidor rodando em http:// localhost:${PORT}`);
});
