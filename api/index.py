import os
import sys

# Add the backend directory to sys.path so Django can find the 'edulink_backend' module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the WSGI application
from edulink_backend.wsgi import application as app
