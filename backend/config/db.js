// backend/config/db.js
const mysql = require('mysql2/promise'); // ✅ obrigatório para usar async/await

const db = mysql.createPool({
    host: "200.17.65.177",          // ou o IP/endereço do seu banco
    user: "root",               // seu usuário do banco
    password: "147852369",               // sua senha (deixe vazio se não tiver senha)
    database: "sistema_ocorrencias"  // nome do banco
});

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nomedobanco', 'usuario', 'senha', {
    host: '200.17.65.177',
    dialect: 'mysql'
});

module.exports = db;

