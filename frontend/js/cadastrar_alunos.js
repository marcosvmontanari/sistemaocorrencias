console.log("🔹 cadastrar_alunos.js (Módulo) carregado corretamente!");

async function initAlunos() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        console.error("❌ ERRO: Usuário não encontrado no localStorage! Redirecionando para login...");
        window.location.href = "../index.html";
        return;
    }

    const tabelaAlunos = document.getElementById("tabelaAlunos");
    const btnCadastrarAluno = document.getElementById("btnCadastrarAluno");
    const btnSalvarEdicaoAluno = document.getElementById("btnSalvarEdicaoAluno");

    if (!tabelaAlunos || !btnCadastrarAluno || !btnSalvarEdicaoAluno) {
        console.error("❌ Elementos da página de alunos não encontrados!");
        return;
    }

    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    btnCadastrarAluno.addEventListener("click", () => {
        console.log("✅ Botão de cadastrar aluno clicado!");
        cadastrarAluno();
    });

    btnSalvarEdicaoAluno.addEventListener("click", () => {
        console.log("✅ Botão de salvar edição clicado!");
        salvarEdicao();
    });

    // Funções internas

    async function carregarAlunos() {
        try {
            console.log("📌 Carregando lista de alunos...");
            const resposta = await fetch("http://localhost:3000/alunos");

            if (!resposta.ok) throw new Error("Erro ao buscar alunos!");

            const alunos = await resposta.json();

            tabelaAlunos.innerHTML = "";
            alunos.forEach(aluno => {
                tabelaAlunos.innerHTML += `
                    <tr>
                        <td>${aluno.id}</td>
                        <td>${aluno.nome}</td>
                        <td>${aluno.turma}</td>
                        <td>${aluno.curso}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" data-id="${aluno.id}">Editar</button>
                            <button class="btn btn-danger btn-sm" data-id="${aluno.id}">Excluir</button>
                        </td>
                    </tr>
                `;
            });

            // Eventos para botões de editar/excluir
            tabelaAlunos.querySelectorAll('.btn-warning').forEach(button => {
                button.addEventListener('click', () => {
                    const aluno = alunos.find(a => a.id === parseInt(button.dataset.id));
                    abrirModalEdicao(aluno);
                });
            });

            tabelaAlunos.querySelectorAll('.btn-danger').forEach(button => {
                button.addEventListener('click', () => {
                    excluirAluno(button.dataset.id);
                });
            });

            console.log("✅ Lista de alunos carregada com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao carregar alunos:", error);
        }
    }

    async function cadastrarAluno() {
        const nome = document.getElementById("nome")?.value.trim();
        const turma = document.getElementById("turma")?.value.trim();
        const curso = document.getElementById("curso")?.value.trim();

        console.log("📦 Enviando dados:", { nome, turma, curso });

        if (!nome || !turma || !curso) {
            alert("⚠️ Preencha todos os campos antes de cadastrar.");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/alunos/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turma, curso })
            });

            if (resposta.ok) {
                alert("✅ Aluno cadastrado com sucesso!");
                document.getElementById("formAluno").reset();
                carregarAlunos();
            } else {
                const erro = await resposta.json();
                alert("❌ Erro ao cadastrar aluno: " + (erro.erro || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("❌ Erro ao conectar com o servidor:", error);
            alert("❌ Erro ao conectar com o servidor!");
        }
    }

    async function excluirAluno(id) {
        if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

        try {
            const resposta = await fetch(`http://localhost:3000/alunos/${id}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                alert("✅ Aluno excluído com sucesso!");
                carregarAlunos();
            } else {
                alert("❌ Erro ao excluir aluno!");
            }
        } catch (error) {
            console.error("❌ Erro ao excluir aluno:", error);
        }
    }

    function abrirModalEdicao(aluno) {
        if (!aluno) return;

        document.getElementById("editId").value = aluno.id;
        document.getElementById("editNome").value = aluno.nome;
        document.getElementById("editTurma").value = aluno.turma;
        document.getElementById("editCurso").value = aluno.curso;

        const modal = new bootstrap.Modal(document.getElementById("modalEditarAluno"));
        modal.show();
    }

    async function salvarEdicao() {
        const id = document.getElementById("editId")?.value;
        const nome = document.getElementById("editNome")?.value.trim();
        const turma = document.getElementById("editTurma")?.value.trim();
        const curso = document.getElementById("editCurso")?.value.trim();

        if (!id || !nome || !turma || !curso) {
            alert("⚠️ Preencha todos os campos antes de salvar.");
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/alunos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turma, curso })
            });

            if (resposta.ok) {
                alert("✅ Aluno atualizado com sucesso!");
                carregarAlunos();
                bootstrap.Modal.getInstance(document.getElementById("modalEditarAluno")).hide();
            } else {
                alert("❌ Erro ao atualizar aluno!");
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar aluno:", error);
        }
    }

    // Carrega os alunos no início
    carregarAlunos();
}

// Inicializa automaticamente assim que o script for carregado
initAlunos();
