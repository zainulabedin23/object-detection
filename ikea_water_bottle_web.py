from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import requests
import os
import time
import urllib.parse
from datetime import datetime

def setup_driver():
    """Setup Chrome driver with necessary options"""
    options = webdriver.ChromeOptions()
    
    # Add flags to handle SwiftShader deprecation
    options.add_argument('--enable-unsafe-swiftshader')
    options.add_argument('--disable-software-rasterizer')
    
    # Other necessary options
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    # Additional stability options
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-notifications')
    options.add_argument('--remote-debugging-port=9222')
    
    return webdriver.Chrome(options=options)

def create_folder():
    """Create a folder for saving images"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    folder_name = f'ikea_water_bottles_{timestamp}'
    os.makedirs(folder_name, exist_ok=True)
    return folder_name

def download_image(url, folder_path, index):
    """Download and save image"""
    try:
        clean_url = url.split('?')[0]
        file_extension = os.path.splitext(clean_url)[1]
        if not file_extension:
            file_extension = '.jpg'
        
        filename = f'water_bottle_{index}{file_extension}'
        filepath = os.path.join(folder_path, filename)
        
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f'Successfully downloaded: {filename}')
        return True
    except Exception as e:
        print(f'Error downloading image {url}: {str(e)}')
        return False

def scrape_ikea_images():
    """Main function to scrape IKEA water bottle images"""
    url = 'https://www.ikea.com/in/en/search/?q=bottle'
    folder_path = create_folder()
    driver = None
    
    try:
        print("Starting scraper...")
        driver = setup_driver()
        print("Chrome driver initialized successfully")
        
        driver.get(url)
        print("Navigated to IKEA search page")
        
        # Wait for product grid to load
        wait = WebDriverWait(driver, 20)  # Increased timeout
        print("Waiting for product images to load...")
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'img.plp-image')))
        
        # Implement smooth scrolling with error handling
        print("Starting scroll operation...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        scroll_attempts = 0
        max_scroll_attempts = 10
        
        while scroll_attempts < max_scroll_attempts:
            # Scroll in smaller increments
            current_height = 0
            while current_height < last_height:
                driver.execute_script(f"window.scrollTo(0, {current_height + 300});")
                current_height += 300
                time.sleep(0.5)
            
            time.sleep(2)  # Wait for content to load
            
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
                
            last_height = new_height
            scroll_attempts += 1
        
        # Find all product images
        images = driver.find_elements(By.CSS_SELECTOR, 'img.plp-image')
        print(f'Found {len(images)} images')
        
        # Download each image
        successful_downloads = 0
        for index, img in enumerate(images, 1):
            src = img.get_attribute('src')
            if src:
                if download_image(src, folder_path, index):
                    
                    successful_downloads += 1
                time.sleep(0.5)
        
        print(f'\nScraping completed!')
        print(f'Total images found: {len(images)}')
        print(f'Successfully downloaded: {successful_downloads}')
        print(f'Images saved in folder: {folder_path}')
        
    except Exception as e:
        print(f'An error occurred: {str(e)}')
        
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    scrape_ikea_images()