import requests
import json

# Test the login API endpoint
url = "http://localhost:8000/api/v1/auth/login"

# Define the payload for login
payload = {
    "email": "newuser2@example.com",
    "password": "Test123"
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Login Status Code: {response.status_code}")
    print(f"Login Response: {response.text}")
except Exception as e:
    print(f"Login Error: {e}")