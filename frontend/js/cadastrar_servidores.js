console.log("🔹 cadastrar_servidores.js (Módulo) carregado corretamente!");

// ✅ Função principal de inicialização do módulo
async function initServidores() {
    const usuario = JSON.parse(sessionStorage.getItem("usuario")); // Alterado para sessionStorage
    if (!usuario) {
        console.error("❌ ERRO: Usuário não encontrado no sessionStorage! Redirecionando para login...");
        window.location.href = "../index.html";
        return;
    }

    const tabelaServidores = document.getElementById("tabelaServidores");
    const btnCadastrarServidor = document.getElementById("btnCadastrarServidor");
    const btnSalvarEdicao = document.getElementById("btnSalvarEdicaoServidor");
    const formUploadCSVServidor = document.getElementById("formUploadCSVServidor");
    const paginationControls = document.getElementById("pagination");
    const inputBusca = document.getElementById("inputBuscaServidores");

    if (!tabelaServidores || !btnCadastrarServidor || !btnSalvarEdicao || !formUploadCSVServidor || !paginationControls || !inputBusca) {
        console.error("❌ Elementos da página de servidores não encontrados!");
        return;
    }

    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    btnCadastrarServidor.addEventListener("click", cadastrarServidor);
    btnSalvarEdicao.addEventListener("click", salvarEdicao);
    formUploadCSVServidor.addEventListener("submit", handleCSVUpload);

    let currentPage = 1;
    let totalPages = 1;
    let termoBusca = "";

    // 🔹 Evento de busca no input
    inputBusca.addEventListener("input", () => {
        termoBusca = inputBusca.value.trim();
        currentPage = 1;
        carregarServidores(currentPage);
    });

    // ✅ Função para carregar a lista de servidores com paginação e busca
    async function carregarServidores(page = 1, limit = 10) {
        try {
            console.log("📦 Carregando servidores...");

            let url = `${BASE_URL}/servidores?page=${page}&limit=${limit}`;
            if (termoBusca !== "") {
                url += `&busca=${encodeURIComponent(termoBusca)}`;
            }

            const resposta = await fetch(url);

            if (!resposta.ok) throw new Error("Erro ao buscar servidores!");

            const data = await resposta.json();

            tabelaServidores.innerHTML = "";

            if (!data.servidores || data.servidores.length === 0) {
                tabelaServidores.innerHTML = `
                    <tr><td colspan="5" class="text-center">Nenhum servidor encontrado.</td></tr>
                `;
                totalPages = 1;
                updatePaginationControls();
                return;
            }

            data.servidores.forEach(servidor => {
                tabelaServidores.innerHTML += `
                    <tr>
                        <td>${servidor.nome}</td>
                        <td>${servidor.email}</td>
                        <td>${servidor.siape}</td>
                        <td>${servidor.tipo}</td>
                        <td class="action-column">
                            <i class="fas fa-edit text-warning" data-id="${servidor.id}" style="cursor: pointer;" id="btnEditar"></i>
                            <i class="fas fa-trash-alt text-danger" data-id="${servidor.id}" style="cursor: pointer;" id="btnExcluir"></i>
                            <i class="fas fa-key text-info" data-id="${servidor.id}" style="cursor: pointer;" id="btnResetarSenha"></i>
                        </td>
                    </tr>
                `;
            });

            totalPages = Math.ceil(data.total / limit);

            updatePaginationControls();
            addEventListeners();

            console.log("✅ Lista de servidores carregada com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao carregar servidores:", error);
        }
    }

    // ✅ Atualiza os controles de paginação
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
                carregarServidores(currentPage);
            }
        });

        document.getElementById("nextPageBtn")?.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                carregarServidores(currentPage);
            }
        });
    }

    // ✅ Adiciona os eventos aos ícones
    function addEventListeners() {
        document.querySelectorAll("#btnEditar").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                abrirModalEdicao(id);
            });
        });

        document.querySelectorAll("#btnExcluir").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                excluirServidor(id);
            });
        });

        document.querySelectorAll("#btnResetarSenha").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                resetarSenha(id);
            });
        });
    }

    async function cadastrarServidor() {
        const nome = document.getElementById("nome")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const siape = document.getElementById("siape")?.value.trim();
        const tipo = document.getElementById("tipo")?.value;

        console.log("🔸 Dados preenchidos:", { nome, email, siape, tipo });

        if (!nome || !email || !siape || !tipo) {
            showAlert("warning", "⚠️ Preencha todos os campos antes de cadastrar.");
            return;
        }

        try {
            const resposta = await fetch(`${BASE_URL}/servidores/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, siape, tipo })
            });

            if (resposta.ok) {
                showAlert("success", "✅ Servidor cadastrado com sucesso!");
                document.getElementById("formServidor").reset();
                carregarServidores(currentPage);
            } else {
                const erro = await resposta.json();
                showAlert("error", `❌ Erro ao cadastrar servidor: ${erro.erro || "Erro desconhecido"}`);
            }
        } catch (error) {
            console.error("❌ Erro ao conectar com o servidor:", error);
            showAlert("error", "❌ Erro ao conectar com o servidor!");
        }
    }

    async function excluirServidor(id) {
        const confirmacao = await Swal.fire({
            icon: 'warning',
            title: 'Tem certeza?',
            text: 'Deseja realmente excluir este servidor?',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacao.isConfirmed) return;

        try {
            const resposta = await fetch(`${BASE_URL}/servidores/${id}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                showAlert("success", "✅ Servidor excluído com sucesso!");
                carregarServidores(currentPage);
            } else {
                showAlert("error", "❌ Erro ao excluir servidor!");
            }
        } catch (error) {
            console.error("❌ Erro ao excluir servidor:", error);
        }
    }

    function abrirModalEdicao(id) {
        if (!id) return;

        const modal = new bootstrap.Modal(document.getElementById("modalEditarServidor"));
        modal.show();

        document.getElementById("editId").value = id;

        fetch(`${BASE_URL}/servidores/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar dados do servidor');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById("editNome").value = data.nome;
                document.getElementById("editEmail").value = data.email;
                document.getElementById("editSiape").value = data.siape;
                document.getElementById("editTipo").value = data.tipo;
            })
            .catch(error => {
                showAlert("error", "❌ Erro ao carregar dados do servidor para edição.");
                console.error(error);
            });
    }

    async function salvarEdicao() {
        const id = document.getElementById("editId")?.value;
        const nome = document.getElementById("editNome")?.value.trim();
        const email = document.getElementById("editEmail")?.value.trim();
        const siape = document.getElementById("editSiape")?.value.trim();
        const tipo = document.getElementById("editTipo")?.value;

        if (!id || !nome || !email || !siape || !tipo) {
            showAlert("warning", "⚠️ Preencha todos os campos antes de salvar.");
            return;
        }

        try {
            const resposta = await fetch(`${BASE_URL}/servidores/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, siape, tipo })
            });

            if (resposta.ok) {
                showAlert("success", "✅ Servidor atualizado com sucesso!");
                carregarServidores(currentPage);
                bootstrap.Modal.getInstance(document.getElementById("modalEditarServidor")).hide();
            } else {
                showAlert("error", "❌ Erro ao atualizar servidor!");
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar servidor:", error);
        }
    }

    async function resetarSenha(id) {
        const confirmacao = await Swal.fire({
            icon: 'question',
            title: 'Resetar senha?',
            text: 'Deseja resetar a senha deste servidor?',
            showCancelButton: true,
            confirmButtonText: 'Sim, resetar!',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacao.isConfirmed) return;

        try {
            const resposta = await fetch(`${BASE_URL}/servidores/${id}/resetarSenha`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            if (resposta.ok) {
                showAlert("success", "✅ Senha resetada com sucesso!");
                carregarServidores(currentPage);
            } else {
                showAlert("error", "❌ Erro ao resetar a senha!");
            }
        } catch (error) {
            console.error("❌ Erro ao resetar senha:", error);
        }
    }

    async function handleCSVUpload(event) {
        event.preventDefault();
        const fileInput = document.getElementById("fileInputServidor");
        const file = fileInput.files[0];

        if (file && file.name.endsWith(".csv")) {
            const formData = new FormData();
            formData.append("csvFile", file);

            fetch(`${BASE_URL}/servidores/upload-csv`, {
                method: "POST",
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    showAlert("success", data.message);
                    carregarServidores(currentPage);
                })
                .catch(error => {
                    showAlert("error", "Erro ao enviar o arquivo.");
                    console.error("Erro:", error);
                });
        } else {
            showAlert("warning", "Por favor, selecione um arquivo CSV.");
        }
    }

    carregarServidores();
}

// 🔸 Exporta a função initServidores para ser chamada de dashboard.js
export { initServidores as init };
