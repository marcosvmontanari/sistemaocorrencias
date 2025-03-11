const express = require("express");
const router = express.Router();
const { criarAluno, listarAlunos, buscarAlunoPorId, atualizarAluno, excluirAluno } = require("../models/AlunoModel");
const db = require("../config/db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

// Configuração de multer para upload de arquivos CSV
const upload = multer({ dest: "uploads/" });

// ✅ Rota para cadastrar um aluno
router.post("/cadastrar", async (req, res) => {
    const { nome, turma, curso } = req.body;
    console.log("📥 Requisição recebida no backend:", { nome, turma, curso });

    try {
        await criarAluno(nome, turma, curso);
        res.status(201).json({ mensagem: "Aluno cadastrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao cadastrar aluno:", err);
        res.status(500).json({ erro: "Erro ao cadastrar aluno." });
    }
});

// Rota para listar os alunos com paginação
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Página atual
        const limit = parseInt(req.query.limit) || 10; // Número de alunos por página
        const offset = (page - 1) * limit;

        // Ajuste da consulta para incluir limite e offset
        const [rows] = await db.execute(
            "SELECT id, nome, turma, curso FROM alunos LIMIT ? OFFSET ?",
            [limit, offset]
        );

        // Para retornar o total de alunos, precisamos de outra consulta
        const [total] = await db.execute("SELECT COUNT(*) as total FROM alunos");

        res.json({
            total: total[0].total, // Total de alunos
            alunos: rows, // Alunos da página atual
        });
    } catch (error) {
        console.error("❌ Erro ao listar alunos:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// ✅ Rota para atualizar um aluno
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, turma, curso } = req.body;

        const aluno = await buscarAlunoPorId(id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        await atualizarAluno(id, nome, turma, curso);
        res.status(200).json({ mensagem: "Aluno atualizado com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);
        res.status(500).json({ erro: "Erro ao atualizar aluno" });
    }
});

// ✅ Rota para excluir um aluno
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const aluno = await buscarAlunoPorId(id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        await excluirAluno(id);
        res.status(200).json({ mensagem: "Aluno excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        res.status(500).json({ erro: "Erro ao excluir aluno" });
    }
});

/**
 * 🔸 Rota para upload de CSV para alunos
 * Recebe o arquivo CSV, processa os dados e os insere no banco
 */
router.post("/upload-csv/alunos", upload.single("csvFile"), (req, res) => {
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", () => {
            insertDataBatch(results)
                .then(() => res.json({ message: "Cadastro de alunos em lote realizado com sucesso!" }))
                .catch((error) => res.status(500).json({ error: "Erro ao processar o CSV", details: error }));
        });
});

/**
 * 🔸 Função para inserir os dados no banco de dados em lote
 * Processa as linhas do CSV e insere no banco
 */
async function insertDataBatch(data) {
    for (const row of data) {
        try {
            // Insira cada aluno no banco de dados
            await db.query(
                'INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)',
                [row.nome, row.turma, row.curso]
            );
        } catch (error) {
            console.error('Erro ao inserir aluno:', error);
            throw error;
        }
    }
}


module.exports = router;
