const db = require("../config/db");

// 🔹 Lista alunos que têm ao menos uma ocorrência do tipo GRAVÍSSIMA
async function listarAlunosEncaminhadosParaComissao() {
    const query = `
        SELECT 
            a.id AS id, 
            a.nome AS nome, 
            COUNT(o.id) AS quantidade
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

// 🔹 Salva um feedback da comissão disciplinar
async function salvarFeedbackComissao(ocorrenciaId, feedback) {
    const query = `
        UPDATE ocorrencias
        SET feedback = ?, status = 'AVALIADO PELA COMISSÃO'
        WHERE id = ?
    `;
    await db.execute(query, [feedback, ocorrenciaId]);
}

module.exports = {
    listarAlunosEncaminhadosParaComissao,
    listarOcorrenciasDoAluno,
    salvarFeedbackComissao
};
