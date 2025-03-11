const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const db = require("../config/db");

// Configuração de multer para upload de arquivos CSV
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("csvFile"), (req, res) => {
    const results = [];

    // Lê o arquivo CSV e armazena as linhas
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", async () => {
            // Insere os dados do CSV no banco
            for (const row of results) {
                try {
                    await db.query("INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)", [
                        row.nome,
                        row.turma,
                        row.curso
                    ]);
                } catch (error) {
                    console.error("Erro ao inserir aluno:", error);
                }
            }
            res.json({ message: "Cadastro em lote de alunos realizado com sucesso!" });
        })
        .on("error", (err) => {
            res.status(500).json({ error: "Erro ao processar o arquivo CSV", details: err });
        });
});

module.exports = router;
