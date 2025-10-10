const fs = require("fs");
const csvParser = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

/**
 * Lê um arquivo CSV e retorna um array de objetos.
 * @param {string} filePath Caminho do arquivo CSV
 * @returns {Promise<Array>}
 */
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

/**
 * Escreve registros em um arquivo CSV, sobrescrevendo o existente.
 * @param {string} filePath Caminho do arquivo
 * @param {Array} header Cabeçalhos [{ id, title }]
 * @param {Array} records Registros a salvar
 * @returns {Promise<void>}
 */
function writeCSV(filePath, header, records) {
  const writer = createObjectCsvWriter({ path: filePath, header });
  return writer.writeRecords(records);
}

module.exports = { readCSV, writeCSV };
