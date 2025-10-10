const { Sequelize } = require("sequelize");

// Conexão com MySQL remoto (Hostinger)
const sequelize = new Sequelize(
  "u538361014_gsx_db",     // database
  "u538361014_gsx_adm",  // username
  "301020@Gsxativos",    // password
  {
    host: "srv791.hstgr.io", // ex: sql123.hostinger.com
    dialect: "mysql",
    logging: false,           // desativa logs SQL
    define: {
      freezeTableName: true,  // evita pluralizar nomes das tabelas
      timestamps: false,      // desativa createdAt/updatedAt
    },
  }
);

sequelize.authenticate()
  .then(() => console.log("Conexão OK com MySQL remoto!"))
  .catch(err => console.error("Erro ao conectar:", err));
  
module.exports = sequelize;
