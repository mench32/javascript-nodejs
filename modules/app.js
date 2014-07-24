"use strict";

const koa = require('koa');
const log = require('js-log')();
const config = require('config');
const app = koa();

// trust all headers from proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

function requireSetup(path) {
  // if debug is on => will log the middleware travel chain
  if (process.env.NODE_ENV == 'development') {
    app.use(function *(next) {
      log.debug("-> setup " + path);
      yield next;
      log.debug("<- setup " + path);
    });
  }
  require(path)(app);
}

// usually nginx will handle this
requireSetup('setup/static');

// errors wrap everything
requireSetup('setup/errorHandler');

// this logger only logs HTTP status and URL
// before everything to make sure it log all
requireSetup('setup/accessLogger');

// before anything that may deal with body
requireSetup('setup/bodyParser');

// right after parsing body, make sure we logged for development
requireSetup('setup/verboseLogger');

if (process.env.NODE_ENV == 'development') {
//  app.verboseLogger.addPath('/:any*');
}

requireSetup('setup/session');
requireSetup('setup/csrf');

requireSetup('setup/payments');

requireSetup('setup/render');
requireSetup('setup/router');

if (process.env.NODE_ENV == 'test') {
  app.listen(config.port, config.host, function() {
    console.log("App listening...");
  });
}

module.exports = app;

if (process.env.NODE_ENV == 'development') {

  global.p = function() {
    var stack = new Error().stack.split("\n")[2].trim();
    console.log("----> " + global.p.counter++ + " at " + stack);
  };
  global.p.counter = 1;
} else {
  global.p = function() {

  };
}
