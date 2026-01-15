const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/editor.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ DB Connection Error:', err.message);
});

function initDB() {
  db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT,
        position TEXT,
        value TEXT,
        site_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (doc_id, position)
      )
    `);
  });
  console.log('✅ Database schema initialized.');
}

function getAllCharacters() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM characters WHERE doc_id = 'main' ORDER BY position ASC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function insertCharacter(char) {
  const stmt = db.prepare("INSERT OR REPLACE INTO characters (doc_id, position, value, site_id) VALUES (?, ?, ?, ?)");
  stmt.run('main', char.position, char.value, char.siteId);
  stmt.finalize();
}

function deleteCharacter(position) {
    const stmt = db.prepare("DELETE FROM characters WHERE doc_id = 'main' AND position = ?");
    stmt.run(position);
    stmt.finalize();
}

module.exports = { initDB, getAllCharacters, insertCharacter, deleteCharacter };