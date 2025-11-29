const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStore');

/**
 * GET /api/results/:drawingId
 * Obtém resultado baseado em token (participante vê só o seu, organizador vê todos)
 * Token: pode ser token de participante OU token de organizador
 */
router.get('/:drawingId', (req, res) => {
  const { drawingId } = req.params;
  const { token } = req.query;

  // Validar token
  if (!token || typeof token !== 'string' || token.length === 0) {
    return res.status(401).json({ error: 'Token inválido ou em falta' });
  }

  // Carregar sorteio
  const drawing = DrawingsStore.getById(drawingId);
  if (!drawing) {
    return res.status(404).json({ error: 'Sorteio não encontrado' });
  }

  // Validar se há resultados
  if (!drawing.result || drawing.result.length === 0) {
    return res.status(404).json({ error: 'Ainda não há resultados neste sorteio' });
  }

  // Verificar se é token de organizador (vê todos os resultados)
  if (DrawingsStore.isOrganizerToken(drawingId, token)) {
    return res.json({
      drawingName: drawing.name,
      drawingDate: drawing.createdAt,
      maxValue: drawing.maxValue,
      isOrganizer: true,
      results: drawing.result.map(r => ({
        from: r.from,
        to: r.to,
        maxValue: r.maxValue
      }))
    });
  }

  // Caso contrário, verificar se é token de participante (vê só o seu resultado)
  const participantResult = DrawingsStore.getParticipantResult(drawingId, token);
  if (!participantResult) {
    return res.status(403).json({ error: 'Token inválido ou acesso recusado' });
  }

  // Retornar APENAS o resultado desta pessoa
  res.json({
    drawingName: drawing.name,
    drawingDate: drawing.createdAt,
    maxValue: drawing.maxValue,
    isOrganizer: false,
    yourResult: {
      from: participantResult.from,
      to: participantResult.to,
      maxValue: participantResult.maxValue
    }
  });
});

module.exports = router;
