// Estado da aplicação
let currentDrawing = null;
let drawings = [];
let currentEditToken = null; // Token de edição do sorteio atual

// API Base URL
const API_URL = '/api';

// App Info
const APP_INFO = {
  name: 'Amigão',
  version: '1.2.4',
  developer: 'Jaime Soares Mascarenhas'
};

// ============================================
// MODAL DO PROGRAMADOR
// ============================================

function openDeveloperModal() {
  const modal = document.getElementById('developerModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeDeveloperModal() {
  const modal = document.getElementById('developerModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

// Fechar modal com tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDeveloperModal();
  }
});

// ============================================
// FIM MODAL DO PROGRAMADOR
// ============================================

// LocalStorage keys para armazenar tokens
const STORAGE_KEY_TOKENS = 'amigao_edit_tokens'; // { drawingId: token }

// Carregar tokens guardados
function loadSavedTokens() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TOKENS)) || {};
  } catch {
    return {};
  }
}

// Guardar token de um sorteio
function saveEditToken(drawingId, token) {
  const tokens = loadSavedTokens();
  tokens[drawingId] = token;
  localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
}

// Recuperar token de um sorteio
function getEditToken(drawingId) {
  const tokens = loadSavedTokens();
  return tokens[drawingId];
}

// Guardar token do organizador
function saveOrganizerToken(drawingId, token) {
  const key = 'amigao_organizer_tokens';
  const tokens = JSON.parse(localStorage.getItem(key)) || {};
  tokens[drawingId] = token;
  localStorage.setItem(key, JSON.stringify(tokens));
}

// Obter token do organizador
function getOrganizerToken(drawingId) {
  const key = 'amigao_organizer_tokens';
  const tokens = JSON.parse(localStorage.getItem(key)) || {};
  return tokens[drawingId];
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Gera um token único para um resultado
 * @param {string} drawingId - ID do sorteio
 * @param {string} participantId - ID do participante
 * @returns {string} Token de 24 caracteres
 */
function generateResultToken(drawingId, participantId) {
  // Simples geração de token client-side para tokens únicos
  const data = `${drawingId}-${participantId}-${Date.now()}-${Math.random()}`;
  let hash = 0;
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const token = Math.abs(hash).toString(16).padStart(24, '0').substring(0, 24);
  return token;
}

/**
 * Formata um número de telefone para visualização
 * @param {string} phone - Número de telefone
 * @returns {string} Número formatado
 */
function formatPhone(phone) {
  if (!phone) return '';
  // Remove caracteres especiais
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 9) {
    return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return phone;
}

// ============================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ============================================

function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.add('hidden'));
  
  const page = document.getElementById(pageName);
  if (page) {
    page.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

function backToMenu() {
  currentDrawing = null;
  showPage('menuPage');
}

function backToDrawingsList() {
  loadDrawings();
}

// ============================================
// GESTÃO DE SORTEIOS
// ============================================

function showCreateDrawingForm() {
  document.getElementById('drawingName').value = '';
  document.getElementById('drawingMaxValue').value = '';
  showPage('createDrawingPage');
}

async function submitCreateDrawing(event) {
  event.preventDefault();

  const name = document.getElementById('drawingName').value.trim();
  const maxValue = parseFloat(document.getElementById('drawingMaxValue').value);

  if (!name || !maxValue || maxValue <= 0) {
    showMessage('Por favor, preenche todos os campos com valores válidos', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/drawings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, maxValue })
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.error || 'Erro ao criar sorteio', 'error');
      return;
    }

    const drawing = await response.json();
    
    // ✅ GUARDAR TOKENS PRIVADOS
    saveEditToken(drawing.id, drawing.editToken);
    saveOrganizerToken(drawing.id, drawing.organizerToken); // Guardar token do organizador
    currentEditToken = drawing.editToken;
    
    currentDrawing = drawing;
    showMessage(`Sorteio "${name}" criado com sucesso!`, 'success');
    
    // Aguardar um pouco antes de navegar
    setTimeout(() => {
      openDrawing(drawing.id);
    }, 500);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao criar sorteio', 'error');
  }
}

