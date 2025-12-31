import sys
from pathlib import Path

# Add the project root to sys.path to resolve absolute imports from 'src'
# This fixes the ModuleNotFoundError when running scripts directly or through IDEs
project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.cli.main import app

if __name__ == "__main__":
    app()
