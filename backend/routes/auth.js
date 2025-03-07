const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ auth.js carregado com sucesso!");

// 🔹 Rota de login
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

        // Retorna alterou_senha para saber se precisa trocar no frontend
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

module.exports = router;
