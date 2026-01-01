import os
from pathlib import Path
print(f"CWD: {os.getcwd()}")
print(f"Skills dir exists: {Path('skills').exists()}")
print(f"Sample file exists: {Path('skills/INFORMATION_SUMMARY.txt').exists()}")
