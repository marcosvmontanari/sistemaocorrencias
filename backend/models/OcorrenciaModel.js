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
    const status = "PENDENTE"; // 🔹 Define status inicial

    const query = `
        INSERT INTO ocorrencias 
            (aluno_id, infracao_id, local, descricao, data_hora, servidor_id, imagem, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [aluno, infracao, local, descricao, dataHora, servidor, imagem, status]);
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
            o.feedback,
            o.status, -- ✅ Adicionado aqui
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
   ✅ LISTAR OCORRÊNCIAS PAGINADAS E COM BUSCA (NOVO)
====================================================================================== */

/**
 * 🔸 Lista ocorrências com paginação e busca por aluno, infração ou local
 * @param {object} filtros - { page, limit, busca }
 */
async function listarOcorrenciasPaginado({ page = 1, limit = 10, busca = "" }) {
    try {
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const offsetInt = (pageInt - 1) * limitInt;

        const filtroBusca = `%${busca}%`;

        console.log("🔍 Model - Paginado - page:", pageInt, "limit:", limitInt, "busca:", busca);

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
            WHERE 
                a.nome LIKE ? OR 
                i.tipo LIKE ? OR
                o.local LIKE ?
            ORDER BY o.data_hora DESC
            LIMIT ${limitInt} OFFSET ${offsetInt}  -- ✅ inseridos diretamente aqui!
        `;

        const params = [filtroBusca, filtroBusca, filtroBusca];

        console.log("📥 Params SELECT:", params);

        const [ocorrencias] = await db.execute(query, params);

        const queryCount = `
            SELECT COUNT(*) AS total
            FROM ocorrencias o
            JOIN alunos a ON o.aluno_id = a.id
            JOIN infracoes i ON o.infracao_id = i.id
            WHERE 
                a.nome LIKE ? OR 
                i.tipo LIKE ? OR
                o.local LIKE ?
        `;

        const paramsCount = [filtroBusca, filtroBusca, filtroBusca];

        console.log("📥 Params COUNT:", paramsCount);

        const [resultCount] = await db.execute(queryCount, paramsCount);

        const total = resultCount[0]?.total || 0;

        return {
            ocorrencias,
            total
        };

    } catch (error) {
        console.error("❌ Erro no listarOcorrenciasPaginado:", error);
        throw error;
    }
}

const moment = require("moment-timezone");

function estaDentroDoPrazo(dataOcorrencia, tipo) {
    const agora = moment().tz("America/Sao_Paulo");
    const data = moment.tz(dataOcorrencia, "America/Sao_Paulo");
    const dias = agora.diff(data, 'days');

    switch (tipo) {
        case "LEVE":
            return dias <= 90;
        case "GRAVE":
            return dias <= 180;
        case "GRAVÍSSIMA":
            return dias <= 365;
        default:
            return false;
    }
}

/* ======================================================================================
   ✅ QUADRO DE OCORRÊNCIAS (COM REGRAS DE REINCIDÊNCIA)
====================================================================================== */

/**
 * 🔹 Gera o quadro geral de ocorrências por aluno, aplicando regras de reincidência:
 * - 3 LEVES = 1 GRAVE
 * - 2 GRAVES = 1 GRAVÍSSIMA
 */
async function gerarQuadroOcorrencias() {
    const query = `
        SELECT 
            a.id AS aluno_id,
            a.nome AS aluno_nome,
            i.tipo AS tipo_infracao,
            o.data_hora
        FROM ocorrencias o
        INNER JOIN alunos a ON o.aluno_id = a.id
        INNER JOIN infracoes i ON o.infracao_id = i.id
        ORDER BY a.nome ASC
    `;

    const [result] = await db.execute(query);

    const mapaAlunos = {};

    result.forEach(item => {
        const nome = item.aluno_nome;
        const tipo = item.tipo_infracao;
        const data = item.data_hora;

        // ⏳ Ignora ocorrências fora do prazo de validade
        if (!estaDentroDoPrazo(data, tipo)) return;

        if (!mapaAlunos[nome]) {
            mapaAlunos[nome] = { leve: 0, grave: 0, gravissima: 0 };
        }

        if (tipo === "LEVE") mapaAlunos[nome].leve++;
        if (tipo === "GRAVE") mapaAlunos[nome].grave++;
        if (tipo === "GRAVÍSSIMA") mapaAlunos[nome].gravissima++;
    });

    const resultadoFinal = [];

    for (const nome in mapaAlunos) {
        let { leve, grave, gravissima } = mapaAlunos[nome];

        // ✅ Converte LEVES em GRAVE só a partir da 4ª
        const novasGraves = leve >= 4 ? leve - 3 : 0;
        grave += novasGraves;
        leve = leve >= 4 ? 3 : leve;

        // ✅ Converte GRAVES em GRAVÍSSIMA só a partir da 3ª
        const novasGravissimas = grave >= 3 ? grave - 2 : 0;
        gravissima += novasGravissimas;
        grave = grave >= 3 ? 2 : grave;

        resultadoFinal.push({ aluno: nome, leve, grave, gravissima });
    }

    return resultadoFinal;
}



/**
 * 🔹 Lista todas as ocorrências cadastradas por um servidor
 * @param {number} servidorId - ID do servidor logado
 */
async function listarOcorrenciasPorServidor(servidorId) {
    const query = `
        SELECT 
            o.id,
            o.local,
            o.descricao,
            o.data_hora,
            o.status,
            o.imagem,
            a.nome AS aluno_nome,
            i.tipo AS infracao_tipo,
            i.descricao AS infracao_descricao
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        WHERE o.servidor_id = ?
        ORDER BY o.data_hora DESC
    `;

    const [result] = await db.execute(query, [servidorId]);
    return result;
}

/**
 * 🔹 Atualiza o feedback e o status de uma ocorrência
 * @param {number} id - ID da ocorrência
 * @param {string} feedback - Texto do feedback
 * @param {string} status - Novo status da ocorrência
 */
async function atualizarFeedback(id, feedback, status) {
    const query = `
        UPDATE ocorrencias
        SET feedback = ?, status = ?
        WHERE id = ?
    `;
    await db.execute(query, [feedback, status, id]);
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
    filtrarOcorrencias,
    listarOcorrenciasPaginado,
    gerarQuadroOcorrencias,
    listarOcorrenciasPorServidor,
    atualizarFeedback // ✅ Nova função exportada
};
