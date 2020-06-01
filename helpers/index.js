const path = require('path');

const Cabin = require('cabin');
const pino = require('pino');
const { Signale } = require('signale');

// note that we had to specify absolute paths here bc
// otherwise tests run from the root folder wont work
const env = require('@ladjs/env')({
  path: path.join(__dirname, '..', '.env'),
  defaults: path.join(__dirname, '..', '.env.defaults'),
  schema: path.join(__dirname, '..', '.env.schema')
});

const logger = new Cabin({
  axe: {
    showStack: env.SHOW_STACK,
    name: env.APP_NAME,
    level: 'debug',
    capture: false,
    logger:
      env.NODE_ENV === 'production'
        ? pino({
            customLevels: {
              log: 30
            },
            hooks: {
              // <https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod>
              logMethod(inputArgs, method) {
                return method.call(this, {
                  // <https://github.com/pinojs/pino/issues/854>
                  // message: inputArgs[0],
                  msg: inputArgs[0],
                  meta: inputArgs[1]
                });
              }
            }
          })
        : new Signale()
  }
});

module.exports = { env, logger };
