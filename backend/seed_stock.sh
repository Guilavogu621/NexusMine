#!/bin/bash

# Check if .venv exists
if [ -d ".venv" ]; then
    echo "Activating virtual environment..."
    source .venv/bin/activate
else
    echo "Virtual environment not found, trying with global python..."
fi

echo "Running stock data population script..."

python3 manage.py shell << 'PYEOF'
import os
import django
import random
from datetime import date, timedelta
from decimal import Decimal

# Import Models
from stock.models import StockLocation, StockMovement
from mining_sites.models import MiningSite
from accounts.models import User

def populate():
    # Get a site
    site = MiningSite.objects.first()
    if not site:
        print("Error: No MiningSite found. Please create one site first.")
        return
    
    # Get a user (optional)
    user = User.objects.first()
    
    # 1. Create Stock Locations
    locations_data = [
        {"code": "PIT-A1", "name": "Fosse Principale A1", "type": "PIT", "cap": 100000},
        {"code": "STK-W1", "name": "Terril Ouest 1", "type": "STOCKPILE", "cap": 250000},
        {"code": "WARE-01", "name": "Hangar de Stockage Or", "type": "WAREHOUSE", "cap": 1000},
        {"code": "LZ-MAIN", "name": "Zone de Chargement Centrale", "type": "LOADING_ZONE", "cap": 50000},
        {"code": "PORT-KAMSAR", "name": "Terminal Mine de Boke", "type": "PORT", "cap": 1000000},
    ]
    
    locations = []
    for loc in locations_data:
        obj, created = StockLocation.objects.get_or_create(
            code=loc["code"],
            defaults={
                "name": loc["name"],
                "site": site,
                "location_type": loc["type"],
                "capacity": Decimal(str(loc["cap"])),
                "description": f"Zone de stockage automatique pour {loc['name']}"
            }
        )
        locations.append(obj)
        if created:
            print(f"Location created: {obj.code}")
        else:
            print(f"Location already exists: {obj.code}")

    # 2. Create Stock Movements
    movements_data = [
        {
            "code": "MOV-001",
            "type": "EXTRACTION",
            "loc": locations[0],
            "mineral": "BAUXITE",
            "qty": 2500.50,
            "grade": 45.2,
            "note": "Extraction quotidienne mine nord"
        },
        {
            "code": "MOV-002",
            "type": "INITIAL",
            "loc": locations[1],
            "mineral": "BAUXITE",
            "qty": 50000.00,
            "grade": 41.5,
            "note": "Inventaire initial au lancement"
        },
        {
            "code": "MOV-003",
            "type": "TRANSFER_OUT",
            "loc": locations[1],
            "dest": locations[3],
            "mineral": "BAUXITE",
            "qty": 1200.00,
            "grade": 41.5,
            "note": "Transfert interne pour préparation export"
        },
        {
            "code": "MOV-004",
            "type": "EXPEDITION",
            "loc": locations[4],
            "mineral": "BAUXITE",
            "qty": 10000.00,
            "grade": 43.8,
            "note": "Expédition Batch #4221",
            "dest_str": "Terminal Shijiazhuang, Chine",
            "ref": "CONV-2024-XP-03"
        },
        {
            "code": "MOV-005",
            "type": "LOSS",
            "loc": locations[0],
            "mineral": "BAUXITE",
            "qty": 15.75,
            "grade": 40.0,
            "note": "Pertes lors de l'acheminement primaire"
        },
    ]

    for mov in movements_data:
        if not StockMovement.objects.filter(movement_code=mov["code"]).exists():
            obj = StockMovement.objects.create(
                movement_code=mov["code"],
                movement_type=mov["type"],
                location=mov["loc"],
                destination_location=mov.get("dest"),
                mineral_type=mov["mineral"],
                quantity=Decimal(str(mov["qty"])),
                grade=Decimal(str(mov.get("grade", 0))),
                date=date.today() - timedelta(days=random.randint(0, 10)),
                notes=mov["note"],
                destination=mov.get("dest_str", ""),
                transport_reference=mov.get("ref", ""),
                created_by=user
            )
            print(f"Movement created: {obj.movement_code} ({obj.movement_type})")
        else:
            print(f"Movement already exists: {mov['code']}")

populate()
PYEOF

echo "Done!"
