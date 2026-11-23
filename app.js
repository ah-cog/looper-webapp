const express = require('express');
const path = require('node:path');
const app = express();
const backend = process.env.MESSENGER_URL || 'http://127.0.0.1:3001';
app.get('/health', (_req, res) => res.json({status: 'ok', service: 'looper-webapp'}));
// Same-origin gateway keeps native builds and browsers on the same API contract.
app.use('/api', async (req, res, next) => {
  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : req;
    const upstream = await fetch(backend + req.originalUrl, {
      method: req.method, headers: {'content-type': req.get('content-type') || 'application/json'},
      body, duplex: body ? 'half' : undefined, signal: AbortSignal.timeout(15000)
    });
    res.status(upstream.status).type(upstream.headers.get('content-type') || 'application/json');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) { res.status(502).json({error: 'Messenger unavailable', detail: error.message}); }
});
app.use(express.static(path.join(__dirname, 'public')));
if (require.main === module) app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('looper-webapp: http://localhost:' + (process.env.PORT || 3000)));
module.exports = app;
