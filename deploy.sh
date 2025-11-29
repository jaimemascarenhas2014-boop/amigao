#!/bin/bash

# 🚀 Script de Deploy Automático - Amigão
# Este script automatiza o processo de publish para GitHub e Render

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
PROJECT_DIR="/home/jaime-mascarenhas/Secretária/Projeto Amigo Secreto"
GITHUB_REPO="https://github.com/jaimemascarenhas2014-boop/amigao"
RENDER_DASHBOARD="https://dashboard.render.com"

# Função para imprimir com cor
print_step() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Iniciar
clear
echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                   🚀 AMIGÃO DEPLOY SCRIPT 🚀              ║
║                   Automatiza GitHub + Render               ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Ir para diretório do projeto
cd "$PROJECT_DIR" || { print_error "Diretório não encontrado!"; exit 1; }

print_step "Passo 1: Verificar estado do repositório"
git status
echo ""

# Perguntar pela mensagem de commit
print_step "Passo 2: Mensagem de Commit"
echo -e "${YELLOW}Tipos recomendados:${NC}"
echo "  • Feature: Adicionar nova funcionalidade"
echo "  • Fix: Corrigir bug"
echo "  • Update: Atualizar versão ou dependências"
echo "  • Improve: Melhorar código existente"
echo "  • Docs: Atualizar documentação"
echo ""
read -p "Escreve a mensagem de commit: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  print_error "Mensagem de commit vazia!"
  exit 1
fi

# Verificar se há alterações
print_step "Passo 3: Adicionar ficheiros alterados"
if git diff --quiet && git diff --cached --quiet; then
  print_info "Sem alterações para fazer commit!"
  exit 0
fi

# Adicionar ficheiros
git add -A
print_info "Ficheiros adicionados:"
git diff --cached --name-only | sed 's/^/  • /'

echo ""

# Fazer commit
print_step "Passo 4: Fazer Commit"
git commit -m "$COMMIT_MSG"
print_info "Commit realizado com sucesso!"

echo ""

# Fazer push
print_step "Passo 5: Fazer Push para GitHub"
if git push origin main; then
  print_info "Push realizado com sucesso!"
else
  print_error "Erro ao fazer push!"
  exit 1
fi

echo ""

# Informações sobre deploy
print_step "Passo 6: Deploy no Render"
print_info "O Render vai fazer deploy automaticamente!"
echo ""
echo -e "${YELLOW}Acompanhar deploy:${NC}"
echo -e "  🔗 ${BLUE}${RENDER_DASHBOARD}${NC}"
echo ""
echo -e "${YELLOW}Repositório GitHub:${NC}"
echo -e "  🔗 ${BLUE}${GITHUB_REPO}${NC}"
echo ""

# Mostrar informações do commit
print_step "Resumo do Deploy"
echo -e "${YELLOW}Commit recente:${NC}"
git log --oneline -1 | sed 's/^/  /'
echo ""
echo -e "${YELLOW}Branch:${NC} $(git branch --show-current)"
echo -e "${YELLOW}Repositório:${NC} $(git config --get remote.origin.url)"
echo ""

# Perguntar se quer abrir o dashboard
echo -ne "${YELLOW}Quer abrir o dashboard do Render? (s/n): ${NC}"
read -r OPEN_DASHBOARD

if [[ "$OPEN_DASHBOARD" =~ ^[Ss]$ ]]; then
  xdg-open "$RENDER_DASHBOARD" 2>/dev/null || open "$RENDER_DASHBOARD" 2>/dev/null || echo "Abre manualmente: $RENDER_DASHBOARD"
fi

echo ""
print_step "✨ Deploy Completo!"
echo -e "${GREEN}🎉 Alterações publicadas com sucesso!${NC}"
echo -e "${YELLOW}Aguarde 2-5 minutos para o site estar atualizado.${NC}"
echo ""