async function loadDrawings() {
  try {
    // ✅ PRIVACIDADE: A API não retorna mais lista de sorteios
    // Todos os sorteios são privados - apenas visíveis com token
    showPage('drawingsListPage');
    
    const list = document.getElementById('drawingsList');
    list.innerHTML = `
      <div class="empty-state">
        <p>🔐 Todos os sorteios são PRIVADOS!</p>
        <p>Para recuperar um sorteio anterior, precisas do link ou do token de edição que recebeste ao criar.</p>
        <p style="margin-top: 20px; font-weight: bold; color: #667eea;">💡 Cria um novo sorteio para começar!</p>
      </div>
    `;
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao carregar sorteios', 'error');
    showPage('menuPage');
  }
}

function displayDrawingsList() {
  // Esta função não é mais usada - sorteios são privados
}

async function openDrawing(drawingId) {
  try {
    // ✅ RECUPERAR EDIT TOKEN DO ARMAZENAMENTO LOCAL
    const editToken = getEditToken(drawingId);
    
    if (!editToken) {
      showMessage('Token de edição não encontrado. O sorteio é privado.', 'error');
      return;
    }
    
    const response = await fetch(`${API_URL}/drawings/${drawingId}?editToken=${editToken}`);
    if (!response.ok) {
      if (response.status === 403) {
        showMessage('Acesso negado. Token inválido ou sorteio não encontrado.', 'error');
      } else {
        showMessage('Sorteio não encontrado ou acesso recusado', 'error');
      }
      return;
    }

    currentDrawing = await response.json();
    currentEditToken = editToken; // Guardar token atual
    displayDrawingEditor();
    showPage('drawingEditorPage');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao abrir sorteio', 'error');
  }
}

function displayDrawingEditor() {
  if (!currentDrawing) return;

  // Atualizar título e info
  document.getElementById('drawingTitle').textContent = currentDrawing.name;
  document.getElementById('infoName').textContent = currentDrawing.name;
  document.getElementById('infoMaxValue').textContent = `${currentDrawing.maxValue}€`;
  document.getElementById('infoParticipants').textContent = currentDrawing.participants.length;
  document.getElementById('infoCreated').textContent = new Date(currentDrawing.createdAt).toLocaleDateString('pt-PT');

  // Atualizar listas
  updateParticipantsList();
  updateRestrictionSelects();
  updateRestrictionsList();
  
  // Limpar formulários
  document.getElementById('participantName').value = '';
  document.getElementById('participantPhone').value = '';

  // Atualizar estado do botão de sorteio
  const hasResult = currentDrawing.result && currentDrawing.result.length > 0;
  const viewResultsBtn = document.getElementById('viewResultsBtn');
  const intermediateActions = document.getElementById('intermediateActions');
  
  if (hasResult) {
    // Mostrar botão de consulta de resultados
    viewResultsBtn.style.display = 'block';
    intermediateActions.classList.remove('hidden');
    // Ocultar o container de resultados
    document.getElementById('resultsContainer').classList.add('hidden');
  } else {
    // Ocultar botão de consulta e ações se não há resultados
    viewResultsBtn.style.display = 'none';
    intermediateActions.classList.add('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
  }
}

async function deleteDrawing(drawingId) {
  if (!confirm('Tens a certeza que queres deletar este sorteio?')) return;

  try {
    const editToken = getEditToken(drawingId);
    if (!editToken) {
      showMessage('Token não encontrado', 'error');
      return;
    }

    const response = await fetch(`${API_URL}/drawings/${drawingId}`, { 
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editToken })
    });
    if (!response.ok) throw new Error('Erro ao deletar');

    showMessage('Sorteio deletado', 'success');
    setTimeout(() => {
      loadDrawings();
    }, 500);
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao deletar sorteio', 'error');
  }
}

// ============================================
// GESTÃO DE PARTICIPANTES
// ============================================

