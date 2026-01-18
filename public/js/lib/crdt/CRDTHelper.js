import { mySiteId } from "../../dom.js";
import { localState } from "../../state.js";
import { sendMessage } from "../../webSocket.js";
import { CRDT } from "./CRDT.js";

export const MIN_CHAR_POS = "!";
export const MAX_CHAR_POS = "~";

export function handleInputChange(newText, oldText) {
	let i = 0;
	while (i < newText.length) {
		if (newText[i] !== oldText[i]) {
			break;
		} else {
			i++;
		}
	}
	const diffStartIndex = i;

	let newTextDiffEndIndex = newText.length - 1;
	let oldTextDiffEndIndex = oldText.length - 1;
	while (
		newTextDiffEndIndex >= 0 &&
		oldTextDiffEndIndex >= 0 &&
		oldTextDiffEndIndex >= diffStartIndex
	) {
		if (newText[newTextDiffEndIndex] !== oldText[oldTextDiffEndIndex]) {
			break;
		} else {
			newTextDiffEndIndex--;
			oldTextDiffEndIndex--;
		}
	}

	let diffLength;
	if (diffStartIndex <= oldTextDiffEndIndex) {
		diffLength = oldTextDiffEndIndex - diffStartIndex + 1;
        const deletedChars = localState.delete(diffStartIndex, diffLength);
        deletedChars.forEach(element => {
            sendMessage({
                type: "DELETE",
                data: {
                    docId: "main",
                    position: element.position,
                }
            });
        });
	}

	if (diffStartIndex <= newTextDiffEndIndex) {
		diffLength = newTextDiffEndIndex - diffStartIndex + 1;

		let prevCharPos = localState.getPrevCharPos(diffStartIndex);
		let nextCharPos = localState.getNextCharPos(diffStartIndex);
		let charsToAdd = [];
        i = diffStartIndex;
        
		while (diffLength--) {
            const newPos = generatePosition(prevCharPos, nextCharPos);
			const newCRDTObject = new CRDT(newText.charAt(i), newPos, mySiteId);
            localState.sortedPush(newCRDTObject);
			sendMessage({
                type: "INSERT",
				data: newCRDTObject.toJSON()
			});
            prevCharPos = newPos;
            i++
		}

	}
}


function generatePosition(prevPos, nextPos) {
	if (!prevPos && !nextPos) {
		const midAscii = Math.floor(
			(MIN_CHAR_POS.charCodeAt(0) + MAX_CHAR_POS.charCodeAt(0)) / 2
		);
		return String.fromCharCode(midAscii);
	}
	if (!prevPos) return findBetween(MIN_CHAR_POS, nextPos);

	// ASCII after '9' is ':'
	if (!nextPos) return findBetween(prevPos, MAX_CHAR_POS);

	return findBetween(prevPos, nextPos);
}

function findBetween(pos1, pos2) {
	let i = 0;
	let newPos = "";

	while (true) {
		let leftChar = i < pos1.length ? pos1.charAt(i) : MIN_CHAR_POS;
		let rightChar = i < pos2.length ? pos2.charAt(i) : MAX_CHAR_POS;

		if (leftChar === rightChar) {
			i++;
			newPos += leftChar;
			continue;
		}

		let leftCharAscii = leftChar.charCodeAt(0);
		let rightCharAscii = rightChar.charCodeAt(0);

		if (rightCharAscii - leftCharAscii > 1) {
			let mid = Math.floor((leftCharAscii + rightCharAscii) / 2);
			newPos += String.fromCharCode(mid);
			break;
		} else {
			newPos += leftChar;
			i++;
		}
	}

	return newPos;
}
