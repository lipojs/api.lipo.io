const path = require('path');

const Axe = require('axe');
const pino = require('pino');
const { Signale } = require('signale');

// note that we had to specify absolute paths here bc
// otherwise tests run from the root folder wont work
const env = require('@ladjs/env')({
  path: path.join(__dirname, '..', '.env'),
  defaults: path.join(__dirname, '..', '.env.defaults'),
  schema: path.join(__dirname, '..', '.env.schema')
});

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

module.exports = { env, logger };
