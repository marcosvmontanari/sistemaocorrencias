console.log("🔹 Script listar_ocorrencias.js carregado!");

export async function init() {
    console.log("🔸 Inicializando módulo listar_ocorrencias.js");

    await carregarOcorrencias();
}

// 🔸 Carrega a lista de ocorrências
async function carregarOcorrencias() {
    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias`);
        if (!resposta.ok) throw new Error("Erro ao buscar ocorrências");

        const dados = await resposta.json();

        // A resposta vem { ocorrencias: [...] }, então acessamos dados.ocorrencias
        const ocorrencias = dados.ocorrencias;

        if (!Array.isArray(ocorrencias)) {
            console.error("Resposta inesperada:", dados);
            return;
        }

        ocorrencias.forEach(ocorrencia => {
            preencherTabelaOcorrencias(ocorrencia);
        });

    } catch (error) {
        console.error("Erro ao carregar ocorrências:", error);
    }
}

// 🔸 Preenche a tabela de ocorrências
function preencherTabelaOcorrencias(ocorrencias) {
    const tbody = document.querySelector("#tabelaOcorrencias tbody");
    tbody.innerHTML = "";

    ocorrencias.forEach(ocorrencia => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${ocorrencia.id}</td>
            <td>${ocorrencia.aluno_nome}</td>
            <td>${ocorrencia.infracao_tipo}</td>
            <td>${ocorrencia.descricao}</td>
            <td>${ocorrencia.local}</td>
            <td>${ocorrencia.servidor_nome}</td>
            <td>${formatarDataHora(ocorrencia.data_hora)}</td>
            <td>${ocorrencia.imagem ? `<a href="${BASE_URL}/uploads/${ocorrencia.imagem}" target="_blank">Ver</a>` : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirModalEdicao(${ocorrencia.id}, '${ocorrencia.descricao}', '${ocorrencia.local}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="confirmarExclusao(${ocorrencia.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// 🔸 Formata a data/hora no padrão brasileiro
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}

// 🔸 Abre o modal de edição
window.abrirModalEdicao = (id, descricao, local) => {
    document.getElementById("editarOcorrenciaId").value = id;
    document.getElementById("editarDescricao").value = descricao;
    document.getElementById("editarLocal").value = local;

    const modal = new bootstrap.Modal(document.getElementById("modalEditarOcorrencia"));
    modal.show();
}

// 🔸 Salva as alterações
window.salvarEdicaoOcorrencia = async () => {
    const id = document.getElementById("editarOcorrenciaId").value;
    const descricao = document.getElementById("editarDescricao").value.trim();
    const local = document.getElementById("editarLocal").value.trim();

    if (!descricao || !local) {
        Swal.fire("Preencha todos os campos!", "", "warning");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, local })
        });

        if (resposta.ok) {
            Swal.fire("Sucesso!", "Ocorrência atualizada.", "success");
            document.querySelector("#modalEditarOcorrencia .btn-secondary").click(); // Fecha o modal
            carregarOcorrencias();
        } else {
            Swal.fire("Erro!", "Falha ao atualizar ocorrência.", "error");
        }
    } catch (error) {
        console.error("❌ Erro ao salvar edição:", error);
        Swal.fire("Erro!", "Erro de conexão.", "error");
    }
}

// 🔸 Confirma e exclui ocorrência
window.confirmarExclusao = (id) => {
    Swal.fire({
        title: "Tem certeza?",
        text: "Esta ação não pode ser desfeita!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (result.isConfirmed) {
            await excluirOcorrencia(id);
        }
    });
}

async function excluirOcorrencia(id) {
    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            Swal.fire("Excluído!", "Ocorrência removida.", "success");
            carregarOcorrencias();
        } else {
            Swal.fire("Erro!", "Falha ao excluir ocorrência.", "error");
        }
    } catch (error) {
        console.error("❌ Erro ao excluir ocorrência:", error);
        Swal.fire("Erro!", "Erro de conexão.", "error");
    }
}
