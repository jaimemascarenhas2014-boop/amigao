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
    
    const newDrawing = {
      id: Date.now().toString(),
      editToken, // Token privado para edição
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

    drawing.participants = drawing.participants.filter(p => p.id !== participantId);
    drawing.restrictions = drawing.restrictions.filter(
      r => r.from !== participantId && r.to !== participantId
    );

    return this.update(drawingId, drawing);
  }

  /**
   * Adiciona uma restrição
   */
  static addRestriction(drawingId, from, to) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    const restriction = {
      id: Date.now().toString(),
      from,
      to
    };

    drawing.restrictions.push(restriction);
    return this.update(drawingId, drawing);
  }

  /**
   * Remove uma restrição
   */
  static removeRestriction(drawingId, restrictionId) {
    const drawing = this.getById(drawingId);
    if (!drawing) return null;

    drawing.restrictions = drawing.restrictions.filter(r => r.id !== restrictionId);
    return this.update(drawingId, drawing);
  }

  /**
   * Guarda o resultado do sorteio
   */
  static saveResult(drawingId, result) {
    return this.update(drawingId, { result });
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
