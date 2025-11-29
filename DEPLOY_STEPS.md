# 🚀 Guia de Deploy - Amigão

## Como Publicar Alterações no GitHub e Render

### 📝 Pré-requisitos
- Git instalado: `git --version`
- Acesso ao repositório: https://github.com/jaimemascarenhas2014-boop/amigao
- Conta no Render.com conectada ao GitHub

---

## 1️⃣ Publicar Alterações no GitHub

### Passo 1: Verificar alterações
```bash
cd "/home/jaime-mascarenhas/Secretária/Projeto Amigo Secreto"
git status
```

### Passo 2: Adicionar ficheiros modificados
```bash
# Adicionar TODOS os ficheiros alterados
git add -A

# OU adicionar ficheiros específicos
git add public/script.js routes/results.js
```

### Passo 3: Fazer commit com mensagem descritiva
```bash
git commit -m "Descrição clara das mudanças, ex: Fix organizer link loading and add direct URL support"
```

**Dica:** Use mensagens tipo:
- `Fix: Corrigir ...`
- `Feature: Adicionar ...`
- `Update: Atualizar versão para ...`
- `Improve: Melhorar ...`

### Passo 4: Enviar para GitHub
```bash
git push origin main
```

**Se der erro de autenticação:**
```bash
# Tentar novamente
git push origin main

# Ou usar SSH (requer configuração prévia)
git push origin main --ssh
```

---

## 2️⃣ Deploy Automático no Render

### ✅ Se já está ligado ao GitHub (automático)

**O Render faz deploy automaticamente quando fazes push!**

Isto é, após fazer:
```bash
git add -A
git commit -m "Mensagem"
git push origin main
```

O Render vai:
1. ✅ Detectar a mudança no GitHub
2. ✅ Executar `npm install`
3. ✅ Executar `node server.js`
4. ✅ Publicar a aplicação em ~2-5 minutos

### 🔍 Acompanhar o Deploy

1. Vai para: https://dashboard.render.com
2. Clica no serviço "amigao"
3. Vê a aba "Deployments"
4. Verifica o status:
   - 🟡 Deploying (em progresso)
   - 🟢 Live (disponível)
   - 🔴 Failed (erro)

---

## 3️⃣ Script Rápido (Bash)

Cria um ficheiro `deploy.sh` na raiz do projeto:

```bash
#!/bin/bash

echo "📝 Adicionar ficheiros..."
git add -A

echo "💬 Commit..."
read -p "Mensagem de commit: " commit_msg
git commit -m "$commit_msg"

echo "🚀 Push para GitHub..."
git push origin main

echo "✅ Enviado! Render vai fazer deploy automaticamente..."
echo "📊 Acompanha em: https://dashboard.render.com"
```

**Usar:**
```bash
bash deploy.sh
```

---

## 4️⃣ Fluxo Completo em Uma Linha

```bash
cd "/home/jaime-mascarenhas/Secretária/Projeto Amigo Secreto" && git add -A && git commit -m "Update: [descrição]" && git push origin main
```

---

## 5️⃣ Troubleshooting

### ❌ "Erro: Falha ao fazer commit"
```bash
# Ver diferenças
git diff

# Resetar alterações não desejadas
git reset HEAD arquivo.js
```

### ❌ "Erro: Falha ao fazer push"
```bash
# Sincronizar com remoto
git pull origin main

# Tentar push novamente
git push origin main
```

### ❌ "Render diz 'Build Failed'"
1. Verifica os logs em https://dashboard.render.com
2. Comuns: `npm install` com erro ou `node server.js` não inicia
3. Verifica `package.json` se tem `"start": "node server.js"`

### ❌ "Alterações não aparecem no site"
1. Aguarda 2-5 minutos (deploy em progresso)
2. Limpa cache do navegador: `Ctrl+Shift+Delete`
3. Verifica se o commit foi feito: `git log --oneline -5`

---

## 📊 Checklist de Deploy

- [ ] Testei as mudanças localmente: `npm start`
- [ ] Atualizei a versão em `script.js` (APP_INFO.version)
- [ ] Atualizei o footer em `index.html` e `resultado.html`
- [ ] Não há erros no console (F12)
- [ ] Fiz commit com mensagem clara
- [ ] Fiz push com sucesso
- [ ] Consultei https://dashboard.render.com e deploy está 🟢 Live

---

## 🔐 Segurança & Boas Práticas

1. **Nunca faça push de:**
   - Ficheiros `.env` com secrets
   - `node_modules` (já em `.gitignore`)
   - Tokens pessoais

2. **Sempre verifique antes de push:**
   ```bash
   git diff        # Ver mudanças
   git status      # Ver ficheiros
   ```

3. **Tenha commits atómicos:**
   - Cada commit = uma funcionalidade/fix
   - Mensagens claras e descritivas

4. **Teste antes de fazer push:**
   ```bash
   npm start
   # Testa em http://localhost:3000
   ```

---

## 📞 Comandos Git Úteis

```bash
# Ver histórico de commits
git log --oneline -10

# Ver branching
git branch -a

# Desfazer último commit (mantendo mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descartando mudanças)
git reset --hard HEAD~1

# Ver ficheiros alterados
git diff --name-only

# Stash (guardar mudanças temporariamente)
git stash
git stash pop
```

---

**✅ Pronto! Agora sabes como fazer deploy! 🚀**
