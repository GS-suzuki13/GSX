require("dotenv").config();

const net = require("net");
const { Sequelize } = require("sequelize");

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT || 3306);

console.log("========== DATABASE CONFIG ==========");
console.log("DB_HOST:", host);
console.log("DB_PORT:", port);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "CONFIGURADA" : "NÃO CONFIGURADA");
console.log("=====================================");

const socket = new net.Socket();

socket.setTimeout(10000);

socket.on("connect", () => {
  console.log(`✅ TCP OK: ${host}:${port}`);
  socket.destroy();
});

socket.on("timeout", () => {
  console.error(`❌ TCP TIMEOUT: ${host}:${port}`);
  socket.destroy();
});

socket.on("error", (err) => {
  console.error(`❌ TCP ERROR: ${host}:${port}`);
  console.error("Código:", err.code);
  console.error("Mensagem:", err.message);
});

socket.connect(port, host);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host,
    port,
    dialect: "mysql",
    logging: false,

    define: {
      freezeTableName: true,
      timestamps: false,
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    connectTimeout: 30000,
  }
);

module.exports = sequelize;