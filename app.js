const http = require('node:http');
const { routes, dispatch } = require('./router');
const views = require('./views');
const { HttpError, send } = require('./http');

function handleError(error, req, res) {
  if (res.headersSent) {
    return res.destroy();
  }

  const status = error instanceof HttpError && views.errors[error.status] ? error.status : 500;
  if (status === 500) {
    console.error(error);
  }

  const headers = status === 413 ? { Connection: 'close' } : {};
  send(res, status, views.errors[status](), headers);
}

function createServer(extraRoutes = {}) {
  const table = { ...routes, ...extraRoutes };

  const server = http.createServer(async (req, res) => {
    try {
      await dispatch(req, res, table);
    } catch (error) {
      handleError(error, req, res);
    }
  });

  server.on('clientError', (error, socket) => {
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    } else {
      socket.destroy();
    }
  });

  return server;
}

module.exports = { createServer };
