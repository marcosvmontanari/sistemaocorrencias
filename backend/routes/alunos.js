const express = require("express");
const router = express.Router();
const {
    criarAluno,
    listarAlunos,
    buscarAlunoPorId,
    atualizarAluno,
    excluirAluno
} = require("../models/AlunoModel");
const db = require("../config/db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

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

// ✅ Rota para listar alunos com paginação e busca inteligente
// Rota para listar os alunos com paginação e busca
router.get("/", async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        const busca = req.query.busca || "";

        console.log("📌 Parâmetros recebidos:", { page, limit, busca });

        if (isNaN(page) || isNaN(limit)) {
            return res.status(400).json({ erro: "Parâmetros inválidos!" });
        }

        const offset = (page - 1) * limit;

        let query;
        let params = [];

        if (busca && busca.trim() !== "") {
            query = `
                SELECT id, nome, turma, curso
                FROM alunos
                WHERE nome LIKE ? OR turma LIKE ? OR curso LIKE ?
                ORDER BY nome ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
            params = [
                `%${busca}%`,
                `%${busca}%`,
                `%${busca}%`
            ];
        } else {
            query = `
                SELECT id, nome, turma, curso
                FROM alunos
                ORDER BY nome ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
            params = [];
        }

        const [rows] = await db.execute(query, params);

        // Consulta de contagem total
        let totalQuery;
        let totalParams = [];

        if (busca && busca.trim() !== "") {
            totalQuery = `
                SELECT COUNT(*) as total
                FROM alunos
                WHERE nome LIKE ? OR turma LIKE ? OR curso LIKE ?
            `;
            totalParams = [
                `%${busca}%`,
                `%${busca}%`,
                `%${busca}%`
            ];
        } else {
            totalQuery = `
                SELECT COUNT(*) as total
                FROM alunos
            `;
            totalParams = [];
        }

        const [total] = await db.execute(totalQuery, totalParams);

        res.json({
            total: total[0].total,
            alunos: rows
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

// ✅ Rota para upload de CSV para alunos
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

// ✅ Função para inserir alunos em lote (sem alterações)
async function insertDataBatch(data) {
    let alunosCadastrados = 0;

    for (const row of data) {
        try {
            const [existingAluno] = await db.execute(
                "SELECT id FROM alunos WHERE nome = ? AND turma = ? AND curso = ?",
                [row.nome, row.turma, row.curso]
            );

            if (existingAluno.length > 0) {
                console.log(`Aluno já existe: ${row.nome} - ${row.turma} - ${row.curso}`);
                continue;
            }

            await db.execute(
                "INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)",
                [row.nome, row.turma, row.curso]
            );

            alunosCadastrados++;
            console.log(`Aluno ${row.nome} cadastrado com sucesso!`);

        } catch (error) {
            console.error("Erro ao inserir aluno:", error);
            continue;
        }
    }

    return alunosCadastrados;
}

// ✅ Rota para listar todos os alunos (sem paginação)
router.get("/todos", async (req, res) => {
    try {
        const query = `SELECT id, nome, turma, curso FROM alunos ORDER BY nome ASC`;
        const [rows] = await db.execute(query);

        res.json({
            total: rows.length,
            alunos: rows
        });
    } catch (error) {
        console.error("❌ Erro ao listar todos os alunos:", error);
        res.status(500).json({ erro: "Erro interno ao listar todos os alunos." });
    }
});


// ✅ Rota para buscar um aluno por ID (turma e curso inclusos)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const aluno = await buscarAlunoPorId(id);

        if (!aluno) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        res.status(200).json(aluno);

    } catch (error) {
        console.error("❌ Erro ao buscar aluno:", error);
        res.status(500).json({ erro: "Erro interno ao buscar aluno" });
    }
});

module.exports = router;