console.log("🔹 Script relatorios.js carregado corretamente!");

// 🔸 Verifica se o usuário está autenticado no sessionStorage
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuario || usuario.tipo !== "ADMIN") {
    console.error("❌ Acesso negado! Apenas administradores podem acessar esta página.");
    window.location.href = "../dashboard.html";
    return;
}

// 🔸 Atualiza o nome do usuário na navbar
const userWelcome = document.getElementById("userWelcome");
if (userWelcome) {
    userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
}

// 🔸 Função para carregar a lista de alunos e servidores no select
async function carregarFiltros() {
    try {
        // Carregar alunos
        const alunosRes = await fetch("http://localhost:3000/alunos?limit=10000"); // Busca todos sem limite
        const alunosData = await alunosRes.json();
        const selectAluno = document.getElementById("aluno");

        // Limpa o select antes de popular
        selectAluno.innerHTML = `<option value="">Todos</option>`;
        alunosData.alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });

        // Carregar servidores
        const servidoresRes = await fetch("http://localhost:3000/servidores");
        const servidoresData = await servidoresRes.json();
        const selectServidor = document.getElementById("servidor");

        // Limpa o select antes de popular
        selectServidor.innerHTML = `<option value="">Todos</option>`;
        servidoresData.servidores.forEach(servidor => {
            let option = document.createElement("option");
            option.value = servidor.id;
            option.textContent = servidor.nome;
            selectServidor.appendChild(option);
        });

        console.log("✅ Filtros carregados com sucesso!");

        // 🔹 Inicializando Select2 nos campos de Aluno e Servidor
        $('#aluno').select2({
            placeholder: "Selecione o aluno",
            allowClear: true,
            width: '100%'
        });

        $('#servidor').select2({
            placeholder: "Selecione o servidor",
            allowClear: true,
            width: '100%'
        });

    } catch (error) {
        console.error("❌ Erro ao carregar filtros:", error);
    }
}

// 🔸 Função para buscar e exibir os relatórios na tabela
async function buscarRelatorios() {
    const tipoInfracao = document.getElementById("tipo_infracao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;
    const aluno = document.getElementById("aluno").value;
    const servidor = document.getElementById("servidor").value;

    const url = `http://localhost:3000/relatorios/dados?tipoInfracao=${tipoInfracao}&dataInicio=${dataInicio}&dataFim=${dataFim}&aluno=${aluno}&servidor=${servidor}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaRelatorios");

        tabela.innerHTML = "";

        if (!dados || dados.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum relatório encontrado.</td></tr>`;
            return;
        }

        dados.forEach(ocorrencia => {
            tabela.innerHTML += `
                <tr>
                    <td>${ocorrencia.id}</td>
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
    }
}

// 🔸 Função para gerar relatório em PDF
async function gerarRelatorioPDF() {
    const tipoInfracao = document.getElementById("tipo_infracao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;
    const aluno = document.getElementById("aluno").value;
    const servidor = document.getElementById("servidor").value;

    const url = `http://localhost:3000/relatorios/gerar?tipoInfracao=${tipoInfracao}&dataInicio=${dataInicio}&dataFim=${dataFim}&aluno=${aluno}&servidor=${servidor}`;

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

        alert("✅ Relatório em PDF gerado com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao gerar relatório PDF:", error);
        alert("Erro ao conectar com o servidor!");
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

// 🔸 Evento para filtrar ao clicar no botão "Filtrar"
document.getElementById("btnFiltrar").addEventListener("click", function (event) {
    event.preventDefault();
    buscarRelatorios();
});

// 🔸 Evento para gerar o PDF ao clicar no botão "Exportar para PDF"
document.getElementById("btnExportarPDF").addEventListener("click", function () {
    gerarRelatorioPDF();
});

// 🔸 Função de Logout
function logout() {
    console.log("🔹 Logout...");
    sessionStorage.removeItem("usuario");
    window.location.href = "../index.html";
}

// 🔸 Inicialização dos filtros ao carregar a página
carregarFiltros();
