"""
Folixo - One time setup script
Run: python setup.py
This creates venv and installs all packages automatically.
"""
import subprocess
import sys
import os

def run(cmd, **kwargs):
    print(f"  >> {' '.join(cmd)}")
    result = subprocess.run(cmd, **kwargs)
    if result.returncode != 0:
        print(f"  [ERROR] Command failed!")
        sys.exit(1)

def main():
    print("\n" + "="*50)
    print("  FOLIXO - Setup")
    print("  By Muhammad Zain Asif")
    print("="*50 + "\n")

    # Create venv
    if not os.path.exists("venv"):
        print("[1/3] Creating virtual environment...")
        run([sys.executable, "-m", "venv", "venv"])
        print("  Done!\n")
    else:
        print("[1/3] Virtual environment already exists.\n")

    # Determine pip path
    if os.name == "nt":  # Windows
        pip = os.path.join("venv", "Scripts", "pip.exe")
        python = os.path.join("venv", "Scripts", "python.exe")
    else:  # Linux/Mac (PythonAnywhere)
        pip = os.path.join("venv", "bin", "pip")
        python = os.path.join("venv", "bin", "python")

    # Install packages
    print("[2/3] Installing packages...")
    run([pip, "install", "--upgrade", "pip", "-q"])
    run([pip, "install", "-r", "requirements.txt", "-q"])
    print("  Done!\n")

    # Create database dir
    os.makedirs("database", exist_ok=True)

    # Create .env if missing
    if not os.path.exists(".env"):
        print("[3/3] Creating .env file...")
        with open(".env", "w") as f:
            f.write("SECRET_KEY=folixo-secret-change-this-in-production\n")
            f.write("GEMINI_API_KEY=your_gemini_api_key_here\n")
            f.write("ADMIN_EMAIL=admin@folixo.com\n")
            f.write("FLASK_ENV=development\n")
            f.write("FLASK_DEBUG=1\n")
        print("  .env created!\n")
    else:
        print("[3/3] .env file already exists.\n")

    print("="*50)
    print("  SETUP COMPLETE!")
    print("")
    print("  Next steps:")
    print("  1. Open .env and add your GEMINI_API_KEY")
    print("     Get free key: https://aistudio.google.com")
    print("")
    print("  2. In VS Code:")
    print("     Ctrl+Shift+P -> Python: Select Interpreter")
    print("     Choose: ./venv/Scripts/python.exe")
    print("")
    print("  3. Press F5 to run!")
    print("     OR in terminal: python run.py")
    print("")
    print("  Site:  http://127.0.0.1:5000")
    print("  Admin: http://127.0.0.1:5000/admin/login")
    print("  Admin Email: admin@folixo.com")
    print("  Admin Pass:  Admin@Folixo2024!")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
