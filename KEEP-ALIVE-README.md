# 🚀 Amigão Keep-Alive

Scripts para manter o site **amigao.onrender.com** sempre ativo no Render.

O Render dorme servidores inativos após 15 minutos, mas estes scripts mantêm o site "acordado" fazendo requisições a cada 10 minutos.

## ✅ Opção 1: Python (Recomendado - Mais Fácil)

### Requisitos
- Python 3.x instalado ([Download aqui](https://www.python.org/downloads/))

### Como usar

1. **Abre PowerShell ou CMD** na pasta do projeto
   
2. **Instala a dependência** (apenas 1 vez):
   ```bash
   pip install requests
   ```

3. **Executa o script**:
   ```bash
   python keep-alive.py
   ```

4. **Deixa a janela aberta** enquanto queres manter o site ativo
   - Podes minimizar a janela
   - Para parar: pressiona `CTRL+C`

### Exemplo de Output
```
[03/12/2025 10:15:30] 🚀 Amigão Keep-Alive iniciado!
[03/12/2025 10:15:30] 📍 URL: https://amigao.onrender.com/
[03/12/2025 10:15:30] ⏱️  Intervalo: a cada 10 minutos
[03/12/2025 10:15:30] 🔄 Enviando primeira requisição...
[03/12/2025 10:15:31] ✅ Site ativo! Status: 200 | Tempo: 1250ms
```

---

## 🟢 Opção 2: Node.js

### Requisitos
- Node.js instalado ([Download aqui](https://nodejs.org/))

### Como usar

1. **Abre PowerShell ou CMD** na pasta do projeto

2. **Executa o script**:
   ```bash
   node keep-alive.js
   ```

3. **Deixa a janela aberta**
   - Para parar: pressiona `CTRL+C`

---

## 📋 O que o script faz?

- ✅ Faz uma requisição HTTP ao site a cada 10 minutos
- ✅ Mostra se o site está ativo (Status 200)
- ✅ Mostra o tempo de resposta
- ✅ Mostra estatísticas de sucesso (a cada hora)
- ✅ Se falhar, continua a tentar
- ✅ Colorido e fácil de ler

---

## ⏰ Agendamento Automático (Windows)

Para que o script execute automaticamente quando ligas o PC:

### Opção A: Task Scheduler (Nativo do Windows)

1. **Abre Task Scheduler**:
   - Prima `Win + R`
   - Digita: `taskschd.msc`
   - Enter

2. **Create Basic Task**:
   - Name: "Amigão Keep-Alive"
   - Trigger: "At log on"
   - Action: "Start a program"
   - Program: `python` ou `node`
   - Arguments: `C:\caminho\para\keep-alive.py` (ou `.js`)

3. **OK**

Agora o script vai executar automaticamente sempre que fazes login!

### Opção B: Atalho na Pasta de Startup

1. Cria um ficheiro `.bat`:
   ```bat
   @echo off
   cd "C:\caminho\para\Projeto Amigo Secreto"
   python keep-alive.py
   pause
   ```

2. Salva como `keep-alive.bat`

3. Cola em: `C:\Users\TeuNome\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

---

## 🔍 Troubleshooting

### "ModuleNotFoundError: No module named 'requests'"
```bash
pip install requests
```

### "Python não é reconhecido como comando"
- Reinstala Python
- Marca a opção **"Add Python to PATH"** na instalação

### Script para ao fazer login
- Certifica-te que deixas a janela aberta
- Podes minimizar, mas não fechar

### Quer saber o custo?
- Cada requisição é mínima (~1KB)
- 6 requisições por hora = ~6KB/hora
- 144 requisições por dia = ~0.14MB/dia
- **Praticamente nada!** 📊

---

## 💡 Dicas

- **Para ganhar mais tempo**: Muda `CHECK_INTERVAL = 10 * 60` para `CHECK_INTERVAL = 5 * 60` (5 minutos)
- **Para poupar**: Muda para `CHECK_INTERVAL = 15 * 60` (15 minutos)
- **Só precisa de correr enquanto o site recebe visitantes**

---

## ❓ Perguntas

Se tiver problemas, verifica:
1. Tens internet ativa?
2. O Render está em funcionamento? (Testa manualmente: https://amigao.onrender.com/)
3. Tens a versão certa de Python/Node instalada?

**Boa sorte! 🎉**
