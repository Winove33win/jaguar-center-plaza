import { Router } from 'express';
import axios from 'axios';
import { isIP } from 'net';
import { pipeline } from 'stream';
import { promisify } from 'util';

const router = Router();
const streamPipeline = promisify(pipeline);

function isPrivateHostname(hostname) {
  if (!hostname) {
    return true;
  }

  const lowerHost = hostname.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost === '127.0.0.1') {
    return true;
  }

  const ipVersion = isIP(lowerHost);
  if (ipVersion) {
    const parts = lowerHost.split('.').map((segment) => Number.parseInt(segment, 10));
    if (ipVersion === 4) {
      if (parts[0] === 10) {
        return true;
      }
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
        return true;
      }
      if (parts[0] === 192 && parts[1] === 168) {
        return true;
      }
      if (parts[0] === 127) {
        return true;
      }
    }

    if (ipVersion === 6) {
      if (lowerHost === '::1') {
        return true;
      }

      if (lowerHost.startsWith('fd') || lowerHost.startsWith('fe80')) {
        return true;
      }
    }
  }

  return false;
}

router.get('/media', async (req, res) => {
  const { url } = req.query;

  if (typeof url !== 'string' || url.trim().length === 0) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório', code: 'INVALID_URL' });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'URL inválida', code: 'INVALID_URL' });
  }

  if (parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Apenas URLs HTTPS são permitidas', code: 'INVALID_URL_PROTOCOL' });
  }

  if (isPrivateHostname(parsed.hostname)) {
    return res.status(400).json({ error: 'Domínio não permitido', code: 'INVALID_URL_DOMAIN' });
  }

  try {
    const response = await axios.get(parsed.toString(), {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Jaguar-Center-Plaza/1.0'
      },
      validateStatus: (status) => status >= 200 && status < 300
    });

    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }

    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.status(response.status);
    await streamPipeline(response.data, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to proxy media', error?.message || error);
    res.status(404).json({ error: 'Mídia não encontrada', code: 'MEDIA_NOT_FOUND' });
  }
});

export default router;

