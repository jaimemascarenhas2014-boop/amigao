const db = require('./Database');

class DrawingsStore {
  /**
   * Carrega todos os sorteios
   */
  static async loadAll() {
    try {
      const result = await db.query('SELECT * FROM drawings ORDER BY created_at DESC');
      const drawings = result.rows.map(row => this.rowToDrawing(row));
      
      // Carregar dados relacionados para cada sorteio
      for (const drawing of drawings) {
        drawing.participants = await this.loadParticipants(drawing.id);
        drawing.restrictions = await this.loadRestrictions(drawing.id);
        drawing.fixations = await this.loadFixations(drawing.id);
      }
      
      return drawings;
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      return [];
    }
  }

  /**
   * Carrega um sorteio específico
   */
  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM drawings WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      
      const drawing = this.rowToDrawing(result.rows[0]);
      drawing.participants = await this.loadParticipants(id);
      drawing.restrictions = await this.loadRestrictions(id);
      drawing.fixations = await this.loadFixations(id);
      
      return drawing;
    } catch (error) {
      console.error('Erro ao carregar sorteio:', error);
      return null;
    }
  }

  /**
   * Cria um novo sorteio
   */
  static async create(name, maxValue) {
    try {
      const id = Date.now().toString();
      const editToken = this.generateSecureToken();
      const organizerToken = this.generateSecureToken();

      await db.query(
        'INSERT INTO drawings (id, edit_token, organizer_token, name, max_value) VALUES ($1, $2, $3, $4, $5)',
        [id, editToken, organizerToken, name, maxValue]
      );

      return {
        id,
        editToken,
        organizerToken,
        name,
        maxValue,
        participants: [],
        restrictions: [],
        fixations: [],
        result: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao criar sorteio:', error);
      throw error;
    }
  }

  /**
   * Atualiza um sorteio
   */
  static async update(id, updates) {
    try {
      const drawing = await this.getById(id);
      if (!drawing) return null;

      const updatedDrawing = { ...drawing, ...updates, updatedAt: new Date().toISOString() };

      await db.query(
        'UPDATE drawings SET name = $1, max_value = $2, result = $3, updated_at = $4 WHERE id = $5',
        [updatedDrawing.name, updatedDrawing.maxValue, JSON.stringify(updatedDrawing.result), new Date(), id]
      );

      return updatedDrawing;
    } catch (error) {
      console.error('Erro ao atualizar sorteio:', error);
      throw error;
    }
  }

  /**
   * Deleta um sorteio (cascata remove participantes, restrições, fixações)
   */
  static async delete(id) {
    try {
      await db.query('DELETE FROM drawings WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('Erro ao deletar sorteio:', error);
      throw error;
    }
  }

  /**
   * Adiciona um participante
   */
  static async addParticipant(drawingId, participant) {
    try {
      const participantId = Date.now().toString();
      
      await db.query(
        'INSERT INTO participants (id, drawing_id, name, phone) VALUES ($1, $2, $3, $4)',
        [participantId, drawingId, participant.name, participant.phone]
      );

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      throw error;
    }
  }

  /**
   * Remove um participante (cascata remove restrições e fixações)
   */
  static async removeParticipant(drawingId, participantId) {
    try {
      await db.query('DELETE FROM participants WHERE id = $1', [participantId]);
      
      // Remover restrições relacionadas
      const restrictions = await db.query(
        'SELECT * FROM restrictions WHERE drawing_id = $1 AND (from_participant = $2 OR to_participant = $2)',
        [drawingId, participantId]
      );

      for (const row of restrictions.rows) {
        if (row.mutual_pair_id) {
          await db.query(
            'DELETE FROM restrictions WHERE drawing_id = $1 AND mutual_pair_id = $2',
            [drawingId, row.mutual_pair_id]
          );
        } else {
          await db.query('DELETE FROM restrictions WHERE id = $1', [row.id]);
        }
      }

      // Remover fixações relacionadas
      await db.query(
        'DELETE FROM fixations WHERE drawing_id = $1 AND (from_participant = $2 OR to_participant = $2)',
        [drawingId, participantId]
      );

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      throw error;
    }
  }

  /**
   * Adiciona uma restrição
   */
  static async addRestriction(drawingId, from, to) {
    try {
      // Verificar se já existe
      const existing = await db.query(
        'SELECT * FROM restrictions WHERE drawing_id = $1 AND ((from_participant = $2 AND to_participant = $3) OR (from_participant = $3 AND to_participant = $2))',
        [drawingId, from, to]
      );

      if (existing.rows.length > 0) {
        return this.getById(drawingId);
      }

      const mutualPairId = Date.now().toString();
      const id1 = mutualPairId + '_1';
      const id2 = mutualPairId + '_2';

      // Adicionar restrição bidirecional
      await db.query(
        'INSERT INTO restrictions (id, drawing_id, from_participant, to_participant, mutual_pair_id) VALUES ($1, $2, $3, $4, $5)',
        [id1, drawingId, from, to, mutualPairId]
      );

      await db.query(
        'INSERT INTO restrictions (id, drawing_id, from_participant, to_participant, mutual_pair_id) VALUES ($1, $2, $3, $4, $5)',
        [id2, drawingId, to, from, mutualPairId]
      );

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao adicionar restrição:', error);
      throw error;
    }
  }

  /**
   * Remove uma restrição
   */
  static async removeRestriction(drawingId, restrictionId) {
    try {
      const restriction = await db.query(
        'SELECT * FROM restrictions WHERE id = $1 AND drawing_id = $2',
        [restrictionId, drawingId]
      );

      if (restriction.rows.length === 0) {
        return this.getById(drawingId);
      }

      const row = restriction.rows[0];
      if (row.mutual_pair_id) {
        await db.query(
          'DELETE FROM restrictions WHERE drawing_id = $1 AND mutual_pair_id = $2',
          [drawingId, row.mutual_pair_id]
        );
      } else {
        await db.query('DELETE FROM restrictions WHERE id = $1', [restrictionId]);
      }

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao remover restrição:', error);
      throw error;
    }
  }

  /**
   * Adiciona uma fixação
   */
  static async addFixation(drawingId, from, to) {
    try {
      // Remover fixação anterior do mesmo participante
      await db.query(
        'DELETE FROM fixations WHERE drawing_id = $1 AND from_participant = $2',
        [drawingId, from]
      );

      const id = Date.now().toString();
      await db.query(
        'INSERT INTO fixations (id, drawing_id, from_participant, to_participant) VALUES ($1, $2, $3, $4)',
        [id, drawingId, from, to]
      );

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao adicionar fixação:', error);
      throw error;
    }
  }

  /**
   * Remove uma fixação
   */
  static async removeFixation(drawingId, fixationId) {
    try {
      await db.query(
        'DELETE FROM fixations WHERE id = $1 AND drawing_id = $2',
        [fixationId, drawingId]
      );

      return this.getById(drawingId);
    } catch (error) {
      console.error('Erro ao remover fixação:', error);
      throw error;
    }
  }

  /**
   * Guarda o resultado
   */
  static async saveResult(drawingId, result) {
    try {
      return this.update(drawingId, { result });
    } catch (error) {
      console.error('Erro ao guardar resultado:', error);
      throw error;
    }
  }

  /**
   * Obtém resultado de um participante
   */
  static async getParticipantResult(drawingId, participantToken) {
    try {
      const drawing = await this.getById(drawingId);
      if (!drawing || !drawing.result) return null;
      
      return drawing.result.find(r => r.token === participantToken);
    } catch (error) {
      console.error('Erro ao obter resultado:', error);
      return null;
    }
  }

  /**
   * Valida token do organizador
   */
  static async isOrganizerToken(drawingId, token) {
    try {
      const result = await db.query(
        'SELECT organizer_token FROM drawings WHERE id = $1',
        [drawingId]
      );

      if (result.rows.length === 0) return false;
      return result.rows[0].organizer_token === token;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  /**
   * Valida token de edição
   */
  static async validateEditToken(id, token) {
    try {
      const result = await db.query(
        'SELECT edit_token FROM drawings WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) return false;
      return result.rows[0].edit_token === token;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  // Métodos auxiliares privados

  static async loadParticipants(drawingId) {
    try {
      const result = await db.query(
        'SELECT id, name, phone FROM participants WHERE drawing_id = $1 ORDER BY created_at',
        [drawingId]
      );
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone
      }));
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
      return [];
    }
  }

  static async loadRestrictions(drawingId) {
    try {
      const result = await db.query(
        'SELECT id, from_participant, to_participant, mutual_pair_id FROM restrictions WHERE drawing_id = $1 ORDER BY created_at',
        [drawingId]
      );
      return result.rows.map(row => ({
        id: row.id,
        from: row.from_participant,
        to: row.to_participant,
        mutualPairId: row.mutual_pair_id
      }));
    } catch (error) {
      console.error('Erro ao carregar restrições:', error);
      return [];
    }
  }

  static async loadFixations(drawingId) {
    try {
      const result = await db.query(
        'SELECT id, from_participant, to_participant FROM fixations WHERE drawing_id = $1 ORDER BY created_at',
        [drawingId]
      );
      return result.rows.map(row => ({
        id: row.id,
        from: row.from_participant,
        to: row.to_participant
      }));
    } catch (error) {
      console.error('Erro ao carregar fixações:', error);
      return [];
    }
  }

  static rowToDrawing(row) {
    return {
      id: row.id,
      editToken: row.edit_token,
      organizerToken: row.organizer_token,
      name: row.name,
      maxValue: parseFloat(row.max_value),
      result: row.result,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
  }

  static generateSecureToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

module.exports = DrawingsStore;
