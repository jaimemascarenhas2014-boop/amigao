# 🎄 GUIA DE DEPLOYMENT DO AMIGÃO 🎄

## Passo 1: Criar Conta no GitHub (se não tiveres)
1. Vai a https://github.com/signup
2. Cria uma conta com o teu email
3. Verifica o email

## Passo 2: Criar Novo Repositório no GitHub
1. Depois de logado, vai a https://github.com/new
2. Nome: `amigao` (ou qualquer nome que preferires)
3. Descrição: "🎄 Amigão - Secret Santa Sorteio de Amigo Secreto com WhatsApp"
4. Escolhe: **Public** (para ser gratuito)
5. Clica em "Create Repository"

## Passo 3: Fazer Push do Código para GitHub
Na pasta do projeto, executa estes comandos:

```bash
cd ~/Secretária/Projeto\ Amigo\ Secreto

# Configurar utilizador Git
git config --global user.name "Jaime Mascarenhas"
git config --global user.email "teu-email@gmail.com"

# Adicionar remote do GitHub (substitui USERNAME com o teu utilizador do GitHub)
git remote add origin https://github.com/USERNAME/amigao.git
git branch -M main
git push -u origin main
```

## Passo 4: Fazer Deploy no Render (GRATUITO)
1. Vai a https://render.com
2. Clica em "Sign up"
3. Escolhe "GitHub" como método de login
4. Autoriza o Render a aceder ao GitHub
5. Clica em "New +" → "Web Service"
6. Escolhe o repositório `amigao`
7. Configura:
   - **Name**: amigao
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (gratuito!)
8. Clica em "Deploy Web Service"

## Passo 5: Aguarda o Deploy
- O Render vai compilar e fazer deploy
- Receberás um URL público tipo: `https://amigao-xxxxx.onrender.com`
- O site estará online em alguns minutos!

## ⚠️ Notas Importantes:
- O plano gratuito do Render hiberna após 15 min de inatividade
- Primeiro acesso pode demorar 30-60 segundos
- Os dados são armazenados localmente (resetam se o servidor reiniciar)
- Para dados persistentes, seria necessário uma base de dados

## 🎉 Pronto!
O teu Amigão estará online e totalmente gratuito! 🎄✨

Qualquer dúvida, diz!
