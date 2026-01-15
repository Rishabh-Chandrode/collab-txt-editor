const {WebSocketServer} = require('ws');

let wss;


function initWS(server) {

    wss = new WebSocketServer({ server });

    wss.on('connection' ,(ws) => {
        console.log('✅ WebSocket Server initialized');

        ws.on('message', (message) => {
            wss.clients.forEach((client) => {
                if (client !==ws && client.readyState === 1) {
                    client.send(message);
                }
            })
        })

        ws.on('close', () => {
            console.log('❌ WebSocket connection closed');
        });

    })
    
}

module.exports = initWS;