const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStorePostgres');

/**
 * GET /api/results/:drawingId
 * Obtém resultado baseado em token (participante vê só o seu, organizador vê todos)
 * Token: pode ser token de participante OU token de organizador
 */
router.get('/:drawingId', async (req, res) => {
  const { drawingId } = req.params;
  const { token } = req.query;

  console.log(`📊 Pedido de resultado - Drawing: ${drawingId}, Token: ${token?.substring(0, 8)}...`);

  // Validar token
  if (!token || typeof token !== 'string' || token.length === 0) {
    console.log(`❌ Token inválido`);
    return res.status(401).json({ error: 'Token inválido ou em falta' });
  }

  try {
    // Carregar sorteio
    const drawing = await DrawingsStore.getById(drawingId);
    if (!drawing) {
      console.log(`❌ Sorteio ${drawingId} não encontrado na BD`);
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }

    console.log(`✅ Sorteio encontrado: ${drawing.name}`);

    // Validar se há resultados
    if (!drawing.result || drawing.result.length === 0) {
      console.log(`⚠️ Sorteio não tem resultados ainda`);
      return res.status(404).json({ error: 'Ainda não há resultados neste sorteio' });
    }

    console.log(`📝 Sorteio tem ${drawing.result.length} resultados`);

    // Verificar se é token de organizador (vê todos os resultados)
    const isOrganizer = await DrawingsStore.isOrganizerToken(drawingId, token);
    if (isOrganizer) {
      console.log(`👑 Acesso como organizador`);
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
    const participantResult = await DrawingsStore.getParticipantResult(drawingId, token);
    if (!participantResult) {
      console.log(`❌ Token de participante não encontrado`);
      return res.status(403).json({ error: 'Token inválido ou acesso recusado' });
    }

    console.log(`✅ Acesso como participante: ${participantResult.from}`);

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
  } catch (error) {
    console.error('❌ Erro ao obter resultado:', error);
    res.status(500).json({ error: 'Erro ao obter resultado' });
  }
});

module.exports = router;
