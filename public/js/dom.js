import { handleCursorEvents } from "./cursor.js";
import { handleDelete, handleInsert } from "./lib/crdt/CRDTHelper.js";
import { localState } from "./state.js";

export const container = document.getElementById("container");
export const editor = document.getElementById("editor");
export const statusDiv = document.getElementById("status");
export const cursorLayer = document.getElementById("cursor-layer");
export const mirrorDiv = document.getElementById("mirror-div");
export const mySiteId = "User-" + Math.floor(Math.random() * 1000);

export function handleEventListeners() {
	editor.addEventListener("input", (event) => {
		const newText = event.target.value;

		const oldText = localState.text;

		const cursorStart = event.target.selectionStart;
		const cursorEnd = event.target.selectionEnd;

		if (newText.length > oldText.length) {
			handleInsert(newText, oldText, cursorStart);
		} else {
			handleDelete(newText, oldText);
		}
	});

    handleCursorEvents();
}

export function updateOnlineStatus(isOnline) {
	if (isOnline) {
		statusDiv.innerText = "Connected";
		statusDiv.className = "status connected";
	} else {
		statusDiv.innerText = "Disconnected";
		statusDiv.className = "status disconnected";
	}
}

export function render() {
	const start = editor.selectionStart;
	const end = editor.selectionEnd;

	editor.value = localState.text;
	editor.setSelectionRange(start, end);
}
