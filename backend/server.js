const app = require("./src/app");

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
