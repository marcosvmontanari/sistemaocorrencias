console.log("🔹 js/comissao.js carregado com sucesso!");

export async function init() {
    console.log("🔸 Inicializando módulo COMISSÃO DISCIPLINAR");

    const containerCards = document.getElementById("containerCardsAlunos");
    const inputBusca = document.getElementById("buscaComissao");

    if (!containerCards) {
        console.error("❌ Elementos da COMISSÃO não encontrados.");
        return;
    }

    let dadosOriginais = { graves: [], gravissimas: [] };

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/alunos`);
        const dados = await resposta.json();
        dadosOriginais = dados;

        renderizarCards(dadosOriginais);

        if (inputBusca) {
            inputBusca.addEventListener("input", () => {
                const termo = inputBusca.value.trim().toLowerCase();
                const filtradasGraves = dados.graves.filter(a => a.nome.toLowerCase().includes(termo));
                const filtradasGravissimas = dados.gravissimas.filter(a => a.nome.toLowerCase().includes(termo));
                renderizarCards({ graves: filtradasGraves, gravissimas: filtradasGravissimas });
            });
        }

    } catch (erro) {
        console.error("❌ Erro ao carregar alunos para a comissão:", erro);
        containerCards.innerHTML = `<div class="col-12 text-center text-danger">Erro ao carregar dados.</div>`;
    }

    function obterClasseStatus(status) {
        switch (status) {
            case "CONCLUÍDO":
                return "bg-success-subtle border-success";
            case "EM ANÁLISE":
                return "bg-warning-subtle border-warning";
            default:
                return "bg-light border-secondary";
        }
    }

    function renderizarCards({ graves, gravissimas }) {
        containerCards.innerHTML = "";

        const todos = [...gravissimas, ...graves];

        if (todos.length === 0) {
            containerCards.innerHTML = `<div class="col-12 text-center text-muted">Nenhum caso encaminhado encontrado.</div>`;
            return;
        }

        todos.forEach(aluno => {
            const status = aluno.status || "PENDENTE";
            const classeStatus = obterClasseStatus(status);

            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";
            card.innerHTML = `
                <div class="card shadow-sm h-100 border ${classeStatus}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary">${aluno.nome}</h5>
                        <p class="card-text mb-2">
                            <strong>Ocorrências:</strong> ${aluno.quantidade}<br>
                            <strong>Status:</strong> ${status}
                        </p>
                        <div class="mt-auto">
                            <button class="btn btn-outline-primary w-100" onclick="abrirPaginaDetalhes(${aluno.id}, '${aluno.nome}')">
                                <i class="fas fa-eye me-1"></i> Ver Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;
            containerCards.appendChild(card);
        });
    }
}

window.abrirPaginaDetalhes = function (alunoId, nomeAluno) {
    sessionStorage.setItem("alunoIdComissao", alunoId);
    sessionStorage.setItem("alunoNomeComissao", nomeAluno);
    carregarPagina("comissao_detalhes.html");
};
