const jwt = require("jsonwebtoken");
const SECRET_KEY = "suaChaveSecreta"; // Use a mesma chave do auth.js

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.usuario = decoded; // Adiciona os dados do usuário à requisição
        next();
    } catch (error) {
        return res.status(403).json({ erro: "Sessão expirada. Faça login novamente." });
    }
};
