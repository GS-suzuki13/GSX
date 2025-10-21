const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");          // <-- Model User
const sequelize = require("../src/database");    // <-- Conexão com o banco

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco com sucesso.");

    const users = await User.findAll();
    console.log(`🔍 ${users.length} usuários encontrados.`);

    for (const user of users) {
      const newId = uuidv4();
      user.id = newId;
      await user.save({ hooks: false });
      console.log(`🆔 Novo ID gerado para ${user.user}: ${newId}`);
    }

    console.log("✅ Todos os UUIDs foram atualizados com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao atualizar os IDs:", error);
    process.exit(1);
  }
})();
