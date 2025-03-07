const db = require("../config/db");

// ✅ Método atualizado usando async/await para criar aluno
async function criarAluno(nome, turma, curso) {
    const sql = "INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)";
    await db.execute(sql, [nome, turma, curso]);
}

// ✅ Método atualizado usando async/await para listar alunos
async function listarAlunos() {
    const sql = "SELECT * FROM alunos";
    const [alunos] = await db.execute(sql);
    return alunos;
}

module.exports = { criarAluno, listarAlunos };
