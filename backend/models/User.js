const { DataTypes } = require("sequelize");
const sequelize = require("../src/database");

const User = sequelize.define("User", {
  user: { type: DataTypes.STRING, primaryKey: true },
  password: DataTypes.STRING,
  token: DataTypes.STRING,
  name: DataTypes.STRING,
  cpf: DataTypes.STRING,
  email: DataTypes.STRING,
  data_cadastro: DataTypes.STRING,
  valor_aportado: DataTypes.FLOAT,
  percentual_contrato: { type: DataTypes.FLOAT, defaultValue: 3 },
});

module.exports = User;
