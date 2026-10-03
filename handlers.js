const querystring = require('node:querystring');
const views = require('./views');
const { HttpError, send, readBody } = require('./http');

const MAX_BODY_SIZE = 1024 * 1024;

const home = (req, res) => send(res, 200, views.home());
const about = (req, res) => send(res, 200, views.about());
const contact = (req, res) => send(res, 200, views.contact());

const field = (value) => (typeof value === 'string' ? value.trim() : '');

async function submit(req, res) {
  const rawBody = await readBody(req, MAX_BODY_SIZE);

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/x-www-form-urlencoded') {
    throw new HttpError(400);
  }

  const data = querystring.parse(rawBody, '&', '=', { maxKeys: 50 });
  const name = field(data.name);
  const email = field(data.email);

  if (!name || !email) {
    throw new HttpError(400);
  }

  send(res, 200, views.submitted(name, email));
}

module.exports = { MAX_BODY_SIZE, home, about, contact, submit };
