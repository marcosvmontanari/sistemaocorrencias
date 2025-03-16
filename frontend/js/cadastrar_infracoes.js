console.log("🔹 cadastrar_infracoes.js (Módulo) carregado corretamente!");

async function init() {
    carregarInfracoes();

    // Formulário de cadastro de infração
    document.getElementById("formInfracao").addEventListener("submit", async function (event) {
        event.preventDefault();
        await cadastrarInfracao();
    });

    // Evento de upload do CSV para cadastro em lote
    document.getElementById("formUploadCSVInfracoes").addEventListener("submit", handleCSVUpload);
}

async function carregarInfracoes() {
    try {
        const resposta = await fetch("http://localhost:3000/infracoes"); // Certifique-se de que essa URL está correta
        const infracoes = await resposta.json();

        const tabela = document.getElementById("tabelaInfracoes");
        tabela.innerHTML = ""; // Limpa a tabela antes de preencher com novos dados

        // Verifique se a resposta tem dados antes de preenchê-los
        if (infracoes.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" class="text-center">Nenhuma infração cadastrada.</td></tr>`;
        } else {
            infracoes.forEach(infracao => {
                tabela.innerHTML += `
                    <tr>
                        <td>${infracao.descricao}</td>
                        <td>${infracao.tipo}</td>
                        <td>
                            <div class="acoes-icons">
                                <!-- Ícones de ação com Font Awesome -->
                                <i class="fas fa-edit text-warning" data-id="${infracao.id}" style="cursor: pointer;"></i>
                                <i class="fas fa-trash-alt text-danger" data-id="${infracao.id}" style="cursor: pointer;"></i>
                            </div>    
                        </td>
                    </tr>
                `;
            });

            // Adicionando eventos de clique diretamente nos ícones de editar e excluir
            tabela.querySelectorAll(".fa-edit").forEach(icon => {
                icon.addEventListener('click', () => {
                    const id = icon.getAttribute("data-id");
                    const infracao = infracoes.find(i => i.id == id);
                    abrirModalEdicao(infracao);
                });
            });

            tabela.querySelectorAll(".fa-trash-alt").forEach(icon => {
                icon.addEventListener('click', () => {
                    const id = icon.getAttribute("data-id");
                    excluirInfracao(id);
                });
            });

        }

    } catch (error) {
        console.error("Erro ao carregar infrações:", error);
    }
}

async function cadastrarInfracao() {
    const descricao = document.getElementById("descricao").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!descricao || !tipo) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/infracoes/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            alert("✅ Infração cadastrada!");
            document.getElementById("formInfracao").reset();
            carregarInfracoes();
        } else {
            alert("❌ Erro ao cadastrar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao cadastrar infração:", error);
    }
}

async function excluirInfracao(id) {
    if (!confirm("Deseja excluir esta infração?")) return;

    try {
        const resposta = await fetch(`http://localhost:3000/infracoes/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("✅ Infração excluída!");
            carregarInfracoes();
        } else {
            alert("❌ Erro ao excluir infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao excluir infração:", error);
    }
}

function abrirModalEdicao(infracao) {
    if (!infracao) return;

    document.getElementById("editId").value = infracao.id;
    document.getElementById("editDescricao").value = infracao.descricao;
    document.getElementById("editTipo").value = infracao.tipo;

    const modalElement = document.getElementById("modalEditarInfracao");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // ADICIONANDO O EVENTO DE CLICK NO BOTÃO "SALVAR" APÓS O MODAL SER ABERTO
    const btnSalvar = modalElement.querySelector("#btnSalvarEdicaoInfracao");
    btnSalvar.onclick = () => salvarEdicao(modal);
}

async function salvarEdicao(modal) {
    const id = document.getElementById("editId").value;
    const descricao = document.getElementById("editDescricao").value.trim();
    const tipo = document.getElementById("editTipo").value;

    if (!descricao || !tipo) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:3000/infracoes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            alert("✅ Infração atualizada!");
            carregarInfracoes();
            modal.hide();
        } else {
            alert("❌ Erro ao atualizar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao atualizar infração:", error);
    }
}

async function handleCSVUpload(event) {
    event.preventDefault();

    // Verifique se o elemento com o ID existe no DOM
    const fileInput = document.getElementById("fileInputInfracao");

    // Verifique se o campo de arquivo está corretamente acessado
    if (!fileInput) {
        console.error("❌ Elemento 'fileInputInfracao' não encontrado!");
        return;
    }

    const file = fileInput.files[0];

    if (file && file.name.endsWith(".csv")) {
        const formData = new FormData();
        formData.append("csvFile", file);

        fetch("http://localhost:3000/infracoes/upload-csv", {  // URL correta para o servidor
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                carregarInfracoes();  // Recarrega a lista de infrações
            })
            .catch(error => {
                alert("Erro ao enviar o arquivo.");
                console.error("Erro:", error);
            });
    } else {
        alert("Por favor, selecione um arquivo CSV.");
    }
}

init();
