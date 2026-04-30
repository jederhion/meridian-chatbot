# This file is strictly for connecting to the database and setting up the tables.

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "../../custom_bots.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

def seed_system_bots(cursor):
    system_url = "http://localhost:8001/sse"
    system_bots = [
        ("bot_science", "Science & Tech Expert", "Searches arXiv and NASA for deep tech.", "You are a science and technology expert.", '[]', None, system_url, 1),
        ("bot_finance", "Financial Analyst", "Analyzes SEC filings and market trends.", "You are a financial analyst.", '[]', None, system_url, 1),
        ("bot_legal", "Legal Counsel", "Researches court cases and public policy.", "You are a legal counsel.", '[]', None, system_url, 1),
        ("bot_cyber", "Security Analyst", "Monitors CVEs and threat intelligence.", "You are a cybersecurity expert.", '[]', None, system_url, 1),
        ("bot_internal", "Company Copilot", "Answers questions based on internal docs.", "You are an internal assistant. Base your answers on the provided documents.", '[]', "bot_internal", "", 1)
    ]
    
    cursor.execute("SELECT count(*) as count FROM bots WHERE is_system_bot = 1")
    row = cursor.fetchone()
    
    if row and row['count'] == 0:
        for bot in system_bots:
            # Notice we don't need to pass user_id here because system bots don't belong to a specific user
            cursor.execute('''
                INSERT INTO bots (id, name, description, system_prompt, allowed_tools, rag_namespace_id, custom_mcp_url, is_system_bot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', bot)
        print("Seeded System Bots into the database with MCP URLs.")

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                encrypted_api_key TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id TEXT,
                user_id TEXT NOT NULL,
                role TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        # ADDED user_id TEXT and FOREIGN KEY to the bots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bots (
                id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                system_prompt TEXT,
                allowed_tools TEXT,
                rag_namespace_id TEXT,
                custom_mcp_url TEXT,
                is_system_bot INTEGER DEFAULT 0,
                status TEXT DEFAULT 'ready',
                user_id TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_usage (
                user_id TEXT PRIMARY KEY,
                tokens_used_month INTEGER DEFAULT 0,
                storage_used_mb REAL DEFAULT 0.0
            )
        ''')

        seed_system_bots(cursor)
        conn.commit()
        print("SQLite Database Initialized.")
        
    except sqlite3.Error as e:
        # If anything fails, undo any partial changes
        conn.rollback()
        # Print a loud and clear error message to your terminal
        print(f"❌ ERROR: Database initialization failed! Details: {e}")
        # Re-raise the error so the app crashes instead of running in a broken state
        raise e
        
    finally:
        # Guarantee the connection closes even if an error occurred
        conn.close()