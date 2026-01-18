const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const isRender = process.env.RENDER || false;
const dbPath = isRender 
    ? '/tmp/editor.db'                 
    : path.resolve(__dirname, "../db/editor.db");
const db = new sqlite3.Database(dbPath, (err) => {
	if (err) console.error("DB Connection Error:", err);
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
}

function getAllCharacters(docId) {
	return new Promise((resolve, reject) => {
		db.all(
			"SELECT * FROM characters WHERE doc_id = ? ORDER BY position ASC",
			[docId],
			(err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			}
		);
	});
}

function insertCharacter(char) {

  const {position, value, siteId} = char;
  if (!position || !value || !siteId) {
    console.error("Invalid character data:", char);
    return;
  }

	const stmt = db.prepare(
		"INSERT OR REPLACE INTO characters (doc_id, position, value, site_id) VALUES (?, ?, ?, ?)"
	);
	stmt.run("main", char.position, char.value, char.siteId);
	stmt.finalize();
}

function deleteCharacter(data) {
  const  {position, docId} = data;

  if (!position || !docId) {
    console.error("Invalid character data:", data);
    return;
  }

	const stmt = db.prepare(
		"DELETE FROM characters WHERE doc_id = ? AND position = ?"
	);
	stmt.run(docId, position);
	stmt.finalize();
}

module.exports = { initDB, getAllCharacters, insertCharacter, deleteCharacter };
