const express = require("express");
const router = express.Router();
const { criarAluno, listarAlunos } = require("../models/AlunoModel");

// Rota para cadastrar um aluno
router.post("/cadastrar", async (req, res) => {
    const { nome, turma, curso } = req.body;

    try {
        await criarAluno(nome, turma, curso);
        res.status(201).json({ mensagem: "Aluno cadastrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao cadastrar aluno:", err);
        res.status(500).json({ erro: "Erro ao cadastrar aluno." });
    }
});

// Rota para listar alunos
router.get("/", async (req, res) => {
    try {
        const alunos = await listarAlunos();
        res.json(alunos);
    } catch (erro) {
        console.error("Erro ao buscar alunos:", erro);
        res.status(500).json({ erro: "Erro ao buscar alunos" });
    }
});

module.exports = router;
