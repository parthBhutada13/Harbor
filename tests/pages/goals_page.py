from selenium.webdriver.common.by import By
from .base_page import BasePage
from ..config import BASE_URL

class GoalsPage(BasePage):
    """Page object for the Goals page"""
    
    # Locators
    ADD_FUNDS_BUTTON = (By.XPATH, "//button[contains(., 'Add Funds')]")
    AMOUNT_INPUT = (By.XPATH, "//input[@placeholder='Amount']")
    CONFIRM_ADD_BUTTON = (By.XPATH, "//button[text()='Add']")
    GOAL_CARD = (By.CLASS_NAME, "bg-card")
    BALANCE_TEXT = (By.XPATH, "//p[contains(@class, 'balance-amount')]") # Assumes balance has a specific class

    def load(self):
        self.driver.get(f"{BASE_URL}/goals")

    def add_funds(self, goal_name, amount):
        # Find the specific goal card by name and click add funds
        goal_xpath = f"//div[contains(@class, 'bg-card')][descendant::p[text()='{goal_name}']]//button[contains(., 'Add Funds')]"
        self.click((By.XPATH, goal_xpath))
        
        # Enter amount and confirm
        self.send_keys(self.AMOUNT_INPUT, str(amount))
        self.click(CONFIRM_ADD_BUTTON)
