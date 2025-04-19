from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
import os


app = FastAPI()
# CORS middleware setup to allow frontend (localhost:5500) to access the backend (localhost:8000)
origins = [
    "http://127.0.0.1:5500",  # Allow requests from frontend
    "http://localhost:5500",   # In case you're running on localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Azure Custom Vision Prediction API details

# iterartion 4
load_dotenv()

# Access environment variables
PREDICTION_URL = os.getenv("PREDICTION_URL")
PREDICTION_KEY = os.getenv("PREDICTION_KEY")

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """
    Endpoint to predict objects in an uploaded image file.
    """
    try:
        # Read the image file
        image_data = await file.read()
        
        # Prepare headers
        headers = {
            "Prediction-Key": PREDICTION_KEY,
            "Content-Type": "application/octet-stream",
        }
        
        # Send the image to the Azure Prediction API
        async with httpx.AsyncClient() as client:
            response = await client.post(PREDICTION_URL, headers=headers, content=image_data)
        
        # Return the response from Azure
        return response.json()

    except Exception as e:
        return {"error": str(e)}
