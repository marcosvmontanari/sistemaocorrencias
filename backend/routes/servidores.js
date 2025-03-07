const express = require("express");
const router = express.Router();
const db = require("../config/db");
const ServidorModel = require("../models/ServidorModel");
const { criarServidor, buscarServidorPorEmail } = require("../models/ServidorModel");

// Rota para criar um novo servidor (usuário)
router.post("/cadastrar", async (req, res) => {
    const { nome, email, siape, tipo } = req.body;

    // Verifique os dados recebidos claramente no console
    console.log("Dados recebidos:", { nome, email, siape, tipo });

    if (!nome || !email || !siape) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios!" });
    }

    try {
        await criarServidor(nome, email, siape, tipo || 'SERVIDOR');
        res.status(201).json({ mensagem: "Servidor cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar servidor:", error);
        res.status(500).json({ erro: "Erro interno ao cadastrar servidor." });
    }
});


// 🔹 Nenhuma alteração nas demais rotas já existentes
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
        console.error("Erro no login:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// Rota para listar servidores (se já existir, não alterei)
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, nome, email, siape, tipo FROM servidores");
        res.json(rows);
    } catch (error) {
        console.error("Erro ao listar servidores:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

// 🔹 Rota para alterar a senha do servidor
router.put("/:id/alterarSenha", async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    try {
        await ServidorModel.alterarSenha(id, senha);
        res.status(200).json({ mensagem: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        res.status(500).json({ erro: "Erro ao alterar senha." });
    }
});

module.exports = router;
