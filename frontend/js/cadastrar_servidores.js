console.log("🔹 Script cadastrar_servidores.js carregado corretamente!");

// 🔹 Verifica se o usuário está autenticado
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || usuario.tipo !== "ADMIN") {
    console.error("❌ Acesso negado! Apenas administradores podem acessar esta página.");
    window.location.href = "../dashboard.html";
}

// 🔹 Atualiza o nome do usuário na navbar
document.getElementById("userWelcome").textContent = `Bem-vindo, ${usuario.nome}`;

// 🔹 Captura o formulário
const formServidor = document.getElementById("formServidor");

// 🔹 Evento para cadastrar um servidor
formServidor.addEventListener("submit", async function (event) {
    event.preventDefault();

    // captura correta dos valores dos campos do formulário
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const siape = document.getElementById("siape").value;
    const tipo = document.getElementById("tipo").value; // tipo agora é obtido do formulário

    console.log("📌 Dados enviados:", { nome, email, siape, tipo });

    try {
        const resposta = await fetch("http://localhost:3000/servidores/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, siape, tipo }) // ✅ Incluído campo "tipo"
        });

        if (resposta.ok) {
            alert("✅ Servidor cadastrado com sucesso!");
            window.location.reload();
        } else {
            const erro = await resposta.json();
            alert("Erro no cadastro: " + erro.mensagem);
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao conectar com o servidor!");
    }
});


// 🔹 Função para carregar a lista de servidores
async function carregarServidores() {
    try {
        const resposta = await fetch("http://localhost:3000/servidores");
        const servidores = await resposta.json();

        const tabelaServidores = document.getElementById("tabelaServidores");
        tabelaServidores.innerHTML = "";

        servidores.forEach(servidor => {
            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${servidor.id}</td>
                <td>${servidor.nome}</td>
                <td>${servidor.email}</td>
                <td>${servidor.siape}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarServidor(${servidor.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirServidor(${servidor.id})">Excluir</button>
                </td>
            `;
            tabelaServidores.appendChild(linha);
        });

    } catch (error) {
        console.error("❌ Erro ao carregar servidores:", error);
    }
}

// 🔹 Função para excluir um servidor
async function excluirServidor(id) {
    if (confirm("Tem certeza que deseja excluir este servidor?")) {
        try {
            const resposta = await fetch(`http://localhost:3000/servidores/${id}`, { method: "DELETE" });

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
}

// 🔹 Carrega os servidores ao abrir a página
carregarServidores();

// 🔹 Função de Logout
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "../index.html";
}
