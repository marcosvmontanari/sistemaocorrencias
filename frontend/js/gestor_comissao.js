console.log("🔹 js/gestor_comissao.js carregado com sucesso!");

export async function init() {
    const tabela = document.getElementById("tabelaGestorComissao");
    const campoBusca = document.getElementById("buscaGestor");

    if (!tabela || !campoBusca) {
        console.error("❌ Elementos da tela de acompanhamento não encontrados.");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/gestor/comissao`);
        if (!resposta.ok) throw new Error("Erro ao buscar dados.");

        const dados = await resposta.json();
        let dadosFiltrados = [...dados];

        renderizarTabela(dadosFiltrados);

        campoBusca.addEventListener("input", () => {
            const termo = campoBusca.value.trim().toLowerCase();
            const filtrados = dados.filter(item =>
                item.nome.toLowerCase().includes(termo)
            );
            dadosFiltrados = filtrados;
            renderizarTabela(filtrados);
        });

    } catch (erro) {
        console.error("❌ Erro ao carregar acompanhamento:", erro);
        tabela.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
    }

    function renderizarTabela(lista) {
        tabela.innerHTML = "";

        if (lista.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum caso encontrado.</td></tr>`;
            return;
        }

        lista.forEach(aluno => {
            const linha = document.createElement("tr");

            const status = aluno.status || "PENDENTE";

            linha.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${aluno.curso} / ${aluno.turma}</td>
            <td><span class="badge bg-${corStatus(status)}">${status}</span></td>
            <td class="text-center">
  <button class="btn btn-sm" style="background-color: #0dcaf0; border: none;" onclick="abrirDetalhes(${aluno.id}, '${aluno.nome}')">
    <i class="fas fa-eye text-white"></i>
  </button>
</td>
          `;

            tabela.appendChild(linha);
        });
    }


    function corStatus(status) {
        switch (status) {
            case "CONCLUÍDO": return "success";
            case "EM ANÁLISE": return "warning text-dark";
            default: return "secondary";
        }
    }
}

window.abrirDetalhes = function (alunoId, nomeAluno) {
    sessionStorage.setItem("alunoIdComissao", alunoId);
    sessionStorage.setItem("alunoNomeComissao", nomeAluno);
    sessionStorage.setItem("paginaInicial", "comissao_detalhes.html");
    location.reload(); // ou carregarPagina("comissao_detalhes.html"); se preferir
};

// Executa init automaticamente
init();
