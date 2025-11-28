# 🎅 Amigão - Sorteio de Amigo Secreto

Uma aplicação web elegante e funcional para organizar sorteios de Amigo Secreto com integração WhatsApp.

## ✨ Funcionalidades

- ✅ **Gestão de Participantes**: Adiciona/remove participantes com nome, telefone e valor máximo
- 🎲 **Sorteio Automático**: Algoritmo inteligente que garante validade
- 🚫 **Restrições**: Define quem não pode tirar quem
- 💬 **WhatsApp Integration**: Envio de resultados via WhatsApp
- 📥 **Exportação**: Descarrega resultados em CSV
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile
- 🎨 **Interface Linda**: Design moderno e intuitivo

## 🚀 Como Começar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional para WhatsApp)

Copia o ficheiro `.env.example` para `.env`:

```bash
cp .env.example .env
```

Se quiseres usar WhatsApp via API (Twilio), preenche:
- `WHATSAPP_API_KEY`
- `WHATSAPP_ACCOUNT_SID`
- `WHATSAPP_PHONE_NUMBER`

### 3. Iniciar o Servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor vai estar disponível em `http://localhost:3000`

## 📖 Como Usar

1. **Adiciona Participantes**
   - Preenche nome, telefone (com código de país) e valor máximo
   - Clica em "Adicionar"

2. **Define Restrições (Opcional)**
   - Seleciona pessoas que não podem tirar uma à outra
   - Clica em "Adicionar Restrição"

3. **Faz o Sorteio**
   - Clica em "Fazer Sorteio" 🎲
   - Os resultados aparecerão em cards coloridos

4. **Envia por WhatsApp**
   - Clica em "Enviar por WhatsApp"
   - Os links vão abrir automaticamente no teu browser
   - Completa os envios manualmente no WhatsApp

5. **Descarrega Resultados**
   - Clica em "Descarregar Resultados" para guardar em CSV

## 🔄 Integração WhatsApp

### Opção 1: Links Diretos (Sem API) ⭐ Recomendado para Testes

A aplicação usa links WhatsApp diretos que abrem no browser. Simplesmente:
- Clica em "Enviar por WhatsApp"
- Escreve a mensagem manualmente no WhatsApp
- Envia

### Opção 2: API Twilio (Automático)

Para envios automáticos:

1. Cria conta em https://www.twilio.com
2. Pega o Account SID e Auth Token
3. Configura em `.env`
4. O envio acontece automaticamente

## 📁 Estrutura do Projeto

```
.
├── server.js                 # Servidor Express
├── package.json             # Dependências
├── .env.example            # Variáveis de ambiente
├── .gitignore
├── routes/
│   ├── participants.js      # API de participantes
│   ├── drawing.js          # API de sorteio
│   └── whatsapp.js         # API WhatsApp
├── utils/
│   └── DrawingAlgorithm.js # Algoritmo de sorteio
└── public/
    ├── index.html          # HTML principal
    ├── styles.css          # Estilos
    └── script.js           # JavaScript frontend
```

## 🎯 Algoritmo de Sorteio

O algoritmo garante:
- ✅ Ninguém tira a si próprio
- ✅ Todas as restrições são respeitadas
- ✅ Resultado completamente aleatório
- ✅ Máximo de 100 tentativas (raramente precisa)

## 🔒 Dados

- Atualmente os dados são armazenados em **memória** (recarregar página limpa tudo)
- Para persistência, pode ser facilmente conectado a uma base de dados (MongoDB, PostgreSQL, etc.)

## 🚀 Deploy

### Vercel (Recomendado para Node.js)
```bash
npm install -g vercel
vercel
```

### Heroku
```bash
heroku create
git push heroku main
```

### Docker
```bash
docker build -t amigo-secreto .
docker run -p 3000:3000 amigo-secreto
```

## 🐛 Troubleshooting

**"Porta 3000 já está em uso"**
```bash
# Muda a porta
PORT=3001 npm start
```

**"Erro ao adicionar participante"**
- Verifica se o formato do telefone é correto: `+351912345678` ou `912345678`

**"Sorteio inválido"**
- Tens demasiadas restrições. Tenta remover algumas.

## 📝 Notas

- Telefones são guardados em texto puro. Em produção, considere encriptação.
- Os dados em memória são perdidos ao reiniciar o servidor.
- Para produção, recomenda-se usar uma base de dados real.

## 👨‍💻 Desenvolvido por Jaime Soares Mascarenhas

**Amigão v1.0.0** - Desenvolvido com ❤️ para o Natal 2025

---

**Dúvidas ou sugestões?** Sinta-se à vontade para contribuir!
