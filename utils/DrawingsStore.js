const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DRAWINGS_FILE = path.join(DATA_DIR, 'drawings.json');

// Criar diretório se não existir
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Criar ficheiro inicial se não existir
if (!fs.existsSync(DRAWINGS_FILE)) {
  fs.writeFileSync(DRAWINGS_FILE, JSON.stringify([], null, 2));
}

class DrawingsStore {
  /**
   * Carrega todos os sorteios do ficheiro
   */
  static loadAll() {
    try {
      const data = fs.readFileSync(DRAWINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      return [];
    }
  }

  /**
   * Guarda todos os sorteios no ficheiro
   */
  static saveAll(drawings) {
    try {
      fs.writeFileSync(DRAWINGS_FILE, JSON.stringify(drawings, null, 2));
      return true;
    } catch (error) {
      console.error('Erro ao guardar sorteios:', error);
      return false;
    }
  }

  /**
   * Carrega um sorteio específico
   */
  static getById(id) {
    const drawings = this.loadAll();
    return drawings.find(d => d.id === id);
  }

  /**
   * Cria um novo sorteio
   */
  static create(name, maxValue) {
    const drawings = this.loadAll();
    
    // Gerar token único de edição
    const editToken = this.generateSecureToken();
    const organizerToken = this.generateSecureToken(); // Token para ver todos os resultados
    
    const newDrawing = {
      id: Date.now().toString(),
      editToken, // Token privado para edição
      organizerToken, // Token para ver todos os resultados
      name,
      maxValue,
      participants: [],
      restrictions: [],
      result: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    drawings.push(newDrawing);
    this.saveAll(drawings);
    
    return newDrawing;
  }

  /**
   * Atualiza um sorteio
   */
  static update(id, updates) {
    const drawings = this.loadAll();
    const index = drawings.findIndex(d => d.id === id);
    
    if (index === -1) {
      return null;
    }

    drawings[index] = {
      ...drawings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveAll(drawings);
    return drawings[index];
  }

  /**
   * Adiciona um participante a um sorteio
   */
  static addParticipant(drawingId, participant) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    drawing.participants.push({
      ...participant,
      id: Date.now().toString()
    });

    return this.update(drawingId, drawing);
  }

  /**
   * Remove um participante
   */
  static removeParticipant(drawingId, participantId) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    // Remove the participant
    drawing.participants = drawing.participants.filter(p => p.id !== participantId);
    
    // Ensure restrictions array exists
    if (!drawing.restrictions) {
      drawing.restrictions = [];
    }
    
    // Remove all restrictions involving this participant (including mutual pairs)
    if (drawing.restrictions.length > 0) {
      const restrictionsToRemove = new Set();
      drawing.restrictions.forEach(r => {
        if (r.from === participantId || r.to === participantId) {
          // If it's a mutual restriction, mark the entire pair for removal
          if (r.mutualPairId) {
            restrictionsToRemove.add(r.mutualPairId);
          } else {
            restrictionsToRemove.add(r.id);
          }
        }
      });
      
      drawing.restrictions = drawing.restrictions.filter(r => 
        !restrictionsToRemove.has(r.mutualPairId || r.id)
      );
    }

    // Use saveAll directly instead of update to ensure proper error handling
    const drawings = this.loadAll();
    const index = drawings.findIndex(d => d.id === drawingId);
    if (index === -1) return null;

    drawings[index] = {
      ...drawings[index],
      participants: drawing.participants,
      restrictions: drawing.restrictions,
      updatedAt: new Date().toISOString()
    };

    const saved = this.saveAll(drawings);
    if (!saved) return null;
    
    return drawings[index];
  }

  /**
   * Adiciona uma restrição
   */
  static addRestriction(drawingId, from, to) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    // Check if restriction already exists in either direction
    const existingRestriction = drawing.restrictions.find(
      r => (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );

    if (existingRestriction) {
      return drawing; // Already exists, don't add duplicates
    }

    const mutualPairId = Date.now().toString();

    // Add forward restriction (from -> to)
    const restriction1 = {
      id: mutualPairId + '_1',
      from,
      to,
      mutualPairId
    };

    // Add reverse restriction (to -> from)
    const restriction2 = {
      id: mutualPairId + '_2',
      from: to,
      to: from,
      mutualPairId
    };

    drawing.restrictions.push(restriction1);
    drawing.restrictions.push(restriction2);
    return this.update(drawingId, drawing);
  }

  /**
   * Remove uma restrição (e sua restrição mútua)
   */
  static removeRestriction(drawingId, restrictionId) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    // Find the restriction to get its mutual pair ID
    const restriction = drawing.restrictions.find(r => r.id === restrictionId);
    
    if (restriction && restriction.mutualPairId) {
      // Remove both restrictions in the mutual pair
      drawing.restrictions = drawing.restrictions.filter(
        r => r.mutualPairId !== restriction.mutualPairId
      );
    } else {
      // Fallback for old restrictions without mutualPairId
      drawing.restrictions = drawing.restrictions.filter(r => r.id !== restrictionId);
    }

    return this.update(drawingId, drawing);
  }

  /**
   * Guarda o resultado do sorteio com tokens individuais por participante
   */
  static saveResult(drawingId, result) {
    // Adicionar token único para cada participante
    const resultWithTokens = result.map(r => ({
      ...r,
      token: this.generateSecureToken() // Token individual para cada pessoa
    }));
    return this.update(drawingId, { result: resultWithTokens });
  }

  /**
   * Obtém o resultado específico de um participante
   */
  static getParticipantResult(drawingId, participantToken) {
    const drawing = this.getById(drawingId);
    if (!drawing || !drawing.result) return null;
    
    // Encontrar resultado com este token
    return drawing.result.find(r => r.token === participantToken);
  }

  /**
   * Valida se é o token do organizador
   */
  static isOrganizerToken(drawingId, token) {
    const drawing = this.getById(drawingId);
    if (!drawing) return false;
    return drawing.organizerToken === token;
  }

  /**
   * Deleta um sorteio
   */
  static delete(id) {
    const drawings = this.loadAll();
    const filtered = drawings.filter(d => d.id !== id);
    this.saveAll(filtered);
    return true;
  }

  /**
   * Gera um token seguro e aleatório
   */
  static generateSecureToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Valida o token de edição de um sorteio
   */
  static validateEditToken(id, token) {
    const drawing = this.getById(id);
    if (!drawing) return false;
    return drawing.editToken === token;
  }
}

module.exports = DrawingsStore;
