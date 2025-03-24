console.log("🔹 Script quadro_ocorrencias.js carregado corretamente!");

export function init() {
    console.log("🔸 Inicializando módulo Quadro de Ocorrências");

    // ✅ Carrega os dados imediatamente
    carregarQuadro();

    // ✅ Atualiza automaticamente a cada 10 segundos
    setInterval(carregarQuadro, 10000);
}

async function carregarQuadro() {
    try {
        const resposta = await fetch(`${BASE_URL}/ocorrencias/quadro`);
        if (!resposta.ok) throw new Error("Erro ao buscar dados do quadro.");

        const dados = await resposta.json();

        const tbody = document.getElementById("tabelaQuadroOcorrencias");
        tbody.innerHTML = ""; // Limpa a tabela

        if (!dados.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum dado encontrado.</td></tr>`;
            return;
        }

        dados.forEach(aluno => {
            const tr = document.createElement("tr");

            const tdNome = document.createElement("td");
            tdNome.textContent = aluno.aluno; // 🔁 CORRIGIDO
            tr.appendChild(tdNome);

            const tdLeves = document.createElement("td");
            tdLeves.innerHTML = `<span class="text-primary fw-bold">${aluno.leve || 0}</span>`;
            tr.appendChild(tdLeves);

            const tdGraves = document.createElement("td");
            tdGraves.innerHTML = `<span class="text-warning fw-bold">${aluno.grave || 0}</span>`;
            tr.appendChild(tdGraves);

            const tdGravissimas = document.createElement("td");
            tdGravissimas.innerHTML = `<span class="text-danger fw-bold">${aluno.gravissima || 0}</span>`;
            tr.appendChild(tdGravissimas);

            tbody.appendChild(tr);
        });

        console.log("✅ Quadro de ocorrências atualizado.");

    } catch (error) {
        console.error("❌ Erro ao carregar o quadro:", error);
        const tbody = document.getElementById("tabelaQuadroOcorrencias");
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
    }
}
