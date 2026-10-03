const { createServer } = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

createServer().listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
