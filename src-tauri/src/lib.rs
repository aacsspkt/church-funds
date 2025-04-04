// mod domain;
use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migration = Migration {
        version: 1,
        description: "drop_tables_if_exist",
        sql: "
            DROP TABLE IF EXISTS church;
            DROP TABLE IF EXISTS member;
            DROP TABLE IF EXISTS fund_type;
            DROP TABLE IF EXISTS fund;
            ",
        kind: MigrationKind::Down,
    };

    let migration1 = Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
            CREATE TABLE church (
                id INTEGER PRIMARY KEY, 
                name TEXT,
                email TEXT NULLABLE,
                address TEXT,
                phone1 TEXT,
                phone2 TEXT NULLABLE,
                created_at INTEGER,
                modified_at INTEGER
            );
        
            CREATE TABLE member (
                id INTEGER PRIMARY KEY, 
                name TEXT,
                email TEXT NULLABLE,
                address TEXT,
                phone1 TEXT,
                phone2 TEXT NULLABLE,
                church_id INTEGER,
                created_at INTEGER,
                modified_at INTEGER
            );
    
            CREATE TABLE fund_type (
                id INTEGER PRIMARY KEY, 
                name TEXT,
                description TEXT NULLABLE,
                created_at INTEGER,
                modified_at INTEGER
            );
    
            CREATE TABLE fund (
                id INTEGER PRIMARY KEY, 
                member_id INTEGER,
                amount REAL,
                endow_date TEXT,
                fund_type_id INTEGER,
                created_at INTEGER,
                modified_at INTEGER
            );
        ",
        kind: MigrationKind::Up,
    };

    let migrations = vec![migration, migration1];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:church_fund_records.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
