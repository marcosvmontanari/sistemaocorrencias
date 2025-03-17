console.log("🔹 Script cadastrar_ocorrencia.js carregado corretamente!");

// 🔹 Verifica se o usuário está autenticado no sessionStorage
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuario) {
    console.error("❌ Acesso negado! Redirecionando para o login...");
    window.location.href = "../index.html";
    return;
}

// 🔹 Atualiza o nome do usuário na navbar
const userWelcome = document.getElementById("userWelcome");
if (userWelcome) {
    userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
}

// 🔹 Carrega alunos no select
async function carregarAlunos() {
    try {
        console.log("🔹 Buscando alunos no servidor...");

        const resposta = await fetch("http://localhost:3000/alunos/todos");

        if (!resposta.ok) throw new Error("❌ Falha ao buscar alunos!");

        const data = await resposta.json();  // <- Recebe o objeto completo
        const alunos = data.alunos;          // <- Extrai o array de alunos

        console.log(`✅ ${alunos.length} alunos carregados!`);

        const selectAluno = document.getElementById("aluno");

        if (!selectAluno) {
            console.error("❌ Elemento <select id='aluno'> não encontrado!");
            return;
        }

        // Limpa o select antes de preencher
        selectAluno.innerHTML = `<option value="">Selecione o aluno...</option>`;

        alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });

        // Remove a instância anterior do TomSelect (caso tenha)
        if (selectAluno.tomselect) {
            selectAluno.tomselect.destroy();
        }

        // Inicia o TomSelect para o campo aluno
        new TomSelect("#aluno", {
            create: false,
            sortField: {
                field: "text",
                direction: "asc"
            },
            placeholder: "Selecione o aluno..."
        });

        console.log("✅ TomSelect inicializado para o campo Aluno!");

    } catch (error) {
        console.error("❌ Erro ao carregar alunos:", error);
    }
}

// 🔹 Carrega tipos de infração no select
async function carregarInfracoes() {
    try {
        const resposta = await fetch("http://localhost:3000/infracoes");
        const infracoes = await resposta.json();

        const selectInfracao = document.getElementById("tipo_infracao");

        // Limpa o select antes de preencher
        selectInfracao.innerHTML = `<option value="">Selecione a infração...</option>`;

        infracoes.forEach(infracao => {
            let option = document.createElement("option");
            option.value = infracao.id;
            option.textContent = `${infracao.tipo} - ${infracao.descricao}`;
            selectInfracao.appendChild(option);
        });

        // Remove a instância anterior do TomSelect (caso tenha)
        if (selectInfracao.tomselect) {
            selectInfracao.tomselect.destroy();
        }

        // Inicializa o TomSelect após carregar as infrações
        new TomSelect("#tipo_infracao", {
            create: false,
            sortField: {
                field: "text",
                direction: "asc"
            },
            placeholder: "Selecione a infração..."
        });

        console.log("✅ TomSelect inicializado para o campo Infração!");

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
    sessionStorage.removeItem("usuario"); // Agora usando sessionStorage
    window.location.href = "../index.html";
}

// 🔹 Carrega os dados ao iniciar
carregarAlunos();
carregarInfracoes();
