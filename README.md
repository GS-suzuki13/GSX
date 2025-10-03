
# 📊 GSX Investimentos – Dashboard de Clientes e Administrador

Bem-vindo ao repositório do **GSX Investimentos**, uma aplicação completa para **gestão de clientes e rendimentos**, com **painel administrativo** e **dashboard do cliente**.  

O sistema foi desenvolvido com foco em **simplicidade, organização e clareza**, permitindo acompanhar aportes, repasses mensais e rendimentos de forma visual e prática.

---

## ✨ Funcionalidades

### 🔑 Autenticação
- Login de **administradores** e **clientes**.
- Usuários cadastrados via `users.csv`.

### 👤 Painel do Cliente
- Visualização do **valor aportado**.
- Acompanhamento de **rendimento bruto vs. líquido**.
- Exibição do **próximo repasse** automaticamente calculado.
- Histórico de rendimentos com gráficos e tabela interativa.
- Diferenciação visual para **valores positivos (verde)** e **negativos (vermelho)**.

### 🛠️ Painel do Administrador
- Cadastro e gerenciamento de clientes.
- Listagem de todos os clientes em **tabela ordenável**.
- Aviso automático de **clientes com repasse no próximo dia**.
- Gráficos e cartões com **visão geral da operação**.

### 📂 Backend
- API em **Node.js + Express**.
- Armazenamento de dados em **arquivos CSV** (sem necessidade de banco de dados).
- Endpoints REST para:
  - `/users` → gestão de clientes.
  - `/returns/:clientUser` → gestão de rendimentos.
  - `/returns/import/:clientUser` → importação de histórico via upload de CSV.
- Conversor automático que **formata e limpa arquivos CSV importados**.
- Garante criação automática de arquivos `user.csv` para cada cliente.
- Limpeza da pasta de uploads após importações.

---

## 🏗️ Estrutura do Projeto

```
.
├── backend/
│   ├── server.js        # Servidor Express
│   ├── conversor.js     # Conversor e normalizador de CSVs
│   ├── data/            # Armazenamento dos CSVs dos usuários
│   └── uploads/         # Arquivos temporários de upload
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis (Cards, Tabelas, Modais, etc.)
│   │   ├── hooks/       # Hooks personalizados (ex: useClientReturns)
│   │   ├── pages/       # Páginas principais (AdminDashboard, ClientDashboard, Login)
│   │   ├── types/       # Definições de tipos TypeScript
│   │   └── utils/       # Utilitários (ex: CSVHandler)
│   └── public/          # Assets estáticos
│
└── README.md
```

---

## ⚙️ Tecnologias Utilizadas

### Backend
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [csv-parser](https://www.npmjs.com/package/csv-parser)
- [csv-writer](https://www.npmjs.com/package/csv-writer)
- [Multer](https://www.npmjs.com/package/multer) (upload de arquivos)

### Frontend
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/) (ícones modernos e leves)
- [Recharts](https://recharts.org/) (gráficos de performance)

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/GS-suzuki13/GSX.git
cd GSX
```

### 2️⃣ Configurar o Backend
```bash
cd backend
npm install
node server.js
```
Servidor rodará por padrão em:  
👉 http://localhost

### 3️⃣ Configurar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend disponível em:  
👉 http://localhost:5173 (ou porta definida pelo Vite)

---

## 📊 Exemplo de Fluxo de Uso
1. Administrador acessa o painel e cadastra um cliente.  
2. Sistema cria automaticamente o arquivo `data/<usuario>.csv`.  
3. Cliente faz login e acessa seu painel, visualizando aportes e rendimentos.  
4. Administrador pode importar um histórico de rendimentos via CSV, que será processado e anexado ao cliente correto.  
5. O sistema notifica o administrador quando há repasse no próximo dia.  

---


## 👨‍💻 Autor
Projeto desenvolvido por **Gustavo Suzuki**  
🔗 [LinkedIn](https://www.linkedin.com/in/gustavo-suzuki-858189163/) | [GitHub](https://github.com/GS-suzuki13)

---

## 📜 Licença
Este projeto é licenciado sob a **MIT License** – fique à vontade para usar, modificar e contribuir.
