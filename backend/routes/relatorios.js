const express = require("express");
const router = express.Router();
const RelatorioModel = require("../models/RelatorioModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

// Rota para gerar relatório PDF
router.get("/gerar", async (req, res) => {
    try {
        const { tipoInfracao, dataInicio, dataFim, aluno, servidor } = req.query;
        const ocorrencias = await RelatorioModel.listarOcorrencias(tipoInfracao, dataInicio, dataFim, aluno, servidor);

        // Configuração do PDF
        const doc = new PDFDocument({ margin: 40, size: "A4" });

        res.setHeader("Content-Disposition", "attachment; filename=relatorio_ocorrencias.pdf");
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // 🔹 Adicionar a logo no topo
        const logoPath = path.join(__dirname, "../uploads/logo.png");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 40, { width: 120 });
        }

        // 🔹 Título do Relatório
        doc
            .fontSize(18)
            .text("Relatório de Ocorrências", { align: "center" })
            .moveDown(2);

        // 🔹 Informações sobre o filtro aplicado
        doc.fontSize(10);
        if (tipoInfracao) doc.text(`Tipo de Infração: ${tipoInfracao}`);
        if (dataInicio) doc.text(`Período: ${moment(dataInicio).format("DD/MM/YYYY")} até ${dataFim ? moment(dataFim).format("DD/MM/YYYY") : "Hoje"}`);
        if (aluno) doc.text(`Aluno Filtrado: ID ${aluno}`);
        if (servidor) doc.text(`Servidor Responsável: ID ${servidor}`);
        doc.moveDown(1.5);

        // 🔹 Verificar se há ocorrências a serem listadas
        if (ocorrencias.length === 0) {
            doc.text("Nenhuma ocorrência encontrada para os filtros aplicados.", { align: "center" }).moveDown();
        } else {
            // 🔹 Criar Tabela
            const tableTop = doc.y + 10;
            const columnSpacing = 80;

            // 🔹 Cabeçalho da Tabela (com espaçamento adequado)
            doc
                .fontSize(12)
                .text("Aluno", 50, tableTop, { bold: true })
                .text("Infração", 140, tableTop)
                .text("Local", 240, tableTop)
                .text("Data/Hora", 340, tableTop)
                .text("Servidor", 440, tableTop);

            // Linha separadora do cabeçalho
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // 🔹 Listar Ocorrências na Tabela com Formatação da Data
            let y = tableTop + 25;
            ocorrencias.forEach((ocorrencia) => {
                doc
                    .fontSize(10)
                    .text(ocorrencia.aluno, 50, y)
                    .text(ocorrencia.infracao, 140, y)
                    .text(ocorrencia.local, 240, y)
                    .text(moment(ocorrencia.data_hora).format("DD/MM/YYYY - HH:mm"), 340, y) // 🔹 Formatação da Data/Hora
                    .text(ocorrencia.servidor, 440, y);

                y += 20;
            });

            doc.moveDown();
        }

        // 🔹 Finalizar PDF
        doc.end();
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        res.status(500).json({ mensagem: "Erro ao gerar relatório." });
    }
});


router.get("/dados", async (req, res) => {
    try {
        const { tipoInfracao, dataInicio, dataFim, aluno, servidor } = req.query;
        const ocorrencias = await RelatorioModel.listarOcorrencias(tipoInfracao, dataInicio, dataFim, aluno, servidor);
        res.json(ocorrencias);
    } catch (error) {
        console.error("Erro ao buscar dados do relatório:", error);
        res.status(500).json({ mensagem: "Erro ao buscar dados do relatório." });
    }
});



module.exports = router;
