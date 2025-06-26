const express = require("express");
const router = express.Router();
const GestorModel = require("../models/GestorModel");

/**
 * 🔹 Rota para o GESTOR visualizar os casos encaminhados à COMISSÃO DISCIPLINAR
 */
router.get("/comissao", async (req, res) => {
    try {
        const dados = await GestorModel.listarCasosComissao();
        res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao listar acompanhamento para o gestor:", error);
        res.status(500).json({ mensagem: "Erro ao listar casos para o gestor." });
    }
});

module.exports = router;
