# 🎄 CRIAR REPOSITÓRIO NO GITHUB - PASSO A PASSO

## ⚠️ O repositório `amigao` ainda NÃO existe na tua conta GitHub!

Segue estes passos para criar:

### 1. Vai ao GitHub
- Abre: https://github.com/new
- Ou: Login → Click no `+` (canto superior direito) → New repository

### 2. Preenche os campos:
```
Repository name: amigao
Description: 🎄 Amigão - Secret Santa Sorteio de Amigo Secreto com WhatsApp
Visibility: PUBLIC (⭐ IMPORTANTE - tem de ser PUBLIC para ser gratuito!)
Initialize repository: Deixa em branco (não importa)
```

### 3. Clica em "Create repository"

### 4. Depois de criar, verás instruções. Tu só precisas de:

```bash
# No terminal, na pasta do projeto:
cd ~/Secretária/Projeto\ Amigo\ Secreto

# Faz push do código
git push -u origin main
```

## Se tiveres problemas com autenticação:

### Opção A: SSH Key (Recomendado)
```bash
ssh -T git@github.com
```
Se responde "Hi jaimemascarenhas! You've successfully authenticated", estás pronto!

### Opção B: Personal Access Token (Se SSH não funcionar)
1. GitHub Settings → Developer settings → Personal access tokens → Generate new token
2. Escolhe: `repo` (todos os permissões de repositório)
3. Copia o token
4. Na primeira vez que o Git pedir password, cola o token em vez da password

### Opção C: HTTPS com credenciais
```bash
# Muda para HTTPS com credenciais
git config credential.helper store
git push -u origin main
# Na primeira vez vai pedir username e password (ou token)
```

## Depois de criar o repositório:

Se vires que funcionou:
```bash
git log --oneline | head -5
```

Deverias ver os commits do Amigão!

---

**Próximo passo:** Deploy no Render!
