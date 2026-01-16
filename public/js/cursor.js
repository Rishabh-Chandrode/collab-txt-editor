import { cursorLayer, mirrorDiv, mySiteId } from "./dom.js";
import { ws } from "./webSocket.js";

export function handleCursorEvents() {
	document.addEventListener("selectionchange", () => {
		if (document.activeElement !== editor) return;

		const start = editor.selectionStart;
		const end = editor.selectionEnd;

		ws.send(
			JSON.stringify({
				type: "CURSOR",
				data: { sideId: mySiteId, cursorIndex: start },
			})
		);
	});
}

export function updateRemoteCursor(data) {
	let cursorElement = document.getElementById(`cursor-${data.sideId}`);
	if (!cursorElement) {
		cursorElement = document.createElement("div");
		cursorElement.id = `cursor-${data.sideId}`;
		cursorElement.className = "remote-cursor";
		cursorElement.setAttribute("data-sideId", data.sideId);
		cursorElement.setAttribute("data-label", data.sideId);
		cursorLayer.appendChild(cursorElement);
	}

	const cursorCoordinates = getRemoteCursorCoordinates(data.cursorIndex);

	cursorElement.style.left = `${cursorCoordinates.left}px`;
	cursorElement.style.top = `${cursorCoordinates.top}px`;
}

function getRemoteCursorCoordinates(cursorIndex) {
	mirrorDiv.innerText = editor.value.substring(0, cursorIndex);

	const cursorSpan = document.createElement("span");
	cursorSpan.innerText = "|";
	mirrorDiv.appendChild(cursorSpan);

	const cursorSpanRect = cursorSpan.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	const cursorCoordinates = {
		left: cursorSpanRect.left - containerRect.left,
		top: cursorSpanRect.top - containerRect.top,
	};

	return cursorCoordinates;
}
