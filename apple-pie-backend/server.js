const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const { initSocket } = require('./src/utils/socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
