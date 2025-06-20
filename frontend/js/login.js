console.log("🔹 Script login.js carregado corretamente!");

// 🔸 Verifica se já existe usuário logado (sessão ativa)
const usuarioSessao = JSON.parse(sessionStorage.getItem("usuario"));

if (usuarioSessao) {
    console.log("🔐 Sessão ativa detectada! Redirecionando...");
    window.location.href = "dashboard.html";
}

// 🔸 Seleciona o formulário de login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!email || !senha) {
            showAlert("warning", "Atenção!", "Preencha todos os campos!");
            return;
        }

        console.log("📌 Tentando login com:", { email, senha });

        try {
            const response = await fetch(`${BASE_URL}/servidores/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            console.log("📌 Dados Recebidos:", data);

            if (response.ok) {
                sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

                // ✅ SEMPRE define a página inicial com base no tipo
                const paginaInicial = data.usuario.tipo === "COMISSÃO DISCIPLINAR" ? "comissao.html" : "";
                sessionStorage.setItem("paginaInicial", paginaInicial);

                if (data.usuario.alterou_senha == 0) {
                    abrirModalAlterarSenha();
                } else {
                    window.location.href = "dashboard.html";
                }
            } else {
                showAlert("error", "Erro", data.erro || "Usuário ou senha inválidos!");
            }

        } catch (error) {
            console.error("📌 Erro ao tentar logar:", error);
            showAlert("error", "Erro ao conectar com o servidor!");
        }
    });
} else {
    console.error("❌ Formulário de login não encontrado!");
}

// 🔸 Função para abrir o modal de alterar senha no primeiro login
function abrirModalAlterarSenha() {
    console.log("🔐 Exibindo modal de alteração de senha obrigatória...");
    const modal = new bootstrap.Modal(document.getElementById("modalAlterarSenha"));
    modal.show();
}

// 🔸 Função para alterar a senha (validação e requisição)
async function alterarSenha() {
    const novaSenha = document.getElementById("novaSenha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
    const erroSenha = document.getElementById("erroSenha");

    // Limpa o campo de erro antes de validar
    erroSenha.innerText = "";

    if (!novaSenha || !confirmarSenha) {
        erroSenha.innerText = "Preencha ambos os campos de senha.";
        return;
    }

    if (novaSenha.length < 6) {
        erroSenha.innerText = "A senha deve ter no mínimo 6 caracteres.";
        return;
    }

    if (novaSenha !== confirmarSenha) {
        erroSenha.innerText = "As senhas não coincidem.";
        return;
    }

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    try {
        const resposta = await fetch(`${BASE_URL}/servidores/${usuario.id}/alterarSenha`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha: novaSenha })
        });

        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Senha alterada com sucesso!',
                showConfirmButton: false,
                timer: 2000
            });

            usuario.alterou_senha = 1;
            sessionStorage.setItem("usuario", JSON.stringify(usuario));

            setTimeout(() => {
                const paginaInicial = usuario.tipo === "COMISSÃO DISCIPLINAR" ? "comissao.html" : "";
                sessionStorage.setItem("paginaInicial", paginaInicial);
                window.location.href = "dashboard.html";
            }, 2000);

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao alterar senha!',
                text: 'Tente novamente mais tarde.'
            });
        }

    } catch (error) {
        console.error("❌ Erro ao alterar senha:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao conectar com o servidor!',
            text: 'Verifique sua conexão e tente novamente.'
        });
    }
}

// 🔸 Função auxiliar para exibir notificações (Toast) com SweetAlert2
function showToast(mensagem) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: mensagem,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}
