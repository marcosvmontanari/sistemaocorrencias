console.log("🔹 cadastrar_infracoes.js (Módulo) carregado corretamente!");

// ✅ Verifica se o usuário está autenticado no sessionStorage
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuario) {
    console.error("❌ Usuário não autenticado! Redirecionando para a tela de login...");
    window.location.href = "../index.html";
} else {
    const userWelcome = document.getElementById("userWelcome");
    if (userWelcome) {
        userWelcome.textContent = `Bem-vindo, ${usuario.nome}`;
    }
}

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
        const resposta = await fetch(`${BASE_URL}/infracoes`);
        const infracoes = await resposta.json();

        const tabela = document.getElementById("tabelaInfracoes");
        tabela.innerHTML = "";

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
                                <i class="fas fa-edit text-warning" data-id="${infracao.id}" style="cursor: pointer;"></i>
                                <i class="fas fa-trash-alt text-danger" data-id="${infracao.id}" style="cursor: pointer;"></i>
                            </div>    
                        </td>
                    </tr>
                `;
            });

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
        showAlert("warning", "⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL}/infracoes/cadastrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            showAlert("success", "✅ Infração cadastrada!");
            document.getElementById("formInfracao").reset();
            carregarInfracoes();
        } else {
            showAlert("error", "❌ Erro ao cadastrar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao cadastrar infração:", error);
    }
}

async function excluirInfracao(id) {
    const confirmacao = await Swal.fire({
        icon: 'warning',
        title: 'Tem certeza?',
        text: 'Deseja excluir esta infração?',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacao.isConfirmed) return;

    try {
        const resposta = await fetch(`${BASE_URL} /infracoes/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            showAlert("success", "✅ Infração excluída!");
            carregarInfracoes();
        } else {
            showAlert("error", "❌ Erro ao excluir infração.");
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

    const btnSalvar = modalElement.querySelector("#btnSalvarEdicaoInfracao");
    btnSalvar.onclick = () => salvarEdicao(modal);
}

async function salvarEdicao(modal) {
    const id = document.getElementById("editId").value;
    const descricao = document.getElementById("editDescricao").value.trim();
    const tipo = document.getElementById("editTipo").value;

    if (!descricao || !tipo) {
        showAlert("warning", "⚠️ Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch(`${BASE_URL} /infracoes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao, tipo })
        });

        if (resposta.ok) {
            showAlert("success", "✅ Infração atualizada!");
            carregarInfracoes();
            modal.hide();
        } else {
            showAlert("error", "❌ Erro ao atualizar infração.");
        }
    } catch (error) {
        console.error("❌ Erro ao atualizar infração:", error);
    }
}

async function handleCSVUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInputInfracao");

    if (!fileInput) {
        console.error("❌ Elemento 'fileInputInfracao' não encontrado!");
        return;
    }

    const file = fileInput.files[0];

    if (file && file.name.endsWith(".csv")) {
        const formData = new FormData();
        formData.append("csvFile", file);

        fetch(`${BASE_URL}/infracoes/upload-csv`, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                showAlert("success", data.message);
                carregarInfracoes();
            })
            .catch(error => {
                showAlert("error", "Erro ao enviar o arquivo.");
                console.error("Erro:", error);
            });
    } else {
        showAlert("warning", "Por favor, selecione um arquivo CSV.");
    }
}

init();
