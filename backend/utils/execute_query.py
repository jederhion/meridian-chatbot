from api.db import get_db_connection
import logging

def execute_query(query: str, params: tuple = (), fetch: bool = False):
    """
    A helper function to handle all database connections, queries, and errors.
    
    Parameters:
    - query: The SQL string to execute.
    - params: The variables to safely insert into the SQL string.
    - fetch: True if we expect data back (SELECT), False if we are saving data (INSERT/UPDATE).
    """
    conn = None
    try:
        conn = get_db_connection()
        # conn.execute is a handy shortcut in SQLite that creates a cursor for us
        cursor = conn.execute(query, params)
        
        if fetch:
            return cursor.fetchall()
        else:
            conn.commit()
            return True # Indicates the write was successful
            
    except Exception as e:
        if conn and not fetch:
            conn.rollback() # Only rollback if we were trying to write data
        logging.error(f"Database query failed: {e}")
        return [] if fetch else False # Return empty list for reads, False for writes
        
    finally:
        if conn:
            conn.close()