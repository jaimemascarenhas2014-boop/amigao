/**
 * Algoritmo de sorteio de Amigo Secreto
 * Garante que:
 * - Ninguém tira a si próprio
 * - Todas as restrições são respeitadas
 * - O resultado é aleatório e válido
 */

class DrawingAlgorithm {
  constructor(participants, restrictions = [], fixations = []) {
    this.participants = participants;
    this.restrictions = restrictions;
    this.fixations = fixations; // Array de {from, to} - fixações pré-definidas
  }

  /**
   * Verifica se um sorteio é válido
   */
  isValidAssignment(assignment) {
    for (let i = 0; i < this.participants.length; i++) {
      const giver = this.participants[i].id;
      const receiver = assignment[i];

      // Ninguém pode tirar a si próprio
      if (giver === receiver) {
        return false;
      }

      // Verificar restrições
      for (const restriction of this.restrictions) {
        if (restriction.from === giver && restriction.to === receiver) {
          return false;
        }
      }

      // Verificar fixações
      const fixation = this.fixations.find(f => f.from === giver);
      if (fixation && fixation.to !== receiver) {
        return false;
      }
    }
    return true;
  }

  /**
   * Realiza o sorteio usando o algoritmo de Fisher-Yates com validação
   */
  draw() {
    const maxAttempts = 100;
    let attempts = 0;

    // Aplicar fixações primeiro
    const fixedReceivers = new Map();
    const usedReceivers = new Set();
    
    for (const fixation of this.fixations) {
      fixedReceivers.set(fixation.from, fixation.to);
      usedReceivers.add(fixation.to);
    }

    while (attempts < maxAttempts) {
      // Criar array com IDs dos participantes
      let receivers = this.participants.map(p => p.id);

      // Embaralhar com Fisher-Yates
      for (let i = receivers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
      }

      // Aplicar fixações ao array de receivers
      for (let i = 0; i < this.participants.length; i++) {
        const giverId = this.participants[i].id;
        if (fixedReceivers.has(giverId)) {
          const fixedReceiverId = fixedReceivers.get(giverId);
          // Encontrar posição da fixação no array
          const fixedIndex = receivers.indexOf(fixedReceiverId);
          if (fixedIndex !== -1) {
            // Trocar com a posição atual
            [receivers[i], receivers[fixedIndex]] = [receivers[fixedIndex], receivers[i]];
          }
        }
      }

      // Verificar se o sorteio é válido
      if (this.isValidAssignment(receivers)) {
        // Criar resultado com nomes
        const result = [];
        for (let i = 0; i < this.participants.length; i++) {
          const giver = this.participants[i];
          const receiverId = receivers[i];
          const receiver = this.participants.find(p => p.id === receiverId);

          result.push({
            from: giver.name,
            fromId: giver.id,
            to: receiver.name,
            toId: receiver.id,
            toPhone: receiver.phone,
            maxValue: receiver.maxValue || 0
          });
        }
        return { success: true, result, attempts };
      }

      attempts++;
    }

    return {
      success: false,
      error: `Não foi possível fazer um sorteio válido após ${maxAttempts} tentativas. Tenta remover algumas restrições ou fixações.`,
      attempts
    };
  }
}

module.exports = DrawingAlgorithm;
