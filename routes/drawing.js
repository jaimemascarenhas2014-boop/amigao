const express = require('express');
const router = express.Router();
const DrawingAlgorithm = require('../utils/DrawingAlgorithm');

// Armazenamento em memória (compartilhado)
let lastDrawing = null;

// Referência para os dados (será preenchida pela aplicação)
let dataStore = {
  participants: [],
  restrictions: []
};

// Fazer sorteio
router.post('/execute', (req, res) => {
  // Obter dados do ficheiro de estado
  const participants = require('../utils/dataStore').participants || [];
  const restrictions = require('../utils/dataStore').restrictions || [];

  if (participants.length < 2) {
    return res.status(400).json({ error: 'Precisas de pelo menos 2 participantes para fazer um sorteio' });
  }

  try {
    const algorithm = new DrawingAlgorithm(participants, restrictions);
    const drawing = algorithm.draw();

    if (drawing.success) {
      lastDrawing = drawing.result;
      res.json({
        success: true,
        message: `Sorteio realizado com sucesso em ${drawing.attempts} tentativa(s)!`,
        result: drawing.result
      });
    } else {
      res.status(400).json(drawing);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer sorteio: ' + error.message });
  }
});

// Obter último sorteio
router.get('/last', (req, res) => {
  if (!lastDrawing) {
    return res.status(404).json({ error: 'Nenhum sorteio realizado ainda' });
  }
  res.json(lastDrawing);
});

// Resetar sorteio
router.post('/reset', (req, res) => {
  lastDrawing = null;
  res.json({ message: 'Sorteio resetado' });
});

module.exports = router;
