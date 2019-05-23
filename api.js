#!/usr/bin/env node
const Server = require('@ladjs/api');
const Graceful = require('@ladjs/graceful');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');
const Logger = require('@ladjs/logger');
const Router = require('koa-router');
const lipoKoa = require('lipo-koa');
const multer = require('koa-multer');
const bytes = require('bytes');

if (process.env.NODE_ENV !== 'production') maxListenersExceededWarning();

const logger = new Logger({appName: 'lipo'});
const routes = new Router();
const upload = multer({
  limits: {
    fileSize: bytes('20mb'),
    fieldNameSize: bytes('100b'),
    fieldSize: bytes('1mb'),
    fields: 10,
    files: 1
  }
});

routes.post('/', upload.single('input'), lipoKoa);

const server = new Server({
  routes,
  logger
});

if (!module.parent) {
  server.listen(process.env.API_PORT || 3000);
  const graceful = new Graceful({server, logger});
  graceful.listen();
}

module.exports = server;
