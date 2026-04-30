import uuid
from utils.execute_query import execute_query

def create_user(username: str, password_hash: str) -> str:
    user_id = str(uuid.uuid4())
    
    # Insert the user
    execute_query(
        'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        (user_id, username, password_hash),
        fetch=False
    )

    execute_query(
        'INSERT INTO user_usage (user_id, tokens_used_month, storage_used_mb) VALUES (?, 0, 0.0)',
        (user_id,),
        fetch=False
    )

    return user_id

def get_user_by_username(username: str) -> dict | None:
    rows = execute_query('SELECT * FROM users WHERE username = ?', (username,), fetch=True)
    return dict(rows[0]) if rows else None

def get_user_by_session(session_id: str) -> dict | None:
    query = '''
        SELECT u.* FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.session_id = ?
    '''
    rows = execute_query(query, (session_id,), fetch=True)
    return dict(rows[0]) if rows else None

def create_user_session(user_id: str, session_id: str):
    execute_query(
        'INSERT INTO sessions (session_id, user_id) VALUES (?, ?)', 
        (session_id, user_id), 
        fetch=False
    )

def delete_session(session_id: str):
    execute_query(
        'DELETE FROM sessions WHERE session_id = ?', 
        (session_id,), 
        fetch=False
    )

def update_user_api_key(user_id: str, encrypted_key: str | None):
    execute_query(
        'UPDATE users SET encrypted_api_key = ? WHERE id = ?', 
        (encrypted_key, user_id), 
        fetch=False
    )

def get_user_metrics(user_id: str) -> dict:
    usage_rows = execute_query(
        'SELECT tokens_used_month, storage_used_mb FROM user_usage WHERE user_id = ?', 
        (user_id,), 
        fetch=True
    )
    usage = usage_rows[0] if usage_rows else None

    try:
        chat_rows = execute_query('SELECT COUNT(DISTINCT thread_id) FROM chat_history WHERE user_id = ?', (user_id,), fetch=True)
        # rows[0] gets the first row, [0] gets the first column (the count)
        chat_count = chat_rows[0][0] if chat_rows else 0
    except Exception:
        chat_count = 0

    try:
        bot_rows = execute_query('SELECT COUNT(*) FROM bots WHERE user_id = ?', (user_id,), fetch=True)
        bot_count = bot_rows[0][0] if bot_rows else 0
    except Exception:
        bot_count = 0

    return {
        "tokensUsedThisMonth": usage["tokens_used_month"] if usage else 0,
        "totalChats": chat_count,
        "storageUsedMB": usage["storage_used_mb"] if usage else 0.0,
        "activeBots": bot_count
    }

def increment_storage_usage(user_id: str, size_in_mb: float):
    execute_query('''
        UPDATE user_usage 
        SET storage_used_mb = storage_used_mb + ? 
        WHERE user_id = ?
    ''', (size_in_mb, user_id), fetch=False)