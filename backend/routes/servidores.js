const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

// Configuração de multer para upload de arquivos CSV
const upload = multer({ dest: "uploads/" });

// 🔹 Importa o modelo completo e também funções específicas
const ServidorModel = require("../models/ServidorModel");
const { criarServidor, buscarServidorPorEmail } = require("../models/ServidorModel");

/**
 * 🔸 Rota para upload de CSV para servidores
 * Recebe o arquivo CSV, processa os dados e os insere no banco
 */
router.post("/upload-csv", upload.single("csvFile"), (req, res) => {
    // Processamento do CSV
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", () => {
            insertDataBatch(results)  // Função que insere dados no banco
                .then(() => res.json({ message: "Cadastro em lote realizado com sucesso!" }))
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
            const senha = row.senha || row.siape;  // Se não houver senha no CSV, utiliza o SIAPE como senha
            // Verifica se o servidor já existe
            const [servidorExistente] = await db.execute("SELECT * FROM servidores WHERE siape = ?", [row.siape]);
            if (servidorExistente.length === 0) {
                // Insere os dados do servidor no banco
                await db.query(
                    "INSERT INTO servidores (nome, email, siape, tipo, senha) VALUES (?, ?, ?, ?, ?)",
                    [row.nome, row.email, row.siape, row.tipo, senha]
                );
            } else {
                console.log(`Servidor com SIAPE ${row.siape} já cadastrado.`);
            }
        } catch (error) {
            console.error("Erro ao inserir servidor:", error);
            throw error;
        }
    }
}
/**
 * 🔸 Rota para criar um novo servidor
 * Exige: nome, email, siape, tipo (ADMIN/SERVIDOR)
 */
router.post("/cadastrar", async (req, res) => {
    const { nome, email, siape, tipo } = req.body;
    console.log("📥 Dados recebidos para cadastro:", { nome, email, siape, tipo });

    if (!nome || !email || !siape) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
    }

    try {
        await criarServidor(nome, email, siape, tipo || "SERVIDOR");
        res.status(201).json({ mensagem: "Servidor cadastrado com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao cadastrar servidor:", error);
        res.status(500).json({ erro: "Erro interno ao cadastrar servidor." });
    }
});

/**
 * 🔸 Rota para excluir um servidor
 * Exige: id como parâmetro
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [servidor] = await db.execute("SELECT * FROM servidores WHERE id = ?", [id]);
        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        await db.execute("DELETE FROM servidores WHERE id = ?", [id]);
        res.status(200).json({ mensagem: "Servidor excluído com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao excluir servidor:", error);
        res.status(500).json({ erro: "Erro interno ao excluir servidor." });
    }
});

/**
 * 🔸 Rota para editar um servidor
 * Exige: id como parâmetro, e no body: nome, email, siape, tipo
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, email, siape, tipo } = req.body;

    console.log("📥 Dados para atualização:", { id, nome, email, siape, tipo });

    try {
        const [servidor] = await db.execute("SELECT * FROM servidores WHERE id = ?", [id]);
        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        await db.execute(
            "UPDATE servidores SET nome = ?, email = ?, siape = ?, tipo = ? WHERE id = ?",
            [nome, email, siape, tipo, id]
        );

        res.status(200).json({ mensagem: "Servidor atualizado com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao atualizar servidor:", error);
        res.status(500).json({ erro: "Erro interno ao atualizar servidor." });
    }
});

/**
 * 🔸 Rota para login do servidor
 * Exige: email e senha no body
 */
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await db.execute("SELECT * FROM servidores WHERE email = ?", [email]);
        if (usuarios.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const usuario = usuarios[0];

        if (senha !== usuario.senha) {
            return res.status(401).json({ erro: "Senha incorreta." });
        }

        res.json({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                alterou_senha: usuario.alterou_senha
            }
        });
    } catch (error) {
        console.error("❌ Erro no login:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// Rota para listar os servidores com paginação
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual
    const limit = parseInt(req.query.limit) || 10; // Número de servidores por página
    const offset = (page - 1) * limit;

    try {
        // Ajuste da consulta para incluir limite e offset
        const [rows] = await db.execute(
            "SELECT id, nome, email, siape, tipo FROM servidores LIMIT " + db.escape(limit) + " OFFSET " + db.escape(offset)
        );

        // Para retornar o total de servidores, precisamos de outra consulta
        const [total] = await db.execute("SELECT COUNT(*) as total FROM servidores");

        res.json({
            total: total[0].total, // Total de servidores
            servidores: rows, // Servidores da página atual
        });
    } catch (error) {
        console.error("❌ Erro ao listar servidores:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});


/**
 * 🔸 Rota para resetar a senha do servidor para o SIAPE
 * Exige: id como parâmetro
 */
router.put("/:id/resetarSenha", async (req, res) => {
    const { id } = req.params;

    try {
        const [servidor] = await db.execute("SELECT siape FROM servidores WHERE id = ?", [id]);
        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        const novaSenha = servidor[0].siape;

        await db.execute(
            "UPDATE servidores SET senha = ?, alterou_senha = 0 WHERE id = ?",
            [novaSenha, id]
        );

        res.status(200).json({ mensagem: "Senha resetada com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao resetar senha:", error);
        res.status(500).json({ erro: "Erro interno ao resetar senha." });
    }
});

router.put("/:id/alterarSenha", async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).json({ erro: "A nova senha é obrigatória!" });
    }

    try {
        const [servidor] = await db.execute("SELECT * FROM servidores WHERE id = ?", [id]);
        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        await db.execute(
            "UPDATE servidores SET senha = ?, alterou_senha = 1 WHERE id = ?",
            [senha, id]
        );

        res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao alterar senha:", error);
        res.status(500).json({ erro: "Erro interno ao alterar senha." });
    }
});

module.exports = router;