const db = require("../config/db");

// Função para listar ocorrências com filtros aplicados
async function listarOcorrencias(tipoInfracao, dataInicio, dataFim, aluno, servidor) {
    let query = `
        SELECT o.id, a.nome AS aluno, i.tipo AS infracao, o.local, o.descricao, o.data_hora, s.nome AS servidor
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        JOIN servidores s ON o.servidor_id = s.id
        WHERE 1 = 1
    `;

    const params = [];

    // 🔹 Adicionando filtros dinamicamente
    if (tipoInfracao) {
        query += " AND i.tipo = ?";
        params.push(tipoInfracao);
    }

    if (dataInicio) {
        query += " AND o.data_hora >= ?";
        params.push(dataInicio + " 00:00:00");
    }

    if (dataFim) {
        query += " AND o.data_hora <= ?";
        params.push(dataFim + " 23:59:59");
    }

    if (aluno) {
        query += " AND o.aluno_id = ?";
        params.push(aluno);
    }

    if (servidor) {
        query += " AND o.servidor_id = ?";
        params.push(servidor);
    }

    // 🔹 Executa a consulta filtrada
    const [result] = await db.execute(query, params);
    return result;
}

module.exports = { listarOcorrencias };
