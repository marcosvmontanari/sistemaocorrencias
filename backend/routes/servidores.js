const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const bcrypt = require("bcrypt"); // ✅ Importação do bcrypt

const upload = multer({ dest: "uploads/" });

const ServidorModel = require("../models/ServidorModel");
const { criarServidor, buscarServidorPorEmail } = require("../models/ServidorModel");

// 🔸 Upload de CSV de servidores
router.post("/upload-csv", upload.single("csvFile"), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
            results.push(row);
        })
        .on("end", () => {
            insertDataBatch(results)
                .then(() => res.json({ message: "Cadastro em lote realizado com sucesso!" }))
                .catch((error) => res.status(500).json({ error: "Erro ao processar o CSV", details: error }));
        });
});

// 🔸 Inserção em lote de servidores com senha criptografada
async function insertDataBatch(data) {
    for (const row of data) {
        try {
            const senhaPura = row.senha || row.siape;
            const senhaCriptografada = await bcrypt.hash(senhaPura, 10);

            const [servidorExistente] = await db.execute("SELECT * FROM servidores WHERE siape = ?", [row.siape]);

            if (servidorExistente.length === 0) {
                await db.query(
                    "INSERT INTO servidores (nome, email, siape, tipo, senha) VALUES (?, ?, ?, ?, ?)",
                    [row.nome, row.email, row.siape, row.tipo, senhaCriptografada]
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

// 🔸 Cadastro de novo servidor
router.post("/cadastrar", async (req, res) => {
    const { nome, email, siape, tipo } = req.body;
    console.log("📥 Dados recebidos para cadastro:", { nome, email, siape, tipo });

    if (!nome || !email || !siape) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
    }

    try {
        const senhaPadrao = siape;
        const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

        await db.execute(
            "INSERT INTO servidores (nome, email, siape, tipo, senha) VALUES (?, ?, ?, ?, ?)",
            [nome, email, siape, tipo || "SERVIDOR", senhaCriptografada]
        );

        res.status(201).json({ mensagem: "Servidor cadastrado com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao cadastrar servidor:", error);
        res.status(500).json({ erro: "Erro interno ao cadastrar servidor." });
    }
});

// 🔸 Excluir servidor
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

// 🔸 Editar servidor
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

// 🔸 Login do servidor com comparação da senha criptografada
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await db.execute("SELECT * FROM servidores WHERE email = ?", [email]);

        if (usuarios.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
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

// 🔸 Listar servidores com paginação e busca
router.get("/", async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        const busca = req.query.busca || "";

        const offset = (page - 1) * limit;

        let query, totalQuery, params = [], totalParams = [];

        if (busca.trim() !== "") {
            query = `
                SELECT id, nome, email, siape, tipo
                FROM servidores
                WHERE nome LIKE ? OR email LIKE ? OR siape LIKE ?
                ORDER BY nome ASC
                LIMIT ${limit} OFFSET ${offset}
            `;
            params = [`%${busca}%`, `%${busca}%`, `%${busca}%`];

            totalQuery = `
                SELECT COUNT(*) as total
                FROM servidores
                WHERE nome LIKE ? OR email LIKE ? OR siape LIKE ?
            `;
            totalParams = [`%${busca}%`, `%${busca}%`, `%${busca}%`];
        } else {
            query = `
                SELECT id, nome, email, siape, tipo
                FROM servidores
                ORDER BY nome ASC
                LIMIT ${limit} OFFSET ${offset}
            `;

            totalQuery = `SELECT COUNT(*) as total FROM servidores`;
        }

        const [rows] = await db.execute(query, params);
        const [total] = await db.execute(totalQuery, totalParams);

        res.json({ total: total[0].total, servidores: rows });
    } catch (error) {
        console.error("❌ Erro ao listar servidores:", error);
        res.status(500).json({ erro: "Erro interno ao listar servidores." });
    }
});

// 🔸 Resetar senha para SIAPE (criptografado)
router.put("/:id/resetarSenha", async (req, res) => {
    const { id } = req.params;

    try {
        const [servidor] = await db.execute("SELECT siape FROM servidores WHERE id = ?", [id]);

        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        const novaSenhaCriptografada = await bcrypt.hash(servidor[0].siape, 10);

        await db.execute(
            "UPDATE servidores SET senha = ?, alterou_senha = 0 WHERE id = ?",
            [novaSenhaCriptografada, id]
        );

        res.status(200).json({ mensagem: "Senha resetada com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao resetar senha:", error);
        res.status(500).json({ erro: "Erro interno ao resetar senha." });
    }
});

// 🔸 Alterar senha manualmente (criptografado)
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

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await db.execute(
            "UPDATE servidores SET senha = ?, alterou_senha = 1 WHERE id = ?",
            [senhaCriptografada, id]
        );

        res.status(200).json({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao alterar senha:", error);
        res.status(500).json({ erro: "Erro interno ao alterar senha." });
    }
});

// 🔸 Buscar servidor por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [servidor] = await db.execute("SELECT * FROM servidores WHERE id = ?", [id]);

        if (servidor.length === 0) {
            return res.status(404).json({ erro: "Servidor não encontrado." });
        }

        res.json(servidor[0]);
    } catch (error) {
        console.error("❌ Erro ao buscar servidor:", error);
        res.status(500).json({ erro: "Erro ao buscar servidor." });
    }
});

module.exports = router;
