import os
import json

def get_secret(key):
    # Pulls from the .env vault we just built
    return os.environ.get(key, "NOT_FOUND")

if __name__ == "__main__":
    print(f"OPR-VAULT-001 ACTIVE. Key status: {len(os.environ)} variables loaded.")
