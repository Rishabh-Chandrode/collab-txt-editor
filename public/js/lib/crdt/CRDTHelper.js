import { mySiteId } from "../../dom.js";
import { localState } from "../../state.js";
import { ws } from "../../webSocket.js";
import { CRDT } from "./CRDT.js";


const MIN_ID_RANGE = '!';
const MAX_ID_RANGE = '~';


export function handleInsert(newText, oldText, cursorIndex) {

    const charIndex = cursorIndex - 1;
    const charValue = newText.charAt(charIndex);

    const prevChar = localState.getByIndex(charIndex - 1);
    const nextChar = localState.getByIndex(charIndex);

    const prevPos = prevChar ? prevChar.position : null;
    const nextPos = nextChar ? nextChar.position : null;

    const newPos = generatePosition(prevPos, nextPos);

    const newCRDTObject = new CRDT(charValue, newPos, mySiteId);

    localState.insert(charIndex, newCRDTObject);

    ws.send(JSON.stringify({
        type: 'INSERT',
        data: newCRDTObject.toJSON()
    }));

}

export function handleDelete(newText, oldText) {
    let diffIndex = 0;
    while (diffIndex < newText.length && newText[diffIndex] === oldText[diffIndex]) {
        diffIndex++;
    }

    const charToDelete = localState.getByIndex(diffIndex);

    if (charToDelete) {
        localState.delete(diffIndex);

        ws.send(JSON.stringify({
            type: 'DELETE',
            data: { position: charToDelete.position }
        }));
    }
}

function generatePosition(prevPos, nextPos) {
    if (!prevPos && !nextPos) {
        const midAscii = Math.floor((MIN_ID_RANGE.charCodeAt(0) + MAX_ID_RANGE.charCodeAt(0)) / 2);
        return String.fromCharCode(midAscii);
    }
    if (!prevPos) return findBetween(MIN_ID_RANGE, nextPos);

    // ASCII after '9' is ':'
    if (!nextPos) return findBetween(prevPos, MAX_ID_RANGE);

    return findBetween(prevPos, nextPos);
}


function findBetween(pos1, pos2) {

   let i = 0;
   let newPos = '';

   while(true) {
        let leftChar = (i < pos1.length) ? pos1.charAt(i) : MIN_ID_RANGE;
        let rightChar = (i < pos2.length) ? pos2.charAt(i) : MAX_ID_RANGE;

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
        }else {
            newPos += leftChar;
            i++;
        }    
   }

   return newPos;
}
