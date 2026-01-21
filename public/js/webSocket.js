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
			const charsToAddJSON = message.data.chars;
			let charsToAdd = [];
			charsToAddJSON.forEach(charJson => {
				charsToAdd.push(new CRDT(charJson.value, charJson.position, charJson.siteId));
			})
			localState.merge(charsToAdd);
			render();
			break;
			
		case "DELETE":
			const charsToDelete = message.data.chars;
			let charSet = new Set(charsToDelete.map(c => c.position));
			localState.filter(char => !charSet.has(char.position));
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
