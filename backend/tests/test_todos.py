import requests
import json

# First, let's login to get a token
login_url = "http://localhost:8000/api/v1/auth/login"
login_payload = {
    "email": "newuser2@example.com",
    "password": "Test123"
}

headers = {
    "Content-Type": "application/json"
}

try:
    # Login to get token
    login_response = requests.post(login_url, headers=headers, json=login_payload)
    login_data = login_response.json()
    access_token = login_data.get("access_token")

    print(f"Login Status Code: {login_response.status_code}")
    print(f"Got access token: {access_token[:20]}..." if access_token else "No token received")

    if access_token:
        # Now test the create todo endpoint
        todo_url = "http://localhost:8000/api/v1/todos"
        todo_payload = {
            "title": "Test Todo",
            "description": "This is a test todo item"
        }
        auth_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        todo_response = requests.post(todo_url, headers=auth_headers, json=todo_payload)
        print(f"\nCreate Todo Status Code: {todo_response.status_code}")
        print(f"Create Todo Response: {todo_response.text}")

        # Now test the get todos endpoint
        get_todos_response = requests.get(todo_url, headers=auth_headers)
        print(f"\nGet Todos Status Code: {get_todos_response.status_code}")
        print(f"Get Todos Response: {get_todos_response.text}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()