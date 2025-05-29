console.log("🔹 js/comissao.js carregado com sucesso!");

export async function init() {
    console.log("🔸 Inicializando módulo COMISSÃO DISCIPLINAR");

    const tabelaAlunos = document.getElementById("tabelaAlunosEncaminhados");
    const corpoHistorico = document.getElementById("tabelaHistoricoOcorrencias");
    const inputBusca = document.getElementById("buscaComissao");

    if (!tabelaAlunos || !corpoHistorico) {
        console.error("❌ Elementos da COMISSÃO não encontrados.");
        return;
    }

    let alunosOriginais = [];

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/alunos`);
        const alunos = await resposta.json();
        alunosOriginais = alunos;

        renderizarTabela(alunosOriginais);

        // ✅ Filtro ao digitar no campo de busca
        if (inputBusca) {
            inputBusca.addEventListener("input", () => {
                const termo = inputBusca.value.trim().toLowerCase();
                const filtrados = alunosOriginais.filter(aluno =>
                    aluno.nome.toLowerCase().includes(termo)
                );
                renderizarTabela(filtrados);
            });
        }

    } catch (erro) {
        console.error("❌ Erro ao carregar alunos para a comissão:", erro);
        tabelaAlunos.innerHTML = `
            <tr><td colspan="3" class="text-danger text-center">Erro ao carregar dados.</td></tr>
        `;
    }

    function renderizarTabela(lista) {
        tabelaAlunos.innerHTML = "";

        if (!lista || lista.length === 0) {
            tabelaAlunos.innerHTML = `
                <tr><td colspan="3" class="text-center text-muted">Nenhum aluno encontrado.</td></tr>
            `;
            return;
        }

        lista.forEach(aluno => {
            tabelaAlunos.innerHTML += `
                <tr>
                    <td>${aluno.nome}</td>
                    <td>${aluno.quantidade}</td>
                    <td class="text-center">
                        <button class="btn btn-outline-primary btn-sm" title="Ver histórico"
                            onclick="abrirHistoricoComissao(${aluno.id}, '${aluno.nome}')">
                            <i class="fas fa-search"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

window.abrirHistoricoComissao = async function (alunoId, nomeAluno) {
    const corpoHistorico = document.getElementById("tabelaHistoricoOcorrencias");
    const tituloModal = document.getElementById("modalHistoricoLabel");

    corpoHistorico.innerHTML = `<tr><td colspan="8" class="text-center">Carregando histórico...</td></tr>`;
    tituloModal.textContent = `Histórico de Ocorrências - ${nomeAluno}`;

    const modal = new bootstrap.Modal(document.getElementById("modalHistorico"));
    modal.show();

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/ocorrencias/${alunoId}`);
        const ocorrencias = await resposta.json();

        corpoHistorico.innerHTML = "";

        if (!ocorrencias || ocorrencias.length === 0) {
            corpoHistorico.innerHTML = `
                <tr><td colspan="8" class="text-center text-muted">Nenhuma ocorrência registrada.</td></tr>
            `;
            return;
        }

        ocorrencias.forEach(oc => {
            corpoHistorico.innerHTML += `
                <tr>
                    <td>${oc.tipo_infracao}</td>
                    <td class="text-wrap" style="max-width: 300px;">${oc.infracao_descricao}</td>
                    <td>${oc.local}</td>
                    <td>${formatarDataHora(oc.data_hora)}</td>
                    <td>${oc.servidor_nome}</td>
                    <td>${oc.status}</td>
                    <td>${oc.feedback ? oc.feedback : '<span class="text-muted">Nenhum</span>'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary" title="Enviar Feedback"
                            onclick="abrirModalFeedbackComissao(${oc.id})">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (erro) {
        console.error("❌ Erro ao buscar histórico do aluno:", erro);
        corpoHistorico.innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">Erro ao carregar histórico.</td></tr>
        `;
    }
};

window.abrirModalFeedbackComissao = function (ocorrenciaId) {
    document.getElementById("feedbackOcorrenciaId").value = ocorrenciaId;
    document.getElementById("feedbackTexto").value = "";

    const modal = new bootstrap.Modal(document.getElementById("modalFeedback"));
    modal.show();
};

window.salvarFeedback = async function () {
    const id = document.getElementById("feedbackOcorrenciaId").value;
    const texto = document.getElementById("feedbackTexto").value.trim();

    if (!texto) {
        Swal.fire("Atenção", "O feedback não pode estar vazio.", "warning");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/feedback/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedback: texto })
        });

        if (resposta.ok) {
            Swal.fire("Sucesso", "Feedback enviado com sucesso!", "success");
            bootstrap.Modal.getInstance(document.getElementById("modalFeedback")).hide();
        } else {
            throw new Error("Erro ao salvar feedback");
        }

    } catch (erro) {
        console.error("❌ Erro ao salvar feedback:", erro);
        Swal.fire("Erro", "Erro ao enviar feedback. Tente novamente.", "error");
    }
};

function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}
