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
    const formUploadCSVAluno = document.getElementById("formUploadCSVAluno");
    const paginationControls = document.getElementById("pagination");

    if (!tabelaAlunos || !btnCadastrarAluno || !btnSalvarEdicaoAluno || !formUploadCSVAluno || !paginationControls) {
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

    // Evento de upload de CSV
    formUploadCSVAluno.addEventListener("submit", handleCSVUpload);

    // Variáveis de controle de paginação
    let currentPage = 1;  // Página inicial
    let totalPages = 1;   // Total de páginas, será atualizado ao carregar alunos

    async function carregarAlunos(page = 1, limit = 10) {
        try {
            console.log("📌 Carregando lista de alunos...");

            // Passa os parâmetros de paginação para o backend
            const resposta = await fetch(`http://localhost:3000/alunos?page=${page}&limit=${limit}`);

            if (!resposta.ok) throw new Error("Erro ao buscar alunos!");

            const data = await resposta.json();

            // Limpa a tabela de alunos antes de preencher com os dados
            tabelaAlunos.innerHTML = "";

            // Preenche a tabela com os dados dos alunos
            data.alunos.forEach(aluno => {
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

            // Atualiza totalPages após carregar a lista
            totalPages = Math.ceil(data.total / limit);

            // Atualiza os controles de navegação
            updatePaginationControls();

            console.log("✅ Lista de alunos carregada com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao carregar alunos:", error);
        }
    }

    // Função para atualizar os controles de navegação de página
    function updatePaginationControls() {
        paginationControls.innerHTML = "";

        // Se houver páginas anteriores
        if (currentPage > 1) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="prevPageBtn">Anterior</button>`;
        }

        // Exibe a página atual
        paginationControls.innerHTML += `<span> Página ${currentPage} de ${totalPages} </span>`;

        // Se houver páginas seguintes
        if (currentPage < totalPages) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="nextPageBtn">Próxima</button>`;
        }

        // Eventos para navegação de página
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
                carregarAlunos(currentPage);  // Recarrega a lista de alunos na página atual
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
                carregarAlunos(currentPage);  // Recarrega a lista de alunos na página atual
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
                carregarAlunos(currentPage);  // Recarrega a lista de alunos na página atual
                bootstrap.Modal.getInstance(document.getElementById("modalEditarAluno")).hide();
            } else {
                alert("❌ Erro ao atualizar aluno!");
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar aluno:", error);
        }
    }

    // Função para lidar com o upload de CSV
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
                    alert(data.message);
                    carregarAlunos(currentPage);  // Recarrega a lista de alunos na página atual
                })
                .catch(error => {
                    alert("Erro ao enviar o arquivo.");
                    console.error("Erro:", error);
                });
        } else {
            alert("Por favor, selecione um arquivo CSV.");
        }
    }

    // Carrega os alunos no início
    carregarAlunos();
}

// Inicializa automaticamente assim que o script for carregado
initAlunos();
