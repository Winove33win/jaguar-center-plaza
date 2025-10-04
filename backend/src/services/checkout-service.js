import axios from 'axios';
import Stripe from 'stripe';

import { env, resolvePublicBaseUrl } from '../config/env.js';

let stripeClient = null;

function getStripeClient() {
  if (stripeClient || !env.payments.stripeSecretKey) {
    if (stripeClient) {
      return stripeClient;
    }

    return null;
  }

  stripeClient = new Stripe(env.payments.stripeSecretKey, {
    apiVersion: '2024-06-20'
  });

  return stripeClient;
}

export async function createTemplateCheckoutSession({
  template,
  quantity = 1,
  successUrl,
  cancelUrl,
  request
}) {
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const metadata = {
    templateId: template.id,
    templateSlug: template.slug
  };

  const serviceUrl = env.payments.stripeServiceUrl;
  if (serviceUrl) {
    const response = await axios.post(
      `${serviceUrl.replace(/\/$/, '')}/checkout`,
      {
        template,
        quantity: normalizedQuantity,
        successUrl,
        cancelUrl,
        metadata
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return response.data;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    const error = new Error('Stripe não configurado');
    error.status = 503;
    throw error;
  }

  const unitAmount = Math.round(Number(template.price || 0) * 100);
  if (!unitAmount) {
    const error = new Error('Preço do template inválido.');
    error.status = 422;
    throw error;
  }

  const baseUrl = successUrl ? undefined : resolvePublicBaseUrl(request);
  const defaultSuccessUrl = baseUrl ? `${baseUrl}/templates/${template.slug}?status=success` : undefined;
  const defaultCancelUrl = baseUrl ? `${baseUrl}/templates/${template.slug}?status=cancel` : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: successUrl || defaultSuccessUrl,
    cancel_url: cancelUrl || defaultCancelUrl,
    line_items: [
      {
        quantity: normalizedQuantity,
        price_data: {
          currency: template.currency || 'brl',
          unit_amount: unitAmount,
          product_data: {
            name: template.name,
            description: template.description
          }
        }
      }
    ],
    metadata
  });

  return {
    id: session.id,
    sessionId: session.id,
    url: session.url,
    publicKey: env.payments.stripePublicKey
  };
}
