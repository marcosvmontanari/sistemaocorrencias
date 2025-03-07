console.log("🔹 Script cadastrar_alunos.js carregado corretamente!");

// Evento para cadastrar aluno
document.getElementById("formAluno").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const turma = document.getElementById("turma").value;
    const curso = document.getElementById("curso").value;

    try {
        const resposta = await fetch("http://localhost:3000/alunos/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, turma, curso })
        });

        if (resposta.ok) {
            alert("✅ Aluno cadastrado com sucesso!");
            carregarAlunos();
        } else {
            const erro = await resposta.json();
            alert("❌ Erro ao cadastrar aluno: " + erro.erro);
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao conectar com o servidor!");
    }
});

// Função para carregar alunos
async function carregarAlunos() {
    const resposta = await fetch("http://localhost:3000/alunos");
    const alunos = await resposta.json();
    const tabelaAlunos = document.getElementById("tabelaAlunos");

    tabelaAlunos.innerHTML = "";
    alunos.forEach(aluno => {
        tabelaAlunos.innerHTML += `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.turma}</td>
                <td>${aluno.curso}</td>
                <td>
                    <button class="btn btn-warning btn-sm">Editar</button>
                    <button class="btn btn-danger btn-sm">Excluir</button>
                </td>
            </tr>
        `;
    });
}

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (usuario) {
    document.getElementById("userWelcome").textContent = `Bem-vindo, ${usuario.nome}`;
} else {
    window.location.href = "../index.html"; // Redireciona para login se não estiver logado
}

// Função Logout
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "../index.html";
}

carregarAlunos();
