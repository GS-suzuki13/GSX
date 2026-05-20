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

app.use("/users", usersRoutes);
app.use("/returns", returnsRoutes);
app.use("/returns/import", importRoutes);
app.use("/repasse", repasseRoutes);
app.use("/eventos", eventosRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log("Banco sincronizado");
});

module.exports = app;