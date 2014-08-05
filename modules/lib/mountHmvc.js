var mount = require('koa-mount');
var path = require('path');

// same as mount(prefix, hmvcModule.middleware),
// but also
//   --> this.templatePaths.push(hmvcModule dirname) when entering middleware
function mountHmvc(prefix, hmvcModulePath) {
  var hmvcModule = require(hmvcModulePath);
  var hmvcModuleDir = path.dirname(require.resolve(hmvcModulePath));

  return mount(prefix, function*(next) {
    var self = this;

    var hmvcTemplateDir = path.join(hmvcModuleDir, 'templates');
    var middleware = hmvcModule.middleware;

    // before entering middeware
    function apply() {
      self.templatePaths.push(hmvcTemplateDir);
    }

    function undo() {
      self.templatePaths.pop();
    }

    apply();

    yield* middleware.call(this, function *(){
      // when middleware does yield next, undo changes
      undo();
      yield* next;
      // ...then apply back, when control goes back after yield next
      apply();
    }.call(this));

    undo();

  });
}

module.exports = mountHmvc;
