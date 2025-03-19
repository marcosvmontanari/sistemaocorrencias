const db = require("../config/db");

/* ======================================================================================
   ✅ CRIA UMA NOVA OCORRÊNCIA
====================================================================================== */

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

/* ======================================================================================
   ✅ LISTAR TODAS AS OCORRÊNCIAS
====================================================================================== */

/**
 * 🔹 Lista todas as ocorrências cadastradas
 * Retorna as informações completas (aluno, infração, servidor)
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

/* ======================================================================================
   ✅ BUSCAR UMA OCORRÊNCIA ESPECÍFICA POR ID
====================================================================================== */

/**
 * 🔸 Busca uma ocorrência específica pelo ID
 * @param {number} id - ID da ocorrência
 */
async function buscarOcorrenciaPorId(id) {
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
        WHERE o.id = ?
    `;

    const [result] = await db.execute(query, [id]);
    return result.length > 0 ? result[0] : null;
}

/* ======================================================================================
   ✅ ATUALIZAR UMA OCORRÊNCIA EXISTENTE
====================================================================================== */

/**
 * 🔸 Atualiza os campos 'descricao' e 'local' de uma ocorrência
 * @param {number} id - ID da ocorrência
 * @param {string} descricao - Nova descrição
 * @param {string} local - Novo local
 */
async function atualizarOcorrencia(id, descricao, local) {
    const query = `
        UPDATE ocorrencias
        SET descricao = ?, local = ?
        WHERE id = ?
    `;

    await db.execute(query, [descricao, local, id]);
}

/* ======================================================================================
   ✅ EXCLUIR UMA OCORRÊNCIA
====================================================================================== */

/**
 * 🔸 Exclui uma ocorrência pelo ID
 * @param {number} id - ID da ocorrência
 */
async function excluirOcorrencia(id) {
    const query = `
        DELETE FROM ocorrencias
        WHERE id = ?
    `;

    await db.execute(query, [id]);
}

/* ======================================================================================
   ✅ FILTRAR OCORRÊNCIAS POR ALUNO OU TIPO DE INFRAÇÃO
====================================================================================== */

/**
 * 🔸 Filtra ocorrências por aluno e/ou tipo de infração (opcional)
 * @param {object} filtros - Filtros de busca (aluno, tipo_infracao)
 */
async function filtrarOcorrencias({ aluno, tipo_infracao }) {
    let query = `
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
        WHERE 1 = 1
    `;

    const params = [];

    if (aluno) {
        query += ` AND a.nome LIKE ?`;
        params.push(`%${aluno}%`);
    }

    if (tipo_infracao) {
        query += ` AND i.tipo LIKE ?`;
        params.push(`%${tipo_infracao}%`);
    }

    query += ` ORDER BY o.data_hora DESC`;

    const [result] = await db.execute(query, params);
    return result;
}

/* ======================================================================================
   ✅ EXPORTA TODAS AS FUNÇÕES
====================================================================================== */

module.exports = {
    criarOcorrencia,
    listarOcorrencias,
    buscarOcorrenciaPorId,
    atualizarOcorrencia,
    excluirOcorrencia,
    filtrarOcorrencias
};
