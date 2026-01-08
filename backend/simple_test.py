import requests
import json

# Login first to get token
login_response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    headers={"Content-Type": "application/json"},
    json={"email": "newuser2@example.com", "password": "Test123"}
)

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    print("✓ Login successful")

    # Create a todo
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    todo_data = {
        "title": "Test Todo from CLI",
        "description": "This is a test todo created via API"
    }

    create_response = requests.post(
        "http://localhost:8000/api/v1/todos",
        headers=headers,
        json=todo_data
    )

    print(f"Create Todo Status: {create_response.status_code}")
    if create_response.status_code == 200:
        print("✓ Todo created successfully!")
        print(f"Response: {create_response.text}")
    else:
        print(f"✗ Failed to create todo: {create_response.text}")

    # Get todos
    get_response = requests.get(
        "http://localhost:8000/api/v1/todos",
        headers=headers
    )

    print(f"Get Todos Status: {get_response.status_code}")
    if get_response.status_code == 200:
        print("✓ Todos retrieved successfully!")
        print(f"Response: {get_response.text}")
    else:
        print(f"✗ Failed to get todos: {get_response.text}")
else:
    print(f"✗ Login failed: {login_response.status_code} - {login_response.text}")