#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎄 AMIGÃO - DEPLOY PARA GITHUB E RENDER 🚀${NC}\n"

# Verificar se estamos no diretório correto
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Erro: Não está na pasta raiz do projeto!${NC}"
    echo "Executa: cd ~/Secretária/Projeto\ Amigo\ Secreto"
    exit 1
fi

echo -e "${YELLOW}Passo 1: Configurar utilizador Git${NC}"
read -p "Nome (ex: Jaime Mascarenhas): " git_name
read -p "Email (ex: jaime@example.com): " git_email

git config --global user.name "$git_name"
git config --global user.email "$git_email"
echo -e "${GREEN}✅ Utilizador configurado: $git_name <$git_email>${NC}\n"

echo -e "${YELLOW}Passo 2: Adicionar repositório remoto do GitHub${NC}"
read -p "Username do GitHub (ex: jaime-mascarenhas): " github_user

REPO_URL="https://github.com/$github_user/amigao.git"
echo -e "URL do repositório: $REPO_URL\n"

# Remover remote anterior se existir
git remote remove origin 2>/dev/null

git remote add origin "$REPO_URL"
git branch -M main

echo -e "${GREEN}✅ Remote adicionado: $REPO_URL${NC}\n"

echo -e "${YELLOW}Passo 3: Fazer push para GitHub${NC}"
echo "Vai ter de entrar credenciais do GitHub (se pedido)..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Código enviado para GitHub com sucesso!${NC}"
    echo -e "${BLUE}URL do repositório: https://github.com/$github_user/amigao${NC}\n"
    
    echo -e "${YELLOW}Próximo passo: Deploy no Render${NC}"
    echo "1. Vai a https://render.com"
    echo "2. Clica em Sign up (escolhe GitHub)"
    echo "3. Clica em New + → Web Service"
    echo "4. Escolhe o repositório 'amigao'"
    echo "5. Configura:"
    echo "   - Build Command: npm install"
    echo "   - Start Command: node server.js"
    echo "   - Plan: Free"
    echo "6. Deploy!"
    echo ""
    echo -e "${GREEN}🎉 O teu Amigão estará online em minutos!${NC}\n"
else
    echo -e "${RED}❌ Erro ao fazer push! Verifica as credenciais do GitHub.${NC}"
    exit 1
fi

echo -e "${BLUE}🎄 Amigão v1.0.0 - Desenvolvido por Jaime Soares Mascarenhas ✨${NC}"