async function addParticipantToDrawing() {
  if (!currentDrawing) return;

  const name = document.getElementById('participantName').value.trim();
  const phone = document.getElementById('participantPhone').value.trim();

  if (!name || !phone) {
    showMessage('Por favor, preenche o nome e telefone', 'error');
    return;
  }

  // Validar telefone: apenas números e exatamente 9 dígitos
  if (!/^\d{9}$/.test(phone)) {
    showMessage('Telefone deve ter exatamente 9 dígitos numéricos', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/drawings/${currentDrawing.id}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, editToken: currentEditToken })
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.error || 'Erro ao adicionar participante', 'error');
      return;
    }

    currentDrawing = await response.json();
    document.getElementById('participantName').value = '';
    document.getElementById('participantPhone').value = '';
    updateParticipantsList();
    updateRestrictionSelects();
    showMessage(`${name} foi adicionado!`, 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao adicionar participante', 'error');
  }
}

async function removeParticipantFromDrawing(participantId) {
  if (!currentDrawing) return;

  try {
    const response = await fetch(`${API_URL}/drawings/${currentDrawing.id}/participants/${participantId}`, 
      { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken: currentEditToken })
      });

    if (!response.ok) throw new Error('Erro ao remover');

    currentDrawing = await response.json();
    updateParticipantsList();
    updateRestrictionSelects();
    updateRestrictionsList();
    showMessage('Participante removido', 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao remover participante', 'error');
  }
}

function updateParticipantsList() {
  if (!currentDrawing) return;

  const list = document.getElementById('participantsList');
  const count = currentDrawing.participants.length;
  document.getElementById('participantCount').textContent = count;
  document.getElementById('infoParticipants').textContent = count;

  if (count === 0) {
    list.innerHTML = '<p class="empty-state">Nenhum participante adicionado ainda</p>';
    return;
  }

  list.innerHTML = currentDrawing.participants.map(p => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-name">${p.name}</div>
        <div class="list-item-detail">📱 ${formatPhone(p.phone)}</div>
      </div>
      <div class="list-item-actions">
        <button onclick="removeParticipantFromDrawing('${p.id}')" class="btn btn-danger btn-small">
          Remover
        </button>
      </div>
    </div>
  `).join('');
}

function updateRestrictionSelects() {
  if (!currentDrawing) return;

  const fromSelect = document.getElementById('restrictionFrom');
  const toSelect = document.getElementById('restrictionTo');

  const options = currentDrawing.participants.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  fromSelect.innerHTML = '<option value="">Seleciona quem NÃO pode tirar:</option>' + options;
  toSelect.innerHTML = '<option value="">Seleciona quem não pode ser tirado:</option>' + options;
}

// ============================================
// GESTÃO DE RESTRIÇÕES
// ============================================

async function addRestrictionToDrawing() {
  if (!currentDrawing) return;

  const from = document.getElementById('restrictionFrom').value;
  const to = document.getElementById('restrictionTo').value;

  if (!from || !to) {
    showMessage('Seleciona os dois participantes', 'error');
    return;
  }

  if (from === to) {
    showMessage('Não podes adicionar uma restrição para a mesma pessoa', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/drawings/${currentDrawing.id}/restrictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, editToken: currentEditToken })
    });

    if (!response.ok) {
      const error = await response.json();
      showMessage(error.error || 'Erro ao adicionar restrição', 'error');
      return;
    }

    currentDrawing = await response.json();
    document.getElementById('restrictionFrom').value = '';
    document.getElementById('restrictionTo').value = '';
    updateRestrictionsList();
    showMessage('Restrição adicionada', 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao adicionar restrição', 'error');
  }
}

async function removeRestrictionFromDrawing(restrictionId) {
  if (!currentDrawing) return;

  try {
    const response = await fetch(`${API_URL}/drawings/${currentDrawing.id}/restrictions/${restrictionId}`, 
      { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken: currentEditToken })
      });

    if (!response.ok) throw new Error('Erro ao remover');

    currentDrawing = await response.json();
    updateRestrictionsList();
    showMessage('Restrição removida', 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao remover restrição', 'error');
  }
}

function updateRestrictionsList() {
  if (!currentDrawing) return;

  const list = document.getElementById('restrictionsList');

  if (currentDrawing.restrictions.length === 0) {
    list.innerHTML = '<p class="empty-state">Sem restrições</p>';
    return;
  }

  // Group mutual restrictions and show only once
  const seenPairs = new Set();
  const restrictionItems = [];

  currentDrawing.restrictions.forEach(r => {
    // Skip if this pair was already processed
    if (r.mutualPairId && seenPairs.has(r.mutualPairId)) {
      return;
    }

    if (r.mutualPairId) {
      seenPairs.add(r.mutualPairId);
    }

    const from = currentDrawing.participants.find(p => p.id === r.from);
    const to = currentDrawing.participants.find(p => p.id === r.to);
    
    const mututalIndicator = r.mutualPairId ? ' ↔' : '';
    const mutualLabel = r.mutualPairId ? ' (Restrição Mútua)' : '';

    restrictionItems.push(`
      <div class="list-item">
        <div class="list-item-info">
          <div class="list-item-name">${from?.name}${mututalIndicator} ${to?.name}</div>
          <div class="list-item-detail">${from?.name} não pode tirar ${to?.name}${mutualLabel}</div>
        </div>
        <div class="list-item-actions">
          <button onclick="removeRestrictionFromDrawing('${r.id}')" class="btn btn-danger btn-small">
            Remover
          </button>
        </div>
      </div>
    `);
  });

  list.innerHTML = restrictionItems.join('');
}

// ============================================
// SORTEIO
// ============================================

async function executeDrawing() {
  if (!currentDrawing || currentDrawing.participants.length < 2) {
    showMessage('Precisa de pelo menos 2 participantes', 'error');
    return;
  }

  const btn = document.getElementById('drawBtn');
  btn.disabled = true;
  btn.classList.add('loading');

  try {
    const drawing = performDrawing(currentDrawing.participants, currentDrawing.restrictions);

    if (drawing.success) {
      currentDrawing.result = drawing.result;
      
      // Guardar resultado no backend
      const response = await fetch(`${API_URL}/drawings/${currentDrawing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: drawing.result, editToken: currentEditToken })
      });

      if (response.ok) {
        currentDrawing = await response.json();
        // Preparar os resultados (mas não mostrar automaticamente)
        displayResults(drawing.result);
        // Mostrar botão de consulta
        document.getElementById('viewResultsBtn').style.display = 'block';
        // Mostrar botões intermediários
        document.getElementById('intermediateActions').classList.remove('hidden');
        // Ocultar container de resultados inicialmente
        document.getElementById('resultsContainer').classList.add('hidden');
        showMessage('Sorteio realizado com sucesso! Clica em "Ver Resultados" para consultar.', 'success');
        
        showOrganizerAccessLink(); // Mostra o link do organizador após o sorteio
      }
    } else {
      showMessage(drawing.error, 'error');
    }
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao fazer sorteio: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

