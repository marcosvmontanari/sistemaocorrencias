console.log("🔹 Script dashboard.js carregado corretamente!");

// ✅ Controla o script carregado dinamicamente
let scriptAtual = null;

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    if (!usuario) {
        console.error("❌ Nenhum usuário logado! Redirecionando para o login...");
        window.location.href = "index.html";
        return;
    }

    const nomeUsuarioElement = document.getElementById("userWelcome");
    if (nomeUsuarioElement) {
        nomeUsuarioElement.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    const menuDashboard = document.getElementById("menuDashboard");

    let menuItens = "";
    if (usuario.tipo === "ADMIN") {
        menuItens = `
            <a href="#" class="list-group-item" data-page="cadastrar_servidores.html">📋 Gerenciar Servidores</a>
            <a href="#" class="list-group-item" data-page="cadastrar_alunos.html">👥 Gerenciar Alunos</a>
            <a href="#" class="list-group-item" data-page="cadastrar_infracoes.html">⚠️ Gerenciar Infrações</a>
            <a href="#" class="list-group-item" data-page="cadastrar_ocorrencia.html">📝 Cadastrar Ocorrência</a>
            <a href="#" class="list-group-item" data-page="relatorios.html">📊 Gerar Relatórios</a>
        `;
    } else {
        menuItens = `
            <a href="#" class="list-group-item" data-page="cadastrar_ocorrencia.html">📝 Cadastrar Ocorrência</a>
            <a href="#" class="list-group-item" data-page="minhas_ocorrencias.html">📂 Minhas Ocorrências</a>
        `;
    }

    menuDashboard.innerHTML = menuItens;

    document.querySelectorAll("#menuDashboard a").forEach(item => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            const page = item.getAttribute("data-page");
            console.log(`📌 Clicado no menu: ${page}`);
            carregarPagina(page);
        });
    });

    if (usuario.alterou_senha === 0) {
        abrirModalAlterarSenha();
    }

    const toggleMenuBtn = document.getElementById("toggleMenu");
    const menuLateral = document.getElementById("menuLateral");
    const conteudoPrincipal = document.getElementById("conteudoPrincipal");

    if (toggleMenuBtn && menuLateral && conteudoPrincipal) {
        toggleMenuBtn.addEventListener("click", () => {
            menuLateral.classList.toggle("minimized");
            conteudoPrincipal.classList.toggle("menu-aberto");
        });
    }
});

// ✅ Função para carregar páginas dinamicamente
async function carregarPagina(pagina) {
    if (!window.sessionIniciada) {
        const script = document.createElement("script");
        script.src = "../js/session.js";
        document.head.appendChild(script);

        window.sessionIniciada = true;
    }

    const conteudoDinamico = document.getElementById("conteudoDinamico");
    const tituloDashboard = document.getElementById("tituloDashboard");
    const alertaInfo = document.querySelector(".alert-info");

    conteudoDinamico.innerHTML = "";
    if (tituloDashboard) tituloDashboard.style.display = "none";
    if (alertaInfo) alertaInfo.style.display = "none";

    try {
        const resposta = await fetch(`pages/${pagina}`);
        if (!resposta.ok) throw new Error(`Erro ao carregar a página: ${pagina}`);

        const html = await resposta.text();
        conteudoDinamico.innerHTML = html;

        console.log(`✅ Conteúdo da página '${pagina}' carregado.`);

        await carregarESexecutarModulo(pagina);
    } catch (error) {
        console.error(`❌ Erro ao carregar a página '${pagina}':`, error);
        conteudoDinamico.innerHTML = `<div class="alert alert-danger">Erro ao carregar a página: ${pagina}</div>`;
    }
}

// ✅ Função para carregar e executar o módulo da página
async function carregarESexecutarModulo(pagina) {
    try {
        let modulo = null;

        switch (pagina) {
            case "cadastrar_servidores.html":
                modulo = await import(`../js/cadastrar_servidores.js?cache=${Date.now()}`);
                if (modulo && typeof modulo.init === "function") {
                    modulo.init();
                }
                break;

            case "cadastrar_alunos.html":
                modulo = await import(`../js/cadastrar_alunos.js?cache=${Date.now()}`);
                if (modulo && typeof modulo.initAlunos === "function") {
                    console.log(`✅ Executando initAlunos() de '${pagina}'`);
                    modulo.initAlunos();
                } else {
                    console.error(`❌ Módulo de '${pagina}' não possui uma função initAlunos().`);
                }
                break;

            case "cadastrar_infracoes.html":
                modulo = await import(`../js/cadastrar_infracoes.js?cache=${Date.now()}`);
                if (modulo && typeof modulo.init === "function") {
                    modulo.init();
                }
                break;

            case "relatorios.html":
                modulo = await import(`../js/relatorios.js?cache=${Date.now()}`);
                if (modulo && typeof modulo.init === "function") {
                    modulo.init();
                }
                break;

            case "cadastrar_ocorrencia.html":
                modulo = await import(`../js/cadastrar_ocorrencia.js?cache=${Date.now()}`);
                if (modulo && typeof modulo.init === "function") {
                    modulo.init();
                }
                break;

            default:
                console.warn(`⚠️ Página '${pagina}' não possui módulo definido.`);
                return;
        }

    } catch (error) {
        console.error(`❌ Erro ao importar o módulo JS para '${pagina}'`, error);
    }
}

// ✅ Modal de alteração de senha no primeiro login
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

// ✅ Função de alterar senha
async function alterarSenha() {
    const novaSenha = document.getElementById("novaSenha").value;
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    if (!novaSenha || novaSenha.length < 6) {
        showAlert("warning", "Senha inválida", "A senha deve ter no mínimo 6 caracteres.", 3000);
        return;
    }

    const resposta = await fetch(`http://localhost:3000/servidores/${usuario.id}/alterarSenha`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: novaSenha })
    });

    if (resposta.ok) {
        showAlert("success", "Senha alterada com sucesso!");
        usuario.alterou_senha = 1;
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        setTimeout(() => window.location.reload(), 2000);
    } else {
        showAlert("error", "Erro ao alterar senha!", "Tente novamente mais tarde.", 4000);
    }
}

// ✅ Função global de alert padrão usando SweetAlert2
function showAlert(icon = 'info', title = '', text = '', timer = 3000) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        toast: icon === 'success' || icon === 'info' || icon === 'warning' ? true : false,
        position: icon === 'success' || icon === 'info' || icon === 'warning' ? 'top-end' : 'center'
    });
}

// ✅ Função de logout
function logout() {
    sessionStorage.removeItem("usuario");
    window.location.href = "index.html";
}
