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
        let page = parseInt(req.query.page, 10) || 1; // Página atual
        let limit = parseInt(req.query.limit, 10) || 10; // Número de alunos por página

        // Verifica se os parâmetros são válidos
        console.log("📌 Parâmetros de paginação:", { page, limit });

        // Verificação para garantir que os valores de page e limit são válidos
        if (isNaN(page) || isNaN(limit)) {
            return res.status(400).json({ erro: "Parâmetros inválidos!" });
        }

        const offset = (page - 1) * limit;

        // Debugar valores de offset
        console.log("📌 Calculando offset:", offset);

        // Ajuste da consulta para incluir LIMIT e OFFSET diretamente na string SQL
        const query = `SELECT id, nome, turma, curso FROM alunos LIMIT ${limit} OFFSET ${offset}`;
        const [rows] = await db.execute(query);

        // Debugar valores das linhas
        console.log("📌 Alunos encontrados:", rows);

        const [total] = await db.execute("SELECT COUNT(*) as total FROM alunos");

        res.json({
            total: total[0].total,
            alunos: rows,
        });
    } catch (error) {
        console.error("❌ Erro ao listar alunos:", error);
        res.status(500).json({ erro: "Erro interno ao listar alunos." });
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
// Função para inserir os dados no banco de dados em lote
// Função para inserir os dados no banco de dados em lote
// Função para inserir os dados no banco de dados em lote
async function insertDataBatch(data) {
    let alunosCadastrados = 0;  // Para contar quantos alunos foram realmente cadastrados

    for (const row of data) {
        try {
            // Verifica se o aluno já existe com base no nome, turma e curso
            const [existingAluno] = await db.execute(
                "SELECT id FROM alunos WHERE nome = ? AND turma = ? AND curso = ?",
                [row.nome, row.turma, row.curso]
            );

            // Se já existe um aluno com os mesmos dados, pula a inserção
            if (existingAluno.length > 0) {
                console.log(`Aluno já existe: ${row.nome} - ${row.turma} - ${row.curso}`);
                continue; // Pula este aluno e vai para o próximo
            }

            // Insere o novo aluno
            await db.execute(
                "INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)",
                [row.nome, row.turma, row.curso]
            );

            alunosCadastrados++;  // Conta o aluno inserido
            console.log(`Aluno ${row.nome} cadastrado com sucesso!`);

        } catch (error) {
            console.error("Erro ao inserir aluno:", error);
            continue; // Continua para o próximo aluno mesmo que um erro tenha ocorrido
        }
    }

    // Retorna a quantidade de alunos cadastrados
    return alunosCadastrados;
}


module.exports = router;
