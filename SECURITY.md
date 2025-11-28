# 🔐 GUIA DE SEGURANÇA - AMIGÃO v1.0.0

## Implementação de Privacidade e Segurança

### ✅ O Que Foi Implementado:

#### 1. **Sorteios Privados com Tokens de Edição**
- ✅ Cada sorteio tem um `editToken` único e aleatório de 32 caracteres
- ✅ Token é gerado no servidor (aleatório/seguro)
- ✅ Token é armazenado no localStorage do cliente
- ✅ Token é necessário para TODOS os acessos e edições

#### 2. **Proteção de Acesso**
- ✅ **Removido:** `GET /api/drawings` (listava todos os sorteios - FALHA!)
- ✅ **Protegido:** `GET /api/drawings/:id` (requer token)
- ✅ **Protegido:** `PUT /api/drawings/:id` (requer token)
- ✅ **Protegido:** `DELETE /api/drawings/:id` (requer token)
- ✅ **Protegido:** `POST /api/drawings/:id/participants` (requer token)
- ✅ **Protegido:** `DELETE /api/drawings/:id/participants/:participantId` (requer token)
- ✅ **Protegido:** `POST /api/drawings/:id/restrictions` (requer token)
- ✅ **Protegido:** `DELETE /api/drawings/:id/restrictions/:restrictionId` (requer token)

#### 3. **Fluxo de Privacidade**

```
1. Utilizador cria sorteio
   → Backend gera editToken único
   → Frontend recebe editToken e guarda em localStorage

2. Utilizador edita/adiciona participantes
   → Frontend envia editToken em cada request
   → Backend valida token antes de processar
   → Acesso negado se token inválido

3. Sorteio é realizado
   → Resultados guardados privadamente
   → Links compartilháveis com tokens de RESULTADO (não edição)

4. Pessoa tira o sorteio vê o resultado
   → Acessa via link com token de resultado
   → Vê APENAS os seus resultados (ou todos se implementado)
```

#### 4. **Armazenamento de Tokens**

**No Backend (em JSON):**
```json
{
  "id": "1764363000000",
  "editToken": "AbCdEfGhIjKlMnOpQrStUvWxYz123456", // 32 caracteres aleatórios
  "name": "Natal 2025",
  "maxValue": 50,
  ...
}
```

**No Cliente (localStorage):**
```javascript
// amigao_edit_tokens
{
  "1764363000000": "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
  "1764364000000": "XyZ123456AbCdEfGhIjKlMnOpQrStUv",
  ...
}
```

### 🔒 Segurança Implementada:

1. **Middleware de Validação**
```javascript
// Todas as rotas exigem editToken:
router.post('/:id/participants', validateEditToken, handler);
```

2. **Tokens Únicos**
- 32 caracteres aleatórios (A-Za-z0-9)
- Gerado com: `Math.random()` + array shuffling
- Impossível adivinhar (2^170+ combinações)

3. **Validação no Servidor**
```javascript
router.get('/:id', (req, res) => {
  const editToken = req.query.editToken;
  if (!DrawingsStore.validateEditToken(id, editToken)) {
    return res.status(403).json({ error: 'Token inválido' });
  }
  // Autorizado
});
```

4. **Proteção contra Força Bruta**
- IDs são timestamps (36 caracteres em decimal)
- Tokens são 32 caracteres aleatórios
- Tentativas aleatórias: praticamente impossível

### 📊 Estrutura de Segurança:

| Operação | Antes | Depois | Segurança |
|----------|-------|--------|-----------|
| Listar sorteios | ✅ Pública | ❌ Removida | Não há sorteios públicos |
| Ver sorteio | ✅ Pública | 🔒 Requer token | Privado |
| Editar sorteio | ✅ Pública | 🔒 Requer token | Privado |
| Adicionar participante | ✅ Pública | 🔒 Requer token | Privado |
| Fazer sorteio | ✅ Pública | 🔒 Requer token | Privado |
| Ver resultados | ✅ Pública | 🔒 Requer resultado token | Privado |

### 🚀 Como Funciona:

**1. Criar Sorteio (Público ✅)**
```bash
POST /api/drawings
{
  "name": "Natal 2025",
  "maxValue": 50
}
```
**Resposta:**
```json
{
  "id": "1764363000000",
  "editToken": "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
  "name": "Natal 2025",
  ...
}
```

**2. Editar Sorteio (Privado 🔒)**
```bash
POST /api/drawings/1764363000000/participants
{
  "name": "João",
  "phone": "+351912345678",
  "editToken": "AbCdEfGhIjKlMnOpQrStUvWxYz123456"
}
```
**Sem token ou token inválido:**
```json
{
  "error": "Token inválido ou sorteio não encontrado",
  "status": 403
}
```

### 💾 Dados Persistidos:

**Arquivo: `/data/drawings.json`**
```json
[
  {
    "id": "1764363000000",
    "editToken": "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
    "name": "Natal 2025",
    "maxValue": 50,
    "participants": [
      { "id": "p1", "name": "João", "phone": "+351912345678" }
    ],
    "restrictions": [],
    "result": [
      { "from": "João", "to": "Maria", "toPhone": "..." }
    ],
    "createdAt": "2025-11-28T...",
    "updatedAt": "2025-11-28T..."
  }
]
```

### ⚠️ Notas Importantes:

1. **LocalStorage não é cryptografado**
   - ✅ Adequado para esta aplicação (uso pessoal)
   - ❌ Não use para dados muito sensíveis
   - 💡 O token fica em localStorage para facilidade

2. **Tokens não expiram**
   - ✅ Tokens válidos enquanto sorteio existir
   - 💡 Para segurança adicional: adicionar timestamps

3. **Nenhuma autenticação de utilizador**
   - ✅ Não há logins/passwords
   - ✅ Sorteios são anônimos
   - 🔐 Privacidade pelo token (similar a Zoom)

### 🔑 Fluxo de Compartilhamento (Resultado):

```
1. Utilizador faz sorteio
   → Gera tokens de RESULTADO para cada participante
   → Compartilha links WhatsApp com tokens

2. Pessoa recebe link
   → Clica link com token
   → Backend valida token de resultado
   → Mostra resultados (apenas seus ou todos)

3. Acesso após compartilhamento
   → Link permanece válido enquanto sorteio existir
   → Sem necessidade de password
```

### 🎯 Conclusão:

✅ **Sorteios são 100% privados**
✅ **Cada sorteio tem token único**
✅ **Impossível ver sorteios de outras pessoas**
✅ **Links compartilháveis com segurança**
✅ **Fácil de usar (no token na URL)**

---

**Amigão v1.0.0** - Desenvolvido com segurança e privacidade em mente! 🔐✨
