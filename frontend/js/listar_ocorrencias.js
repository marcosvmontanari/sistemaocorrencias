console.log("🔹 listar_ocorrencias.js carregado com sucesso!");

// ✅ Função inicial chamada pelo dashboard.js após carregar o HTML
export async function init() {
    console.log("🔸 Inicializando módulo listar_ocorrencias.js");

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario) {
        console.error("❌ ERRO: Usuário não encontrado! Redirecionando para login...");
        window.location.href = "../index.html";
        return;
    }

    const tabelaOcorrencias = document.getElementById("tabelaOcorrencias");
    const inputBusca = document.getElementById("inputBuscaOcorrencias");
    const paginationControls = document.getElementById("paginationOcorrencias");

    if (!tabelaOcorrencias || !inputBusca || !paginationControls) {
        console.error("❌ Elementos da página de ocorrências não encontrados!");
        return;
    }

    let ocorrenciasData = [];
    let termoBusca = "";
    let currentPage = 1;
    let totalPages = 1;

    inputBusca.addEventListener("input", () => {
        termoBusca = inputBusca.value.trim();
        currentPage = 1;
        carregarOcorrencias(currentPage);
    });

    async function carregarOcorrencias(page = 1, limit = 10) {
        try {
            let url = `${BASE_URL}/ocorrencias?page=${page}&limit=${limit}`;
            if (termoBusca !== "") {
                url += `&busca=${encodeURIComponent(termoBusca)}`;
            }

            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error("Erro ao buscar ocorrências!");

            const data = await resposta.json();

            ocorrenciasData = data.ocorrencias || [];
            tabelaOcorrencias.innerHTML = "";

            if (ocorrenciasData.length === 0) {
                tabelaOcorrencias.innerHTML = `
                    <tr><td colspan="9" class="text-center">Nenhuma ocorrência encontrada.</td></tr>
                `;
                totalPages = 1;
                updatePaginationControls();
                return;
            }

            ocorrenciasData.forEach(ocorrencia => {
                tabelaOcorrencias.innerHTML += `
                    <tr>
                        <td>${ocorrencia.aluno_nome}</td>
                        <td>${ocorrencia.infracao_tipo}</td>
                        <td>${ocorrencia.descricao}</td>
                        <td>${ocorrencia.local}</td>
                        <td>${ocorrencia.servidor_nome}</td>
                        <td>${formatarDataHora(ocorrencia.data_hora)}</td>
                        <td>
  ${ocorrencia.imagem
                        ? `<i class="fas fa-image text-primary" style="cursor: pointer;" 
           onclick="mostrarImagemModal('${BASE_URL}/uploads/${ocorrencia.imagem}')"
           title="Ver imagem"></i>`
                        : '-'}
</td>
                        <td class="action-column">
                            ${usuario.tipo === "ADMIN" ? `
                                <i class="fas fa-edit text-warning" style="cursor: pointer;" data-id="${ocorrencia.id}" data-descricao="${ocorrencia.descricao}" data-local="${ocorrencia.local}"></i>
                                <i class="fas fa-trash-alt text-danger ms-2" style="cursor: pointer;" data-id="${ocorrencia.id}"></i>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            });

            totalPages = Math.ceil(data.total / limit);
            updatePaginationControls();
            addEventListeners();

        } catch (error) {
            console.error("❌ Erro ao carregar ocorrências:", error);
            Swal.fire("Erro", "Erro ao carregar as ocorrências!", "error");
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
                carregarOcorrencias(currentPage);
            }
        });

        document.getElementById("nextPageBtn")?.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                carregarOcorrencias(currentPage);
            }
        });
    }

    function addEventListeners() {
        document.querySelectorAll('.fa-edit').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const descricao = button.getAttribute('data-descricao');
                const local = button.getAttribute('data-local');
                abrirModalEdicao(id, descricao, local);
            });
        });

        document.querySelectorAll('.fa-trash-alt').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                excluirOcorrencia(id);
            });
        });
    }

    function abrirModalEdicao(id, descricao, local) {
        document.getElementById("editarOcorrenciaId").value = id;
        document.getElementById("editarDescricao").value = descricao;
        document.getElementById("editarLocal").value = local;

        const modal = new bootstrap.Modal(document.getElementById("modalEditarOcorrencia"));
        modal.show();
    }

    async function salvarEdicao() {
        const id = document.getElementById("editarOcorrenciaId").value;
        const descricao = document.getElementById("editarDescricao").value.trim();
        const local = document.getElementById("editarLocal").value.trim();

        if (!descricao || !local) {
            Swal.fire("Atenção", "Preencha todos os campos!", "warning");
            return;
        }

        try {
            const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descricao, local })
            });

            if (resposta.ok) {
                Swal.fire("Sucesso", "Ocorrência atualizada com sucesso!", "success");
                bootstrap.Modal.getInstance(document.getElementById("modalEditarOcorrencia")).hide();
                carregarOcorrencias(currentPage);
            } else {
                Swal.fire("Erro", "Falha ao atualizar ocorrência.", "error");
            }

        } catch (error) {
            console.error("❌ Erro ao salvar edição:", error);
            Swal.fire("Erro", "Erro ao conectar ao servidor.", "error");
        }
    }

    async function excluirOcorrencia(id) {
        const confirmacao = await Swal.fire({
            title: "Tem certeza?",
            text: "Esta ação não poderá ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar"
        });

        if (!confirmacao.isConfirmed) return;

        try {
            const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                Swal.fire("Excluído!", "Ocorrência removida.", "success");
                carregarOcorrencias(currentPage);
            } else {
                Swal.fire("Erro", "Falha ao excluir a ocorrência.", "error");
            }

        } catch (error) {
            console.error("❌ Erro ao excluir ocorrência:", error);
            Swal.fire("Erro", "Erro ao conectar ao servidor.", "error");
        }
    }

    // Evento salvar no modal
    document.getElementById("btnSalvarEdicaoOcorrencia").addEventListener("click", salvarEdicao);

    // Inicialização de dados
    carregarOcorrencias(currentPage);
}

// ✅ Função para exibir imagem em um modal
window.mostrarImagemModal = function (imagem) {
    const modal = new bootstrap.Modal(document.getElementById("modalVisualizarImagem"));
    const imgElement = document.getElementById("imagemModal");

    imgElement.src = imagem;
    modal.show();
};

window.mostrarImagemModal = mostrarImagemModal;

// ✅ Função auxiliar para formatar data e hora no padrão brasileiro
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}
