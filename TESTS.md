# 🧪 TESTES DE SEGURANÇA - AMIGÃO

## Como Testar a Privacidade e Segurança

### ✅ Teste 1: Sorteios Não São Listados Publicamente

**Objetivo:** Verificar que `GET /api/drawings` não funciona

```bash
# Terminal
curl -X GET http://localhost:3000/api/drawings
```

**Resultado esperado:**
```json
{
  "error": "Not Found"
}
// Ou status 404/403
```

**Resultado ❌ BAD (se aparecer lista):**
```json
[
  {
    "id": "1764363000000",
    "name": "Sorteio",
    ...
  }
]
```

---

### ✅ Teste 2: Sorteio Sem Token É Inacessível

**Objetivo:** Verificar que `GET /api/drawings/:id` requer token

**Passo 1:** Criar um sorteio (copiar o ID e token)
```javascript
// No console da app (F12)
// Após criar um sorteio, copiar:
const token = localStorage.getItem('amigao_edit_tokens');
console.log(token); // Ver todos os tokens
```

**Passo 2:** Tentar aceder sem token
```bash
curl -X GET "http://localhost:3000/api/drawings/1764363000000"
```

**Resultado esperado:**
```json
{
  "error": "Token inválido ou sorteio não encontrado"
}
// Status: 403 Forbidden
```

**Passo 3:** Aceder COM token
```bash
curl -X GET "http://localhost:3000/api/drawings/1764363000000?editToken=AbCdEfGhIjKlMnOpQrStUvWxYz123456"
```

**Resultado esperado:**
```json
{
  "id": "1764363000000",
  "name": "Sorteio",
  "participants": [...],
  ...
}
// Status: 200 OK
```

---

### ✅ Teste 3: Edições Exigem Token

**Objetivo:** Verificar que POST/PUT/DELETE exigem `editToken`

**Teste 3.1: Adicionar participante SEM token**
```bash
curl -X POST "http://localhost:3000/api/drawings/1764363000000/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "phone": "+351912345678"
  }'
```

**Resultado esperado:**
```json
{
  "error": "Token inválido ou sorteio não encontrado"
}
// Status: 403 Forbidden
```

**Teste 3.2: Adicionar participante COM token**
```bash
curl -X POST "http://localhost:3000/api/drawings/1764363000000/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "phone": "+351912345678",
    "editToken": "AbCdEfGhIjKlMnOpQrStUvWxYz123456"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "participant": { "id": "p1", "name": "João", ... }
}
// Status: 201 Created
```

---

### ✅ Teste 4: Tokens São Aleatórios e Únicos

**Objetivo:** Verificar que cada sorteio tem token diferente

**Passo 1:** Criar 3 sorteios na app

**Passo 2:** Ver os tokens no localStorage
```javascript
// No console (F12)
JSON.parse(localStorage.getItem('amigao_edit_tokens'))
```

**Resultado esperado:**
```json
{
  "1764363000000": "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
  "1764364000000": "XyZ123456AbCdEfGhIjKlMnOpQrStUv",
  "1764365000000": "QwErTyUiOpAsdfGhJklZxcVbnM12345"
}
```

**Características:**
- ✅ Cada token é DIFERENTE
- ✅ Cada token tem 32 caracteres
- ✅ Tokens parecem aleatórios

---

### ✅ Teste 5: Token Incorreto É Rejeitado

**Objetivo:** Verificar que tokens inválidos não funcionam

```bash
# Token correto (do sorteio)
TOKEN_CORRETO="AbCdEfGhIjKlMnOpQrStUvWxYz123456"

# Tentar com token errado
curl -X POST "http://localhost:3000/api/drawings/1764363000000/participants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria",
    "phone": "+351987654321",
    "editToken": "INVALID_TOKEN_WRONG_WRONG_WRONG"
  }'
```

**Resultado esperado:**
```json
{
  "error": "Token inválido ou sorteio não encontrado"
}
// Status: 403 Forbidden
```

---

### ✅ Teste 6: Duas Pessoas NÃO Podem Ver o Sorteio Uma da Outra

**Objetivo:** Simular dois utilizadores sem acesso cruzado

