console.log("🔹 Script login.js carregado corretamente!");

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

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
                localStorage.setItem("usuario", JSON.stringify(data.usuario));

                if (data.usuario.alterou_senha == 0) {
                    console.log("🔑 Necessário alterar senha, exibindo modal...");
                    abrirModalAlterarSenha(); // 🔹 Corrigido para abrir modal corretamente
                } else {
                    window.location.href = "dashboard.html";
                }
            } else {
                showToast(data.erro);
            }
        } catch (error) {
            console.error("📌 Erro ao processar JSON:", error);
            showToast("Erro ao processar resposta do servidor!");
        }
    });
} else {
    console.error("❌ Formulário de login não encontrado! Verifique o ID no HTML.");
}

// 🔹 Função para abrir o modal de alterar senha
function abrirModalAlterarSenha() {
    const modal = new bootstrap.Modal(document.getElementById("modalAlterarSenha"));
    modal.show();
}

// 🔹 Função para alterar a senha
async function alterarSenha() {
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    try {
        const resposta = await fetch(`http://localhost:3000/servidores/${usuario.id}/alterarSenha`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha: novaSenha })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("Senha alterada com sucesso! Faça login novamente.");
            localStorage.removeItem("usuario");
            window.location.reload();
        } else {
            alert("Erro ao alterar senha: " + resultado.erro);
        }
    } catch (error) {
        console.error("Erro ao conectar ao servidor:", error);
        alert("Erro ao conectar com o servidor!");
    }
}
