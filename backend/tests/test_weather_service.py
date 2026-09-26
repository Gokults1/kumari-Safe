import pytest
from unittest.mock import patch
from app.services.weather_service import evaluate_weather_context

class MockResponse:
    def __init__(self, json_data, status_code=200):
        self._json_data = json_data
        self.status_code = status_code

    def json(self):
        return self._json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception("HTTP Error")

@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_heavy_rain_advisory(mock_get):
    mock_get.return_value = MockResponse({
        "current": {
            "temperature_2m": 25.0,
            "precipitation": 10.0,
            "wind_speed_10m": 15.0,
            "weather_code": 65
        }
    })
    
    result = await evaluate_weather_context(8.08, 77.55)
    
    assert result.is_adverse is True
    assert "Heavy rain detected" in result.advisory_message
    assert result.metrics.precipitation_mm == 10.0
    assert result.metrics.condition_text == "Heavy Rain"

@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_extreme_heat_advisory(mock_get):
    mock_get.return_value = MockResponse({
        "current": {
            "temperature_2m": 38.0,
            "precipitation": 0.0,
            "wind_speed_10m": 5.0,
            "weather_code": 0
        }
    })
    
    result = await evaluate_weather_context(8.08, 77.55)
    
    # Heat does not trigger is_adverse based on requirements, just an advisory message
    # "is_adverse = True if rain > 5.0 or wind > 40.0"
    assert result.is_adverse is False
    assert "High temperatures detected" in result.advisory_message
    assert result.metrics.temperature_celsius == 38.0
    assert result.metrics.condition_text == "Clear"

@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_api_failure_fallback(mock_get):
    mock_get.side_effect = Exception("Connection Timeout")
    
    result = await evaluate_weather_context(8.08, 77.55)
    
    assert result.is_adverse is False
    assert "Clear/Moderate" in result.advisory_message
    assert result.metrics.temperature_celsius == 25.0
    assert result.metrics.precipitation_mm == 0.0
    assert "Unavailable" in result.metrics.condition_text
