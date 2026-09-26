import datetime
from sqlalchemy.orm import Session
from app.models import TransitHub, TransitHubType, DataSourceType

# Coordinates are approximate real-world locations in Kanniyakumari district
TRANSIT_HUBS = [
    {
        "name": "Nagercoil Junction Railway Station",
        "hub_type": TransitHubType.RAILWAY_STATION,
        "lat": 8.1691,
        "lon": 77.4265
    },
    {
        "name": "Vadasery Christopher Bus Stand",
        "hub_type": TransitHubType.BUS_TERMINAL,
        "lat": 8.1925,
        "lon": 77.4326
    },
    {
        "name": "Kanyakumari Railway Station",
        "hub_type": TransitHubType.RAILWAY_STATION,
        "lat": 8.0898,
        "lon": 77.5458
    },
    {
        "name": "Kanyakumari Bus Stand",
        "hub_type": TransitHubType.BUS_TERMINAL,
        "lat": 8.0825,
        "lon": 77.5502
    },
    {
        "name": "Thuckalay Bus Stand",
        "hub_type": TransitHubType.BUS_TERMINAL,
        "lat": 8.2435,
        "lon": 77.3195
    },
    {
        "name": "Marthandam Bus Stand",
        "hub_type": TransitHubType.BUS_TERMINAL,
        "lat": 8.3079,
        "lon": 77.2173
    },
    {
        "name": "Eraniel Railway Station",
        "hub_type": TransitHubType.RAILWAY_STATION,
        "lat": 8.2045,
        "lon": 77.3005
    },
    {
        "name": "Kulitturai Railway Station",
        "hub_type": TransitHubType.RAILWAY_STATION,
        "lat": 8.3182,
        "lon": 77.2139
    }
]

def seed_transit_hubs(db: Session):
    print("Seeding Transit Hubs...")
    count = 0
    for hub in TRANSIT_HUBS:
        # Check if already exists
        exists = db.query(TransitHub).filter(TransitHub.name == hub["name"]).first()
        if not exists:
            geom_wkt = f"SRID=4326;POINT({hub['lon']} {hub['lat']})"
            new_hub = TransitHub(
                name=hub["name"],
                hub_type=hub["hub_type"],
                geom=geom_wkt,
                source="Kanniyakumari District Administration",
                source_url="https://kanniyakumari.nic.in/",
                last_verified=datetime.datetime.utcnow(),
                data_type=DataSourceType.OFFICIAL
            )
            db.add(new_hub)
            count += 1
            
    db.commit()
    print(f"Added {count} new transit hubs.")

if __name__ == "__main__":
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_transit_hubs(db)
    finally:
        db.close()
