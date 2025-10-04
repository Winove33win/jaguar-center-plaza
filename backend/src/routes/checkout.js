import { Router } from 'express';
import { createTemplateCheckoutSession } from '../services/checkout-service.js';
import { getTemplateBySlug } from '../repositories/templates-repository.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { templateSlug, quantity, successUrl, cancelUrl } = req.body || {};

    if (!templateSlug) {
      res.status(400).json({ error: 'InvalidPayload', message: 'templateSlug é obrigatório.' });
      return;
    }

    const template = await getTemplateBySlug(String(templateSlug));
    if (!template) {
      res.status(404).json({ error: 'NotFound', message: 'Template não encontrado.' });
      return;
    }

    const session = await createTemplateCheckoutSession({
      template,
      quantity,
      successUrl,
      cancelUrl,
      request: req
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
