const { URL } = require('node:url');
const handlers = require('./handlers');
const views = require('./views');
const { send } = require('./http');

const routes = {
  '/': { GET: handlers.home },
  '/about': { GET: handlers.about },
  '/contact': { GET: handlers.contact },
  '/submit': { POST: handlers.submit },
};

function getPathname(rawUrl) {
  const { pathname } = new URL(rawUrl.replace(/^\/+/, '/'), 'http://localhost');
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

async function dispatch(req, res, table = routes) {
  const pathname = getPathname(req.url);

  if (!Object.hasOwn(table, pathname)) {
    return send(res, 404, views.errors[404]());
  }

  const methods = table[pathname];
  const handler = Object.hasOwn(methods, req.method) ? methods[req.method] : null;

  if (!handler) {
    return send(res, 405, views.errors[405](), { Allow: Object.keys(methods).join(', ') });
  }

  await handler(req, res);
}

module.exports = { routes, dispatch };
