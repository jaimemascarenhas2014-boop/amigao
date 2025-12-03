const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStore');

// Middleware para validar edit token
const validateEditToken = (req, res, next) => {
  const { id } = req.params;
  const { editToken } = req.body || req.query;

  if (!editToken) {
    return res.status(401).json({ error: 'Token de edição é obrigatório' });
  }

  if (!DrawingsStore.validateEditToken(id, editToken)) {
    return res.status(403).json({ error: 'Token inválido ou sorteio não encontrado' });
  }

  next();
};

// ⛔ REMOVIDO: GET / (listava todos os sorteios - SEGURANÇA CRÍTICA)
// Agora apenas sorteios privados com token de acesso

// Criar novo sorteio
router.post('/', (req, res) => {
  const { name, maxValue } = req.body;

  if (!name || maxValue === undefined) {
    return res.status(400).json({ error: 'Nome e valor máximo são obrigatórios' });
  }

  if (maxValue <= 0) {
    return res.status(400).json({ error: 'Valor máximo deve ser maior que 0' });
  }

  try {
    const drawing = DrawingsStore.create(name, maxValue);
    res.status(201).json(drawing); // Retorna com editToken
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar sorteio' });
  }
});

// ⛔ REMOVIDO: GET /:id (acesso sem autenticação - SEGURANÇA CRÍTICA)
// Obter sorteio específico - REQUER TOKEN DE EDIÇÃO
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { editToken } = req.query;

  if (!editToken) {
    return res.status(401).json({ error: 'Token de edição é obrigatório para visualizar' });
  }

  if (!DrawingsStore.validateEditToken(id, editToken)) {
    return res.status(403).json({ error: 'Token inválido ou sorteio não encontrado' });
  }

  const drawing = DrawingsStore.getById(id);
  if (!drawing) {
    return res.status(404).json({ error: 'Sorteio não encontrado' });
  }

  res.json(drawing);
});

// Atualizar sorteio - REQUER TOKEN
router.put('/:id', validateEditToken, (req, res) => {
  const { id } = req.params;
  const { editToken, ...updates } = req.body;

  const drawing = DrawingsStore.update(id, updates);
  if (!drawing) {
    return res.status(404).json({ error: 'Sorteio não encontrado' });
  }

  res.json(drawing);
});

// Deletar sorteio - REQUER TOKEN
router.delete('/:id', validateEditToken, (req, res) => {
  const { id } = req.params;
  DrawingsStore.delete(id);
  res.json({ message: 'Sorteio deletado com sucesso' });
});

// Adicionar participante - REQUER TOKEN
router.post('/:id/participants', validateEditToken, (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  try {
    const drawing = DrawingsStore.addParticipant(id, { name, phone });
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.status(201).json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar participante' });
  }
});

// Remover participante - REQUER TOKEN
router.delete('/:id/participants/:participantId', validateEditToken, (req, res) => {
  const { id, participantId } = req.params;

  try {
    const drawing = DrawingsStore.removeParticipant(id, participantId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover participante' });
  }
});

// Adicionar restrição - REQUER TOKEN
router.post('/:id/restrictions', validateEditToken, (req, res) => {
  const { id } = req.params;
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from e to são obrigatórios' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Não podes adicionar uma restrição para a mesma pessoa' });
  }

  try {
    const drawing = DrawingsStore.addRestriction(id, from, to);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar restrição' });
  }
});

// Remover restrição - REQUER TOKEN
router.delete('/:id/restrictions/:restrictionId', validateEditToken, (req, res) => {
  const { id, restrictionId } = req.params;

  try {
    const drawing = DrawingsStore.removeRestriction(id, restrictionId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover restrição' });
  }
});

// Adicionar fixação - REQUER TOKEN
router.post('/:id/fixations', validateEditToken, (req, res) => {
  const { id } = req.params;
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from e to são obrigatórios' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Não podes fixar uma pessoa a si mesma' });
  }

  try {
    const drawing = DrawingsStore.addFixation(id, from, to);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.status(201).json(drawing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remover fixação - REQUER TOKEN
router.delete('/:id/fixations/:fixationId', validateEditToken, (req, res) => {
  const { id, fixationId } = req.params;

  try {
    const drawing = DrawingsStore.removeFixation(id, fixationId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover fixação' });
  }
});

module.exports = router;
