const express = require('express');
const router = express.Router();
const InfracaoModel = require('../models/InfracaoModel');
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });
const path = require("path");

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
        // Certifique-se de que a função de listagem está retornando as infrações corretamente
        const infracoes = await InfracaoModel.listarInfracoes();
        res.status(200).json(infracoes); // Retorna todas as infrações encontradas
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

// Rota para upload de CSV de Infrações
router.post("/upload-csv", upload.single("csvFile"), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado!" });
    }

    const results = [];
    fs.createReadStream(file.path)
        .pipe(csv()) // csv-parser lida com campos entre aspas
        .on("data", (row) => {
            results.push(row); // Cada linha será um objeto com "descricao" e "tipo"
        })
        .on("end", async () => {
            try {
                // Aqui insira os dados no banco, processando um por um
                await insertDataBatch(results);  // Verificando duplicação antes de inserir

                res.status(200).json({ message: "Arquivo CSV processado com sucesso!" });
            } catch (err) {
                console.error("Erro ao processar o CSV:", err);
                res.status(500).json({ error: "Erro ao processar o arquivo CSV." });
            }
        })
        .on("error", (err) => {
            console.error("Erro ao processar o CSV:", err);
            res.status(500).json({ error: "Erro ao processar o arquivo CSV." });
        });
});



// Função para inserir os dados no banco
async function insertDataBatch(data) {
    for (const row of data) {
        try {
            // Verifica se os campos de descrição e tipo são válidos
            if (!row.descricao || !row.tipo) {
                console.error("❌ Dados inválidos: ", row);
                continue; // Ignora esta linha se os dados forem inválidos
            }

            // Verificar se a infração já existe (baseado em descrição e tipo)
            const existing = await InfracaoModel.listarInfracoes(row.descricao, row.tipo);

            if (existing.length === 0) {
                // Se não houver registros existentes, insere no banco de dados
                await InfracaoModel.criarInfracao(row.descricao, row.tipo);
                console.log("✅ Infração cadastrada: ", row);
            } else {
                console.log("⚠️ Infração já cadastrada: ", row);
            }
        } catch (error) {
            console.error("❌ Erro ao inserir infração:", error);
        }
    }
}



module.exports = router;
