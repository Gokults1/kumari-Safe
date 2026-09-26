from fastapi import FastAPI
from app.config import settings
from app.schemas import HealthCheck
from app.routers import emergency, routing

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.include_router(emergency.router, prefix="/api/v1/emergency", tags=["emergency"])
app.include_router(routing.router, prefix="/api/v1/routing", tags=["routing"])

@app.get("/health", response_model=HealthCheck, tags=["health"])
def health_check():
    return {"status": "ok", "message": "KumariSafe API is running."}
