const express = require("express");
const cors = require("cors");
const sequelize = require("./database"); // MySQL Sequelize
const usersRoutes = require("./routes/users.routes");
const importRoutes = require("./routes/import.routes");
const returnsRoutes = require("./routes/returns.routes");
const repasseRoutes = require("./routes/repasse.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/users", usersRoutes);
app.use("/returns", returnsRoutes);
app.use("/returns/import", importRoutes);
app.use("/repasse", repasseRoutes); // rota para repasses

// Sincroniza models com o DB (use alter:true para atualizar tabelas sem perder dados)
sequelize.authenticate({ alter: true }).then(() => {
  console.log("Banco sincronizado");
});

module.exports = app;
