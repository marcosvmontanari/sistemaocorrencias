// Importação das dependências
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

// Inicializa o servidor
const app = express();

// Middleware para permitir requisições JSON e CORS
app.use(express.json());
app.use(cors());

// Rota inicial de teste
app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Ocorrências está rodando! 🚀");
});

const authRoutes = require("./routes/auth"); // 🔹 Importa as rotas de login
app.use("/auth", authRoutes); // 🔹 Registra a rota corretamente

const servidorRoutes = require("./routes/servidores");
const alunoRoutes = require("./routes/alunos");
const ocorrenciaRoutes = require("./routes/ocorrencias");

app.use("/servidores", servidorRoutes);
app.use("/alunos", alunoRoutes);
app.use("/ocorrencias", ocorrenciaRoutes);

const relatorioRoutes = require("./routes/relatorios");
app.use("/relatorios", relatorioRoutes);

app.use(express.static("frontend"));

const infracoesRoutes = require("./routes/infracoes");
app.use("/infracoes", infracoesRoutes);

// Definir a porta e iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});


