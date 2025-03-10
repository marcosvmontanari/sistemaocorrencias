const db = require("../config/db"); // Conexão com o banco de dados

// ✅ Criar um aluno
async function criarAluno(nome, turma, curso) {
    const sql = "INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)";
    await db.execute(sql, [nome, turma, curso]);
}

// ✅ Listar alunos
async function listarAlunos() {
    const sql = "SELECT * FROM alunos";
    const [alunos] = await db.execute(sql);
    return alunos;
}

// ✅ Buscar um aluno por ID
async function buscarAlunoPorId(id) {
    const sql = "SELECT * FROM alunos WHERE id = ?";
    const [aluno] = await db.execute(sql, [id]);
    return aluno.length ? aluno[0] : null;
}

// ✅ Atualizar um aluno pelo ID
async function atualizarAluno(id, nome, turma, curso) {
    const sql = "UPDATE alunos SET nome = ?, turma = ?, curso = ? WHERE id = ?";
    await db.execute(sql, [nome, turma, curso, id]);
}

// ✅ Excluir um aluno pelo ID
async function excluirAluno(id) {
    const sql = "DELETE FROM alunos WHERE id = ?";
    await db.execute(sql, [id]);
}

module.exports = {
    criarAluno,
    listarAlunos,
    buscarAlunoPorId,
    atualizarAluno,
    excluirAluno
};
