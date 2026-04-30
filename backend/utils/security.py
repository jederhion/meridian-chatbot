import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import bcrypt

load_dotenv()

# We pull the master key from the environment.
# If it doesn't exist (like on local dev), we generate a temporary one.
# IN PRODUCTION: You must generate a key and save it in your .env file as ENCRYPTION_KEY!
_env_key = os.getenv("ENCRYPTION_KEY")
MASTER_KEY = _env_key.encode() if _env_key else Fernet.generate_key()

cipher_suite = Fernet(MASTER_KEY)

def encrypt_key(plain_text_key: str) -> str:
    """Encrypts a plain text string and returns the encoded string."""
    return cipher_suite.encrypt(plain_text_key.encode()).decode()

def decrypt_key(encrypted_key: str) -> str:
    """Decrypts an encoded string back to plain text."""
    return cipher_suite.decrypt(encrypted_key.encode()).decode()

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    # bcrypt requires bytes, so we encode the password, hash it, and decode back to string
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plaintext password matches the hashed password."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())