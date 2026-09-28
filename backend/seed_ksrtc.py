import os
import json
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app.models import Base, TransitSchedule

# Create the new table if it doesn't exist
Base.metadata.create_all(bind=engine)

def seed_ksrtc_buses():
    db = SessionLocal()
    
    # Check if we already have some seeded
    if db.query(TransitSchedule).filter(TransitSchedule.agency == "KSRTC").count() > 0:
        print("KSRTC buses already seeded!")
        # Let's clear them so we can re-seed with stops
        db.query(TransitSchedule).filter(TransitSchedule.agency == "KSRTC").delete()
        db.commit()

    schedules = [
        {
            "route_number": "TRV-FAST-01",
            "agency": "KSRTC",
            "transit_type": "BUS",
            "source_hub_name": "Kanyakumari",
            "dest_hub_name": "Trivandrum Central",
            "departure_time": "06:00 AM",
            "arrival_time": "08:30 AM",
            "frequency_notes": None,
            "stops": json.dumps([
                {"name": "Kanyakumari", "time": "06:00 AM"},
                {"name": "Nagercoil Vadasery", "time": "06:30 AM"},
                {"name": "Thuckalay", "time": "07:00 AM"},
                {"name": "Marthandam", "time": "07:20 AM"},
                {"name": "Kaliyakkavilai", "time": "07:35 AM"},
                {"name": "Neyyattinkara", "time": "08:00 AM"},
                {"name": "Trivandrum Central", "time": "08:30 AM"}
            ])
        },
        {
            "route_number": "TRV-FAST-02",
            "agency": "KSRTC",
            "transit_type": "BUS",
            "source_hub_name": "Kanyakumari",
            "dest_hub_name": "Trivandrum Central",
            "departure_time": "07:30 AM",
            "arrival_time": "10:00 AM",
            "frequency_notes": None,
            "stops": json.dumps([
                {"name": "Kanyakumari", "time": "07:30 AM"},
                {"name": "Nagercoil Vadasery", "time": "08:00 AM"},
                {"name": "Thuckalay", "time": "08:30 AM"},
                {"name": "Marthandam", "time": "08:50 AM"},
                {"name": "Kaliyakkavilai", "time": "09:05 AM"},
                {"name": "Neyyattinkara", "time": "09:30 AM"},
                {"name": "Trivandrum Central", "time": "10:00 AM"}
            ])
        },
        {
            "route_number": "ERN-SF-01",
            "agency": "KSRTC",
            "transit_type": "BUS",
            "source_hub_name": "Kanyakumari",
            "dest_hub_name": "Ernakulam",
            "departure_time": "05:00 PM",
            "arrival_time": "11:30 PM",
            "frequency_notes": "Super Fast",
            "stops": json.dumps([
                {"name": "Kanyakumari", "time": "05:00 PM"},
                {"name": "Nagercoil Vadasery", "time": "05:30 PM"},
                {"name": "Trivandrum Central", "time": "07:30 PM"},
                {"name": "Kollam", "time": "09:00 PM"},
                {"name": "Alappuzha", "time": "10:30 PM"},
                {"name": "Ernakulam", "time": "11:30 PM"}
            ])
        },
        {
            "route_number": "KTR-ORD-01",
            "agency": "KSRTC",
            "transit_type": "BUS",
            "source_hub_name": "Kanyakumari",
            "dest_hub_name": "Kottarakkara",
            "departure_time": "08:15 AM",
            "arrival_time": "01:00 PM",
            "frequency_notes": "Ordinary",
            "stops": json.dumps([
                {"name": "Kanyakumari", "time": "08:15 AM"},
                {"name": "Nagercoil Vadasery", "time": "08:50 AM"},
                {"name": "Marthandam", "time": "09:50 AM"},
                {"name": "Trivandrum Central", "time": "11:00 AM"},
                {"name": "Venjaramoodu", "time": "12:00 PM"},
                {"name": "Kottarakkara", "time": "01:00 PM"}
            ])
        },
        {
            "route_number": "TRV-FREQ",
            "agency": "KSRTC",
            "transit_type": "BUS",
            "source_hub_name": "Kanyakumari",
            "dest_hub_name": "Trivandrum",
            "departure_time": "05:00 AM",
            "arrival_time": "09:00 PM",
            "frequency_notes": "Every 45 mins",
            "stops": json.dumps([
                {"name": "Kanyakumari", "time": "Start"},
                {"name": "Nagercoil", "time": "+30m"},
                {"name": "Marthandam", "time": "+1h 20m"},
                {"name": "Trivandrum", "time": "+2h 30m"}
            ])
        }
    ]

    objects = [TransitSchedule(**data) for data in schedules]
    db.add_all(objects)
    db.commit()
    print(f"Successfully seeded {len(objects)} KSRTC Kerala Govt bus schedules with stops into the database!")
    db.close()

if __name__ == "__main__":
    seed_ksrtc_buses()
