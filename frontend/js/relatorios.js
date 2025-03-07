console.log("🔹 Script relatorios.js carregado corretamente!");

// Verifica se o usuário está autenticado
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || usuario.tipo !== "ADMIN") {
    console.error("❌ Acesso negado! Apenas administradores podem acessar esta página.");
    window.location.href = "../dashboard.html";
}

// Atualiza o nome do usuário na navbar
document.getElementById("userWelcome").textContent = `Bem-vindo, ${usuario.nome}`;

// Função para carregar a lista de alunos e servidores
async function carregarFiltros() {
    try {
        const alunosRes = await fetch("http://localhost:3000/alunos");
        const alunos = await alunosRes.json();
        const selectAluno = document.getElementById("aluno");
        alunos.forEach(aluno => {
            let option = document.createElement("option");
            option.value = aluno.id;
            option.textContent = aluno.nome;
            selectAluno.appendChild(option);
        });

        const servidoresRes = await fetch("http://localhost:3000/servidores");
        const servidores = await servidoresRes.json();
        const selectServidor = document.getElementById("servidor");
        servidores.forEach(servidor => {
            let option = document.createElement("option");
            option.value = servidor.id;
            option.textContent = servidor.nome;
            selectServidor.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar filtros:", error);
    }
}

// Função para buscar e exibir os relatórios na tela antes de exportar
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
        if (dados.length === 0) {
            tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum relatório encontrado.</td></tr>`;
            return;
        }

        dados.forEach(ocorrencia => {
            let row = `
                <tr>
                    <td>${ocorrencia.id}</td>
                    <td>${ocorrencia.aluno}</td>
                    <td>${ocorrencia.infracao}</td>
                    <td>${ocorrencia.local}</td>
                    <td>${ocorrencia.descricao}</td>
                    <td>${ocorrencia.data_hora}</td>
                    <td>${ocorrencia.servidor}</td>
                </tr>
            `;
            tabela.innerHTML += row;
        });
    } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
    }
}

// 🔹 Função para gerar relatório em PDF
async function gerarRelatorioPDF() {
    const tipoInfracao = document.getElementById("tipo_infracao").value;
    const dataInicio = document.getElementById("data_inicio").value;
    const dataFim = document.getElementById("data_fim").value;
    const aluno = document.getElementById("aluno").value;
    const servidor = document.getElementById("servidor").value;

    const url = `http://localhost:3000/relatorios/gerar?tipoInfracao=${tipoInfracao}&dataInicio=${dataInicio}&dataFim=${dataFim}&aluno=${aluno}&servidor=${servidor}`;

    try {
        const resposta = await fetch(url, {
            method: "GET"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao gerar relatório.");
        }

        // Criar o download do arquivo PDF
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
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao conectar com o servidor!");
    }
}

// Evento para filtrar os relatórios antes de exportar
document.getElementById("formRelatorio").addEventListener("submit", function (event) {
    event.preventDefault();
    buscarRelatorios();
});


// Carrega os filtros ao abrir a página
carregarFiltros();

// Função de Logout
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "../index.html";
}
