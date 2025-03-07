const db = require("../config/db");

// Criar infração (apenas descricao e tipo agora)
async function criarInfracao(descricao, tipo) {
    const query = `INSERT INTO infracoes (descricao, tipo) VALUES (?, ?)`;
    await db.execute(query, [descricao, tipo]);
}

// Listar infrações
async function listarInfracoes() {
    const [rows] = await db.execute("SELECT * FROM infracoes");
    return rows;
}

// Buscar infração por ID
async function buscarPorId(id) {
    const [rows] = await db.execute("SELECT * FROM infracoes WHERE id = ?", [id]);
    return rows[0];
}

// Atualizar infração
async function atualizarInfracao(id, descricao, tipo) {
    const query = `UPDATE infracoes SET descricao = ?, tipo = ? WHERE id = ?`;
    await db.execute(query, [descricao, tipo, id]);
}

// Excluir infração
async function excluirInfracao(id) {
    await db.execute("DELETE FROM infracoes WHERE id = ?", [id]);
}

module.exports = {
    criarInfracao,
    listarInfracoes,
    buscarPorId,
    atualizarInfracao,
    excluirInfracao
};
