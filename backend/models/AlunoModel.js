const db = require("../config/db"); // Conexão com o banco de dados

// ✅ Criar um aluno
async function criarAluno(nome, turma, curso) {
    if (!nome || !turma || !curso) {
        throw new Error("Todos os campos (nome, turma, curso) são obrigatórios!");
    }

    const sql = "INSERT INTO alunos (nome, turma, curso) VALUES (?, ?, ?)";
    await db.execute(sql, [nome, turma, curso]);
}

// ✅ Listar todos os alunos (sem paginação)
async function listarAlunos() {
    const sql = "SELECT * FROM alunos";
    const [alunos] = await db.execute(sql);
    return alunos;
}

// ✅ Listar alunos com paginação e busca (opcional)
async function listarAlunosPaginado(page = 1, limit = 10, busca = "") {
    const offset = (page - 1) * limit;
    let query;
    let params;

    if (busca.trim() !== "") {
        query = `
            SELECT id, nome, turma, curso
            FROM alunos
            WHERE nome LIKE ? OR turma LIKE ? OR curso LIKE ?
            ORDER BY nome ASC
            LIMIT ? OFFSET ?
        `;
        params = [`%${busca}%`, `%${busca}%`, `%${busca}%`, limit, offset];
    } else {
        query = `
            SELECT id, nome, turma, curso
            FROM alunos
            ORDER BY nome ASC
            LIMIT ? OFFSET ?
        `;
        params = [limit, offset];
    }

    const [rows] = await db.execute(query, params);
    return rows;
}

// ✅ Buscar um aluno por ID
async function buscarAlunoPorId(id) {
    const sql = "SELECT * FROM alunos WHERE id = ?";
    const [aluno] = await db.execute(sql, [id]);
    return aluno.length ? aluno[0] : null;
}

// ✅ Atualizar um aluno pelo ID
async function atualizarAluno(id, nome, turma, curso) {
    if (!id || !nome || !turma || !curso) {
        throw new Error("Todos os campos são obrigatórios para atualizar!");
    }

    const sql = "UPDATE alunos SET nome = ?, turma = ?, curso = ? WHERE id = ?";
    await db.execute(sql, [nome, turma, curso, id]);
}

// ✅ Excluir um aluno pelo ID
async function excluirAluno(id) {
    if (!id) {
        throw new Error("ID é obrigatório para excluir!");
    }

    const sql = "DELETE FROM alunos WHERE id = ?";
    await db.execute(sql, [id]);
}

module.exports = {
    criarAluno,
    listarAlunos,
    listarAlunosPaginado,
    buscarAlunoPorId,
    atualizarAluno,
    excluirAluno
};
