import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'project-hub.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

function quote(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlite(sql) {
  return execFileSync('sqlite3', ['-json', dbPath, sql], { encoding: 'utf8' }).trim();
}

export function migrate() {
  execFileSync('sqlite3', [dbPath], { input: `
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, is_admin INTEGER DEFAULT 0, bio TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS project_sections (id INTEGER PRIMARY KEY AUTOINCREMENT, section_key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS phases (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL, starts_at TEXT, ends_at TEXT, status TEXT CHECK(status IN ('not_started','in_progress','done')) DEFAULT 'not_started', expected_outputs TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS references_list (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, url TEXT, summary TEXT NOT NULL, track TEXT DEFAULT 'research', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, owner_id INTEGER, status TEXT CHECK(status IN ('not_started','in_progress','done')) DEFAULT 'not_started', track TEXT CHECK(track IN ('research','practice','plan')) DEFAULT 'practice', phase_id INTEGER, due_date TEXT, output TEXT DEFAULT '', updated_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(owner_id) REFERENCES members(id), FOREIGN KEY(phase_id) REFERENCES phases(id));
    CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, content TEXT NOT NULL, category TEXT DEFAULT 'عام', created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(member_id) REFERENCES members(id));
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, member_id INTEGER NOT NULL, content TEXT NOT NULL, attachment_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(member_id) REFERENCES members(id));
  ` });
}

export function all(sql, params = []) {
  const finalSql = params.reduce((query, param) => query.replace('?', quote(param)), sql);
  const output = sqlite(finalSql);
  return output ? JSON.parse(output) : [];
}
export function get(sql, params = []) { return all(sql, params)[0]; }
export function run(sql, params = []) { all(sql, params); }
export function insert(table, values) {
  const keys = Object.keys(values);
  run(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, keys.map(k => values[k]));
}
