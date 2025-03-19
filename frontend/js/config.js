console.log("🔧 Carregando configuração de ambiente...");

// Define automaticamente o ambiente conforme o host da página
const BASE_URL = location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'http://200.17.65.177:3000';

console.log(`🔧 Ambiente detectado: ${location.hostname}`);
console.log(`🔧 BASE_URL definida para: ${BASE_URL}`);
