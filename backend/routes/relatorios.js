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
        const ocorrencias = await RelatorioModel.listarOcorrencias(
            tipoInfracao, dataInicio, dataFim, aluno, servidor
        );

        const doc = new PDFDocument({
            size: "A4",
            layout: "landscape",
            margins: { top: 40, left: 30, right: 30, bottom: 40 },
        });

        const fileName = `relatorio_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // 🔹 Adicionando a logo no canto superior esquerdo
        const logoPath = path.join(__dirname, "..", "assets", "logo.png");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 30, 20, { width: 100 });
        }

        // 🔹 Cabeçalho do relatório
        doc.fontSize(20).text("Relatório de Ocorrências", 150, 30, { align: "center" });
        doc.moveDown(1);

        // 🔹 Informações do filtro
        doc.fontSize(12);
        doc.text(`Data de Emissão: ${moment().format("DD/MM/YYYY HH:mm")}`);
        if (tipoInfracao) doc.text(`Tipo de Infração: ${tipoInfracao}`);
        if (dataInicio) doc.text(`Data Início: ${dataInicio}`);
        if (dataFim) doc.text(`Data Fim: ${dataFim}`);
        if (aluno) doc.text(`Aluno: ${aluno}`);
        if (servidor) doc.text(`Servidor: ${servidor}`);
        doc.moveDown(1);

        // 🔹 Definição das posições das colunas
        const colPositions = {
            id: 30,
            aluno: 70,
            infracao: 220,
            local: 320,
            descricao: 520,
            dataHora: 700,
            servidor: 850
        };

        let y = doc.y;

        // 🔹 Cabeçalho da tabela
        doc.fontSize(12).font("Helvetica-Bold");
        doc.rect(25, y - 5, 850, 25).fill("#f0f0f0");
        doc.fillColor("black");

        doc.text("ID", colPositions.id, y, { width: 30 });
        doc.text("Aluno", colPositions.aluno, y, { width: 150 });
        doc.text("Infração", colPositions.infracao, y, { width: 100 });
        doc.text("Local", colPositions.local, y, { width: 180 });
        doc.text("Descrição", colPositions.descricao, y, { width: 200 });
        doc.text("Data/Hora", colPositions.dataHora, y, { width: 120 });
        doc.text("Servidor", colPositions.servidor, y, { width: 120 });

        doc.moveDown(0.5);
        y = doc.y + 5;

        // 🔹 Linhas da tabela com ajuste de altura
        doc.font("Helvetica").fontSize(10);
        ocorrencias.forEach((ocorrencia, index) => {
            // 🔹 Calcular a altura máxima necessária para esta linha
            const rowHeights = [
                doc.heightOfString(ocorrencia.id, { width: 30 }),
                doc.heightOfString(ocorrencia.aluno, { width: 150 }),
                doc.heightOfString(ocorrencia.infracao, { width: 100 }),
                doc.heightOfString(ocorrencia.local, { width: 180 }),
                doc.heightOfString(ocorrencia.descricao, { width: 200 }),
                doc.heightOfString(moment(ocorrencia.data_hora).format("DD/MM/YYYY HH:mm"), { width: 120 }),
                doc.heightOfString(ocorrencia.servidor, { width: 120 })
            ];

            // 🔹 Define a altura da linha como a maior altura calculada
            const rowHeight = Math.max(...rowHeights) + 5;

            // 🔹 Fundo alternado para melhor leitura
            if (index % 2 === 0) {
                doc.rect(25, y - 5, 850, rowHeight).fill("#e8e8e8");
                doc.fillColor("black");
            }

            // 🔹 Posiciona os textos corretamente
            doc.text(`${ocorrencia.id}`, colPositions.id, y, { width: 30 });
            doc.text(`${ocorrencia.aluno}`, colPositions.aluno, y, { width: 150 });
            doc.text(`${ocorrencia.infracao}`, colPositions.infracao, y, { width: 100 });
            doc.text(`${ocorrencia.local}`, colPositions.local, y, { width: 180, lineGap: 2 });
            doc.text(`${ocorrencia.descricao}`, colPositions.descricao, y, { width: 200, lineGap: 2 });
            doc.text(moment(ocorrencia.data_hora).format("DD/MM/YYYY HH:mm"), colPositions.dataHora, y, { width: 120 });
            doc.text(`${ocorrencia.servidor}`, colPositions.servidor, y, { width: 120 });

            y += rowHeight; // 🔹 Agora cada linha ocupa o espaço correto

            // 🔹 Se a página estiver cheia, cria uma nova
            if (y > 500) {
                doc.addPage();
                y = 50;
            }
        });

        doc.end();

        stream.on("finish", () => {
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error("Erro no download do PDF:", err);
                    res.status(500).send("Erro ao baixar o PDF");
                }
            });
        });
    } catch (error) {
        console.error("Erro ao gerar relatório PDF:", error);
        res.status(500).send("Erro ao gerar relatório PDF");
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
