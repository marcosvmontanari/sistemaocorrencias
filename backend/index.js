// Importação das dependências
const express = require("express");
import cors from 'cors';
const cors = require("cors");
import dotenv from 'dotenv';

require("dotenv").config();
const db = require("./config/db");


dotenv.config();


// Inicializa o servidor
const app = express();

// Middleware para permitir requisições JSON e CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://200.17.65.177', // OU: 'http://200.17.65.177'
}));

// Rota inicial de teste
app.get("/", (req, res) => {
    res.send("Servidor do Sistema de Ocorrências está rodando! 🚀");
});

const uploadCSVAlunos = require("./routes/uploadCSVAlunos");  // Arquivo com a rota de upload CSV para alunos
app.use("/upload-csv/alunos", uploadCSVAlunos);  // Defina corretamente a rota para upload de CSV

const authRoutes = require("./routes/auth"); // 🔹 Importa as rotas de login
app.use("/auth", authRoutes); // 🔹 Registra a rota corretamente

const servidorRoutes = require("./routes/servidores");
const alunoRoutes = require("./routes/alunos");
const ocorrenciaRoutes = require("./routes/ocorrencias");

app.use("/servidores", servidorRoutes);
app.use("/alunos", alunoRoutes);
app.use("/ocorrencias", ocorrenciaRoutes);

app.use('/upload-csv', alunoRoutes);

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


