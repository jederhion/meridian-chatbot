from utils.execute_query import execute_query

def save_message(thread_id: str, role: str, content: str, user_id: int):
    query = 'INSERT INTO chat_history (thread_id, role, content, user_id) VALUES (?, ?, ?, ?)'
    params = (thread_id, role, content, user_id)
    execute_query(query, params, fetch=False)

def get_chat_history_from_db(thread_id: str, user_id: int) -> list:
    query = 'SELECT id, role, content FROM chat_history WHERE thread_id = ? AND user_id = ? ORDER BY timestamp ASC'
    params = (thread_id, user_id)
    rows = execute_query(query, params, fetch=True)
    
    return [{"id": str(row['id']), "role": row['role'], "content": row['content']} for row in rows]

def get_all_threads_from_db(user_id: int) -> list:
    query = '''
        SELECT thread_id, content as title, timestamp
        FROM chat_history
        WHERE id IN (
            SELECT MIN(id)
            FROM chat_history
            WHERE role = 'user' AND user_id = ?
            GROUP BY thread_id
        )
        ORDER BY timestamp DESC
    '''
    params = (user_id,) # Note the comma! It's required for a single-item tuple in Python
    rows = execute_query(query, params, fetch=True)
    
    threads = []
    for row in rows:
        title = row['title']
        short_title = title[:30] + "..." if len(title) > 30 else title
        threads.append({"id": row['thread_id'], "title": short_title})
        
    return threads

def increment_token_usage(user_id: str, new_tokens: int):
    query = '''
        UPDATE user_usage 
        SET tokens_used_month = tokens_used_month + ? 
        WHERE user_id = ?
    '''
    params = (new_tokens, user_id)
    execute_query(query, params, fetch=False)