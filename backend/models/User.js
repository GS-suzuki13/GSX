const { DataTypes } = require("sequelize");
const sequelize = require("../src/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.ENUM("adm", "user"),
    allowNull: false,
    defaultValue: "user",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  data_cadastro: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  data_modificacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  valor_aportado: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  percentual_contrato: {
    type: DataTypes.FLOAT,
    defaultValue: 3,
  },
});

module.exports = User;
