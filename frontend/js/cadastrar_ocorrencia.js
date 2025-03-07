console.log("🔹 Script cadastrar_ocorrencia.js carregado corretamente!");

// 🔹 Verifica se o usuário está autenticado
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    console.error("❌ Acesso negado! Redirecionando para o login...");
    window.location.href = "../index.html";
}

// 🔹 Atualiza o nome do usuário na navbar
document.getElementById("userWelcome").textContent = `Bem-vindo, ${usuario.nome}`;

// 🔹 Carrega alunos no select
async function carregarAlunos() {
    try {
        const resposta = await fetch("http://localhost:3000/alunos");
        const alunos = await resposta.json();

        const selectAluno = document.getElementById("aluno");
        alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// 🔹 Carrega tipos de infração no select
async function carregarInfracoes() {
    try {
        const resposta = await fetch("http://localhost:3000/infracoes");
        const infracoes = await resposta.json();

        const selectInfracao = document.getElementById("tipo_infracao");
        infracoes.forEach(infracao => {
            let option = document.createElement("option");
            option.value = infracao.id;
            option.textContent = `${infracao.tipo} - ${infracao.descricao}`;
            selectInfracao.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar infrações:", error);
    }
}

// 🔹 Evento de envio do formulário
document.getElementById("formOcorrencia").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(); // Criar um objeto FormData para enviar arquivos

    formData.append("aluno", document.getElementById("aluno").value);
    formData.append("infracao", document.getElementById("tipo_infracao").value);
    formData.append("local", document.getElementById("local").value);
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("dataHora", document.getElementById("data_hora").value);
    formData.append("servidor", usuario.id);

    // Captura a imagem, se houver
    const imagem = document.getElementById("imagem").files[0];
    if (imagem) {
        formData.append("imagem", imagem);
    }

    try {
        const resposta = await fetch("http://localhost:3000/ocorrencias/cadastrar", {
            method: "POST",
            body: formData // Enviar FormData
        });

        if (resposta.ok) {
            alert("✅ Ocorrência cadastrada com sucesso!");
            window.location.reload();
        } else {
            alert("❌ Erro ao cadastrar ocorrência.");
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao conectar com o servidor!");
    }
});

function logout() {
    console.log("🔹 Realizando logout...");
    localStorage.removeItem("usuario"); // Remove os dados do usuário
    window.location.href = "../index.html"; // Redireciona para a tela de login
}

// 🔹 Carrega os dados ao iniciar
carregarAlunos();
carregarInfracoes();
