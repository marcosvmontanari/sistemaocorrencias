const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Importa o modelo completo e também funções específicas
const ServidorModel = require("../models/ServidorModel");
const { criarServidor, buscarServidorPorEmail } = require("../models/ServidorModel");

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
        await criarServidor(nome, email, siape, tipo || 'SERVIDOR');
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

/**
 * 🔸 Rota para listar todos os servidores
 */
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, nome, email, siape, tipo FROM servidores");
        res.json(rows);
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

/**
 * 🔸 Rota para alterar a senha do servidor
 * Exige: id como parâmetro, senha no body
 */
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

/**
 * 🔸 Rota protegida de teste para validar autenticação
 */
router.get("/dados", authMiddleware, async (req, res) => {
    res.json({
        mensagem: "Você está autenticado!",
        usuario: req.usuario
    });
});

module.exports = router;
