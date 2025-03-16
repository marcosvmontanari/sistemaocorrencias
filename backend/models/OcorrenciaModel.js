const db = require("../config/db");

/**
 * 🔹 Cria uma nova ocorrência no banco de dados
 * @param {number} aluno - ID do aluno
 * @param {number} infracao - ID da infração
 * @param {string} local - Local da ocorrência
 * @param {string} descricao - Descrição da ocorrência
 * @param {string} dataHora - Data e hora do ocorrido
 * @param {number} servidor - ID do servidor responsável
 * @param {string|null} imagem - Nome do arquivo da imagem anexada (ou null)
 */
async function criarOcorrencia(aluno, infracao, local, descricao, dataHora, servidor, imagem) {
    const query = `
        INSERT INTO ocorrencias (aluno_id, infracao_id, local, descricao, data_hora, servidor_id, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [aluno, infracao, local, descricao, dataHora, servidor, imagem]);
}

/**
 * 🔹 Lista todas as ocorrências cadastradas
 * Agora retorna as informações completas (aluno, infração, servidor)
 */
async function listarOcorrencias() {
    const query = `
        SELECT 
            o.id,
            o.local,
            o.descricao,
            o.data_hora,
            o.imagem,
            a.nome AS aluno_nome,
            i.tipo AS infracao_tipo,
            i.descricao AS infracao_descricao,
            s.nome AS servidor_nome
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        JOIN servidores s ON o.servidor_id = s.id
        ORDER BY o.data_hora DESC
    `;

    const [result] = await db.execute(query);
    return result;
}

module.exports = { criarOcorrencia, listarOcorrencias };
