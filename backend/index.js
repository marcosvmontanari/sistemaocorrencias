process.env.TZ = 'America/Sao_Paulo';
console.log('🕒 Timezone configurado como:', process.env.TZ);

// Importação das dependências
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const path = require("path"); // 👈 NÃO ESQUECE ESSA LINHA!

// Inicializa o servidor
const app = express();

// Middleware para permitir requisições JSON e CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// ✅ Rota principal devolvendo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/uploads', express.static('uploads'));

// ✅ Rotas de API
const uploadCSVAlunos = require("./routes/uploadCSVAlunos");
const authRoutes = require("./routes/auth");
const servidorRoutes = require("./routes/servidores");
const alunoRoutes = require("./routes/alunos");
const ocorrenciaRoutes = require("./routes/ocorrencias");
const relatorioRoutes = require("./routes/relatorios");
const infracoesRoutes = require("./routes/infracoes");
const cursosRouter = require("./routes/cursos");
const turmasRouter = require("./routes/turmas");
const comissaoRoutes = require("./routes/comissao");
const rotaGestor = require("./routes/gestor");

// ✅ Registro das rotas
app.use("/upload-csv/alunos", uploadCSVAlunos);
app.use("/auth", authRoutes);
app.use("/servidores", servidorRoutes);
app.use("/alunos", alunoRoutes);
app.use("/ocorrencias", ocorrenciaRoutes);
app.use("/relatorios", relatorioRoutes);
app.use("/infracoes", infracoesRoutes);
app.use("/cursos", cursosRouter);
app.use("/turmas", turmasRouter);
app.use("/comissao", comissaoRoutes);
app.use("/gestor", rotaGestor);

// ✅ Definir a porta e iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
