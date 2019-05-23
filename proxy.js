#!/usr/bin/env node
const proxy = require('@ladjs/proxy');

if (!module.parent) proxy.listen(process.env.PROXY_PORT || 80);
module.exports = proxy;
