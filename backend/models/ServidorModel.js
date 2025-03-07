const db = require("../config/db");

// ✅ Ajuste para cadastrar corretamente o servidor
async function criarServidor(nome, email, siape, tipo = 'SERVIDOR') {
    const senhaInicial = siape; // Senha padrão inicial igual SIAPE
    const alterou_senha = false; // inicial é FALSE

    const query = `
        INSERT INTO servidores (nome, email, siape, senha, tipo, alterou_senha) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Valores passados na ordem correta
    await db.execute(query, [nome, email, siape, senhaInicial, tipo, alterou_senha]);
}

// 🔹 Método para buscar servidor por ID
async function buscarPorId(id) {
    const query = `
        SELECT * FROM servidores WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
}

// 🔹 Método para atualizar servidor
async function atualizarServidor(id, nome, email, siape, tipo) {
    const query = `
        UPDATE servidores SET nome = ?, email = ?, siape = ?, tipo = ?
        WHERE id = ?
    `;
    await db.execute(query, [nome, email, siape, tipo, id]);
}

// 🔹 Método para excluir servidor
async function excluirServidor(id) {
    const query = `
        DELETE FROM servidores WHERE id = ?
    `;
    await db.execute(query, [id]);
}

// 🔹 Método para login
async function login(email, senha) {
    const query = `
        SELECT * FROM servidores WHERE email = ? AND senha = ?
    `;
    const [rows] = await db.execute(query, [email, senha]);
    return rows[0];
}

// 🔸 Método correto para alterar senha e marcar como alterada
async function alterarSenha(id, novaSenha) {
    const query = `
        UPDATE servidores
        SET senha = ?, alterou_senha = 1
        WHERE id = ?
    `;
    const [result] = await db.execute(query, [novaSenha, id]);
    return result;
}

module.exports = {
    criarServidor,
    buscarPorId,
    atualizarServidor,
    excluirServidor,
    login,
    alterarSenha
};
