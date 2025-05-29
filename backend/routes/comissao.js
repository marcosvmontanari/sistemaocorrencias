const express = require("express");
const router = express.Router();
const ComissaoModel = require("../models/ComissaoModel");

/**
 * 🔹 Rota para listar todos os alunos encaminhados para a comissão
 * (aqueles que têm pelo menos uma ocorrência GRAVÍSSIMA)
 */
router.get("/alunos", async (req, res) => {
    try {
        const alunos = await ComissaoModel.listarAlunosEncaminhadosParaComissao();
        res.status(200).json(alunos);
    } catch (error) {
        console.error("Erro ao listar alunos para comissão:", error);
        res.status(500).json({ mensagem: "Erro ao listar alunos para comissão." });
    }
});

/**
 * 🔹 Rota para listar o histórico completo de ocorrências de um aluno específico
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
 * 🔹 Rota para salvar um feedback da comissão disciplinar sobre uma ocorrência
 */
router.put("/feedback/:ocorrenciaId", async (req, res) => {
    const { ocorrenciaId } = req.params;
    const { feedback } = req.body;

    try {
        await ComissaoModel.salvarFeedbackComissao(ocorrenciaId, feedback);
        res.status(200).json({ mensagem: "Feedback salvo com sucesso." });
    } catch (error) {
        console.error("Erro ao salvar feedback da comissão:", error);
        res.status(500).json({ mensagem: "Erro ao salvar feedback da comissão." });
    }
});

module.exports = router;
