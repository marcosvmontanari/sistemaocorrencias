const db = require("../config/db");

const GestorModel = {};

// 🔹 Lista os alunos com ocorrência do tipo GRAVÍSSIMA, para acompanhamento
GestorModel.listarCasosComissao = async () => {
    const [dados] = await db.execute(`
        SELECT 
            a.id,
            a.nome,
            a.curso,
            a.turma,
            COUNT(o.id) AS quantidade,
            (
                SELECT o2.status
                FROM ocorrencias o2
                JOIN infracoes i2 ON o2.infracao_id = i2.id
                WHERE o2.aluno_id = a.id AND i2.tipo = 'GRAVÍSSIMA'
                ORDER BY o2.data_hora DESC
                LIMIT 1
            ) AS status,
            MAX(o.feedback) AS feedback,
            MAX(o.documento_final) AS documento_final
        FROM ocorrencias o
        JOIN alunos a ON o.aluno_id = a.id
        JOIN infracoes i ON o.infracao_id = i.id
        WHERE i.tipo = 'GRAVÍSSIMA'
        GROUP BY a.id, a.nome, a.curso, a.turma
        ORDER BY a.nome ASC
    `);

    return dados;
};

module.exports = GestorModel;
