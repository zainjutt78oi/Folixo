"""
Folixo - Main entry point
Run directly: python run.py
Or press F5 in VS Code
"""
import os
import sys

# Auto-setup check
def check_setup():
    """Check if packages are installed, if not run setup automatically"""
    try:
        import flask
        import flask_sqlalchemy
        import flask_login
    except ImportError:
        print("\n[Folixo] First time setup - installing packages...")
        print("[Folixo] This will take 1-2 minutes...\n")
        import subprocess
        
        # Create venv if needed
        if not os.path.exists("venv"):
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        
        # Get venv pip
        if os.name == "nt":
            pip = os.path.join("venv", "Scripts", "pip.exe")
            python_venv = os.path.join("venv", "Scripts", "python.exe")
        else:
            pip = os.path.join("venv", "bin", "pip")
            python_venv = os.path.join("venv", "bin", "python")
        
        subprocess.run([pip, "install", "-r", "requirements.txt", "-q"], check=True)
        print("[Folixo] Setup done! Restarting...\n")
        
        # Restart with venv python
        os.execv(python_venv, [python_venv] + sys.argv)

check_setup()

# Create database dir
os.makedirs("database", exist_ok=True)

# Load .env
from dotenv import load_dotenv
load_dotenv()

from app import create_app

app = create_app('development')

if __name__ == '__main__':
    print("\n" + "="*45)
    print("  FOLIXO is running!")
    print("  Website: http://127.0.0.1:5000")
    print("  Admin:   http://127.0.0.1:5000/admin/login")
    print("  Press Ctrl+C to stop")
    print("="*45 + "\n")
    app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=True)
