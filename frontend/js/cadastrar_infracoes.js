console.log("🔹 Script cadastrar_infracoes.js carregado corretamente!");

// Função para carregar as infrações cadastradas
async function carregarInfracoes() {
    const resposta = await fetch("http://localhost:3000/infracoes");
    const infracoes = await resposta.json();
    const tabelaInfracoes = document.getElementById("tabelaInfracoes");

    tabelaInfracoes.innerHTML = ""; // limpa a tabela antes de carregar

    infracoes.forEach(infracao => {
        tabelaInfracoes.innerHTML += `
            <tr>
                <td>${infracao.id}</td>
                <td>${infracao.descricao}</td>
                <td>${infracao.tipo}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarInfracao(${infracao.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirInfracao(${infracao.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// Evento para cadastrar uma nova infração
document.getElementById("formInfracao").addEventListener("submit", async function (event) {
    event.preventDefault();

    const descricao = document.getElementById("descricao").value;
    const tipo = document.getElementById("tipo").value;

    try {
        const resposta = await fetch("http://localhost:3000/infracoes/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            alert("✅ Infração cadastrada com sucesso!");
            document.getElementById("formInfracao").reset(); // limpa o formulário
            carregarInfracoes(); // atualiza a lista após cadastro
        } else {
            const erro = await resposta.json();
            alert("❌ Erro ao cadastrar infração: " + erro.erro);
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao conectar com o servidor!");
    }
});

// Opcional (se quiser implementar posteriormente):
function editarInfracao(id) {
    alert("Editar infração de ID: " + id);
    // Implementar posteriormente
}

async function excluirInfracao(id) {
    if (confirm("Deseja realmente excluir esta infração?")) {
        const resposta = await fetch(`http://localhost:3000/infracoes/${id}`, { method: "DELETE" });

        if (resposta.ok) {
            alert("✅ Infração excluída com sucesso!");
            carregarInfracoes(); // atualiza após exclusão
        } else {
            alert("❌ Erro ao excluir infração.");
        }
    }
}

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (usuario) {
    document.getElementById("userWelcome").textContent = `Bem-vindo, ${usuario.nome}`;
} else {
    window.location.href = "../index.html"; // Redireciona para login se não estiver logado
}

// Função Logout
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "../index.html";
}

// Carrega automaticamente as infrações quando a página é aberta
carregarInfracoes();
