const db = require("../config/db");

// ✅ Função para criar infração
async function criarInfracao(descricao, tipo) {
    await db.execute(
        'INSERT INTO infracoes (descricao, tipo) VALUES (?, ?)',
        [descricao, tipo]
    );
}

// ✅ Função para listar infrações COM ordenação personalizada
async function listarInfracoes() {
    try {
        const query = `
            SELECT * FROM infracoes
            ORDER BY
                CASE tipo
                    WHEN 'LEVE' THEN 1
                    WHEN 'GRAVE' THEN 2
                    WHEN 'GRAVISSIMA' THEN 3
                    ELSE 4
                END,
                descricao ASC
        `;

        const [rows] = await db.execute(query);
        return rows;
    } catch (error) {
        console.error("Erro ao listar infrações:", error);
        throw error;
    }
}

// ✅ Buscar infração por ID
async function buscarPorId(id) {
    const [rows] = await db.execute("SELECT * FROM infracoes WHERE id = ?", [id]);
    return rows[0];
}

// ✅ Atualizar infração
async function atualizarInfracao(id, descricao, tipo) {
    const query = `UPDATE infracoes SET descricao = ?, tipo = ? WHERE id = ?`;
    await db.execute(query, [descricao, tipo, id]);
}

// ✅ Excluir infração
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
