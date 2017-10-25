import os
import bcrypt
import base64

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(APP_ROOT, 'database.db')

PASSWORD_SALT_ROUNDS = 12
testhash = bcrypt.hashpw(b"test password", bcrypt.gensalt(PASSWORD_SALT_ROUNDS))

PASSWORD_HASH_LENGTH = len(testhash)

GAME_ID_LENGTH_BYTES = 12

GAME_ID_LENGTH_CHARS = len(base64.b64encode(b' ' * GAME_ID_LENGTH_BYTES))
