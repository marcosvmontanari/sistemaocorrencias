console.log("🔹 Script cadastrar_ocorrencia.js carregado como módulo!");

// 🔸 Função principal chamada ao importar este módulo
export function init() {
    console.log("🔸 Inicializando módulo cadastrar_ocorrencias.js");

    // 🔹 Carrega Bootstrap Icons dinamicamente (caso não esteja presente)
    carregarBootstrapIcons(() => {
        carregarAlunos();  // carrega alunos e só depois aplica os ícones
    });

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
    carregarInfracoes();

    // ✅ Evento de envio do formulário de ocorrência
    const formOcorrencia = document.getElementById("formOcorrencia");
    if (formOcorrencia) {
        formOcorrencia.addEventListener("submit", function (event) {
            event.preventDefault();
            cadastrarOcorrencia(usuario);
        });
    }
}

// 🔸 Carrega Bootstrap Icons dinamicamente
function carregarBootstrapIcons(callback) {
    const existeLink = document.querySelector('link[href*="bootstrap-icons"]');
    if (!existeLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css';
        link.onload = () => {
            console.log("✅ Bootstrap Icons carregado.");
            if (callback) callback();
        };
        document.head.appendChild(link);
    } else {
        if (callback) callback();
    }
}

// 🔸 Função para carregar alunos no select (exibindo turma e curso)
async function carregarAlunos() {
    try {
        console.log("🔹 Buscando alunos no servidor...");

        const resposta = await fetch(`${BASE_URL}/alunos/todos`);
        if (!resposta.ok) throw new Error("❌ Falha ao buscar alunos!");

        const data = await resposta.json();
        const alunos = data.alunos;

        console.log("🔸 Dados de alunos recebidos:", alunos);

        const selectAluno = document.getElementById("aluno");
        if (!selectAluno) {
            console.error("❌ Elemento <select id='aluno'> não encontrado!");
            return;
        }

        // Limpa o select e adiciona o item padrão
        selectAluno.innerHTML = `<option value="">Selecione o aluno...</option>`;

        // Popula o select com os alunos
        alunos.forEach(aluno => {
            const turma = aluno.turma || "Sem turma";
            const curso = aluno.curso || "Sem curso";

            const option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = `${aluno.nome} - ${turma} / ${curso}`;

            selectAluno.appendChild(option);
        });

        // ✅ Inicializa o Select2 para o campo Aluno
        $('#aluno').select2({
            theme: 'bootstrap4',
            placeholder: "Selecione os alunos...",
            allowClear: true,
            width: '100%',
            closeOnSelect: false,
            tags: false,
            language: {
                noResults: function () {
                    return "Nenhum aluno encontrado";
                }
            }
        });

        // 🔹 Aplica ícones Bootstrap nas bolhas do Select2
        function aplicarIconesSelect2() {
            document.querySelectorAll('.select2-selection__choice').forEach(choice => {
                if (!choice.querySelector('.bi')) {
                    const icon = document.createElement("i");
                    icon.className = "bi bi-x-lg";
                    icon.style.marginRight = "6px";
                    icon.style.cursor = "pointer";

                    icon.onclick = () => {
                        const removeBtn = choice.querySelector('.select2-selection__choice__remove');
                        if (removeBtn) removeBtn.click();
                    };

                    choice.prepend(icon);
                }
            });
        }

        // ✅ Aplica os ícones após carregar
        setTimeout(aplicarIconesSelect2, 150);

        // ✅ Reaplica ao alterar seleção
        $('#aluno').on('change', aplicarIconesSelect2);

        console.log("✅ Select2 de alunos aplicado com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao carregar alunos:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao carregar alunos!',
            text: 'Verifique sua conexão ou tente novamente.'
        });
    }
}

// 🔸 Função para carregar tipos de infração no select
async function carregarInfracoes() {
    try {
        console.log("🔹 Buscando infrações...");

        const resposta = await fetch(`${BASE_URL}/infracoes`);
        if (!resposta.ok) throw new Error("❌ Falha ao buscar infrações!");

        const infracoes = await resposta.json();

        const selectInfracao = document.getElementById("tipo_infracao");
        if (!selectInfracao) {
            console.error("❌ Elemento <select id='tipo_infracao'> não encontrado!");
            return;
        }

        // Limpa o select e adiciona o item padrão
        selectInfracao.innerHTML = `<option value="">Selecione a infração...</option>`;

        // Popula o select com as infrações
        infracoes.forEach(infracao => {
            const option = document.createElement("option");
            option.value = infracao.id;
            option.textContent = `${infracao.tipo} - ${infracao.descricao}`;

            selectInfracao.appendChild(option);
        });

        // ✅ Inicializa o Select2 para o campo Infração
        $('#tipo_infracao').select2({
            theme: 'bootstrap4',
            placeholder: "Selecione a infração...",
            allowClear: true,
            width: '100%',
            language: {
                noResults: function () {
                    return "Nenhuma infração encontrada";
                }
            }
        });

        console.log("✅ Select2 de infrações aplicado com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao carregar infrações:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao carregar infrações!',
            text: 'Verifique sua conexão ou tente novamente.'
        });
    }
}

// 🔸 Função para enviar o formulário de cadastro de ocorrência
async function cadastrarOcorrencia(usuario) {
    try {
        console.log("🔹 Preparando envio de ocorrência...");

        const formData = new FormData();

        const alunosSelecionados = $('#aluno').val();
        if (!alunosSelecionados || alunosSelecionados.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione pelo menos um aluno!',
            });
            return;
        }

        alunosSelecionados.forEach(id => formData.append("alunos[]", id));

        formData.append("infracao", document.getElementById("tipo_infracao").value);
        formData.append("local", document.getElementById("local").value);
        formData.append("descricao", document.getElementById("descricao").value);
        formData.append("dataHora", document.getElementById("data_hora").value);
        formData.append("servidor", usuario.id);

        const imagem = document.getElementById("imagem").files[0];
        if (imagem) {
            formData.append("imagem", imagem);
        }

        const resposta = await fetch(`${BASE_URL}/ocorrencias/cadastrar`, {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Ocorrência(s) cadastrada(s) com sucesso!',
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

// 🔸 Função de logout (caso necessário)
function logout() {
    console.log("🔹 Logout...");
    sessionStorage.removeItem("usuario");
    window.location.href = "../index.html";
}
