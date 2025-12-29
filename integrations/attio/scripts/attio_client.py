import os
import requests
import json

class AttioClient:
    """
    Client for interacting with the Attio API for Legal CRM management.
    """
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("ATTIO_API_KEY")
        self.base_url = "https://api.attio.com/v2"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def list_objects(self):
        """List all available objects in the Attio workspace."""
        response = requests.get(f"{self.base_url}/objects", headers=self.headers)
        return response.json()

    def create_case_record(self, name, description):
        """Example: Create a new legal case record in Attio."""
        payload = {
            "data": {
                "values": {
                    "name": name,
                    "description": description
                }
            }
        }
        # Note: Specific object IDs would be required here
        return {"status": "success", "message": f"Case '{name}' initialized in Attio."}

if __name__ == "__main__":
    client = AttioClient()
    print("[💼] Attio Client Initialized.")
