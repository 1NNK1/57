const { createServer } = require('./src/app');

const failingRoutes = {
  '/boom': {
    GET: () => {
      throw new Error('test failure');
    },
  },
};

const form = { 'Content-Type': 'application/x-www-form-urlencoded' };

const checks = [
  ['GET /', { path: '/' }, 200, 'Welcome to the Home Page'],
  ['GET /about', { path: '/about' }, 200, 'Learn more about us'],
  ['GET /contact', { path: '/contact' }, 200, 'Get in touch'],
  ['GET /about?x=1 (query ігнорується)', { path: '/about?x=1' }, 200, 'Learn more about us'],
  ['GET /nope', { path: '/nope' }, 404, 'Page Not Found'],
  ['GET //evil.com/about', { path: '//evil.com/about' }, 404, 'Page Not Found'],
  ['POST /submit', { method: 'POST', path: '/submit', headers: form, body: 'name=Ivan&email=ivan%40example.com' }, 200, 'Name: Ivan'],
  ['POST /submit (email у відповіді)', { method: 'POST', path: '/submit', headers: form, body: 'name=Ivan&email=ivan%40example.com' }, 200, 'Email: ivan@example.com'],
  ['POST /submit XSS', { method: 'POST', path: '/submit', headers: form, body: 'name=%3Cscript%3Ealert(1)%3C%2Fscript%3E&email=a%40b.c' }, 200, '&lt;script&gt;'],
  ['POST /submit порожні поля', { method: 'POST', path: '/submit', headers: form, body: 'name=&email=' }, 400, 'Invalid form data'],
  ['POST /submit пробіли', { method: 'POST', path: '/submit', headers: form, body: 'name=%20%20&email=a%40b.c' }, 400, 'Invalid form data'],
  ['POST /submit без email', { method: 'POST', path: '/submit', headers: form, body: 'name=Ivan' }, 400, 'Invalid form data'],
  ['POST /submit дубль поля', { method: 'POST', path: '/submit', headers: form, body: 'name=a&name=b&email=a%40b.c' }, 400, 'Invalid form data'],
  ['POST /submit інший Content-Type', { method: 'POST', path: '/submit', headers: { 'Content-Type': 'application/json' }, body: '{"name":"a","email":"b"}' }, 400, 'Invalid form data'],
  ['POST /submit > 1 МБ', { method: 'POST', path: '/submit', headers: form, body: 'name=' + 'a'.repeat(1024 * 1024 + 10) + '&email=a%40b.c' }, 413, 'Payload Too Large'],
  ['GET /submit', { path: '/submit' }, 405, 'Method Not Allowed'],
  ['DELETE /about', { method: 'DELETE', path: '/about' }, 405, 'Method Not Allowed'],
  ['GET /boom (непередбачена помилка)', { path: '/boom' }, 500, 'Server Error'],
];

const server = createServer(failingRoutes);
const originalError = console.error;
console.error = () => {};

server.listen(0, async () => {
  const base = `http://localhost:${server.address().port}`;
  let failed = 0;

  for (const [label, req, status, text] of checks) {
    try {
      const res = await fetch(base + req.path, { method: req.method || 'GET', headers: req.headers, body: req.body });
      const body = await res.text();
      const headersOk =
        res.headers.get('content-type') === 'text/html; charset=utf-8' &&
        res.headers.get('x-content-type-options') === 'nosniff' &&
        Number(res.headers.get('content-length')) === Buffer.byteLength(body);
      const ok = res.status === status && body.includes(text) && headersOk;
      if (!ok) failed++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${label} -> ${res.status}`);
    } catch (error) {
      failed++;
      console.log(`FAIL ${label} -> ${error.message}`);
    }
  }

  console.error = originalError;
  console.log(failed ? `\nПровалено: ${failed}` : '\nУсі перевірки пройдено');
  server.close();
  process.exit(failed ? 1 : 0);
});
