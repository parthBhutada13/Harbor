from selenium.webdriver.common.by import By
from .base_page import BasePage
from ..config import BASE_URL

class LoginPage(BasePage):
    """Page object for the Login page"""
    
    # Locators
    EMAIL_INPUT = (By.NAME, "email")
    PASSWORD_INPUT = (By.NAME, "password")
    LOGIN_BUTTON = (By.TAG_NAME, "button") # Usually the only button in a simple form

    def load(self):
        self.driver.get(f"{BASE_URL}/login")

    def login(self, email, password):
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
