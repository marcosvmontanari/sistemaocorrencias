const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 🔹 Rota para listar todos os cursos distintos
router.get("/", async (req, res) => {
    try {
        const [cursos] = await db.execute(`
            SELECT DISTINCT curso AS nome, curso AS id
            FROM alunos
            WHERE curso IS NOT NULL AND curso != ''
            ORDER BY curso ASC
        `);
        res.json(cursos);
    } catch (error) {
        console.error("❌ Erro ao buscar cursos:", error);
        res.status(500).json({ erro: "Erro ao buscar cursos." });
    }
});

module.exports = router;
