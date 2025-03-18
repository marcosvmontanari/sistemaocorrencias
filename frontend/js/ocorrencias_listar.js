document.addEventListener("DOMContentLoaded", async function () {
    const tabelaOcorrencias = document.getElementById("tabelaOcorrencias");
    const filtroAluno = document.getElementById("filtroAluno");
    const filtroTipo = document.getElementById("filtroTipo");
    const btnFiltrar = document.getElementById("btnFiltrar");

    async function carregarOcorrencias() {
        try {
            const response = await fetch("http://200.17.65.177:3000/ocorrencias/listar");
            const ocorrencias = await response.json();
            exibirOcorrencias(ocorrencias);
        } catch (error) {
            console.error("Erro ao carregar ocorrências:", error);
        }
    }

    function exibirOcorrencias(ocorrencias) {
        tabelaOcorrencias.innerHTML = "";

        if (ocorrencias.length === 0) {
            tabelaOcorrencias.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma ocorrência encontrada.</td></tr>`;
            return;
        }

        ocorrencias.forEach(ocorrencia => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ocorrencia.aluno_nome}</td>
                <td>${ocorrencia.turma}</td>
                <td>${ocorrencia.curso}</td>
                <td>${ocorrencia.tipo}</td>
                <td>${ocorrencia.local}</td>
                <td>${ocorrencia.descricao}</td>
                <td>${new Date(ocorrencia.data_hora).toLocaleString()}</td>
            `;
            tabelaOcorrencias.appendChild(row);
        });
    }

    // Filtragem de ocorrências
    btnFiltrar.addEventListener("click", async function () {
        try {
            const response = await fetch("http://200.17.65.177:3000/ocorrencias/listar");
            let ocorrencias = await response.json();

            const alunoFiltro = filtroAluno.value.toLowerCase();
            const tipoFiltro = filtroTipo.value;

            if (alunoFiltro) {
                ocorrencias = ocorrencias.filter(o => o.aluno_nome.toLowerCase().includes(alunoFiltro));
            }
            if (tipoFiltro) {
                ocorrencias = ocorrencias.filter(o => o.tipo === tipoFiltro);
            }

            exibirOcorrencias(ocorrencias);
        } catch (error) {
            console.error("Erro ao filtrar ocorrências:", error);
        }
    });

    await carregarOcorrencias();
});
