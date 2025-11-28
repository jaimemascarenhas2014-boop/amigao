const crypto = require('crypto');

class TokenGenerator {
  /**
   * Gera um token único para um resultado
   * @param {string} drawingId - ID do sorteio
   * @param {string} participantId - ID do participante
   * @returns {string} Token único
   */
  static generate(drawingId, participantId) {
    const data = `${drawingId}-${participantId}-${Date.now()}-${Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 24);
  }

  /**
   * Valida um token (básico - apenas verifica formato)
   * @param {string} token - Token a validar
   * @returns {boolean} True se válido
   */
  static isValid(token) {
    return token && typeof token === 'string' && token.length === 24;
  }
}

module.exports = TokenGenerator;
