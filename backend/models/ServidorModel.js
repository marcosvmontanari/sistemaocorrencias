const db = require("../config/db");

/**
 * 🔸 Cria um novo servidor
 * @param {string} nome - Nome do servidor
 * @param {string} email - Email do servidor
 * @param {string} siape - Matrícula SIAPE
 * @param {string} tipo - Tipo do servidor (ADMIN ou SERVIDOR)
 */
async function criarServidor(nome, email, siape, tipo = 'SERVIDOR') {
    const senhaInicial = siape; // Senha padrão inicial igual ao SIAPE
    const alterou_senha = false; // Inicial é FALSE

    const query = `
        INSERT INTO servidores (nome, email, siape, senha, tipo, alterou_senha) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Executa o cadastro com os valores na ordem correta
    await db.execute(query, [nome, email, siape, senhaInicial, tipo, alterou_senha]);
}

/**
 * 🔸 Busca um servidor pelo ID
 * @param {number} id - ID do servidor
 * @returns {object} Servidor encontrado ou undefined
 */
async function buscarPorId(id) {
    const query = `
        SELECT * FROM servidores WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
}

/**
 * 🔸 Atualiza os dados de um servidor
 * @param {number} id - ID do servidor
 * @param {string} nome - Nome atualizado
 * @param {string} email - Email atualizado
 * @param {string} siape - SIAPE atualizado
 * @param {string} tipo - Tipo atualizado (ADMIN ou SERVIDOR)
 */
async function atualizarServidor(id, nome, email, siape, tipo) {
    const query = `
        UPDATE servidores SET nome = ?, email = ?, siape = ?, tipo = ?
        WHERE id = ?
    `;
    await db.execute(query, [nome, email, siape, tipo, id]);
}

/**
 * 🔸 Exclui um servidor pelo ID
 * @param {number} id - ID do servidor
 */
async function excluirServidor(id) {
    const query = `
        DELETE FROM servidores WHERE id = ?
    `;
    await db.execute(query, [id]);
}

/**
 * 🔸 Faz login de um servidor verificando email e senha
 * @param {string} email - Email do servidor
 * @param {string} senha - Senha do servidor
 * @returns {object} Servidor encontrado ou undefined
 */
async function login(email, senha) {
    const query = `
        SELECT * FROM servidores WHERE email = ? AND senha = ?
    `;
    const [rows] = await db.execute(query, [email, senha]);
    return rows[0];
}

/**
 * 🔸 Altera a senha de um servidor
 * @param {number} id - ID do servidor
 * @param {string} novaSenha - Nova senha a ser salva
 */
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
