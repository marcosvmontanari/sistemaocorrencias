console.log("🔹 cadastrar_servidores.js (Módulo) carregado corretamente!");

// ✅ Função principal de inicialização do módulo
async function initServidores() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        console.error("❌ ERRO: Usuário não encontrado no localStorage! Redirecionando para login...");
        window.location.href = "../index.html";
        return;
    }

    const tabelaServidores = document.getElementById("tabelaServidores");
    const btnCadastrarServidor = document.getElementById("btnCadastrarServidor");
    const btnSalvarEdicao = document.getElementById("btnSalvarEdicaoServidor");

    if (!tabelaServidores || !btnCadastrarServidor || !btnSalvarEdicao) {
        console.error("❌ Elementos da página de servidores não encontrados!");
        return;
    }

    // Exibe o nome do usuário na navbar
    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    // Eventos de clique
    btnCadastrarServidor.addEventListener("click", cadastrarServidor);
    btnSalvarEdicao.addEventListener("click", salvarEdicao);

    // Inicializa a tabela
    carregarServidores();

    // 🔸 Funções internas

    async function carregarServidores() {
        try {
            console.log("📦 Carregando servidores...");
            const resposta = await fetch("http://localhost:3000/servidores");

            if (!resposta.ok) throw new Error("Erro ao buscar servidores!");

            const servidores = await resposta.json();

            tabelaServidores.innerHTML = "";
            servidores.forEach(servidor => {
                tabelaServidores.innerHTML += `
                    <tr>
                        <td>${servidor.id}</td>
                        <td>${servidor.nome}</td>
                        <td>${servidor.email}</td>
                        <td>${servidor.siape}</td>
                        <td>${servidor.tipo}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" data-id="${servidor.id}">Editar</button>
                            <button class="btn btn-danger btn-sm" data-id="${servidor.id}">Excluir</button>
                        </td>
                    </tr>
                `;
            });

            // Eventos para os botões editar e excluir
            tabelaServidores.querySelectorAll(".btn-warning").forEach(button => {
                button.addEventListener("click", () => {
                    const servidor = servidores.find(s => s.id === parseInt(button.dataset.id));
                    abrirModalEdicao(servidor);
                });
            });

            tabelaServidores.querySelectorAll(".btn-danger").forEach(button => {
                button.addEventListener("click", () => excluirServidor(button.dataset.id));
            });

            console.log("✅ Lista de servidores carregada com sucesso!");
        } catch (error) {
            console.error("❌ Erro ao carregar servidores:", error);
        }
    }

    async function cadastrarServidor() {
        const nome = document.getElementById("nome")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const siape = document.getElementById("siape")?.value.trim();
        const tipo = document.getElementById("tipo")?.value;

        console.log("🔸 Dados preenchidos:", { nome, email, siape, tipo });

        if (!nome || !email || !siape || !tipo) {
            alert("⚠️ Preencha todos os campos antes de cadastrar.");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/servidores/cadastrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, siape, tipo })
            });

            if (resposta.ok) {
                alert("✅ Servidor cadastrado com sucesso!");
                document.getElementById("formServidor").reset();
                carregarServidores();
            } else {
                const erro = await resposta.json();
                alert("❌ Erro ao cadastrar servidor: " + (erro.erro || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("❌ Erro ao conectar com o servidor:", error);
            alert("❌ Erro ao conectar com o servidor!");
        }
    }

    async function excluirServidor(id) {
        if (!confirm("Tem certeza que deseja excluir este servidor?")) return;

        try {
            const resposta = await fetch(`http://localhost:3000/servidores/${id}`, {
                method: "DELETE"
            });

            if (resposta.ok) {
                alert("✅ Servidor excluído com sucesso!");
                carregarServidores();
            } else {
                alert("❌ Erro ao excluir servidor!");
            }
        } catch (error) {
            console.error("❌ Erro ao excluir servidor:", error);
        }
    }

    function abrirModalEdicao(servidor) {
        if (!servidor) return;

        document.getElementById("editId").value = servidor.id;
        document.getElementById("editNome").value = servidor.nome;
        document.getElementById("editEmail").value = servidor.email;
        document.getElementById("editSiape").value = servidor.siape;
        document.getElementById("editTipo").value = servidor.tipo;

        const modal = new bootstrap.Modal(document.getElementById("modalEditarServidor"));
        modal.show();
    }

    async function salvarEdicao() {
        const id = document.getElementById("editId")?.value;
        const nome = document.getElementById("editNome")?.value.trim();
        const email = document.getElementById("editEmail")?.value.trim();
        const siape = document.getElementById("editSiape")?.value.trim();
        const tipo = document.getElementById("editTipo")?.value;

        if (!id || !nome || !email || !siape || !tipo) {
            alert("⚠️ Preencha todos os campos antes de salvar.");
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/servidores/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, siape, tipo })
            });

            if (resposta.ok) {
                alert("✅ Servidor atualizado com sucesso!");
                carregarServidores();
                bootstrap.Modal.getInstance(document.getElementById("modalEditarServidor")).hide();
            } else {
                alert("❌ Erro ao atualizar servidor!");
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar servidor:", error);
        }
    }
}

// ✅ Inicialização automática após o DOM ser montado (depois do HTML ser injetado)
requestAnimationFrame(() => {
    initServidores();
});
