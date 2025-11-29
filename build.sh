#!/bin/bash
# Deploy script para garantir que o Render sempre faz redeploy

# Gerar um timestamp único para quebrar cache
TIMESTAMP=$(date +%s)
echo "Build iniciado em: $(date)"
echo "Timestamp: $TIMESTAMP"

# Atualizar um ficheiro que força mudança no git
echo "$TIMESTAMP" > /tmp/build-timestamp.txt

# Executar npm install normalmente
npm install --production

# Log de sucesso
echo "Deploy completado com sucesso às $(date)"
