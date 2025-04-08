// controllers/PdfOcorrenciaController.js

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const OcorrenciaModel = require("../models/OcorrenciaModel");

async function gerarPdfOcorrencia(req, res) {
    const { id } = req.params;

    try {
        const ocorrencia = await OcorrenciaModel.buscarOcorrenciaPorId(id);

        if (!ocorrencia) {
            return res.status(404).json({ mensagem: "Ocorrência não encontrada." });
        }

        const doc = new PDFDocument({ margin: 50 });

        const nomeArquivo = `ocorrencia_${id}.pdf`;
        const caminhoCompleto = path.join(__dirname, "..", "uploads", nomeArquivo);
        const stream = fs.createWriteStream(caminhoCompleto);
        doc.pipe(stream);

        // 🔤 Fontes personalizadas
        const regularFont = path.join(__dirname, "..", "fonts", "OpenSans-Regular.ttf");
        const boldFont = path.join(__dirname, "..", "fonts", "OpenSans-Bold.ttf");

        doc.registerFont("Regular", regularFont);
        doc.registerFont("Bold", boldFont);

        // 🖼️ Adiciona a logo do IFNMG - Campus Almenara
        const logoPath = path.join(__dirname, "..", "assets", "logo.png");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 50, 40, { width: 100 });
            doc.moveDown(3);
        } else {
            console.warn("⚠️ Logo não encontrada:", logoPath);
        }

        // 📝 Título
        doc
            .font("Bold")
            .fontSize(16)
            .text("FORMULÁRIO DE OCORRÊNCIA", { align: "center" })
            .moveDown(2);

        // 🧾 Informações da ocorrência
        doc.fontSize(12);

        function campo(titulo, valor) {
            doc
                .font("Bold")
                .text(`${titulo}: `, { continued: true })
                .font("Regular")
                .text(valor)
                .moveDown(0.5);
        }

        campo("Aluno", ocorrencia.aluno_nome);
        campo("Tipo de Infração", ocorrencia.infracao_tipo);
        campo("Descrição", ocorrencia.descricao);
        campo("Local", ocorrencia.local);
        campo("Servidor Responsável", ocorrencia.servidor_nome);
        campo("Data/Hora", formatarDataHora(ocorrencia.data_hora));

        doc.moveDown(3);

        // ✍️ Assinaturas centralizadas
        doc
            .font("Regular")
            .text("____________________________________________", { align: "center" })
            .text("Assinatura do Servidor", { align: "center" })
            .moveDown(2)
            .text("____________________________________________", { align: "center" })
            .text("Assinatura do Aluno", { align: "center" });

        doc.end();

        stream.on("finish", () => {
            res.download(caminhoCompleto, nomeArquivo, (err) => {
                if (err) {
                    console.error("Erro ao enviar PDF:", err);
                    res.status(500).json({ mensagem: "Erro ao enviar o PDF." });
                } else {
                    fs.unlink(caminhoCompleto, () => { });
                }
            });
        });

    } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
        res.status(500).json({ mensagem: "Erro ao gerar PDF da ocorrência." });
    }
}

function formatarDataHora(dataHora) {
    const data = new Date(dataHora);
    return data.toLocaleString("pt-BR");
}

module.exports = { gerarPdfOcorrencia };