function performDrawing(participants, restrictions) {
  if (participants.length < 2) {
    return { success: false, error: 'Precisa de pelo menos 2 participantes' };
  }

  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    let receivers = participants.map(p => p.id);
    receivers = shuffleArray(receivers);

    let valid = true;
    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i];
      const receiverId = receivers[i];

      if (giver.id === receiverId) {
        valid = false;
        break;
      }

      for (const restriction of restrictions) {
        if (restriction.from === giver.id && restriction.to === receiverId) {
          valid = false;
          break;
        }
      }

      if (!valid) break;
    }

    if (valid) {
      const result = [];
      for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        const receiverId = receivers[i];
        const receiver = participants.find(p => p.id === receiverId);

        result.push({
          from: giver.name,
          fromId: giver.id,
          fromPhone: giver.phone,
          to: receiver.name,
          toId: receiver.id,
          toPhone: receiver.phone,
          maxValue: currentDrawing.maxValue,
          token: generateResultToken(currentDrawing.id, giver.id),
          restrictions: currentDrawing.restrictions
        });
      }

      return { success: true, result, attempts };
    }

    attempts++;
  }

  return {
    success: false,
    error: `Não foi possível fazer um sorteio válido após ${maxAttempts} tentativas. Tenta remover algumas restrições.`,
    attempts
  };
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function displayResults(results) {
  const container = document.getElementById('resultsContainer');
  const list = document.getElementById('resultsList');

  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  list.innerHTML = results.map((result, index) => `
    <div class="result-card" style="background: ${colors[index % colors.length]}">
      <div class="result-from">👤 ${result.from}</div>
      <div style="text-align: center; margin: 15px 0;">
        <div style="font-size: 2em;">⬇️</div>
      </div>
      <div class="result-to">🎁 ${result.to}</div>
      <div class="result-value">💰 Valor máximo: ${result.maxValue}€</div>
    </div>
  `).join('');
}

