const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ margin: 50 });

const output = path.join(__dirname, "teste_output.pdf");
const fontePath = path.join(__dirname, "fonts", "NotoSans-Regular.ttf");

// ✅ Registra a fonte
doc.registerFont("Noto", fontePath);
doc.pipe(fs.createWriteStream(output));

// ✅ Aplica a fonte antes de escrever
doc.font("Noto");

// ✅ Teste de caracteres
doc.fontSize(14).text("Teste de acentuação: á é í ó ú ç ã õ â ê î ô û À É Í Ó Ú Ç", {
    align: "left"
});
doc.moveDown();
doc.text("Aluno: João Antônio Ávila");
doc.text("Local: Laboratório de Desenvolvimento");
doc.text("Servidor: André Oliveira");

doc.end();
