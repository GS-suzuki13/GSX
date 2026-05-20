const { DataTypes } = require("sequelize");
const sequelize = require("../src/database");

const Evento = sequelize.define("Evento", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  data: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM(
      "pendente",
      "concluido",
      "cancelado"
    ),
    defaultValue: "pendente",
  },

  recorrente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Evento;