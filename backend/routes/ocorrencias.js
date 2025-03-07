const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const OcorrenciaModel = require("../models/OcorrenciaModel");

// Configuração do armazenamento da imagem
const storage = multer.diskStorage({
    destination: "uploads/", // Pasta onde os arquivos serão salvos
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo para evitar duplicatas
    }
});

const upload = multer({ storage: storage });


// 🔹 Rota para cadastrar uma nova ocorrência
router.post("/cadastrar", upload.single("imagem"), async (req, res) => {
    try {
        const { aluno, infracao, local, descricao, dataHora, servidor } = req.body;
        const imagem = req.file ? req.file.filename : null; // Se houver imagem, salva o nome do arquivo

        await OcorrenciaModel.criarOcorrencia(aluno, infracao, local, descricao, dataHora, servidor, imagem);
        res.status(201).json({ mensagem: "Ocorrência cadastrada com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar ocorrência:", error);
        res.status(500).json({ mensagem: "Erro ao cadastrar ocorrência." });
    }
});

// 🔹 Rota para listar todas as ocorrências
router.get("/", async (req, res) => {
    try {
        const ocorrencias = await OcorrenciaModel.listarOcorrencias();
        res.json(ocorrencias);
    } catch (error) {
        console.error("Erro ao listar ocorrências:", error);
        res.status(500).json({ mensagem: "Erro ao listar ocorrências." });
    }
});


module.exports = router;
