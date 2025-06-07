console.log("🔹 js/comissao_detalhes.js carregado com sucesso!");

export async function init() {
    console.log("🔸 Aguardando carregamento do DOM antes de iniciar...");

    // Espera 50ms para garantir que o HTML foi injetado
    await new Promise(resolve => setTimeout(resolve, 50));

    const alunoId = sessionStorage.getItem("alunoIdComissao");
    if (!alunoId) {
        console.error("❌ ID do aluno não encontrado no sessionStorage");
        return;
    }

    const infoAluno = document.getElementById("infoAluno");
    const corpoTabela = document.getElementById("tabelaOcorrenciasAluno");
    const feedbackStatus = document.getElementById("feedbackStatus");
    const feedbackTexto = document.getElementById("feedbackTexto");
    const campoUpload = document.getElementById("campoUploadDocumento");
    const inputArquivo = document.getElementById("arquivoDocumento");
    const containerDocumento = document.getElementById("documentoAnexado");
    const inputIdOcorrencia = document.getElementById("feedbackOcorrenciaId");

    if (!infoAluno || !corpoTabela || !feedbackStatus || !feedbackTexto || !campoUpload || !containerDocumento || !inputIdOcorrencia) {
        console.error("❌ Elementos do DOM ainda não estão prontos.");
        return;
    }

    console.log("✅ DOM carregado, executando init normalmente.");

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/detalhes/${alunoId}`);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!dados || !dados.aluno) {
            infoAluno.innerHTML = `<div class="text-danger">Aluno não encontrado.</div>`;
            return;
        }

        const aluno = dados.aluno;
        const ocorrencias = dados.ocorrencias || [];

        // ℹ️ Dados do aluno
        infoAluno.innerHTML = `
            <strong>Nome:</strong> ${aluno.nome} &nbsp;&nbsp;
            <strong>Curso:</strong> ${aluno.curso || "-"} &nbsp;&nbsp;
            <strong>Turma:</strong> ${aluno.turma || "-"}
        `;

        // 📋 Tabela de ocorrências
        corpoTabela.innerHTML = "";

        if (ocorrencias.length === 0) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">Nenhuma ocorrência registrada para este aluno.</td>
                </tr>
            `;
        } else {
            ocorrencias.forEach(oc => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${oc.tipo_infracao}</td>
                    <td class="text-wrap" style="max-width: 300px;">${oc.infracao_descricao}</td>
                    <td>${oc.local}</td>
                    <td>${formatarDataHora(oc.data_hora)}</td>
                    <td>${oc.servidor_nome}</td>
                `;
                corpoTabela.appendChild(linha);
            });

            const ultima = ocorrencias[0];
            if (ultima) {
                feedbackStatus.value = ultima.status || "PENDENTE";
                feedbackTexto.value = ultima.feedback || "";
                campoUpload.style.display = (ultima.status === "CONCLUÍDO") ? "block" : "none";
                inputIdOcorrencia.value = ultima.id;

                // 📄 Exibe documento se houver
                if (ultima.status === "CONCLUÍDO" && ultima.documento_final) {
                    containerDocumento.innerHTML = `
                        <div class="mt-2">
                            <label class="form-label">Documento Anexado:</label><br>
                            <a href="${ultima.documento_final}" target="_blank" class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-file-pdf me-1"></i> Ver Documento Final
                            </a>
                        </div>
                    `;
                } else {
                    containerDocumento.innerHTML = "";
                }
            }
        }

    } catch (erro) {
        console.error("❌ Erro ao carregar dados do aluno e ocorrências:", erro);
        infoAluno.innerHTML = `<div class="text-danger">Erro ao buscar informações do aluno.</div>`;
    }
}

// 🎯 Mostrar ou esconder campo de upload com base no status
document.getElementById("feedbackStatus").addEventListener("change", () => {
    const status = document.getElementById("feedbackStatus").value;
    const campo = document.getElementById("campoUploadDocumento");
    campo.style.display = (status === "CONCLUÍDO") ? "block" : "none";
});

// 📩 Envio do feedback final
window.salvarFeedback = async function () {
    const id = document.getElementById("feedbackOcorrenciaId").value;
    const texto = document.getElementById("feedbackTexto").value.trim();
    const status = document.getElementById("feedbackStatus").value;
    const arquivo = document.getElementById("arquivoDocumento").files[0];

    if (!texto) {
        Swal.fire("Atenção", "O feedback não pode estar vazio.", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("feedback", texto);
    formData.append("status", status);
    if (status === "CONCLUÍDO" && arquivo) {
        formData.append("documento", arquivo);
    }

    try {
        const resposta = await fetch(`${BASE_URL}/comissao/feedback/${id}`, {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            sessionStorage.setItem("paginaInicial", "comissao.html");
            location.reload();
        } else {
            throw new Error("Erro ao salvar feedback");
        }

    } catch (erro) {
        console.error("❌ Erro ao salvar feedback:", erro);
        Swal.fire("Erro", "Erro ao enviar feedback. Tente novamente.", "error");
    }
};

// 📅 Formata data/hora para exibição
function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}
