// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const csvParser = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const multer = require("multer");
const conversor = require("./conversor");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 5000;


// Middlewares
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const USERS_FILE = path.join(DATA_DIR, "users.csv");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

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

    if (!newUser.percentual_contrato) newUser.percentual_contrato = 3;

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

// =================== USERS - EDITAR ===================
app.put("/users/:user", async (req, res) => {
  try {
    const username = req.params.user;
    let users = await readCSV(USERS_FILE);

    const index = users.findIndex((u) => u.user === username);
    if (index === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    users[index] = { ...users[index], ...req.body };

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
    res.json({ success: true, user: users[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar usuário" });
  }
});

// =================== USERS - EXCLUIR ===================
app.delete("/users/:user", async (req, res) => {
  try {
    const username = req.params.user;
    let users = await readCSV(USERS_FILE);

    const filtered = users.filter((u) => u.user !== username);
    if (filtered.length === users.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

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

    await writeCSV(USERS_FILE, headers, filtered);

    const clientFile = path.join(DATA_DIR, `${username}.csv`);
    if (fs.existsSync(clientFile)) {
      fs.unlinkSync(clientFile);
    }

    res.json({ success: true, message: `Usuário '${username}' excluído com sucesso` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
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

// =================== RETURNS - EXCLUIR ===================
app.delete("/returns/:clientUser/:date", async (req, res) => {
  try {
    const { clientUser, date } = req.params;
    const clientFile = ensureClientFile(clientUser);
    const returns = await readCSV(clientFile);

    const filtered = returns.filter((r) => r.data !== date);

    if (filtered.length === returns.length) {
      return res.status(404).json({ error: "Rendimento não encontrado" });
    }

    await writeCSV(
      clientFile,
      [
        { id: "data", title: "data" },
        { id: "percentual", title: "percentual" },
        { id: "variacao", title: "variacao" },
        { id: "rendimento", title: "rendimento" },
      ],
      filtered
    );

    res.json({ success: true, message: `Rendimento de ${date} excluído com sucesso` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir rendimento" });
  }
});

// =================== RETURNS - UPDATE ===================
app.put("/returns/:clientUser/:date", async (req, res) => {
  try {
    const { clientUser, date } = req.params;
    const clientFile = ensureClientFile(clientUser);
    const returns = await readCSV(clientFile);

    const index = returns.findIndex((r) => r.data === date);
    if (index === -1) {
      return res.status(404).json({ error: "Rendimento não encontrado" });
    }

    // Mantemos a data, atualizamos percentual, variação e rendimento
    returns[index] = { ...returns[index], ...req.body, data: date };

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

    res.json({ success: true, return: returns[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar rendimento" });
  }
});

/* =============== IMPORTAR HISTÓRICO =============== */
app.post(
  "/returns/import/:clientUser",
  upload.single("file"),
  async (req, res) => {
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
        return res
          .status(500)
          .json({ error: "Erro no formato do arquivo importado" });
      }

      const existingReturns = await readCSV(clientFile);
      const existingDates = new Set(existingReturns.map((r) => r.data));
      const newReturns = convertedReturns.filter(
        (r) => !existingDates.has(r.data)
      );

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

      fs.readdirSync(UPLOAD_DIR).forEach((file) => {
        fs.unlinkSync(path.join(UPLOAD_DIR, file));
      });

      res.json({ success: true, added: newReturns.length });
    } catch (err) {
      console.error("Erro ao importar histórico:", err);
      res.status(500).json({ error: "Erro ao importar histórico" });
    }
  }
);

/* =============== SERVER =============== */
const host = '0.0.0.0';
app.listen(PORT, host, () => {
  console.log(`Servidor rodando na porta ${PORT} e acessível na rede local`);
});

