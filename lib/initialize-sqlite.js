// Initial schema only. Future column changes require explicit migrations.
module.exports = function initializeSqlite(db) {
  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "config" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "createdAt" BIGINT,
        "updatedAt" BIGINT,
        "name" TEXT NOT NULL,
        "value" TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "repo" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "createdAt" BIGINT,
        "updatedAt" BIGINT,
        "owner" TEXT,
        "repo" TEXT,
        "nodes" TEXT
      );
      CREATE TABLE IF NOT EXISTS "owner" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "createdAt" BIGINT,
        "updatedAt" BIGINT,
        "login" TEXT NOT NULL UNIQUE
      );
    `);
  })();
};
