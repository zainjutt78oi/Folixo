import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY       = os.getenv('SECRET_KEY', 'folixo-dev-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY   = os.getenv('GEMINI_API_KEY')
    ADMIN_EMAIL      = os.getenv('ADMIN_EMAIL', 'admin@folixo.com')

    SECURITY_QUESTIONS = [
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your mother's maiden name?",
        "What was the name of your primary school?",
        "What was the make of your first car?",
        "What is the name of your childhood best friend?",
        "What street did you grow up on?",
        "What was your childhood nickname?",
        "What is your oldest sibling's middle name?",
        "What was your childhood sports team?",
    ]

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig,
}
