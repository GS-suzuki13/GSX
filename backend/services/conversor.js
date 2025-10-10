const fs = require("fs");
const readline = require("readline");
const User = require("../models/User");
const Return = require("../models/Return");

// Funções auxiliares
function parseDateBRtoISO(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, dia, mes, ano] = m;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function cleanString(s = "") {
  return String(s).trim().replace(/^"(.+)"$/, "$1");
}

function splitCSVLine(line) {
  const cols = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cols.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cols.push(cur);
  return cols;
}

function parsePercent(raw) {
  if (!raw) return null;
  const s = cleanString(raw).replace("%", "").trim();
  if (!s) return null;
  const normalized = s.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseMoney(raw) {
  if (!raw) return null;
  const s = cleanString(raw).replace("R$", "").trim();
  if (!s) return null;
  const normalized = s.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

// Conversor principal
async function conversor(filePath, clientUser) {
  const user = await User.findByPk(clientUser);
  if (!user) throw new Error(`Usuário ${clientUser} não encontrado`);

  const results = [];

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", async (rawLine) => {
      try {
        const line = rawLine.replace(/\r/g, "");
        if (!line.trim()) return;
        if (/Dashboard|Historico|Data,Dia,Percentual|Aporte Inicial/i.test(line)) return;
        if (/OUTUBRO|NOVEMBRO|JANEIRO|FEVEREIRO|MARÇO/i.test(line)) return;

        const parts = splitCSVLine(line);
        const dateIdx = parts.findIndex((p) => /\d{2}\/\d{2}\/\d{4}/.test(p));
        if (dateIdx === -1) return;

        const dataISO = parseDateBRtoISO(parts[dateIdx]);
        const percentual = parsePercent(parts[dateIdx + 2] ?? "");
        const variacao = parsePercent(parts[dateIdx + 3] ?? "");
        const rendimento = parseMoney(parts[dateIdx + 4] ?? "");

        // Ignora linha se todos os valores forem nulos ou data inválida
        if (!dataISO || (percentual === null && variacao === null && rendimento === null)) return;

        const row = {
          data: dataISO,
          percentual,
          variacao,
          rendimento,
          userId: user.user,
        };

        results.push(row);

        // Insere no banco apenas se houver algum valor válido
        await Return.create(row);
      } catch (err) {
        // ignora erros de linha para não travar a importação
      }
    });

    rl.on("close", () => resolve({ success: true, message: "Importação concluída", data: results }));
    rl.on("error", reject);
  });
}

module.exports = conversor;
