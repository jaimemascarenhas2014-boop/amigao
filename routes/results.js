const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStore');

/**
 * GET /api/results/:drawingId
 * Obtém todos os resultados do sorteio com token de validação
 * Token query param obrigatório para segurança (apenas valida acesso, retorna todos)
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

  // Validar que o token pertence a este sorteio (qualquer resultado válido permite acesso)
  const tokenValid = drawing.result.find(r => r.token === token);
  if (!tokenValid) {
    return res.status(403).json({ error: 'Token inválido ou acesso recusado' });
  }

  // Retornar TODOS os resultados (agora que o token foi validado)
  res.json({
    drawingName: drawing.name,
    drawingDate: drawing.createdAt,
    maxValue: drawing.maxValue,
    results: drawing.result.map(r => ({
      from: r.from,
      to: r.to,
      maxValue: r.maxValue
    })),
    allResults: drawing.result.map(r => ({
      from: r.from,
      to: r.to,
      maxValue: r.maxValue
    }))
  });
});

module.exports = router;
