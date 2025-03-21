const db = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * 🔸 Cria um novo servidor
 * @param {string} nome - Nome do servidor
 * @param {string} email - Email do servidor
 * @param {string} siape - Matrícula SIAPE
 * @param {string} tipo - Tipo do servidor (ADMIN ou SERVIDOR)
 */
async function criarServidor(nome, email, siape, tipo = 'SERVIDOR') {
    const senhaInicial = siape; // Senha padrão inicial igual ao SIAPE
    const alterou_senha = 0; // Começa como 0 (falso)

    // 🔐 Criptografa a senha antes de gravar no banco
    const senhaHash = await bcrypt.hash(senhaInicial, 10);

    const query = `
        INSERT INTO servidores (nome, email, siape, senha, tipo, alterou_senha) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [nome, email, siape, senhaHash, tipo, alterou_senha]);
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
 * @param {string} senha - Senha informada no login
 * @returns {object|null} Dados do servidor se a senha for válida
 */
async function login(email, senha) {
    // Busca o servidor pelo email
    const query = `
        SELECT * FROM servidores WHERE email = ?
    `;
    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
        return null; // Usuário não encontrado
    }

    const servidor = rows[0];

    // 🔐 Compara a senha informada com o hash do banco
    const senhaValida = await bcrypt.compare(senha, servidor.senha);

    if (!senhaValida) {
        return null; // Senha inválida
    }

    // Remove a senha antes de retornar (boa prática)
    delete servidor.senha;

    return servidor;
}

/**
 * 🔸 Altera a senha de um servidor
 * @param {number} id - ID do servidor
 * @param {string} novaSenha - Nova senha a ser salva
 */
async function alterarSenha(id, novaSenha) {
    // 🔐 Criptografa a nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const query = `
        UPDATE servidores
        SET senha = ?, alterou_senha = 1
        WHERE id = ?
    `;
    const [result] = await db.execute(query, [senhaHash, id]);
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
