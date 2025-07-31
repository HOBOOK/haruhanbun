require('dotenv').config();
const express = require('express');
const { loadNuxt, build } = require('nuxt')
const path = require('path');
const http = require('http');
const app = express();
const config = require('./config/config');
const cors = require('cors');
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const rankRoutes = require('./routes/rankRoutes');
const logger = require('./middlewares/logger');
const socket = require('./socket.js')
const isDev = process.env.NODE_ENV !== 'production'
require("./config/mongoose");

const server = http.createServer(app);
app.io = socket
app.io.attach(server)

app.use(express.json());
app.use(logger); // 미들웨어 등록
app.use(cors());
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/rank', rankRoutes)

// Nuxt SSR 통합
async function start() {
  console.log('NUXT rootDir =', path.resolve(__dirname, '../ui'))

  const nuxt = await loadNuxt( {
    for: isDev ? 'dev' : 'start',
    rootDir: path.resolve(__dirname, '../ui')  // ← 디렉토리 정확히 명시
  })
  if (isDev) {
    await build(nuxt)
  }

  await nuxt.ready()

  app.use(nuxt.render)

  server.listen(config.PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${config.PORT}`);

  });

  server.on('listening', () => {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  });
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

start()