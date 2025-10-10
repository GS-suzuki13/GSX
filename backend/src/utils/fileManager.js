const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const USERS_FILE = path.join(DATA_DIR, "users.csv");

// Garante que as pastas principais existam
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
}

/**
 * Garante que o arquivo do cliente exista e retorna seu caminho.
 * @param {string} clientUser Nome de usuário do cliente
 * @returns {string} Caminho absoluto do arquivo CSV do cliente
 */
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

/**
 * Remove todos os arquivos temporários de upload.
 */
function clearUploads() {
  if (fs.existsSync(UPLOAD_DIR)) {
    fs.readdirSync(UPLOAD_DIR).forEach((file) => {
      fs.unlinkSync(path.join(UPLOAD_DIR, file));
    });
  }
}

module.exports = {
  DATA_DIR,
  UPLOAD_DIR,
  USERS_FILE,
  ensureDirectories,
  ensureClientFile,
  clearUploads,
};
