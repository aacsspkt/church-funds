import Database from "@tauri-apps/plugin-sql";

// when using `"withGlobalTauri": true`, you may use
// const Database = window.__TAURI__.sql;

const db = await Database.load("sqlite:church_fund_records.db");

export default db;
