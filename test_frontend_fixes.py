#!/usr/bin/env python3
"""
Test script to verify frontend fixes for the Todo App
This script simulates the frontend behavior to test the API endpoints
"""

import requests
import json
import time
import subprocess
import signal
import os
from typing import Optional

class TodoAppTester:
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.auth_token: Optional[str] = None
        self.user_id: Optional[str] = None

    def start_backend(self):
        """Start the backend server"""
        print("Starting backend server...")
        self.backend_process = subprocess.Popen([
            "python", "-m", "uvicorn", "backend.src.main:app",
            "--reload", "--port", "8000"
        ], cwd=os.getcwd())

        # Wait for server to start
        time.sleep(3)

    def stop_backend(self):
        """Stop the backend server"""
        if hasattr(self, 'backend_process'):
            self.backend_process.terminate()
            self.backend_process.wait()

    def register_user(self, email: str, username: str, password: str):
        """Test user registration"""
        print(f"\n--- Testing Registration ---")
        print(f"Registering user: {email}")

        url = f"{self.backend_url}/api/register"
        data = {
            "email": email,
            "username": username,
            "password": password
        }

        try:
            response = requests.post(url, json=data)
            print(f"Registration response: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"Registration successful: {result.get('email', 'Unknown')}")
                return True, result
            elif response.status_code == 409:  # Conflict - user already exists
                error_result = response.json()
                print(f"Registration failed (conflict): {error_result.get('detail', 'Unknown error')}")
                return False, error_result
            else:
                error_result = response.json()
                print(f"Registration failed: {response.status_code} - {error_result.get('detail', 'Unknown error')}")
                return False, error_result
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return False, {"error": str(e)}

    def login_user(self, email: str, password: str):
        """Test user login"""
        print(f"\n--- Testing Login ---")
        print(f"Logging in user: {email}")

        url = f"{self.backend_url}/api/login"
        data = {
            "email": email,
            "password": password
        }

        try:
            response = requests.post(url, json=data)
            print(f"Login response: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                self.auth_token = result.get('access_token')
                self.user_id = result.get('user', {}).get('id')
                print(f"Login successful for user: {self.user_id}")
                return True, result
            else:
                error_result = response.json()
                print(f"Login failed: {response.status_code} - {error_result.get('detail', 'Unknown error')}")
                return False, error_result
        except Exception as e:
            print(f"Login error: {str(e)}")
            return False, {"error": str(e)}

    def create_task(self, title: str, description: str = "", priority: str = "medium"):
        """Test task creation"""
        print(f"\n--- Testing Task Creation ---")
        print(f"Creating task: {title}")

        if not self.auth_token:
            print("No auth token available. Please login first.")
            return False, {"error": "Not authenticated"}

        url = f"{self.backend_url}/api/{self.user_id}/tasks"
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        data = {
            "title": title,
            "description": description,
            "priority": priority
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            print(f"Task creation response: {response.status_code}")
            if response.status_code == 201:
                result = response.json()
                print(f"Task created successfully: {result.get('title', 'Unknown')}")
                return True, result
            else:
                error_result = response.json()
                print(f"Task creation failed: {response.status_code} - {error_result.get('detail', 'Unknown error')}")
                return False, error_result
        except Exception as e:
            print(f"Task creation error: {str(e)}")
            return False, {"error": str(e)}

    def test_duplicate_registration(self):
        """Test duplicate registration error handling"""
        print(f"\n--- Testing Duplicate Registration ---")
        # First registration should succeed
        success1, result1 = self.register_user(
            "testduplicate@example.com",
            "testdupuser",
            "TestPass123!"
        )

        if success1:
            print("First registration succeeded as expected")
        else:
            print("First registration failed unexpectedly")
            return False

        # Second registration with same email should fail
        success2, result2 = self.register_user(
            "testduplicate@example.com",  # Same email
            "testdupuser2",
            "TestPass123!"
        )

        if not success2 and result2.get('detail', '').lower().find('already exists') != -1:
            print("Second registration correctly failed with 'already exists' error")
            return True
        else:
            print("Second registration did not fail as expected")
            return False

    def run_tests(self):
        """Run all tests to verify the fixes"""
        print("Starting tests for frontend fixes verification...")

        # Test 1: Duplicate registration error handling
        print("\n=== Test 1: Duplicate Registration Error Handling ===")
        test1_passed = self.test_duplicate_registration()
        print(f"Test 1 Result: {'PASS' if test1_passed else 'FAIL'}")

        # Test 2: Normal registration and login flow
        print("\n=== Test 2: Normal Registration and Login Flow ===")
        reg_success, reg_result = self.register_user(
            "testuser@example.com",
            "testuser123",
            "TestPass123!"
        )

        if not reg_success:
            print("Registration failed, skipping subsequent tests")
            return False

        login_success, login_result = self.login_user("testuser@example.com", "TestPass123!")
        test2_passed = reg_success and login_success
        print(f"Test 2 Result: {'PASS' if test2_passed else 'FAIL'}")

        # Test 3: Task creation
        print("\n=== Test 3: Task Creation ===")
        if test2_passed:
            task_success, task_result = self.create_task("Test Task", "Test Description", "high")
            test3_passed = task_success
            print(f"Test 3 Result: {'PASS' if test3_passed else 'FAIL'}")
        else:
            test3_passed = False
            print("Skipped due to failed login")

        # Overall result
        overall_passed = test1_passed and test2_passed and test3_passed
        print(f"\n=== Overall Test Result: {'PASS' if overall_passed else 'FAIL'} ===")

        if overall_passed:
            print("All tests passed! The frontend fixes are working correctly.")
        else:
            print("Some tests failed. Please check the implementation.")

        return overall_passed

def main():
    tester = TodoAppTester()

    try:
        # Start backend server
        tester.start_backend()

        # Run tests
        success = tester.run_tests()

        # Stop backend server
        tester.stop_backend()

        return success
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
        tester.stop_backend()
        return False
    except Exception as e:
        print(f"Test error: {str(e)}")
        if hasattr(tester, 'stop_backend'):
            tester.stop_backend()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)