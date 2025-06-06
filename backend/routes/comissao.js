const express = require("express");
const router = express.Router();
const ComissaoModel = require("../models/ComissaoModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// 🔹 Configuração do armazenamento dos arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, "..", "uploads", "documentos");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Apenas arquivos PDF são permitidos."));
        }
    }
});

/**
 * 🔹 Rota para listar todos os alunos encaminhados para a comissão
 */
router.get("/alunos", async (req, res) => {
    try {
        const gravissimas = await ComissaoModel.listarAlunosComOcorrenciaGravissima();
        const graves = await ComissaoModel.listarAlunosComOcorrenciaGrave();

        res.status(200).json({ graves, gravissimas });
    } catch (error) {
        console.error("Erro ao listar alunos para comissão:", error);
        res.status(500).json({ mensagem: "Erro ao listar alunos para comissão." });
    }
});

/**
 * 🔹 Rota para listar o histórico de um aluno
 */
router.get("/ocorrencias/:alunoId", async (req, res) => {
    const { alunoId } = req.params;

    try {
        const ocorrencias = await ComissaoModel.listarOcorrenciasDoAluno(alunoId);
        res.status(200).json(ocorrencias);
    } catch (error) {
        console.error("Erro ao listar ocorrências do aluno:", error);
        res.status(500).json({ mensagem: "Erro ao listar ocorrências do aluno." });
    }
});

/**
 * 🔹 Rota para salvar feedback + status + (opcionalmente) documento
 */
router.post("/feedback/:ocorrenciaId", upload.single("documento"), async (req, res) => {
    const { ocorrenciaId } = req.params;
    const { feedback, status } = req.body;
    const arquivo = req.file;

    try {
        let caminhoDocumento = null;
        if (arquivo) {
            caminhoDocumento = `/uploads/documentos/${arquivo.filename}`;
        }

        await ComissaoModel.salvarFeedbackComissao(ocorrenciaId, feedback, status, caminhoDocumento);

        res.status(200).json({ mensagem: "Feedback salvo com sucesso." });
    } catch (error) {
        console.error("Erro ao salvar feedback da comissão:", error);
        res.status(500).json({ mensagem: "Erro ao salvar feedback da comissão." });
    }
});

/**
 * 🔹 NOVA ROTA: Retorna dados completos do aluno e suas ocorrências
 */
// 🔹 NOVA ROTA: Retorna dados completos do aluno e suas ocorrências
router.get("/detalhes/:alunoId", async (req, res) => {
    const { alunoId } = req.params;

    try {
        // Dados do aluno
        const [dadosAluno] = await db.execute(
            `SELECT id, nome, curso, turma FROM alunos WHERE id = ?`,
            [alunoId]
        );

        if (dadosAluno.length === 0) {
            return res.status(404).json({ mensagem: "Aluno não encontrado." });
        }

        // Ocorrências do aluno
        const ocorrencias = await ComissaoModel.listarOcorrenciasDoAluno(alunoId);

        res.status(200).json({
            aluno: dadosAluno[0],
            ocorrencias
        });

    } catch (error) {
        console.error("Erro ao obter detalhes do aluno:", error);
        res.status(500).json({ mensagem: "Erro ao obter detalhes do aluno." });
    }
});


module.exports = router;
