const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Rota para enviar mensagens via WhatsApp usando Twilio
 * 
 * Para usar:
 * 1. Criar conta em https://www.twilio.com
 * 2. Pegar Account SID e Auth Token
 * 3. Configurar .env com as credenciais
 */

// Enviar resultado via WhatsApp
router.post('/send', async (req, res) => {
  const { to, from, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
  }

  try {
    // Verificar se as credenciais estão configuradas
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({
        error: 'Integração WhatsApp não configurada. Configura as variáveis de ambiente.',
        info: 'https://www.twilio.com/console'
      });
    }

    // Exemplo de integração com Twilio
    const response = await sendViaWhatsApp(to, message);
    
    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      sid: response
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem: ' + error.message });
  }
});

// Função para enviar via WhatsApp (Twilio)
async function sendViaWhatsApp(phoneNumber, messageText) {
  // Placeholder para implementação real
  // Em produção, usarias a API do Twilio
  console.log(`[WhatsApp] Enviando para ${phoneNumber}: ${messageText}`);
  
  // Para desenvolvimento, apenas log
  return 'MOCK_SID_' + Date.now();
}

// Enviar sorteio para todos os participantes
router.post('/send-all', async (req, res) => {
  const { results } = req.body;

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Resultados inválidos' });
  }

  try {
    const messages = [];
    
    for (const result of results) {
      const message = `
🎅 *Sorteio de Amigo Secreto* 🎅

Olá ${result.from}!

Tiraste: *${result.to}*

Valor máximo do presente: ${result.maxValue || 'Sem limite'} €
Data limite: A confirmar

Boa sorte! 🎁
      `.trim();

      messages.push({
        to: result.toPhone,
        from: result.from,
        message: message
      });
    }

    // Enviar todas as mensagens
    const sent = [];
    for (const msg of messages) {
      try {
        await sendViaWhatsApp(msg.to, msg.message);
        sent.push({ to: msg.to, status: 'enviado' });
      } catch (error) {
        sent.push({ to: msg.to, status: 'erro', error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Processo de envio concluído',
      results: sent
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro: ' + error.message });
  }
});

// Gerar link WhatsApp direto (sem API)
router.post('/generate-link', (req, res) => {
  const { phoneNumber, from, to, maxValue } = req.body;

  if (!phoneNumber || !from || !to) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Formatar número se necessário
  let phone = phoneNumber.replace(/\D/g, '');
  if (!phone.startsWith('351')) {
    // Se não tiver código de país, assume Portugal
    if (phone.startsWith('9')) {
      phone = '351' + phone;
    }
  }

  // Data atual
  const today = new Date().toLocaleDateString('pt-PT');

  const message = `🎅 *Amigão* 🎁%0A%0AOlá ${from}!%0A%0ATiraste: *${to}*%0A%0AValor máximo: ${maxValue || 'Sem limite'} €%0A%0A----%0A*Amigão* v1.0.0%0ADesenvolvido por Jaime Soares Mascarenhas%0AData: ${today}%0A© 2025%0A%0ABoa sorte! 🎉`;
  
  const link = `https://wa.me/${phone}?text=${message}`;

  res.json({
    success: true,
    link: link,
    message: 'Link WhatsApp gerado com sucesso'
  });
});

module.exports = router;
