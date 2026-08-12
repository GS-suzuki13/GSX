const express = require("express");
const cors = require("cors");

const sequelize = require("./database");

const usersRoutes = require("./routes/users.routes");
const importRoutes = require("./routes/import.routes");
const returnsRoutes = require("./routes/returns.routes");
const repasseRoutes = require("./routes/repasse.routes");
const eventosRoutes = require("./routes/eventos.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/users", usersRoutes);
app.use("/returns", returnsRoutes);
app.use("/returns/import", importRoutes);
app.use("/repasse", repasseRoutes);
app.use("/eventos", eventosRoutes);

// Rota simples para verificar se a API está funcionando
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API GSX funcionando",
  });
});

// Inicialização do banco
async function initializeDatabase() {
  try {
    console.log("🔄 Tentando conectar ao MySQL...");

    await sequelize.authenticate();

    console.log("✅ Conexão com MySQL estabelecida!");

    await sequelize.sync({ alter: false });

    console.log("✅ Banco sincronizado!");
  } catch (error) {
    console.error("❌ Falha ao conectar/sincronizar o banco:");

    console.error(error);

    process.exit(1);
  }
}

initializeDatabase();

module.exports = app;