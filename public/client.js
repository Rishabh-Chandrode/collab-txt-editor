const ws = new WebSocket('ws://localhost:5000');

const editor = document.getElementById('editor');
const statusDiv = document.getElementById('status');


ws.onopen = () => {
    statusDiv.innerText = 'Connected';
    statusDiv.className = 'status connected';
};

ws.onclose = () => {
    statusDiv.innerText = 'Disconnected';
    statusDiv.className = 'status disconnected';
};

let localState = [];

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
        case 'SYNC':
            localState = msg.data;
            editor.value = localState.map(char => char.value).join('');
            break;
        case 'INSERT':
            localState.push(msg.data);
            editor.value += msg.data.value;
            break;
        case 'DELETE':
            localState = localState.filter(char => char.position !== msg.data.position);
            editor.value = localState.map(char => char.value).join('');
            break;
    }

    render();

}

function render() {

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value = localState.map(char => char.value).join('');
    editor.setSelectionRange(start, end);
}

editor.addEventListener('input', (event) => {
    const newText = event.target.value;

    const oldText = localState.map(char => char.value).join('');

    const cursorStart = event.target.selectionStart;
    const cursorEnd = event.target.selectionEnd;

    if (newText > oldText) {
       handleInsert(newText, oldText, cursorStart);
    } else {
        handleDelete(newText, oldText);
    }
})


function handleInsert(newText, oldText, cursorIndex) {

    const charIndex = cursorIndex - 1;
    const charValue = newText.charAt(charIndex);

    const prevChar = localState[charIndex-1];
    const nextChar = localState[charIndex];

    const prevPos = prevChar ? prevChar.position : null;
    const nextPos = nextChar ? nextChar.position : null;

    const newPos = generatePosition(prevPos, nextPos);

    const newCharObject = {
        value: charValue,
        position: newPos,
        sideId: 'user-' + Math.floor(Math.random() * 1000)
    }

    localState.splice(charIndex, 0, newCharObject);

    ws.send(JSON.stringify({
        type: 'INSERT',
        data: newCharObject
    }));

}

function handleDelete(newText, oldText) {
    let diffIndex = 0;
    while (diffIndex < newText.length && newText[diffIndex] === oldText[diffIndex]) {
        diffIndex++;
    }

    const charToDelete = localState[diffIndex];

    if (charToDelete) {
        localState.splice(diffIndex, 1);
        
        ws.send(JSON.stringify({ 
            type: 'DELETE', 
            data: { position: charToDelete.position } 
        }));
    }
}

function generatePosition(prevPos, nextPos) {
    if (!prevPos && !nextPos) return '5';
    if (!prevPos) return findBetween('0', nextPos);

    // ASCII after '9' ':'
    if (!nextPos) return findBetween(prevPos, ':');

    return findBetween(prevPos, nextPos);
}


function findBetween(pos1, pos2) {

   let i = 0;
   let newPos = '';

   while(true) {
        let leftChar = (i < pos1.length) ? pos1.charAt(i) : '0';
        let rightChar = (i < pos2.length) ? pos2.charAt(i) : ':';

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