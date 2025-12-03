#!/usr/bin/env node

/**
 * Amigão Keep-Alive Script
 * Mantém o site ativo no Render fazendo requisições a cada 10 minutos
 * 
 * Para usar:
 * 1. Guarda este ficheiro como "keep-alive.js" na tua pasta do projeto
 * 2. Abre PowerShell ou CMD na pasta
 * 3. Executa: node keep-alive.js
 * 4. Deixa a janela aberta
 */

const http = require('http');
const https = require('https');

const SITE_URL = 'https://amigao.onrender.com/';
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutos em milisegundos

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleString('pt-PT');
  console.log(`${colors[color]}[${timestamp}]${colors.reset} ${message}`);
}

function makeRequest() {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      timeout: 10000, // timeout de 10 segundos
      headers: {
        'User-Agent': 'Amigao-Keep-Alive/1.0'
      }
    };

    const startTime = Date.now();
    
    https.get(SITE_URL, requestOptions, (res) => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      if (statusCode === 200) {
        log(`✅ Site ativo! Status: ${statusCode} | Tempo: ${duration}ms`, 'green');
        resolve(true);
      } else {
        log(`⚠️  Resposta inesperada: ${statusCode} | Tempo: ${duration}ms`, 'yellow');
        resolve(false);
      }
    }).on('error', (error) => {
      const duration = Date.now() - startTime;
      log(`❌ Erro ao contactar site: ${error.message} | Tempo: ${duration}ms`, 'red');
      reject(error);
    });
  });
}

async function startKeepAlive() {
  log('🚀 Amigão Keep-Alive iniciado!', 'bright');
  log(`📍 URL: ${SITE_URL}`, 'blue');
  log(`⏱️  Intervalo: a cada 10 minutos`, 'blue');
  log('─'.repeat(60), 'blue');

  let requestCount = 0;
  let successCount = 0;

  // Fazer primeira requisição imediatamente
  try {
    log('🔄 Enviando primeira requisição...', 'yellow');
    await makeRequest();
    successCount++;
  } catch (error) {
    log(`Erro na primeira requisição: ${error.message}`, 'red');
  }
  requestCount++;

  // Loop para fazer requisições a cada 10 minutos
  setInterval(async () => {
    try {
      log(`🔄 Enviando requisição #${requestCount + 1}...`, 'yellow');
      await makeRequest();
      successCount++;
    } catch (error) {
      log(`Erro: ${error.message}`, 'red');
    }
    requestCount++;
    
    // Mostrar estatísticas a cada 6 requisições (1 hora)
    if (requestCount % 6 === 0) {
      const taxa = ((successCount / requestCount) * 100).toFixed(1);
      log(`📊 Estatísticas: ${successCount}/${requestCount} bem-sucedidas (${taxa}%)`, 'blue');
    }
  }, CHECK_INTERVAL);
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  log(`⚠️  Erro não capturado: ${error.message}`, 'red');
  log('O programa vai continuar a tentar...', 'yellow');
});

// Iniciar
startKeepAlive();

// Mensagem de instruções
log('', 'reset');
log('💡 Dica: Deixa esta janela aberta enquanto queres manter o site ativo', 'blue');
log('   Podes minimizar a janela', 'blue');
log('', 'reset');
