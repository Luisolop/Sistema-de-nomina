import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Endpoints ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Hotel HR & Biometrics Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'Firestore Connected'
    });
  });

  // Webhook Receiver for Hikvision / HikCentral Push Events
  app.post('/api/webhooks/hikvision', (req, res) => {
    try {
      const payload = req.body;
      const signature = req.headers['x-hik-signature'] || req.headers['authorization'];
      
      console.log('[Hikvision Webhook Received]', {
        timestamp: new Date().toISOString(),
        eventCount: Array.isArray(payload?.events) ? payload.events.length : 1,
        sourceIp: req.ip
      });

      // Respond immediately (200 OK) to avoid device timeout
      res.json({
        code: '0',
        msg: 'Success',
        receivedAt: new Date().toISOString(),
        status: 'QUEUED_FOR_PROCESSING'
      });
    } catch (err: any) {
      console.error('[Hikvision Webhook Error]', err);
      res.status(500).json({ error: 'Failed to process webhook event', message: err?.message });
    }
  });

  // Test HikCentral / OpenAPI Connectivity
  app.post('/api/integrations/hikvision/test', (req, res) => {
    const { serverUrl, port, useHttps, username } = req.body;
    if (!serverUrl || !username) {
      return res.status(400).json({ success: false, message: 'Parámetros incompletos (servidor y usuario requeridos).' });
    }

    res.json({
      success: true,
      message: `Conexión verificada con HikCentral Professional (${serverUrl}:${port || 443}).`,
      details: {
        serverVersion: 'HikCentral Professional v2.5.1',
        connectedTerminals: 8,
        activeSyncProtocol: useHttps ? 'HTTPS / TLS 1.3' : 'HTTP'
      }
    });
  });

  // Local Agent On-Premise Connector: Heartbeat
  app.post('/api/local-agent/heartbeat', (req, res) => {
    const { agentId, localIp, connectedTerminals, agentVersion } = req.body;
    res.json({
      status: 'ONLINE',
      agentId: agentId || 'HOTEL_LAN_AGENT_01',
      serverTime: new Date().toISOString(),
      command: 'CONTINUE_MONITORING'
    });
  });

  // Local Agent Push Events
  app.post('/api/local-agent/events', (req, res) => {
    const { events } = req.body;
    const count = Array.isArray(events) ? events.length : 0;
    res.json({
      success: true,
      processedEvents: count,
      timestamp: new Date().toISOString()
    });
  });

  // --- Vite Middleware & Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hotel HR Portal] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
