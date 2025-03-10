export function init() {
    carregarInfracoes();

    document.getElementById("formInfracao").addEventListener("submit", async function (event) {
        event.preventDefault();
        await cadastrarInfracao();
    });
}

async function carregarInfracoes() {
    try {
        const resposta = await fetch("http://localhost:3000/infracoes");
        const infracoes = await resposta.json();

        const tabela = document.getElementById("tabelaInfracoes");
        tabela.innerHTML = "";

        infracoes.forEach(infracao => {
            tabela.innerHTML += `
                <tr>
                    <td>${infracao.id}</td>
                    <td>${infracao.descricao}</td>
                    <td>${infracao.tipo}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" data-id="${infracao.id}">Editar</button>
                        <button class="btn btn-danger btn-sm" data-id="${infracao.id}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        tabela.querySelectorAll(".btn-warning").forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute("data-id");
                const infracao = infracoes.find(i => i.id == id);
                abrirModalEdicao(infracao);
            });
        });

        tabela.querySelectorAll(".btn-danger").forEach(button => {
            button.addEventListener('click', () => excluirInfracao(button.getAttribute("data-id")));
        });

    } catch (error) {
        console.error("❌ Erro ao carregar infrações:", error);
    }
}

async function cadastrarInfracao() {
    const descricao = document.getElementById("descricao").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!descricao || !tipo) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/infracoes/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            alert("✅ Infração cadastrada!");
            document.getElementById("formInfracao").reset();
            carregarInfracoes();
        } else {
            alert("❌ Erro ao cadastrar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao cadastrar infração:", error);
    }
}

async function excluirInfracao(id) {
    if (!confirm("Deseja excluir esta infração?")) return;

    try {
        const resposta = await fetch(`http://localhost:3000/infracoes/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("✅ Infração excluída!");
            carregarInfracoes();
        } else {
            alert("❌ Erro ao excluir infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao excluir infração:", error);
    }
}

function abrirModalEdicao(infracao) {
    if (!infracao) return;

    document.getElementById("editId").value = infracao.id;
    document.getElementById("editDescricao").value = infracao.descricao;
    document.getElementById("editTipo").value = infracao.tipo;

    const modalElement = document.getElementById("modalEditarInfracao");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // ADICIONANDO O EVENTO DE CLICK NO BOTÃO "SALVAR" APÓS O MODAL SER ABERTO
    const btnSalvar = modalElement.querySelector("#btnSalvarEdicaoInfracao");
    btnSalvar.onclick = () => salvarEdicao(modal);
}

async function salvarEdicao(modal) {
    const id = document.getElementById("editId").value;
    const descricao = document.getElementById("editDescricao").value.trim();
    const tipo = document.getElementById("editTipo").value;

    if (!descricao || !tipo) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:3000/infracoes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            alert("✅ Infração atualizada!");
            carregarInfracoes();
            modal.hide();
        } else {
            alert("❌ Erro ao atualizar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao atualizar infração:", error);
    }
}
