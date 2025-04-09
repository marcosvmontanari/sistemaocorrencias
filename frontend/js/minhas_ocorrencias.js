console.log("🔹 Script minhas_ocorrencias.js carregado corretamente!");

// ✅ Função principal
export async function init() {
    console.log("🔸 Inicializando módulo Minhas Ocorrências");

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario || !usuario.id) {
        console.error("❌ Usuário não encontrado na sessão.");
        return;
    }

    const tabela = document.getElementById("tabelaMinhasOcorrencias");
    if (!tabela) {
        console.error("❌ Elemento da tabela não encontrado.");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/servidor/${usuario.id}`);
        if (!resposta.ok) throw new Error("Erro ao buscar ocorrências.");

        const data = await resposta.json();
        const ocorrencias = data.ocorrencias || [];

        tabela.innerHTML = "";

        if (ocorrencias.length === 0) {
            tabela.innerHTML = `
                <tr><td colspan="8" class="text-center">Nenhuma ocorrência cadastrada ainda.</td></tr>
            `;
            return;
        }

        ocorrencias.forEach(o => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${o.aluno_nome}</td>
                <td>${o.infracao_tipo}</td>
                <td>${o.descricao}</td>
                <td>${o.local}</td>
                <td>${formatarDataHora(o.data_hora)}</td>
                <td>
                    <span class="badge bg-${corStatus(o.status)}" style="cursor: pointer;" 
                          onclick="mostrarFeedback(${o.id})">
                        ${o.status}
                    </span>
                </td>
                <td>
                    ${o.imagem
                    ? `<i class="fas fa-image text-primary" style="cursor:pointer"
                             onclick="mostrarImagemModal('${BASE_URL}/uploads/${o.imagem}')"
                             title="Ver imagem"></i>`
                    : "-"}
                </td>
            `;

            tabela.appendChild(tr);
        });

    } catch (erro) {
        console.error("❌ Erro ao carregar Minhas Ocorrências:", erro);
        tabela.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
    }
}

// ✅ Formata a data/hora
function formatarDataHora(data) {
    return new Date(data).toLocaleString("pt-BR");
}

// ✅ Define a cor do badge com base no status
function corStatus(status) {
    switch (status) {
        case "PENDENTE": return "secondary";
        case "EM ANÁLISE": return "warning";
        case "CONCLUÍDO": return "success";
        default: return "dark";
    }
}

// ✅ Exibe imagem no modal
window.mostrarImagemModal = function (imagemUrl) {
    const modal = new bootstrap.Modal(document.getElementById("modalVisualizarImagem"));
    const img = document.getElementById("imagemModal");

    if (img) img.src = imagemUrl;
    modal.show();
};

// ✅ Exibe o feedback da ocorrência no modal
window.mostrarFeedback = async function (ocorrenciaId) {
    const modal = new bootstrap.Modal(document.getElementById("modalFeedback"));
    const conteudo = document.getElementById("conteudoFeedback");

    conteudo.innerText = "Buscando feedback...";

    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/${ocorrenciaId}`);
        if (!resposta.ok) throw new Error("Erro ao buscar ocorrência");

        const ocorrencia = await resposta.json();
        const texto = ocorrencia.feedback || "Nenhum feedback registrado até o momento.";

        conteudo.innerText = texto;

    } catch (error) {
        console.error("❌ Erro ao buscar feedback:", error);
        conteudo.innerText = "Erro ao carregar feedback.";
    }

    modal.show();
};
