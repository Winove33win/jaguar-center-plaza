import { Router } from 'express';
import { createLibrasLead, isSpamAttempt } from '../repositories/leads-repository.js';

const router = Router();

function sanitizeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

router.post('/libras', async (req, res, next) => {
  try {
    const { name, email, phone, message, source, honeypot } = req.body || {};

    if (honeypot) {
      res.status(400).json({ error: 'InvalidPayload', message: 'Requisição inválida.' });
      return;
    }

    const payload = {
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: sanitizeString(phone),
      message: sanitizeString(message),
      source: sanitizeString(source || 'libras-form')
    };

    if (!payload.name || !payload.email) {
      res.status(422).json({ error: 'ValidationError', message: 'Nome e e-mail são obrigatórios.' });
      return;
    }

    const spam = await isSpamAttempt(payload);
    if (spam) {
      res.status(429).json({ error: 'TooManyRequests', message: 'Recebemos um envio semelhante recentemente. Aguarde antes de tentar novamente.' });
      return;
    }

    const id = await createLibrasLead(payload);

    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
});

export default router;
