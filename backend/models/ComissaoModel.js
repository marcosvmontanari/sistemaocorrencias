const db = require("../config/db");

// 🔹 Lista alunos com ocorrência do tipo GRAVÍSSIMA
async function listarAlunosComOcorrenciaGravissima() {
    const query = `
        SELECT 
            a.id AS id, 
            a.nome AS nome, 
            COUNT(o.id) AS quantidade,
            (SELECT o2.status 
             FROM ocorrencias o2 
             JOIN infracoes i2 ON o2.infracao_id = i2.id 
             WHERE o2.aluno_id = a.id AND i2.tipo = 'GRAVÍSSIMA' 
             ORDER BY o2.data_hora DESC 
             LIMIT 1) AS status,
            MAX(o.feedback) AS feedback,
            MAX(o.documento_final) AS documento_final
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        WHERE i.tipo = 'GRAVÍSSIMA'
        GROUP BY a.id, a.nome
        ORDER BY a.nome ASC
    `;
    const [result] = await db.execute(query);
    return result;
}

// 🔹 Lista alunos com ocorrência do tipo GRAVE
async function listarAlunosComOcorrenciaGrave() {
    const query = `
        SELECT 
            a.id AS id, 
            a.nome AS nome, 
            COUNT(o.id) AS quantidade,
            (SELECT o2.status 
             FROM ocorrencias o2 
             JOIN infracoes i2 ON o2.infracao_id = i2.id 
             WHERE o2.aluno_id = a.id AND i2.tipo = 'GRAVE' 
             ORDER BY o2.data_hora DESC 
             LIMIT 1) AS status,
            MAX(o.feedback) AS feedback,
            MAX(o.documento_final) AS documento_final
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        WHERE i.tipo = 'GRAVE'
        GROUP BY a.id, a.nome
        ORDER BY a.nome ASC
    `;
    const [result] = await db.execute(query);
    return result;
}

// 🔹 Lista todas as ocorrências de um aluno
async function listarOcorrenciasDoAluno(alunoId) {
    const query = `
        SELECT 
            o.id,
            o.local,
            o.descricao,
            o.data_hora,
            o.status,
            o.feedback,
            o.documento_final,
            i.tipo AS tipo_infracao,
            i.descricao AS infracao_descricao,
            s.nome AS servidor_nome
        FROM ocorrencias o
        JOIN infracoes i ON o.infracao_id = i.id
        JOIN servidores s ON o.servidor_id = s.id
        WHERE o.aluno_id = ?
        ORDER BY o.data_hora DESC
    `;
    const [result] = await db.execute(query, [alunoId]);
    return result;
}

// 🔹 Salva feedback, status e opcionalmente o documento
async function salvarFeedbackComissao(ocorrenciaId, feedback, status, documentoFinal = null) {
    let query, params;

    if (documentoFinal) {
        query = `
            UPDATE ocorrencias
            SET feedback = ?, status = ?, documento_final = ?
            WHERE id = ?
        `;
        params = [feedback, status, documentoFinal, ocorrenciaId];
    } else {
        query = `
            UPDATE ocorrencias
            SET feedback = ?, status = ?
            WHERE id = ?
        `;
        params = [feedback, status, ocorrenciaId];
    }

    await db.execute(query, params);
}

module.exports = {
    listarAlunosComOcorrenciaGravissima,
    listarAlunosComOcorrenciaGrave,
    listarOcorrenciasDoAluno,
    salvarFeedbackComissao
};
