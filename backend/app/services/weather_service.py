import httpx
from app.schemas import WeatherMetrics, WeatherAdvisoryResponse

WEATHER_CODE_MAPPING = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail"
}

def get_condition_text(code: int) -> str:
    return WEATHER_CODE_MAPPING.get(code, "Unknown Condition")

async def evaluate_weather_context(lat: float, lon: float) -> WeatherAdvisoryResponse:
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            current = data.get("current", {})
            
            temp = float(current.get("temperature_2m", 25.0))
            precip = float(current.get("precipitation", 0.0))
            wind = float(current.get("wind_speed_10m", 0.0))
            code = int(current.get("weather_code", 0))
            condition = get_condition_text(code)
            
    except Exception:
        # Fallback to pleasant defaults if API is unreachable
        temp = 25.0
        precip = 0.0
        wind = 0.0
        condition = "Data Unavailable (Assumed Moderate)"

    metrics = WeatherMetrics(
        temperature_celsius=temp,
        precipitation_mm=precip,
        wind_speed_kmh=wind,
        condition_text=condition
    )
    
    is_adverse = False
    
    if precip > 5.0:
        advisory_message = "Heavy rain detected. Low-lying coastal roads may experience waterlogging."
        is_adverse = True
    elif temp > 34.0:
        advisory_message = "High temperatures detected. Extended walking routes may be uncomfortable."
    elif wind > 40.0:
        advisory_message = "Strong winds detected. Proceed with caution."
        is_adverse = True
    else:
        advisory_message = "Clear/Moderate weather conditions."

    return WeatherAdvisoryResponse(
        metrics=metrics,
        advisory_message=advisory_message,
        is_adverse=is_adverse
    )
