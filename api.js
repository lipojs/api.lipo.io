const API = require('@ladjs/api');
const Graceful = require('@ladjs/graceful');
const Router = require('@koa/router');
const bytes = require('bytes');
const ip = require('ip');
const lipoKoa = require('lipo-koa');
const multer = require('@koa/multer');

const { logger } = require('./helpers');

const router = new Router();

const upload = multer({
  limits: {
    fileSize: bytes('20mb'),
    fieldNameSize: bytes('100b'),
    fieldSize: bytes('1mb'),
    fields: 10,
    files: 1
  }
});

router.post('/', upload.single('input'), lipoKoa);

const api = new API({
  routes: router,
  logger
});

console.log('api.config', api.config);

if (!module.parent) {
  const graceful = new Graceful({
    servers: [api],
    redisClients: [api.client],
    logger
  });

  (async () => {
    try {
      await Promise.all([api.listen(api.config.port), graceful.listen()]);
      if (process.send) process.send('ready');
      const { port } = api.server.address();
      logger.info(
        `Lad API server listening on ${port} (LAN: ${ip.address()}:${port})`
      );
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}

module.exports = api;
