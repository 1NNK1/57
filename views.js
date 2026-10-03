const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const page = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
</head>
<body>
${content}
</body>
</html>
`;

const staticPage = (title, text) =>
  page(title, `<h1>${escapeHtml(title)}</h1>\n<p>${escapeHtml(text)}</p>`);

const errorPage = (title, message) => page(title, `<h1>${escapeHtml(message)}</h1>`);

const home = () => staticPage('Home', 'Welcome to the Home Page');
const about = () => staticPage('About', 'Learn more about us');
const contact = () => staticPage('Contact', 'Get in touch');

const submitted = (name, email) =>
  page(
    'Form Submitted',
    `<h1>Form Submitted</h1>\n<p>Name: ${escapeHtml(name)}</p>\n<p>Email: ${escapeHtml(email)}</p>`,
  );

const errors = {
  400: () => errorPage('400 Bad Request', 'Invalid form data'),
  404: () => errorPage('404 Not Found', 'Page Not Found'),
  405: () => errorPage('405 Method Not Allowed', 'Method Not Allowed'),
  413: () => errorPage('413 Payload Too Large', 'Payload Too Large'),
  500: () => errorPage('500 Internal Server Error', 'Server Error'),
};

module.exports = { escapeHtml, home, about, contact, submitted, errors };
