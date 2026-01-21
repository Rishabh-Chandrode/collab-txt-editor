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

function insertCharacters(chars) {
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const stmt = db.prepare(
            "INSERT OR REPLACE INTO characters (doc_id, position, value, site_id) VALUES (?, ?, ?, ?)"
        );

        chars.forEach((char) => {
            stmt.run("main", char.position, char.value, char.siteId);
        });

        stmt.finalize();

        db.run("COMMIT", (err) => {
            if (err) console.error("Transaction commit failed:", err);
        });
    });
}

function deleteCharacters(chars) {
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const stmt = db.prepare(
            "DELETE FROM characters WHERE doc_id = ? AND position = ? AND site_id = ?"
        );

        chars.forEach((char) => {
            stmt.run("main", char.position, char.siteId);
        });

        stmt.finalize();

        db.run("COMMIT", (err) => {
            if (err) console.error("Transaction commit failed:", err);
        });
    });
}

module.exports = { initDB, getAllCharacters, insertCharacters, deleteCharacters };
