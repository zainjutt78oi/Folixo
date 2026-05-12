import sys
import os

# Add project to path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.environ.setdefault('FLASK_ENV', 'production')

from run import app as application
