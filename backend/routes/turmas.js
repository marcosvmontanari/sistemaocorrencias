const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 🔹 Rota para listar todas as turmas distintas
router.get("/", async (req, res) => {
    try {
        const [turmas] = await db.execute(`
            SELECT DISTINCT turma AS nome, turma AS id
            FROM alunos
            WHERE turma IS NOT NULL AND turma != ''
            ORDER BY turma ASC
        `);
        res.json(turmas);
    } catch (error) {
        console.error("❌ Erro ao buscar turmas:", error);
        res.status(500).json({ erro: "Erro ao buscar turmas." });
    }
});

module.exports = router;
