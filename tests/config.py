import os

# Base configuration for Selenium tests
BASE_URL = "http://localhost:5173"  # Frontend URL
API_URL = "http://localhost:5000"   # Backend URL

# Test user credentials
TEST_USERNAME = os.environ.get("TEST_USERNAME", "testuser")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "Password123")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "test@example.com")

# Browser configuration
HEADLESS = False  # Set to True to run without browser window
TIMEOUT = 10      # Default wait timeout in seconds
