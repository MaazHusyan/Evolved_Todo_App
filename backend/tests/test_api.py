import requests
import json

# Test the API endpoint
url = "http://localhost:8000/api/v1/auth/register"

# Define the payload
payload = {
    "email": "newuser2@example.com",
    "username": "newuser2",
    "password": "Test123"
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")