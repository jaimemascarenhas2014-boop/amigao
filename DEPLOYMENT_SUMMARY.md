# 🎄 AMIGÃO - DEPLOY GRATUITO ✨

## 📊 Status do Projeto

✅ **App completa e funcional**
- Sorteios de Amigo Secreto com restrições
- WhatsApp integration
- Decorações natalícias massivas
- UI moderna com gradientes e animações
- Dados persistidos em JSON

✅ **Servidor testado**
- Node.js + Express rodando perfeitamente
- API REST funcionando
- Todos os endpoints validados

## 🚀 DEPLOYMENT GRATUITO NO RENDER

### Opção 1: Script Automático (Recomendado)

```bash
cd ~/Secretária/Projeto\ Amigo\ Secreto
./deploy.sh
```

O script vai:
1. Configurar o Git
2. Adicionar repositório do GitHub
3. Fazer push automático

### Opção 2: Manual (Passo a Passo)

1. **Cria conta no GitHub** (gratuito)
   - https://github.com/signup

2. **Cria novo repositório**
   - Nome: `amigao`
   - Visibilidade: **PUBLIC**
   - https://github.com/new

3. **Faz push do código:**
   ```bash
   cd ~/Secretária/Projeto\ Amigo\ Secreto
   
   # Primeira vez apenas
   git config --global user.name "Jaime Mascarenhas"
   git config --global user.email "seu-email@gmail.com"
   
   # Adicionar remote
   git remote add origin https://github.com/SEU_USERNAME/amigao.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy no Render:**
   - Vai a https://render.com
   - Sign up com GitHub
   - New → Web Service
   - Seleciona repositório `amigao`
   - Configura:
     ```
     Build Command: npm install
     Start Command: node server.js
     Plan: Free
     ```
   - Deploy!

## 💰 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| GitHub | Public Repos | **GRÁTIS** ✅ |
| Render | Free Tier | **GRÁTIS** ✅ |
| **TOTAL** | | **$0/mês** 🎉 |

## ⚡ Características do Render Free

✅ Hosting ilimitado
✅ Bandwidth ilimitado  
✅ SSL/HTTPS automático
✅ Suporte a Node.js, Python, etc
✅ Build automático em cada push

⚠️ Hibernação após 15 min de inatividade (acorda ao primeiro acesso)
⚠️ Dados em memória (resetam se servidor reiniciar)

## 📱 URL Pública

Após deploy, receberas URL tipo:
```
https://amigao-xxxxx.onrender.com
```

## 📝 Ficheiros de Deployment Adicionados

- `DEPLOYMENT_GUIDE.md` - Guia em Markdown
- `public/deploy-guide.html` - Guia interativo (abre em browser)
- `deploy.sh` - Script automático

## 🎯 Próximos Passos

1. **Cria conta no GitHub** (5 min)
2. **Executa script deploy** (2 min)
3. **Deploy no Render** (3 min)
4. **Site online!** 🚀

Total: ~10 minutos para ter site público! ⏱️

## 🎉 Resultado Final

- Site público e gratuito
- Decorações natalícias massivas
- WhatsApp integration
- Sorteios funcionando
- URL compartilhável

**URL:** https://amigao-xxxxx.onrender.com 🌍

---

**Amigão v1.0.0** | Desenvolvido por Jaime Soares Mascarenhas ✨
🎅 🎄 🎁 ✨ ⛄ 🔔 💚 ❤️ 🌟 🎉
