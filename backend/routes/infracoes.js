const express = require('express');
const router = express.Router();
const InfracaoModel = require('../models/InfracaoModel');

// Rota para cadastrar infração (apenas descricao e tipo)
router.post("/cadastrar", async (req, res) => {
    const { descricao, tipo } = req.body;

    if (!descricao || !tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    try {
        await InfracaoModel.criarInfracao(descricao, tipo);
        res.status(201).json({ mensagem: "Infração cadastrada com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar infração:", error);
        res.status(500).json({ mensagem: "Erro ao cadastrar infração." });
    }
});

// Rota para listar todas as infrações
router.get("/", async (req, res) => {
    try {
        const infracoes = await InfracaoModel.listarInfracoes();
        res.status(200).json(infracoes);
    } catch (error) {
        console.error("Erro ao listar infrações:", error);
        res.status(500).json({ mensagem: "Erro ao listar infrações." });
    }
});

// Rota para atualizar infração (apenas descricao e tipo)
router.put("/:id", async (req, res) => {
    const { descricao, tipo } = req.body;
    const { id } = req.params;

    if (!descricao || !tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }

    try {
        await InfracaoModel.atualizarInfracao(id, descricao, tipo);
        res.status(200).json({ mensagem: "Infração atualizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar infração:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar infração." });
    }
});

// Rota para excluir infração
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await InfracaoModel.excluirInfracao(id);
        res.status(200).json({ mensagem: "Infração excluída com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir infração:", error);
        res.status(500).json({ mensagem: "Erro ao excluir infração." });
    }
});

module.exports = router;
