const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/editor.db');

let db;


function initDB () {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
        } else {
            console.log('✅ Connected to the SQLite database.');
            initializeSchema();
        }
    })
}


function initializeSchema() {
    db.run(`CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        position TEXT,
        value TEXT,
        site_id TEXT
    )`);
}


module.exports = initDB;