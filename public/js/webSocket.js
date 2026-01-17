import { updateRemoteCursor } from "./cursor.js";
import { render, updateOnlineStatus } from "./dom.js";
import { CRDT } from "./lib/crdt/CRDT.js";
import { localState } from "./state.js";

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.host; 

export const ws = new WebSocket(`${protocol}://${host}`);

export function initWebSocket() {

	ws.onopen = () => {
		updateOnlineStatus(true);
	};

	ws.onclose = () => {
		updateOnlineStatus(false);
	};

	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		handleMessage(message);
	};
}

function handleMessage(message) {
	switch (message.type) {
		case "SYNC":
            message.data.forEach(element => {
                const char = new CRDT(element.value, element.position, element.siteId);
                localState.push(char);
            });
			localState.sort();
			render();
			break;
		case "INSERT":
			const data = message.data;
			const char = new CRDT(data.value, data.position, data.siteId);
			localState.push(char);
			localState.sort();
			render();
			break;
			
		case "DELETE":
			const {  position } = message.data;
            localState.filter((char) => {
				return char.position !== position;
			})
			render();
			break;
		case "CURSOR":
			updateRemoteCursor(message.data);
			break;
	}

	render();
}

export function sendMessage(message) {
	ws.send(JSON.stringify(message));
}
