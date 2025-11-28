const express = require('express');
const router = express.Router();
const DrawingAlgorithm = require('../utils/DrawingAlgorithm');

// Armazenamento em memória (em produção usaria uma base de dados)
let participants = [];
let restrictions = [];
let lastDrawing = null;

// Obter todos os participantes
router.get('/', (req, res) => {
  res.json(participants);
});

// Adicionar participante
router.post('/', (req, res) => {
  const { name, phone, maxValue } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  // Validar formato do telefone (simples)
  if (!/^\+\d{10,}$/.test(phone) && !/^\d{9,}$/.test(phone)) {
    return res.status(400).json({ error: 'Formato de telefone inválido. Usa +351XXXXXXXXX ou 9XXXXXXXX' });
  }

  const newParticipant = {
    id: Date.now().toString(),
    name,
    phone,
    maxValue: maxValue || 50
  };

  participants.push(newParticipant);
  res.status(201).json(newParticipant);
});

// Remover participante
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  participants = participants.filter(p => p.id !== id);
  
  // Remover restrições relacionadas
  restrictions = restrictions.filter(r => r.from !== id && r.to !== id);
  
  res.json({ message: 'Participante removido' });
});

// Atualizar participante
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, maxValue } = req.body;
  
  const participant = participants.find(p => p.id === id);
  if (!participant) {
    return res.status(404).json({ error: 'Participante não encontrado' });
  }

  if (name) participant.name = name;
  if (phone) participant.phone = phone;
  if (maxValue) participant.maxValue = maxValue;

  res.json(participant);
});

// Adicionar restrição
router.post('/restrictions/add', (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from e to são obrigatórios' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Não podes adicionar uma restrição para a mesma pessoa' });
  }

  // Verificar se já existe
  const exists = restrictions.some(r => r.from === from && r.to === to);
  if (exists) {
    return res.status(400).json({ error: 'Restrição já existe' });
  }

  const restriction = { from, to, id: Date.now().toString() };
  restrictions.push(restriction);
  res.status(201).json(restriction);
});

// Remover restrição
router.delete('/restrictions/:restrictionId', (req, res) => {
  const { restrictionId } = req.params;
  restrictions = restrictions.filter(r => r.id !== restrictionId);
  res.json({ message: 'Restrição removida' });
});

// Obter restrições
router.get('/restrictions', (req, res) => {
  res.json(restrictions);
});

// Limpar todos os participantes
router.post('/clear', (req, res) => {
  participants = [];
  restrictions = [];
  lastDrawing = null;
  res.json({ message: 'Tudo limpo' });
});

module.exports = router;
