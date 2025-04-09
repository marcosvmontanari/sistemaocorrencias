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
    window.currentPage = 1;
    let totalPages = 1;

    inputBusca.addEventListener("input", () => {
        termoBusca = inputBusca.value.trim();
        window.currentPage = 1;
        window.carregarOcorrencias(window.currentPage);
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
        <i class="fas fa-file-pdf text-danger me-2" 
           title="Gerar PDF" 
           onclick="gerarPdfOcorrencia(${ocorrencia.id})"></i>

        <i class="fas fa-edit text-warning me-2"
           title="Editar Ocorrência"
           data-id="${ocorrencia.id}" 
           data-descricao="${ocorrencia.descricao}" 
           data-local="${ocorrencia.local}"></i>

        <i class="fas fa-comment-dots text-info me-2"
           title="Adicionar Feedback"
           data-id="${ocorrencia.id}" 
           onclick="abrirModalFeedback(${ocorrencia.id})"></i>

        <i class="fas fa-trash-alt text-danger" 
           title="Excluir Ocorrência"
           data-id="${ocorrencia.id}"></i>
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

    // ✅ Expondo a função globalmente para uso externo
    window.carregarOcorrencias = carregarOcorrencias;

    function updatePaginationControls() {
        paginationControls.innerHTML = "";

        if (window.currentPage > 1) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="prevPageBtn">Anterior</button>`;
        }

        paginationControls.innerHTML += `<span> Página ${window.currentPage} de ${totalPages} </span>`;

        if (window.currentPage < totalPages) {
            paginationControls.innerHTML += `<button class="btn btn-secondary" id="nextPageBtn">Próxima</button>`;
        }

        document.getElementById("prevPageBtn")?.addEventListener("click", () => {
            if (window.currentPage > 1) {
                window.currentPage--;
                window.carregarOcorrencias(window.currentPage);
            }
        });

        document.getElementById("nextPageBtn")?.addEventListener("click", () => {
            if (window.currentPage < totalPages) {
                window.currentPage++;
                window.carregarOcorrencias(window.currentPage);
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
                window.carregarOcorrencias(window.currentPage);
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
                window.carregarOcorrencias(window.currentPage);
            } else {
                Swal.fire("Erro", "Falha ao excluir a ocorrência.", "error");
            }

        } catch (error) {
            console.error("❌ Erro ao excluir ocorrência:", error);
            Swal.fire("Erro", "Erro ao conectar ao servidor.", "error");
        }
    }

    document.getElementById("btnSalvarEdicaoOcorrencia")?.addEventListener("click", salvarEdicao);
    window.carregarOcorrencias(window.currentPage);
}

// ✅ Exibe imagem no modal
window.mostrarImagemModal = function (imagem) {
    const modal = new bootstrap.Modal(document.getElementById("modalVisualizarImagem"));
    const imgElement = document.getElementById("imagemModal");

    imgElement.src = imagem;
    modal.show();
};

// ✅ Formata data/hora
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}

// ✅ Gera PDF
window.gerarPdfOcorrencia = function (id) {
    const url = `${BASE_URL}/ocorrencias/${id}/pdf`;
    window.open(url, "_blank");
};

// ✅ Modal de feedback com preenchimento automático
window.abrirModalFeedback = async function (id) {
    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}`);
        if (!resposta.ok) throw new Error("Erro ao buscar ocorrência");

        const ocorrencia = await resposta.json();

        // Preenche os campos do modal com os dados atualizados
        document.getElementById("feedbackOcorrenciaId").value = ocorrencia.id;
        document.getElementById("feedbackTexto").value = ocorrencia.feedback || "";

        // Atualiza corretamente o status selecionado no <select>
        const statusSelect = document.getElementById("feedbackStatus");
        if (statusSelect) {
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === ocorrencia.status) {
                    statusSelect.selectedIndex = i;
                    break;
                }
            }
        }

        // Abre o modal
        const modal = new bootstrap.Modal(document.getElementById("modalFeedback"));
        modal.show();

    } catch (error) {
        console.error("❌ Erro ao carregar dados do feedback:", error);
        Swal.fire("Erro", "Não foi possível carregar os dados da ocorrência.", "error");
    }
};


// ✅ Envia feedback para backend
window.salvarFeedback = async function () {
    const id = document.getElementById("feedbackOcorrenciaId").value;
    const texto = document.getElementById("feedbackTexto").value.trim();
    const status = document.getElementById("feedbackStatus").value;

    if (!texto) {
        Swal.fire("Atenção", "O feedback não pode estar vazio.", "warning");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}/feedback`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedback: texto, status })
        });

        if (resposta.ok) {
            Swal.fire("Sucesso", "Feedback atualizado com sucesso!", "success");
            bootstrap.Modal.getInstance(document.getElementById("modalFeedback")).hide();
            window.carregarOcorrencias(window.currentPage); // ✅ corrigido aqui
        } else {
            throw new Error();
        }
    } catch (erro) {
        console.error("❌ Erro ao salvar feedback:", erro);
        Swal.fire("Erro", "Não foi possível salvar o feedback.", "error");
    }
};
