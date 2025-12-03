#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Amigão Keep-Alive Script (Python)
Mantém o site ativo no Render fazendo requisições a cada 10 minutos

Para usar:
1. Guarda este ficheiro como "keep-alive.py" 
2. Abre PowerShell ou CMD
3. Executa: python keep-alive.py
4. Deixa a janela aberta
"""

import requests
import time
from datetime import datetime
import sys

SITE_URL = 'https://amigao.onrender.com/'
CHECK_INTERVAL = 10 * 60  # 10 minutos em segundos

# Cores para o terminal (Windows)
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RED = '\033[91m'

def log(message, color=Colors.RESET):
    """Imprime uma mensagem com timestamp e cor"""
    timestamp = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    print(f'{color}[{timestamp}]{Colors.RESET} {message}')

def make_request():
    """Faz uma requisição HTTP ao site"""
    try:
        start_time = time.time()
        headers = {'User-Agent': 'Amigao-Keep-Alive/1.0'}
        
        response = requests.get(SITE_URL, timeout=10, headers=headers)
        duration = (time.time() - start_time) * 1000  # converter para ms
        
        if response.status_code == 200:
            log(f'✅ Site ativo! Status: {response.status_code} | Tempo: {duration:.0f}ms', Colors.GREEN)
            return True
        else:
            log(f'⚠️  Resposta inesperada: {response.status_code} | Tempo: {duration:.0f}ms', Colors.YELLOW)
            return False
    except requests.exceptions.Timeout:
        log('❌ Timeout - Site demorou muito a responder', Colors.RED)
        return False
    except requests.exceptions.ConnectionError:
        log('❌ Erro de conexão - Verifique a sua internet', Colors.RED)
        return False
    except Exception as error:
        log(f'❌ Erro: {str(error)}', Colors.RED)
        return False

def start_keep_alive():
    """Inicia o loop de keep-alive"""
    log('🚀 Amigão Keep-Alive iniciado!', Colors.BRIGHT)
    log(f'📍 URL: {SITE_URL}', Colors.BLUE)
    log('⏱️  Intervalo: a cada 10 minutos', Colors.BLUE)
    log('─' * 60, Colors.BLUE)
    
    request_count = 0
    success_count = 0
    
    # Fazer primeira requisição imediatamente
    try:
        log('🔄 Enviando primeira requisição...', Colors.YELLOW)
        if make_request():
            success_count += 1
        request_count += 1
    except Exception as error:
        log(f'Erro na primeira requisição: {str(error)}', Colors.RED)
    
    # Loop para fazer requisições a cada 10 minutos
    while True:
        try:
            time.sleep(CHECK_INTERVAL)
            log(f'🔄 Enviando requisição #{request_count + 1}...', Colors.YELLOW)
            
            if make_request():
                success_count += 1
            request_count += 1
            
            # Mostrar estatísticas a cada 6 requisições (1 hora)
            if request_count % 6 == 0:
                taxa = (success_count / request_count) * 100
                log(f'📊 Estatísticas: {success_count}/{request_count} bem-sucedidas ({taxa:.1f}%)', Colors.BLUE)
                
        except KeyboardInterrupt:
            log('\n👋 Keep-Alive parado pelo utilizador', Colors.YELLOW)
            sys.exit(0)
        except Exception as error:
            log(f'⚠️  Erro: {str(error)}', Colors.RED)
            log('O programa vai continuar a tentar...', Colors.YELLOW)

if __name__ == '__main__':
    try:
        log('', Colors.RESET)
        log('💡 Dica: Deixa esta janela aberta enquanto queres manter o site ativo', Colors.BLUE)
        log('   Podes minimizar a janela', Colors.BLUE)
        log('   Prima CTRL+C para parar', Colors.BLUE)
        log('', Colors.RESET)
        
        start_keep_alive()
    except Exception as error:
        log(f'❌ Erro fatal: {str(error)}', Colors.RED)
        sys.exit(1)
