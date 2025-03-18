console.log("🔹 cadastrar_alunos.js (Módulo) carregado corretamente!");

async function initAlunos() {
    const usuario = JSON.parse(sessionStorage.getItem("usuario")); // ✅ sessionStorage mantido!
    if (!usuario) {
        console.error("❌ ERRO: Usuário não encontrado no sessionStorage! Redirecionando para login...");
        window.location.href = "../index.html";
        return;
    }

    const tabelaAlunos = document.getElementById("tabelaAlunos");
    const btnCadastrarAluno = document.getElementById("btnCadastrarAluno");
    const btnSalvarEdicaoAluno = document.getElementById("btnSalvarEdicaoAluno");
    const formUploadCSVAluno = document.getElementById("formUploadCSVAluno");
    const paginationControls = document.getElementById("pagination");

    // 🔸 Campo de busca no DOM
    const inputBusca = document.getElementById("inputBuscaAlunos");

    if (!tabelaAlunos || !btnCadastrarAluno || !btnSalvarEdicaoAluno || !formUploadCSVAluno || !paginationControls || !inputBusca) {
        console.error("❌ Elementos da página de alunos não encontrados!");
        return;
    }

    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    let alunosData = [];
    let termoBusca = "";

    let currentPage = 1;
    let totalPages = 1;

    btnCadastrarAluno.addEventListener("click", () => {
        console.log("✅ Botão de cadastrar aluno clicado!");
        cadastrarAluno();
    });

    btnSalvarEdicaoAluno.addEventListener("click", () => {
        console.log("✅ Botão de salvar edição clicado!");
        salvarEdicao();
    });

    formUploadCSVAluno.addEventListener("submit", handleCSVUpload);

    // 🔸 Escuta do campo de busca
    inputBusca.addEventListener("input", () => {
        termoBusca = inputBusca.value.trim();
        currentPage = 1;
        carregarAlunos(currentPage);
    });

    async function carregarAlunos(page = 1, limit = 10) {
        try {
            console.log("📌 Carregando lista de alunos...");

            let url = `http://localhost:3000/alunos?page=${page}&limit=${limit}`;
            if (termoBusca !== "") {
                url += `&busca=${encodeURIComponent(termoBusca)}`;
            }

            const resposta = await fetch(url);

            if (!resposta.ok) throw new Error("Erro ao buscar alunos!");

            const data = await resposta.json();

            alunosData = data.alunos;
            tabelaAlunos.innerHTML = "";

            if (alunosData.length === 0) {
                tabelaAlunos.innerHTML = `
                    <tr><td colspan="4" class="text-center">Nenhum aluno encontrado.</td></tr>
                `;
                totalPages = 1;
                updatePaginationControls();
                return;
            }

            alunosData.forEach(aluno => {
                tabelaAlunos.innerHTML += `
                    <tr>
                        <td>${aluno.nome}</td>
                        <td>${aluno.turma}</td>
                        <td>${aluno.curso}</td>
                        <td class="action-column">
                            <i class="fas fa-edit text-warning" data-id="${aluno.id}" style="cursor: pointer;"></i>
                            <i class="fas fa-trash-alt text-danger" data-id="${aluno.id}" style="cursor: pointer;"></i>
                        </td>
                    </tr>
                `;
            });

            totalPages = Math.ceil(data.total / limit);

            updatePaginationControls();
            addEventListeners();

            console.log("✅ Lista de alunos carregada com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao carregar alunos:", error);
        }
    }

    function updatePaginationControls() {
        paginationControls.innerHTML = "";

        if (currentPage > 1) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="prevPageBtn">Anterior</button>`;
        }

        paginationControls.innerHTML += `<span> Página ${currentPage} de ${totalPages} </span>`;

        if (currentPage < totalPages) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="nextPageBtn">Próxima</button>`;
        }

        document.getElementById("prevPageBtn")?.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                carregarAlunos(currentPage);
            }
        });

        document.getElementById("nextPageBtn")?.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                carregarAlunos(currentPage);
            }
        });
    }

    function addEventListeners() {
        document.querySelectorAll('.fa-edit').forEach(button => {
            button.addEventListener('click', () => {
                const aluno = alunosData.find(a => a.id === parseInt(button.dataset.id));
                abrirModalEdicao(aluno);
            });
        });

        document.querySelectorAll('.fa-trash-alt').forEach(button => {
            button.addEventListener('click', () => {
                excluirAluno(button.dataset.id);
            });
        });
    }

    async function cadastrarAluno() {
        const nome = document.getElementById("nome").value.trim();
        const turma = document.getElementById("turma").value.trim();
        const curso = document.getElementById("curso").value.trim();

        console.log("📦 Enviando dados:", { nome, turma, curso });

        if (!nome || !turma || !curso) {
            showAlert('warning', '⚠️ Preencha todos os campos antes de cadastrar.');
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/alunos/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turma, curso })
            });

            if (resposta.ok) {
                showAlert('success', '✅ Aluno cadastrado com sucesso!');
                document.getElementById("formAluno").reset();
                carregarAlunos(currentPage);
            } else {
                const erro = await resposta.json();
                showAlert('error', `❌ Erro ao cadastrar aluno: ${erro.erro || "Erro desconhecido"}`);
            }
        } catch (error) {
            console.error("❌ Erro ao conectar com o servidor:", error);
            showAlert('error', '❌ Erro ao conectar com o servidor!');
        }
    }

    async function excluirAluno(id) {
        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este aluno?',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacao.isConfirmed) return;

        try {
            const resposta = await fetch(`http://localhost:3000/alunos/${id}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                showAlert('success', '✅ Aluno excluído com sucesso!');
                carregarAlunos(currentPage);
            } else {
                showAlert('error', '❌ Erro ao excluir aluno!');
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
        const id = document.getElementById("editId").value;
        const nome = document.getElementById("editNome").value.trim();
        const turma = document.getElementById("editTurma").value.trim();
        const curso = document.getElementById("editCurso").value.trim();

        if (!id || !nome || !turma || !curso) {
            showAlert('warning', '⚠️ Preencha todos os campos antes de salvar.');
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/alunos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, turma, curso })
            });

            if (resposta.ok) {
                showAlert('success', '✅ Aluno atualizado com sucesso!');
                carregarAlunos(currentPage);
                bootstrap.Modal.getInstance(document.getElementById("modalEditarAluno")).hide();
            } else {
                showAlert('error', '❌ Erro ao atualizar aluno!');
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar aluno:", error);
        }
    }

    async function handleCSVUpload(event) {
        event.preventDefault();
        const fileInput = document.getElementById("fileInputAluno");
        const file = fileInput.files[0];

        if (file && file.name.endsWith(".csv")) {
            const formData = new FormData();
            formData.append("csvFile", file);

            fetch("http://localhost:3000/upload-csv/alunos", {
                method: "POST",
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    showAlert('success', data.message);
                    carregarAlunos(currentPage);
                })
                .catch(error => {
                    showAlert('error', 'Erro ao enviar o arquivo.');
                    console.error("Erro:", error);
                });
        } else {
            showAlert('warning', 'Por favor, selecione um arquivo CSV.');
        }
    }

    carregarAlunos();
}

// 🔸 Export da função para ser utilizada pelo dashboard.js
export { initAlunos };
