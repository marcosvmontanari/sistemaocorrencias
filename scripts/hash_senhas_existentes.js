const db = require("../backend/config/db");
const bcrypt = require('bcryptjs');

async function hashSenhasExistentes() {
    try {
        // 1. Buscar todos os servidores
        const [servidores] = await db.execute("SELECT id, senha FROM servidores");

        console.log(`🔎 ${servidores.length} servidores encontrados.`);

        for (const servidor of servidores) {
            const id = servidor.id;
            const senhaAtual = servidor.senha;

            // 2. Verifica se a senha já está hashada (opcional)
            if (senhaAtual.startsWith("$2b$")) {
                console.log(`➡️  ID ${id} já está hashada. Pulando...`);
                continue;
            }

            // 3. Criptografar a senha atual (que é o SIAPE ou senha simples)
            const senhaHash = await bcrypt.hash(senhaAtual, 10);

            // 4. Atualizar a senha no banco de dados
            await db.execute(
                "UPDATE servidores SET senha = ? WHERE id = ?",
                [senhaHash, id]
            );

            console.log(`✅ ID ${id} senha hash aplicada!`);
        }

        console.log("🎉 Hash de senhas aplicado com sucesso em todos os servidores!");

        process.exit();

    } catch (error) {
        console.error("❌ Erro ao aplicar hash nas senhas:", error);
        process.exit(1);
    }
}

hashSenhasExistentes();
