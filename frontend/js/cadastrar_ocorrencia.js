console.log("🔹 Script cadastrar_ocorrencia.js carregado como módulo!");

// 🔹 Função principal que será chamada pelo dashboard.js
export function init() {
    console.log("🔸 Inicializando módulo cadastrar_ocorrencias.js");

    // ✅ Verifica se o usuário está autenticado
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario) {
        console.error("❌ Acesso negado! Redirecionando para o login...");
        window.location.href = "../index.html";
        return;
    }

    // ✅ Atualiza o nome do usuário na navbar
    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    // ✅ Carrega alunos e infrações ao abrir o módulo
    carregarAlunos();
    carregarInfracoes();

    // ✅ Evento de envio do formulário
    const formOcorrencia = document.getElementById("formOcorrencia");
    if (formOcorrencia) {
        formOcorrencia.addEventListener("submit", async function (event) {
            event.preventDefault();
            await cadastrarOcorrencia(usuario);
        });
    }
}

// 🔹 Função para carregar alunos no select
async function carregarAlunos() {
    try {
        console.log("🔹 Buscando alunos no servidor...");

        const resposta = await fetch("http://200.17.65.177:3000/alunos/todos");

        if (!resposta.ok) throw new Error("❌ Falha ao buscar alunos!");

        const data = await resposta.json();
        const alunos = data.alunos;

        console.log(`✅ ${alunos.length} alunos carregados!`);

        const selectAluno = document.getElementById("aluno");
        if (!selectAluno) {
            console.error("❌ Elemento <select id='aluno'> não encontrado!");
            return;
        }

        selectAluno.innerHTML = `<option value="">Selecione o aluno...</option>`;

        alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });

        if (selectAluno.tomselect) {
            selectAluno.tomselect.destroy();
        }

        new TomSelect("#aluno", {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: "Selecione o aluno..."
        });

    } catch (error) {
        console.error("❌ Erro ao carregar alunos:", error);
    }
}

// 🔹 Função para carregar tipos de infração no select
async function carregarInfracoes() {
    try {
        console.log("🔹 Buscando infrações...");

        const resposta = await fetch("http://200.17.65.177:3000/infracoes");
        if (!resposta.ok) throw new Error("❌ Falha ao buscar infrações!");

        const infracoes = await resposta.json();

        const selectInfracao = document.getElementById("tipo_infracao");

        if (!selectInfracao) {
            console.error("❌ Elemento <select id='tipo_infracao'> não encontrado!");
            return;
        }

        selectInfracao.innerHTML = `<option value="">Selecione a infração...</option>`;

        infracoes.forEach(infracao => {
            let option = document.createElement("option");
            option.value = infracao.id;
            option.textContent = `${infracao.tipo} - ${infracao.descricao}`;
            selectInfracao.appendChild(option);
        });

        if (selectInfracao.tomselect) {
            selectInfracao.tomselect.destroy();
        }

        new TomSelect("#tipo_infracao", {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: "Selecione a infração..."
        });

    } catch (error) {
        console.error("❌ Erro ao carregar infrações:", error);
    }
}

// 🔹 Função para enviar o formulário de cadastro de ocorrência
async function cadastrarOcorrencia(usuario) {
    const formData = new FormData();

    formData.append("aluno", document.getElementById("aluno").value);
    formData.append("infracao", document.getElementById("tipo_infracao").value);
    formData.append("local", document.getElementById("local").value);
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("dataHora", document.getElementById("data_hora").value);
    formData.append("servidor", usuario.id);

    const imagem = document.getElementById("imagem").files[0];
    if (imagem) {
        formData.append("imagem", imagem);
    }

    try {
        const resposta = await fetch("http://200.17.65.177:3000/ocorrencias/cadastrar", {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Ocorrência cadastrada com sucesso!',
                showConfirmButton: false,
                timer: 2000
            });
            setTimeout(() => window.location.reload(), 2000);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar ocorrência!',
                text: 'Tente novamente.'
            });
        }
    } catch (error) {
        console.error("❌ Erro ao cadastrar ocorrência:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao conectar com o servidor!',
            text: 'Verifique sua conexão ou tente novamente.'
        });
    }
}

// 🔹 Função de logout (se necessário)
function logout() {
    console.log("🔹 Logout...");
    sessionStorage.removeItem("usuario");
    window.location.href = "../index.html";
}
