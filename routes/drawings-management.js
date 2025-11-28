const express = require('express');
const router = express.Router();
const DrawingsStore = require('../utils/DrawingsStore');

// Obter todos os sorteios
router.get('/', (req, res) => {
  const drawings = DrawingsStore.loadAll();
  res.json(drawings);
});

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
    res.status(201).json(drawing);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar sorteio' });
  }
});

// Obter sorteio específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const drawing = DrawingsStore.getById(id);

  if (!drawing) {
    return res.status(404).json({ error: 'Sorteio não encontrado' });
  }

  res.json(drawing);
});

// Atualizar sorteio
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const drawing = DrawingsStore.update(id, updates);
  if (!drawing) {
    return res.status(404).json({ error: 'Sorteio não encontrado' });
  }

  res.json(drawing);
});

// Deletar sorteio
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  DrawingsStore.delete(id);
  res.json({ message: 'Sorteio deletado com sucesso' });
});

// Adicionar participante a um sorteio
router.post('/:id/participants', (req, res) => {
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

// Remover participante
router.delete('/:id/participants/:participantId', (req, res) => {
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

// Adicionar restrição
router.post('/:id/restrictions', (req, res) => {
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

// Remover restrição
router.delete('/:id/restrictions/:restrictionId', (req, res) => {
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

module.exports = router;