**Simulação:**
```bash
# Utilizador 1: Criar sorteio (copia o ID e token)
curl -X POST http://localhost:3000/api/drawings \
  -H "Content-Type: application/json" \
  -d '{"name": "Sorteio Utilizador 1", "maxValue": 50}'

# Resposta:
{
  "id": "1764363000000",
  "editToken": "TokenUtilizador1111111111111111"
}

# Utilizador 2: Tentar aceder ao sorteio do Utilizador 1
curl -X GET "http://localhost:3000/api/drawings/1764363000000"
# ❌ Erro: Falta token

curl -X GET "http://localhost:3000/api/drawings/1764363000000?editToken=ADIVINHE"
# ❌ Erro: Token inválido
```

**Resultado esperado:**
- ✅ Utilizador 2 NÃO consegue ver o sorteio do Utilizador 1
- ✅ Sem token, sorteio é inacessível
- ✅ Token inválido é rejeitado

---

### ✅ Teste 7: Compartilhamento de Resultados

**Objetivo:** Verificar que links de resultado funcionam

**Quando estiver implementado:**

```bash
# Após fazer sorteio, gera link de resultado
# Exemplo: http://localhost:3000?result=1764363000000&token=RESULTADO_TOKEN

# Pessoa clica no link
# ✅ Vê os resultados (privadamente)
# ✅ Sem necessidade de editToken
```

---

## 🚀 Script Automático de Testes

Crie arquivo `test-security.sh`:

```bash
#!/bin/bash

echo "🧪 TESTES DE SEGURANÇA - AMIGÃO"
echo "================================"
echo ""

# Criar sorteio
echo "✅ Teste 1: Criar sorteio"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/drawings \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste Segurança", "maxValue": 100}')

DRAWING_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
EDIT_TOKEN=$(echo $RESPONSE | grep -o '"editToken":"[^"]*' | cut -d'"' -f4)

echo "ID: $DRAWING_ID"
echo "Token: $EDIT_TOKEN"
echo ""

# Teste 2: Aceder sem token
echo "✅ Teste 2: Aceder SEM token (deve falhar)"
curl -s -X GET "http://localhost:3000/api/drawings/$DRAWING_ID" | head -c 100
echo ""
echo ""

# Teste 3: Aceder com token
echo "✅ Teste 3: Aceder COM token (deve funcionar)"
curl -s -X GET "http://localhost:3000/api/drawings/$DRAWING_ID?editToken=$EDIT_TOKEN" | grep -o '"name":"[^"]*'
echo ""
echo ""

# Teste 4: Adicionar participante sem token
echo "✅ Teste 4: Adicionar participante SEM token (deve falhar)"
curl -s -X POST "http://localhost:3000/api/drawings/$DRAWING_ID/participants" \
  -H "Content-Type: application/json" \
  -d '{"name":"João","phone":"+351912345678"}' | head -c 100
echo ""
echo ""

# Teste 5: Adicionar participante com token
echo "✅ Teste 5: Adicionar participante COM token (deve funcionar)"
curl -s -X POST "http://localhost:3000/api/drawings/$DRAWING_ID/participants" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"João\",\"phone\":\"+351912345678\",\"editToken\":\"$EDIT_TOKEN\"}" | grep -o '"id":"[^"]*'
echo ""
echo ""

echo "✅ Todos os testes completados!"
```

**Usar:**
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## 📋 Checklist de Segurança

Marque conforme testa:

- [ ] `GET /api/drawings` retorna 404/403 (não lista)
- [ ] `GET /api/drawings/:id` sem token retorna 403
- [ ] `GET /api/drawings/:id?editToken=X` funciona
- [ ] `POST participant` sem token retorna 403
- [ ] `POST participant` com token funciona
- [ ] Cada sorteio tem token único
- [ ] Token inválido é rejeitado
- [ ] Dois utilizadores não vêm sorteios um do outro
- [ ] Tokens persistem em localStorage
- [ ] Resultados são privados (quando implementado)

---

## 🎯 Conclusão

Se todos os testes passarem: ✅ **Amigão é seguro e privado!**

