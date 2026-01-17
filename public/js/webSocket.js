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
			render();
			break;
		case "INSERT":
			const char = new CRDT(message.data.value, message.data.position, message.data.siteId);
			localState.sortedPush(char);
			render();
			break;
		case "DELETE":
            localState.filter((char) => char.position !== message.data.position);
			render();
			break;
		case "CURSOR":
			updateRemoteCursor(message.data);
			break;
	}

	render();
}
