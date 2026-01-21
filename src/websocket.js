const { WebSocketServer } = require('ws');
const db = require('./database');
let docId = 'main';

function initWS(server) {
	const wss = new WebSocketServer({ server });

	wss.on('connection', async (ws) => {
		console.log('New client connected');

		try {
			const allChars = await db.getAllCharacters(docId);
			ws.send(
				JSON.stringify({
					type: 'SYNC',
					data: allChars,
				}),
			);
		} catch (err) {
			console.error('Sync Error:', err);
		}

		ws.on('message', (message) => {
			try {
				const parsedMsg = JSON.parse(message);
				if (parsedMsg.type === 'INSERT') {
					const chars = parsedMsg.data.chars;
					broadcast(parsedMsg);
					db.insertCharacters(chars);
				} else if (parsedMsg.type === 'DELETE') {
					const chars = parsedMsg.data.chars;
					const docId = parsedMsg.data.docId;
					broadcast(parsedMsg);
					db.deleteCharacters(chars);
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
				console.error('Message Error:', err);
			}
		});

		ws.on('close', () => console.log('Client Disconnected'));
	});
}

module.exports = initWS;
