import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    DATA_FOLDER = os.path.join(os.path.dirname(__file__), 'data')
    ALLOWED_EXTENSIONS = {'json'}