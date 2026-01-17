import { cursorLayer, mirrorDiv, mySiteId } from "./dom.js";
import { sendMessage } from "./webSocket.js";

export function handleCursorEvents() {
	document.addEventListener("selectionchange", () => {
		if (document.activeElement !== editor) return;

		const start = editor.selectionStart;
		const end = editor.selectionEnd;

		sendMessage({
			type: "CURSOR",
			data: { sideId: mySiteId, cursorIndex: start },
		});
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

		const randomColorCode = Math.floor(Math.random() * 16777215)
  .toString(16)
  .padStart(6, "0");
		cursorElement.style.setProperty("--cursor-color", `#${randomColorCode}`);
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
