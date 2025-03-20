console.log("🔹 session.js carregado!");

// ✅ Proteção para páginas privadas (NÃO colocar no index.html)
function verificarSessao() {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));

    if (!usuario) {
        console.warn("🚫 Sessão não encontrada. Redirecionando para login...");
        window.location.href = "../index.html"; // ou apenas index.html dependendo da estrutura de pastas
    }

    // Atualiza o nome do usuário no elemento userWelcome, se existir
    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome && usuario) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }
}

// ✅ Função de logout (pode ser chamada manualmente ou pelo timer)
function logout() {
    console.log("🔐 Logout efetuado.");
    sessionStorage.removeItem("usuario");
    window.location.href = "../index.html";
}

// ✅ Verificação inicial ao carregar a página
verificarSessao();

/* =====================================================================
🔹 A partir daqui começa o controle de sessão por inatividade
===================================================================== */

// ✅ Impede redeclaração caso o session.js seja carregado mais de uma vez
if (typeof TEMPO_MAXIMO_INATIVIDADE === "undefined") {

    // Tempo máximo de inatividade em MILISSEGUNDOS (exemplo: 10 minutos)
    const TEMPO_MAXIMO_INATIVIDADE = 10 * 60 * 1000; // 10 minutos
    let timerInatividade = null;

    // 🔸 Função para deslogar automaticamente por inatividade
    function logoutPorInatividade() {

        // ✅ ALERTA ORIGINAL COMENTADO:
        // alert("⏰ Sessão expirada por inatividade! Faça login novamente.");
        // logout();

        // ✅ NOVO ALERTA COM SWEETALERT2
        Swal.fire({
            icon: 'warning',
            title: 'Sessão expirada!',
            text: 'Faça login novamente.',
            confirmButtonText: 'OK'
        }).then(() => {
            logout();
        });
    }

    // 🔸 Função que reinicia o timer sempre que o usuário interage
    function resetarTimerInatividade() {
        if (timerInatividade) clearTimeout(timerInatividade);

        // Cria um novo timer para deslogar após o tempo máximo de inatividade
        timerInatividade = setTimeout(() => {
            logoutPorInatividade();
        }, TEMPO_MAXIMO_INATIVIDADE);
    }

    // 🔸 Eventos que indicam atividade do usuário (podem ser ampliados se quiser)
    window.addEventListener("mousemove", resetarTimerInatividade);
    window.addEventListener("keydown", resetarTimerInatividade);
    window.addEventListener("click", resetarTimerInatividade);
    window.addEventListener("scroll", resetarTimerInatividade);

    // 🔸 Inicia o timer quando o script for carregado
    resetarTimerInatividade();

} else {
    console.warn("⚠️ Script session.js já foi carregado anteriormente. Ignorando duplicação.");
}
