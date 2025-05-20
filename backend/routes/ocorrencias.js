const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const OcorrenciaModel = require("../models/OcorrenciaModel");
const { gerarPdfOcorrencia } = require("../controllers/PdfOcorrenciaController");

// Configuração do armazenamento da imagem
const storage = multer.diskStorage({
    destination: "uploads/", // Pasta onde os arquivos serão salvos
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo para evitar duplicatas
    }
});

const upload = multer({ storage: storage });

/* ===============================================================
   🔹 ROTAS EXISTENTES (MANTIDAS)
=============================================================== */

// 🔹 Rota para cadastrar uma nova ocorrência (agora para múltiplos alunos)
router.post("/cadastrar", upload.single("imagem"), async (req, res) => {
    try {
        const { alunos, infracao, local, descricao, dataHora, servidor } = req.body;
        const imagem = req.file ? req.file.filename : null;

        // ✅ Ajuste de horário para formato compatível com MySQL
        const dataHoraConvertida = new Date(dataHora).toISOString().slice(0, 19).replace('T', ' ');

        // Se vier só um aluno (por segurança), transforma em array
        const listaAlunos = Array.isArray(alunos) ? alunos : [alunos];

        for (const alunoId of listaAlunos) {
            await OcorrenciaModel.criarOcorrencia(
                alunoId,
                infracao,
                local,
                descricao,
                dataHoraConvertida,
                servidor,
                imagem
            );
        }

        res.status(201).json({ mensagem: "Ocorrência(s) cadastrada(s) com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar ocorrência:", error);
        res.status(500).json({ mensagem: "Erro ao cadastrar ocorrência." });
    }
});

// 🔹 Rota para listar ocorrências com paginação e busca
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const busca = req.query.busca || "";

        console.log("🔍 Recebido na query:", { page, limit, busca });

        const { ocorrencias, total } = await OcorrenciaModel.listarOcorrenciasPaginado({
            page,
            limit,
            busca
        });

        console.log("✅ Ocorrências retornadas:", ocorrencias.length);
        console.log("📊 Total de registros encontrados:", total);

        res.json({ ocorrencias, total });
    } catch (error) {
        console.error("❌ Erro ao listar ocorrências:", error);
        res.status(500).json({ mensagem: "Erro ao listar ocorrências.", erro: error.message });
    }
});

/* ===============================================================
   ✅ ROTAS ADICIONADAS ABAIXO
=============================================================== */

// 🔸 Rota para editar uma ocorrência específica (descricao e local)
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { descricao, local } = req.body;

    try {
        const ocorrenciaExistente = await OcorrenciaModel.buscarOcorrenciaPorId(id);

        if (!ocorrenciaExistente) {
            return res.status(404).json({ mensagem: "Ocorrência não encontrada." });
        }

        await OcorrenciaModel.atualizarOcorrencia(id, descricao, local);
        res.json({ mensagem: "Ocorrência atualizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar ocorrência:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar ocorrência." });
    }
});

// 🔸 Rota para excluir uma ocorrência específica
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const ocorrenciaExistente = await OcorrenciaModel.buscarOcorrenciaPorId(id);

        if (!ocorrenciaExistente) {
            return res.status(404).json({ mensagem: "Ocorrência não encontrada." });
        }

        await OcorrenciaModel.excluirOcorrencia(id);
        res.json({ mensagem: "Ocorrência excluída com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir ocorrência:", error);
        res.status(500).json({ mensagem: "Erro ao excluir ocorrência." });
    }
});

// 🔸 (Opcional) Rota para listar ocorrências filtradas por parâmetros (aluno, tipo de infração)
router.get("/filtro", async (req, res) => {
    const { aluno, tipo_infracao } = req.query;

    try {
        const ocorrencias = await OcorrenciaModel.filtrarOcorrencias({ aluno, tipo_infracao });
        res.json({ ocorrencias });
    } catch (error) {
        console.error("Erro ao filtrar ocorrências:", error);
        res.status(500).json({ mensagem: "Erro ao filtrar ocorrências." });
    }
});

// 🔹 Rota para gerar o Quadro de Ocorrências com regras de reincidência
router.get("/quadro", async (req, res) => {
    try {
        const quadro = await OcorrenciaModel.gerarQuadroOcorrencias();
        res.status(200).json(quadro);
    } catch (error) {
        console.error("❌ Erro ao gerar quadro de ocorrências:", error);
        res.status(500).json({ mensagem: "Erro ao gerar quadro de ocorrências." });
    }
});

// 🔸 Lista ocorrências cadastradas por um servidor específico
router.get("/servidor/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const ocorrencias = await OcorrenciaModel.listarOcorrenciasPorServidor(id);
        res.status(200).json({ ocorrencias });
    } catch (error) {
        console.error("Erro ao listar ocorrências do servidor:", error);
        res.status(500).json({ mensagem: "Erro ao buscar ocorrências do servidor." });
    }
});

// 🔸 Rota para buscar uma ocorrência específica por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const ocorrencia = await OcorrenciaModel.buscarOcorrenciaPorId(id);

        if (!ocorrencia) {
            return res.status(404).json({ mensagem: "Ocorrência não encontrada." });
        }

        res.json(ocorrencia);
    } catch (error) {
        console.error("Erro ao buscar ocorrência:", error);
        res.status(500).json({ mensagem: "Erro ao buscar ocorrência." });
    }
});

// 🔸 Rota para gerar PDF usando controller externo
router.get("/:id/pdf", gerarPdfOcorrencia);

// 🔸 Atualizar o feedback e o status de uma ocorrência
router.put("/:id/feedback", async (req, res) => {
    const { id } = req.params;
    const { feedback, status } = req.body;

    try {
        const ocorrencia = await OcorrenciaModel.buscarOcorrenciaPorId(id);

        if (!ocorrencia) {
            return res.status(404).json({ mensagem: "Ocorrência não encontrada." });
        }

        await OcorrenciaModel.atualizarFeedback(id, feedback, status);
        res.json({ mensagem: "Feedback e status atualizados com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar feedback:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar feedback." });
    }
});

/* ===============================================================
   ✅ FIM DAS ROTAS
=============================================================== */

module.exports = router;
