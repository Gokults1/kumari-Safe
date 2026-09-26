from fastapi import APIRouter
from app.schemas import WeatherAdvisoryResponse
from app.services.weather_service import evaluate_weather_context

router = APIRouter(
    prefix="/weather",
    tags=["weather"]
)

@router.get("/current", response_model=WeatherAdvisoryResponse)
async def get_current_weather(lat: float, lon: float):
    """
    Get current weather context and advisory for a specific location.
    """
    return await evaluate_weather_context(lat, lon)
