const { WebSocketServer } = require('ws');
const db = require('./database');

function initWS(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws) => {
    console.log('🔌 New Client Connected');

    try {
      const allChars = await db.getAllCharacters();
      ws.send(JSON.stringify({ 
        type: 'SYNC', 
        data: allChars 
      }));
    } catch (err) {
      console.error('❌ Sync Error:', err);
    }


    ws.on('message', (message) => {
      try {
        const parsedMsg = JSON.parse(message);
        
        
        if (parsedMsg.type === 'INSERT') {
          db.insertCharacter(parsedMsg.data);
          broadcast(parsedMsg);
        } else if (parsedMsg.type === 'DELETE') {
          db.deleteCharacter(parsedMsg.data.position);
          broadcast(parsedMsg);
        } else if (parsedMsg.type === 'CURSOR') {
          broadcast(parsedMsg);
        }

        function broadcast(msg) {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(msg));
            }
          });
        }

      } catch (err) {
        console.error('❌ Message Error:', err);
      }
    });

    ws.on('close', () => console.log('❌ Client Disconnected'));
  });

  console.log('✅ WebSocket Server initialized');
}

module.exports = initWS;