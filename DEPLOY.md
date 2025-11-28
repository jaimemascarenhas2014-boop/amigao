# 🚀 Guia de Deploy no Render (Gratuito)

## Passos para Publicar o Amigão Online

### 1️⃣ Criar Repositório no GitHub

**Opção A: Usando GitHub Web**
1. Vai para https://github.com/new
2. Nome do repositório: `amigao`
3. Descrição: "Amigo Secreto Web App - Secret Santa Generator"
4. Seleciona "Public"
5. Clica "Create repository"

**Opção B: Usando Terminal (CLI)**
```bash
# Instalar GitHub CLI (se não tiver)
# Em Ubuntu/Debian:
sudo apt install gh

# Login
gh auth login

# Criar repositório
gh repo create amigao --public --source=. --remote=origin --push
```

---

### 2️⃣ Push do Código para GitHub

Se criaste o repositório na web:

```bash
cd /home/jaime-mascarenhas/Secretária/Projeto\ Amigo\ Secreto

git remote add origin https://github.com/SEU_USERNAME/amigao.git
git branch -M main
git push -u origin main
```

**Substitui `SEU_USERNAME` com o teu username do GitHub**

---

### 3️⃣ Deploy no Render (Gratuito)

1. Vai para https://render.com
2. Clica "Sign Up" (ou "Sign in with GitHub")
3. Conecta com GitHub
4. Clica "New +" → "Web Service"
5. Seleciona o repositório `amigao`
6. Configura assim:
   - **Name:** `amigao`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (gratuito)
7. Clica "Create Web Service"

⏳ **Render faz deploy automaticamente** (pode levar 2-3 minutos)

---

### 4️⃣ Resultado

Quando terminar, terás uma URL assim:
```
https://amigao.onrender.com
```

✅ A app fica online 24/7 (com plano Free, pode hibernar se sem uso 15 min)

---

## 🎉 Pronto!

Agora podes:
- ✅ Aceder em https://amigao.onrender.com
- ✅ Criar sorteios
- ✅ Partilhar links pelos WhatsApp
- ✅ Os links funcionam de qualquer lugar do mundo!

---

## ⚠️ Notas Importantes

1. **Plano Free Render:**
   - Hibernação: App descansa se sem tráfego 15 minutos
   - Acorda em ~10 segundos quando alguém acede
   - Totalmente gratuito
   - Perfeito para Secret Santa 🎁

2. **Dados Persistem:**
   - JSON é guardado em `/data/drawings.json`
   - Sobrevive a restarts (no Render, por enquanto)
   - Se precisares de backup: descarrega os dados antes

3. **Domínio Personalizado:**
   - Se tiveres domínio próprio, podes conectar no Render
   - Render suporta subdomínios grátis também

---

## 🔧 Troubleshooting

**Se não funciona após deploy:**
1. Vai a https://render.com/dashboard
2. Seleciona o serviço `amigao`
3. Clica "Logs" para ver erros
4. Se tiver erro, clica "Manual Deploy" para tentar novamente

---

**Precisa de ajuda?** 
Diz-me quando chegares ao passo 3 (Render) que vejo os logs contigo! 🚀
