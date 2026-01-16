function updateStatus(online) {
    if (online) {
        statusDiv.innerText = 'Connected';
        statusDiv.className = 'status connected';
    } else {
        statusDiv.innerText = 'Disconnected';
        statusDiv.className = 'status disconnected';
    }
}

module.exports = { updateStatus };