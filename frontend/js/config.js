console.log("🔧 Carregando configuração de ambiente...");

// Define automaticamente o ambiente conforme o host da página
const BASE_URL = location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://ocorrencias.ifalmenara.com.br';

console.log(`🔧 Ambiente detectado: ${location.hostname}`);
console.log(`🔧 BASE_URL definida para: ${BASE_URL}`);