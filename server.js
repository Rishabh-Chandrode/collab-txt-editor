require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const {initDB} = require('./src/database');
const initWS = require('./src/websocket');


initDB();


const server = http.createServer(app);

initWS(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
