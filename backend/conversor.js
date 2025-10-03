// conversor.js
const fs = require("fs");
const readline = require("readline");

function parseDateBRtoISO(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const m = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, dia, mes, ano] = m;
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function cleanString(s = "") {
  return String(s).replace(/(^\s+|\s+$)/g, "").replace(/^"(.+)"$/, "$1");
}

// split CSV line respeitando aspas
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
  if (raw == null) return null;
  const s = cleanString(raw).replace("%", "").trim();
  if (s === "") return null;
  const normalized = s.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseMoney(raw) {
  if (raw == null) return null;
  const s = cleanString(raw).replace("R$", "").trim();
  if (s === "") return null;
  const normalized = s.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

async function conversor(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", (rawLine) => {
      try {
        const line = rawLine.replace(/\r/g, "");
        if (!line.trim()) return;
        if (/Dashboard|Historico|Data,Dia,Percentual|Aporte Inicial/i.test(line)) return;
        if (/OUTUBRO|NOVEMBRO|JANEIRO|FEVEREIRO|MARÇO/i.test(line)) return;

        const parts = splitCSVLine(line);
        const dateIdx = parts.findIndex((p) => /\d{2}\/\d{2}\/\d{4}/.test(p));
        if (dateIdx === -1) return;

        const rawDate = parts[dateIdx];
        const rawPercent = parts[dateIdx + 2] ?? "";
        const rawVariacao = parts[dateIdx + 3] ?? "";
        const rawRendimento = parts[dateIdx + 4] ?? "";

        const dataISO = parseDateBRtoISO(rawDate);
        if (!dataISO) return;

        const percentual = parsePercent(rawPercent);
        const variacao = parsePercent(rawVariacao);
        const rendimento = parseMoney(rawRendimento);

        if (percentual === null && variacao === null && rendimento === null) return;

        results.push({
          data: dataISO,
          percentual,
          variacao,
          rendimento,
        });
      } catch (err) {
        console.error("Erro ao processar linha:", rawLine, err);
      }
    });

    rl.on("close", () => resolve(results));
    rl.on("error", reject);
  });
}

module.exports = conversor;
