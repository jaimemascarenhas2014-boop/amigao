#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎅 Amigo Secreto - Dev Server${NC}"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependências...${NC}"
  npm install
  echo ""
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo -e "${BLUE}⚙️ Criando ficheiro .env...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✓ Ficheiro .env criado${NC}"
  echo ""
fi

echo -e "${GREEN}✓ Tudo pronto!${NC}"
echo ""
echo -e "${BLUE}Iniciando servidor em desenvolvimento...${NC}"
echo -e "${BLUE}Acessa http://localhost:3000${NC}"
echo ""

# Iniciar servidor com nodemon
npm run dev
