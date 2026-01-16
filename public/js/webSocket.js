import { updateRemoteCursor } from "./cursor.js";
import { render, updateOnlineStatus } from "./dom.js";
import { CRDT } from "./lib/crdt/CRDT.js";
import { localState } from "./state.js";

export const ws = new WebSocket("ws://localhost:5000");

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

			editor.value = localState.text;
			break;
		case "INSERT":
			localState.push(message.data);
            localState.sort();
			editor.value += message.data.value;
			break;
		case "DELETE":
            localState.filter((char) => char.position !== message.data.position);
			editor.value = localState.text;
			break;
		case "CURSOR":
			updateRemoteCursor(message.data);
			break;
	}

	render();
}
