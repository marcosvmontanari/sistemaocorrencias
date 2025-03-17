console.log("🔹 Script login.js carregado corretamente!");

// 🔸 Verifica se já existe usuário logado (sessão ativa)
const usuarioSessao = JSON.parse(sessionStorage.getItem("usuario"));

if (usuarioSessao) {
    console.log("🔐 Sessão ativa detectada! Redirecionando...");
    window.location.href = "dashboard.html";
}

// 🔸 Seleciona o formulário
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!email || !senha) {
            showToast("Preencha todos os campos!");
            return;
        }

        console.log("📌 Tentando login com:", { email, senha });

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();
            console.log("📌 Dados Recebidos:", data);

            if (response.ok) {
                // 🔸 Armazena os dados no sessionStorage (sessão temporária)
                sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

                if (data.usuario.alterou_senha == 0) {
                    abrirModalAlterarSenha();
                } else {
                    window.location.href = "dashboard.html";
                }
            } else {
                showToast(data.erro || "Usuário ou senha inválidos!");
            }

        } catch (error) {
            console.error("📌 Erro ao tentar logar:", error);
            showToast("Erro ao conectar com o servidor!");
        }
    });
} else {
    console.error("❌ Formulário de login não encontrado!");
}

// 🔸 Função para abrir o modal de alterar senha
function abrirModalAlterarSenha() {
    const modal = new bootstrap.Modal(document.getElementById("modalAlterarSenha"));
    modal.show();
}

// 🔸 Função para alterar a senha
async function alterarSenha() {
    const novaSenha = document.getElementById("novaSenha").value.trim();

    if (!novaSenha || novaSenha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    try {
        const resposta = await fetch(`http://localhost:3000/servidores/${usuario.id}/alterarSenha`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha: novaSenha })
        });

        if (resposta.ok) {
            alert("✅ Senha alterada com sucesso!");

            usuario.alterou_senha = 1;
            sessionStorage.setItem("usuario", JSON.stringify(usuario));

            window.location.href = "dashboard.html";
        } else {
            alert("❌ Erro ao alterar senha!");
        }

    } catch (error) {
        console.error("❌ Erro ao alterar senha:", error);
        alert("Erro ao conectar com o servidor.");
    }
}

// 🔸 Função auxiliar para exibir notificações (Toast)
function showToast(mensagem) {
    alert(mensagem); // Aqui você pode integrar um toast customizado futuramente
}
