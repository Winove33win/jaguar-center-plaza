import { Router } from 'express';
import { CATEGORIES } from './companies.js';
import pool, { ping } from '../../db/pool.js';

function summarizeActiveEntries(getter) {
  if (typeof getter !== 'function') {
    return { total: 0, byType: {} };
  }

  const entries = getter();
  if (!entries) {
    return { total: 0, byType: {} };
  }

  const list = Array.isArray(entries)
    ? entries
    : typeof entries[Symbol.iterator] === 'function'
      ? Array.from(entries)
      : [];

  const byType = list.reduce((accumulator, entry) => {
    const type = entry?.constructor?.name || 'Unknown';
    accumulator[type] = (accumulator[type] || 0) + 1;
    return accumulator;
  }, {});

  return { total: list.length, byType };
}

function normalizeResourceUsage(details) {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const {
    userCPUTime,
    systemCPUTime,
    maxRSS,
    sharedMemorySize,
    unsharedDataSize,
    unsharedStackSize,
    minorPageFault,
    majorPageFault,
    voluntaryContextSwitches,
    involuntaryContextSwitches,
    fsRead,
    fsWrite,
    ipcSent,
    ipcReceived,
    signalsCount,
    swapCount
  } = details;

  return {
    userCPUTime,
    systemCPUTime,
    maxRSS,
    sharedMemorySize,
    unsharedDataSize,
    unsharedStackSize,
    minorPageFault,
    majorPageFault,
    voluntaryContextSwitches,
    involuntaryContextSwitches,
    fsRead,
    fsWrite,
    ipcSent,
    ipcReceived,
    signalsCount,
    swapCount
  };
}

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: {
      USE_JSON_DB: process.env.USE_JSON_DB ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null
    }
  });
});

router.get('/health/processes', (req, res) => {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();
  const resourceUsage = typeof process.resourceUsage === 'function'
    ? process.resourceUsage()
    : null;

  const handles = summarizeActiveEntries(process._getActiveHandles);
  const requests = summarizeActiveEntries(process._getActiveRequests);

  res.json({
    pid: process.pid,
    ppid: process.ppid,
    uptime: process.uptime(),
    platform: process.platform,
    arch: process.arch,
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers
    },
    cpu: {
      user: cpu.user,
      system: cpu.system
    },
    resourceUsage: normalizeResourceUsage(resourceUsage),
    handles,
    requests,
    versions: process.versions
  });
});

router.get('/health/db', async (_req, res) => {
  try {
    const dbOk = await ping();
    const tablesEntries = await Promise.all(
      CATEGORIES.map(async ({ slug, tabela }) => {
        try {
          const [rows] = await pool.query('SHOW TABLES LIKE ?', [tabela]);
          return [slug, Array.isArray(rows) && rows.length > 0];
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to inspect table ${tabela}`, error);
          return [slug, false];
        }
      })
    );

    const tables = Object.fromEntries(tablesEntries);
    const ok = dbOk && Object.values(tables).every(Boolean);

    return res.json({ ok, tables });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database health check failed', error);
    return res.status(500).json({ error: 'Falha ao verificar banco', code: 'DB_HEALTHCHECK_FAILED' });
  }
});

export default router;

