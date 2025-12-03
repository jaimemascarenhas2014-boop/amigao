const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStorePostgres');

// Middleware para validar edit token
const validateEditToken = async (req, res, next) => {
  const { id } = req.params;
  const { editToken } = req.body || req.query;

  if (!editToken) {
    return res.status(401).json({ error: 'Token de edição é obrigatório' });
  }

  const isValid = await DrawingsStore.validateEditToken(id, editToken);
  if (!isValid) {
    return res.status(403).json({ error: 'Token inválido ou sorteio não encontrado' });
  }

  next();
};

// Criar novo sorteio
router.post('/', async (req, res) => {
  const { name, maxValue } = req.body;

  if (!name || maxValue === undefined) {
    return res.status(400).json({ error: 'Nome e valor máximo são obrigatórios' });
  }

  if (maxValue <= 0) {
    return res.status(400).json({ error: 'Valor máximo deve ser maior que 0' });
  }

  try {
    const drawing = await DrawingsStore.create(name, maxValue);
    res.status(201).json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao criar sorteio' });
  }
});

// Obter sorteio específico - REQUER TOKEN DE EDIÇÃO
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { editToken } = req.query;

  if (!editToken) {
    return res.status(401).json({ error: 'Token de edição é obrigatório para visualizar' });
  }

  const isValid = await DrawingsStore.validateEditToken(id, editToken);
  if (!isValid) {
    return res.status(403).json({ error: 'Token inválido ou sorteio não encontrado' });
  }

  try {
    const drawing = await DrawingsStore.getById(id);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }

    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao obter sorteio' });
  }
});

// Atualizar sorteio - REQUER TOKEN
router.put('/:id', validateEditToken, async (req, res) => {
  const { id } = req.params;
  const { editToken, ...updates } = req.body;

  try {
    const drawing = await DrawingsStore.update(id, updates);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }

    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao atualizar sorteio' });
  }
});

// Deletar sorteio - REQUER TOKEN
router.delete('/:id', validateEditToken, async (req, res) => {
  const { id } = req.params;

  try {
    await DrawingsStore.delete(id);
    res.json({ message: 'Sorteio deletado com sucesso' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao deletar sorteio' });
  }
});

// Adicionar participante - REQUER TOKEN
router.post('/:id/participants', validateEditToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  try {
    const drawing = await DrawingsStore.addParticipant(id, { name, phone });
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.status(201).json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao adicionar participante' });
  }
});

// Remover participante - REQUER TOKEN
router.delete('/:id/participants/:participantId', validateEditToken, async (req, res) => {
  const { id, participantId } = req.params;

  try {
    const drawing = await DrawingsStore.removeParticipant(id, participantId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao remover participante' });
  }
});

// Adicionar restrição - REQUER TOKEN
router.post('/:id/restrictions', validateEditToken, async (req, res) => {
  const { id } = req.params;
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from e to são obrigatórios' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Não podes adicionar uma restrição para a mesma pessoa' });
  }

  try {
    const drawing = await DrawingsStore.addRestriction(id, from, to);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao adicionar restrição' });
  }
});

// Remover restrição - REQUER TOKEN
router.delete('/:id/restrictions/:restrictionId', validateEditToken, async (req, res) => {
  const { id, restrictionId } = req.params;

  try {
    const drawing = await DrawingsStore.removeRestriction(id, restrictionId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao remover restrição' });
  }
});

// Adicionar fixação - REQUER TOKEN
router.post('/:id/fixations', validateEditToken, async (req, res) => {
  const { id } = req.params;
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from e to são obrigatórios' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Não podes fixar uma pessoa a si mesma' });
  }

  try {
    const drawing = await DrawingsStore.addFixation(id, from, to);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.status(201).json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(400).json({ error: error.message });
  }
});

// Remover fixação - REQUER TOKEN
router.delete('/:id/fixations/:fixationId', validateEditToken, async (req, res) => {
  const { id, fixationId } = req.params;

  try {
    const drawing = await DrawingsStore.removeFixation(id, fixationId);
    if (!drawing) {
      return res.status(404).json({ error: 'Sorteio não encontrado' });
    }
    res.json(drawing);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao remover fixação' });
  }
});

module.exports = router;
