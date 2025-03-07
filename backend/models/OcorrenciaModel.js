const db = require("../config/db");

async function criarOcorrencia(aluno, infracao, local, descricao, dataHora, servidor, imagem) {
    const query = `
        INSERT INTO ocorrencias (aluno_id, infracao_id, local, descricao, data_hora, servidor_id, imagem)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [aluno, infracao, local, descricao, dataHora, servidor, imagem]);
}

async function listarOcorrencias() {
    const [result] = await db.execute("SELECT * FROM ocorrencias");
    return result;
}

module.exports = { criarOcorrencia, listarOcorrencias };
