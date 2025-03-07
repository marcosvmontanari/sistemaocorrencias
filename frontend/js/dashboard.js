console.log("🔹 Script dashboard.js carregado corretamente!");

// 🔹 Recupera os dados do usuário logado
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    console.error("❌ Nenhum usuário logado! Redirecionando para o login...");
    window.location.href = "index.html"; // Redireciona para o login se não houver usuário
} else {
    console.log("✅ Usuário logado:", usuario);
}

// 🔹 Obtém o tipo de usuário (ADMIN ou SERVIDOR)
const tipoUsuario = usuario.tipo || "SERVIDOR"; // Se não houver, assume "SERVIDOR" por padrão
console.log("📌 Tipo do usuário identificado:", tipoUsuario);

// 🔹 Atualiza o nome do usuário na navbar
const nomeUsuarioElement = document.getElementById("nomeUsuario");

if (nomeUsuarioElement) {
    nomeUsuarioElement.textContent = usuario.nome; // Insere o nome do usuário na navbar
} else {
    console.warn("⚠️ Elemento para exibir o nome do usuário não encontrado!");
}

// 🔹 Identifica o menu do dashboard
const menuDashboard = document.getElementById("menuDashboard");
console.log("📌 Elemento menuDashboard encontrado?", menuDashboard ? "Sim" : "Não");

// 🔹 Personaliza o menu e funcionalidades do dashboard conforme o tipo de usuário
if (menuDashboard) {
    if (tipoUsuario === "ADMIN") {
        console.log("🛠️ Carregando funcionalidades do ADMIN...");

        menuDashboard.innerHTML = `
            <li><a href="pages/cadastrar_servidores.html">Gerenciar Servidores</a></li>
            <li><a href="pages/cadastrar_alunos.html">Gerenciar Alunos</a></li>
            <li><a href="pages/relatorios.html">Gerar Relatórios</a></li>
            <li><a href="pages/cadastrar_infracoes.html">Cadastrar Infrações</a></li>
            <li><a href="pages/cadastrar_ocorrencia.html">Cadastrar Ocorrência</a></li>
        `;
    } else {
        console.log("🛠️ Carregando funcionalidades do SERVIDOR...");

        menuDashboard.innerHTML = `
            <li><a href="pages/cadastrar_ocorrencia.html">Cadastrar Ocorrência</a></li>
            <li><a href="pages/minhas_ocorrencias.html">Minhas Ocorrências</a></li>
        `;
    }
}

// 🔹 Verifica se o usuário precisa alterar a senha no primeiro login
if (usuario.alterou_senha === 0) {
    abrirModalAlterarSenha();
}

// 🔹 Função para abrir o modal de alteração de senha
function abrirModalAlterarSenha() {
    const modalHtml = `
    <div class="modal fade" id="modalAlterarSenha" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Alterar Senha</h5>
                </div>
                <div class="modal-body">
                    <input type="password" id="novaSenha" placeholder="Nova Senha" class="form-control">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="alterarSenha()">Salvar</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById("modalAlterarSenha"));
    modal.show();
}

// 🔹 Função para alterar senha no backend
async function alterarSenha() {
    const novaSenha = document.getElementById("novaSenha").value;

    const resposta = await fetch(`http://localhost:3000/servidores/${usuario.id}/alterarSenha`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: novaSenha })
    });

    if (resposta.ok) {
        alert("Senha alterada com sucesso!");
        usuario.alterou_senha = 1; // Atualiza localmente para não repetir o modal
        localStorage.setItem("usuario", JSON.stringify(usuario));
        window.location.reload();
    } else {
        alert("Erro ao alterar senha!");
    }
}

// 🔹 Função de Logout
function logout() {
    console.log("🔹 Realizando logout...");
    localStorage.removeItem("usuario"); // Remove os dados do usuário
    window.location.href = "index.html"; // Redireciona para a tela de login
}