function toggleResultsView() {
  const container = document.getElementById('resultsContainer');
  container.classList.toggle('hidden');
  
  // Se abrir, scroll para os resultados
  if (!container.classList.contains('hidden')) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function sendViaWhatsApp() {
  if (!currentDrawing || !currentDrawing.result || currentDrawing.result.length === 0) {
    showMessage('Nenhum sorteio para enviar', 'error');
    return;
  }

  // Mostrar modal com lista de participantes
  showParticipantsList();
}

function showParticipantsList() {
  if (!currentDrawing || !currentDrawing.result) return;
  
  const modal = document.createElement('div');
  modal.id = 'participantsModal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
  
  const content = document.createElement('div');
  content.style.cssText = 'background: white; border-radius: 15px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;';
  
  let html = '<h2>📱 Enviar Resultados por WhatsApp</h2><p style="margin-bottom: 20px;">Clica no participante para enviar o link do seu resultado:</p>';
  
  currentDrawing.result.forEach((result, index) => {
    const sentClass = `sent-status-${index}`;
    html += `
      <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>👤 ${result.from}</strong><br>
          <small>📱 ${result.fromPhone}</small>
        </div>
        <button onclick="sendIndividualWhatsApp(${index}, this)" class="btn btn-primary btn-small">
          💬 Enviar
        </button>
        <span class="${sentClass}" style="display:none; color: #4CAF50; font-weight: bold;">✓</span>
      </div>
    `;
  });
  
  html += '<br><button onclick="closeParticipantsModal()" class="btn btn-secondary btn-small">Fechar</button>';
  
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function closeParticipantsModal() {
  const modal = document.getElementById('participantsModal');
  if (modal) modal.remove();
}

async function sendIndividualWhatsApp(index, btn) {
  if (!currentDrawing || !currentDrawing.result || currentDrawing.result.length === 0) {
    showMessage('Nenhum sorteio para enviar', 'error');
    return;
  }

  const result = currentDrawing.result[index];
  if (!result) return;
  
  btn.disabled = true;

  try {
    // Gerar link direto para o resultado individual
    const baseUrl = window.location.origin;
    const resultLink = `${baseUrl}/resultado.html?drawing=${currentDrawing.id}&token=${result.token}`;
    
    // Criar mensagem com link
    const message = `🎁 *${APP_INFO.name}* 🎁\n\nOlá ${result.from}!\n\nClica no link abaixo para ver em quem caíste no sorteio de *${currentDrawing.name}*:\n\n${resultLink}\n\n${APP_INFO.name} v${APP_INFO.version}\nDesenvolvido por ${APP_INFO.developer}\n© 2025`;
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${result.fromPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappLink, '_blank');
    
    // Mostrar indicação de envio
    btn.style.display = 'none';
    const sentSpan = btn.parentElement.querySelector(`[class="sent-status-${index}"]`);
    if (sentSpan) sentSpan.style.display = 'inline-block';
    
    showMessage(`✓ Link enviado para ${result.from}!`, 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao gerar link WhatsApp', 'error');
    btn.disabled = false;
  }
}

async function sendSingleWhatsApp(index) {
  if (!currentDrawing || !currentDrawing.result || currentDrawing.result.length === 0) {
    showMessage('Nenhum sorteio para enviar', 'error');
    return;
  }

  const result = currentDrawing.result[index];
  if (!result) return;

  const btn = document.getElementById(`btn-${index}`);
  const sentSpan = document.getElementById(`sent-${index}`);
  
  btn.disabled = true;

  try {
    // Gerar link direto para o resultado individual
    const baseUrl = window.location.origin;
    const resultLink = `${baseUrl}/resultado.html?drawing=${currentDrawing.id}&token=${result.token}`;
    
    // Criar mensagem com link
    const message = `🎁 *${APP_INFO.name}* 🎁\n\nOlá ${result.from}!\n\nClica no link abaixo para ver em quem caíste no sorteio de *${currentDrawing.name}*:\n\n${resultLink}\n\n${APP_INFO.name} v${APP_INFO.version}\nDesenvolvido por ${APP_INFO.developer}\n© 2025`;
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${result.fromPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappLink, '_blank');
    
    // Mostrar indicação de envio
    btn.style.display = 'none';
    sentSpan.style.display = 'inline-block';
    
    showMessage(`✓ Link enviado para ${result.from}!`, 'success');
  } catch (error) {
    console.error('Erro:', error);
    showMessage('Erro ao gerar link WhatsApp', 'error');
    btn.disabled = false;
  }
}

function downloadResults() {
  if (!currentDrawing || !currentDrawing.result || currentDrawing.result.length === 0) {
    showMessage('Nenhum sorteio para descarregar', 'error');
    return;
  }

  let csv = 'Quem Tira,Telefone,Tira Quem,Valor Máximo\n';
  currentDrawing.result.forEach(result => {
    csv += `"${result.from}","${result.fromPhone}","${result.to}",${result.maxValue}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sorteio-${currentDrawing.name}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  showMessage('Resultados descarregados!', 'success');
}

function resetDrawing() {
  currentDrawing.result = null;
  document.getElementById('intermediateActions').classList.add('hidden');
  document.getElementById('viewResultsBtn').style.display = 'none';
  document.getElementById('resultsContainer').classList.add('hidden');
  showMessage('Sorteio resetado', 'info');
}

// ============================================
// UTILITÁRIOS
// ============================================

function showMessage(text, type = 'info') {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;

  const mainContent = document.querySelector('.main-content');
  mainContent.insertBefore(message, mainContent.firstChild);

  setTimeout(() => message.remove(), 5000);
}

function formatPhone(phone) {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3');
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Atualizar versão no footer
  const footerEl = document.getElementById('footerVersion');
  if (footerEl) {
    footerEl.textContent = `🎄 Amigão v${APP_INFO.version} 🎄 | Desenvolvido por ${APP_INFO.developer} ✨ | © 2025 ❤️ 💚`;
  }
  
  // Verificar se há sorteio na URL para acesso direto
  const params = new URLSearchParams(window.location.search);
  const drawingId = params.get('drawing');
  const token = params.get('token');
  
  if (drawingId && token) {
    // Guardar token se for fornecido na URL
    saveEditToken(drawingId, token);
    currentEditToken = token;
    
    // Carregar o sorteio diretamente
    loadDrawingFromUrl(drawingId, token);
  } else {
    showPage('menuPage');
  }
});

async function loadDrawingFromUrl(drawingId, token) {
  try {
    const response = await fetch(`${API_URL}/drawings/${drawingId}?editToken=${token}`);
    
    if (!response.ok) {
      showMessage('❌ Link inválido ou sorteio não encontrado', 'error');
      showPage('menuPage');
      return;
    }
    
    const drawing = await response.json();
    currentDrawing = drawing;
    currentEditToken = token;
    
    // Mostrar a página do editor e atualizar dados
    showPage('drawingEditorPage');
    displayDrawingEditor();
    
    showMessage('✓ Sorteio carregado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao carregar sorteio:', error);
    showMessage('❌ Erro ao carregar sorteio', 'error');
    showPage('menuPage');
  }
}

function showOrganizerAccessLink() {
  if (!currentDrawing) return;
  const editToken = getEditToken(currentDrawing.id);
  if (!editToken) return;
  const baseUrl = window.location.origin;
  const organizerLink = `${baseUrl}?drawing=${currentDrawing.id}&token=${editToken}`;
  const el = document.getElementById('organizerResultLink');
  if (el) {
    el.innerHTML = `<b>🔐 Link privado do organizador (aceder ao sorteio):</b><br><a href="${organizerLink}" target="_blank">${organizerLink}</a><br><small>Guarda este link para aceder ao sorteio mais tarde</small>`;
    el.style.display = 'block';
  }
}
