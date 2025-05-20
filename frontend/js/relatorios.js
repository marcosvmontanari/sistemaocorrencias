console.log("🔹 Script relatorios.js carregado como módulo!");

// 🔸 Função principal chamada ao importar este módulo
export function init() {
    console.log("🔸 Inicializando módulo relatorios.js");

    // ✅ Verifica se o usuário está autenticado e tem permissão
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario || (usuario.tipo !== "ADMIN" && usuario.tipo !== "GESTOR DE OCORRÊNCIAS")) {
        console.error("❌ Acesso negado! Apenas administradores ou gestores de ocorrências podem acessar esta página.");
        window.location.href = "../dashboard.html";
        return;
    }

    // ✅ Atualiza o nome do usuário na navbar
    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }

    // ✅ Carrega filtros ao abrir o módulo
    carregarFiltros();

    // ✅ Eventos de clique para buscar e gerar relatórios
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnExportarPDF = document.getElementById("btnExportarPDF");

    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", function (event) {
            event.preventDefault();
            buscarRelatorios();
        });
    }

    if (btnExportarPDF) {
        btnExportarPDF.addEventListener("click", function () {
            gerarRelatorioPDF();
        });
    }

    // ✅ Ativa o Select2 no campo Tipo de Infração
    $('#tipo_infracao').select2({
        placeholder: "Selecione o tipo de infração",
        allowClear: true,
        width: '100%',
        theme: 'bootstrap5',
        dropdownCssClass: 'select2-dropdown-scroll'
    });
}

// 🔸 Função para carregar a lista de alunos, servidores, cursos e turmas no select
async function carregarFiltros() {
    try {
        // Alunos
        const alunosRes = await fetch(`${BASE_URL}/alunos?limit=10000`);
        const alunosData = await alunosRes.json();
        const selectAluno = document.getElementById("aluno");

        selectAluno.innerHTML = `<option value="">Todos</option>`;
        alunosData.alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });

        // Servidores
        const servidoresRes = await fetch(`${BASE_URL}/servidores?page=1&limit=10000`);
        const servidoresData = await servidoresRes.json();
        const selectServidor = document.getElementById("servidor");

        selectServidor.innerHTML = `<option value="">Todos</option>`;
        servidoresData.servidores.forEach(servidor => {
            let option = document.createElement("option");
            option.value = servidor.id;
            option.textContent = servidor.nome;
            selectServidor.appendChild(option);
        });

        // Cursos
        const cursosRes = await fetch(`${BASE_URL}/cursos`);
        const cursos = await cursosRes.json();
        const selectCurso = document.getElementById("curso");

        selectCurso.innerHTML = `<option value="">Todos</option>`;
        cursos.forEach(curso => {
            let option = document.createElement("option");
            option.value = curso.id;
            option.textContent = curso.nome;
            selectCurso.appendChild(option);
        });

        // Turmas
        const turmasRes = await fetch(`${BASE_URL}/turmas`);
        const turmas = await turmasRes.json();
        const selectTurma = document.getElementById("turma");

        selectTurma.innerHTML = `<option value="">Todas</option>`;
        turmas.forEach(turma => {
            let option = document.createElement("option");
            option.value = turma.id;
            option.textContent = turma.nome;
            selectTurma.appendChild(option);
        });

        console.log("✅ Filtros carregados com sucesso!");

        // Ativa Select2 em todos
        ['aluno', 'servidor', 'curso', 'turma'].forEach(id => {
            $(`#${id}`).select2({
                placeholder: `Selecione ${id}`,
                allowClear: true,
                width: '100%',
                theme: 'bootstrap5',
                dropdownCssClass: 'select2-dropdown-scroll'
            });
        });

    } catch (error) {
        console.error("❌ Erro ao carregar filtros:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao carregar filtros!',
            text: 'Não foi possível carregar os filtros de alunos, turmas, cursos ou servidores.'
        });
    }
}

// 🔸 Função para buscar e exibir os relatórios na tabela
async function buscarRelatorios() {
    const tipoInfracao = document.getElementById("tipo_infracao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;
    const aluno = document.getElementById("aluno").value;
    const servidor = document.getElementById("servidor").value;
    const curso = document.getElementById("curso").value;
    const turma = document.getElementById("turma").value;

    const url = `${BASE_URL}/relatorios/dados?tipoInfracao=${tipoInfracao}&dataInicio=${dataInicio}&dataFim=${dataFim}&aluno=${aluno}&servidor=${servidor}&curso=${curso}&turma=${turma}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaRelatorios");

        tabela.innerHTML = "";

        if (!dados || dados.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum relatório encontrado.</td></tr>`;
            Swal.fire({
                icon: 'info',
                title: 'Nenhum relatório encontrado!',
                text: 'Tente ajustar os filtros de busca.'
            });
            return;
        }

        dados.forEach(ocorrencia => {
            tabela.innerHTML += `
                <tr>
                    <td>${ocorrencia.aluno}</td>
                    <td>${ocorrencia.infracao}</td>
                    <td>${ocorrencia.local}</td>
                    <td>${ocorrencia.descricao}</td>
                    <td>${formatarDataHora(ocorrencia.data_hora)}</td>
                    <td>${ocorrencia.servidor}</td>
                </tr>
            `;
        });

        console.log(`✅ ${dados.length} ocorrências carregadas.`);

    } catch (error) {
        console.error("❌ Erro ao buscar relatórios:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao buscar relatórios!',
            text: 'Verifique sua conexão e tente novamente.'
        });
    }
}

// 🔸 Função para gerar relatório em PDF
async function gerarRelatorioPDF() {
    const tipoInfracao = document.getElementById("tipo_infracao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;
    const aluno = document.getElementById("aluno").value;
    const servidor = document.getElementById("servidor").value;
    const curso = document.getElementById("curso").value;
    const turma = document.getElementById("turma").value;

    const url = `${BASE_URL}/relatorios/gerar?tipoInfracao=${tipoInfracao}&dataInicio=${dataInicio}&dataFim=${dataFim}&aluno=${aluno}&servidor=${servidor}&curso=${curso}&turma=${turma}`;

    try {
        const resposta = await fetch(url, { method: "GET" });

        if (!resposta.ok) {
            throw new Error("Erro ao gerar relatório PDF.");
        }

        const blob = await resposta.blob();
        const urlBlob = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = urlBlob;
        a.download = "relatorio_ocorrencias.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Swal.fire({
            icon: 'success',
            title: 'Relatório PDF gerado com sucesso!',
            showConfirmButton: false,
            timer: 2000
        });

    } catch (error) {
        console.error("❌ Erro ao gerar relatório PDF:", error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao gerar relatório!',
            text: 'Verifique a conexão ou tente novamente.'
        });
    }
}

// 🔸 Função auxiliar para formatar data/hora
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}
