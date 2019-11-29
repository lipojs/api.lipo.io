const path = require('path');

const API = require('@ladjs/api');
const Axe = require('axe');
const Graceful = require('@ladjs/graceful');
const Router = require('@koa/router');
const bytes = require('bytes');
const ip = require('ip');
const lipoKoa = require('lipo-koa');
const multer = require('@koa/multer');
const pino = require('pino');
const {Signale} = require('signale');

// note that we had to specify absolute paths here bc
// otherwise tests run from the root folder wont work
const env = require('@ladjs/env')({
  path: path.join(__dirname, '.env'),
  defaults: path.join(__dirname, '.env.defaults'),
  schema: path.join(__dirname, '.env.schema')
});

const router = new Router();
const logger = new Axe({
  showStack: env.SHOW_STACK,
  name: env.APP_NAME,
  level: 'debug',
  capture: false,
  logger:
    env === 'production'
      ? pino({
          customLevels: {
            log: 30
          }
        })
      : new Signale()
});

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
      const {port} = api.server.address();
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
