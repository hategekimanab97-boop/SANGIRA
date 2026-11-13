import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from './server/auth/auth.ts';
import { getIntegrationStatus } from './server/config/integrations.ts';
import { apiRouter } from './server/routes/api.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Mount Better Auth handler BEFORE express.json() so request streams remain intact
  app.all('/api/auth/*', (req, res) => {
    const auth = getAuth();
    if (!auth) {
      const report = getIntegrationStatus();
      return res.status(503).json({
        error: 'BETTER_AUTH_NOT_CONFIGURED',
        message:
          'Staff authentication requires DATABASE_URL and BETTER_AUTH_SECRET to be set in environment secrets.',
        missingKeys: report.services.betterAuth.missingKeys,
      });
    }
    return toNodeHandler(auth)(req, res);
  });

  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRouter);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const status = getIntegrationStatus();
    console.log(`[Sangira Express] Listening on http://0.0.0.0:${PORT}`);
    if (!status.overallReady) {
      console.log(
        `[Sangira Config Notice] Missing keys for full production integrations: ${status.allMissingKeys.join(', ')}`
      );
    }
  });
}

startServer().catch((err) => {
  console.error('[Sangira Express Fatal Error]', err);
  process.exit(1);
});
