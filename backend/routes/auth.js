const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");


console.log("✅ auth.js carregado com sucesso!");

const SECRET_KEY = "suaChaveSecreta"; // 🔐 Use uma chave segura no .env

// 🔹 Rota de login com JWT (expiração de 30 minutos)
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

        // 🔹 Criar token JWT com expiração de 30 minutos
        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            },
            SECRET_KEY,
            { expiresIn: "30m" } // ⏳ Expira em 30 minutos
        );

        res.json({ token, usuario });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

module.exports = router;
