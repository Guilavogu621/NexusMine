import os
import django
import random
from datetime import date, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus_backend.settings')
django.setup()

from stock.models import StockLocation, StockMovement
from mining_sites.models import MiningSite
from accounts.models import User

def populate():
    print("Populating stock data...")
    
    # Get a site
    site = MiningSite.objects.first()
    if not site:
        print("No MiningSite found. Please create one first.")
        return
    
    # Get a user
    user = User.objects.first()
    
    # 1. Create 5 Stock Locations
    locations_data = [
        {"code": "PIT-001", "name": "Fosse Boke Nord", "type": StockLocation.LocationType.PIT, "cap": 50000},
        {"code": "STK-01", "name": "Stockpile Principal", "type": StockLocation.LocationType.STOCKPILE, "cap": 100000},
        {"code": "WH-02", "name": "Entrepôt Maintenance", "type": StockLocation.LocationType.WAREHOUSE, "cap": 5000},
        {"code": "LZ-01", "name": "Zone de Chargement Conakry", "type": StockLocation.LocationType.LOADING_ZONE, "cap": 25000},
        {"code": "PORT-KAMSAR", "name": "Terminal Portuaire Kamsar", "type": StockLocation.LocationType.PORT, "cap": 500000},
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
                "description": f"Emplacement créé automatiquement pour {loc['name']}"
            }
        )
        locations.append(obj)
        if created:
            print(f"Created location: {obj.code}")
        else:
            print(f"Location {obj.code} already exists")

    # 2. Create 5 Stock Movements
    movements_data = [
        {
            "code": "MOV-EXT-001",
            "type": StockMovement.MovementType.EXTRACTION,
            "loc": locations[0],
            "mineral": StockMovement.MineralType.BAUXITE,
            "qty": 1250.50,
            "grade": 45.5,
            "note": "Extraction journalière standard"
        },
        {
            "code": "MOV-INIT-001",
            "type": StockMovement.MovementType.INITIAL,
            "loc": locations[1],
            "mineral": StockMovement.MineralType.BAUXITE,
            "qty": 15000.00,
            "grade": 42.0,
            "note": "Stock initial pour ouverture"
        },
        {
            "code": "MOV-TRANS-001",
            "type": StockMovement.MovementType.TRANSFER_OUT,
            "loc": locations[1],
            "dest": locations[3],
            "mineral": StockMovement.MineralType.BAUXITE,
            "qty": 500.00,
            "grade": 42.0,
            "note": "Transfert vers zone de chargement"
        },
        {
            "code": "MOV-EXP-001",
            "type": StockMovement.MovementType.EXPEDITION,
            "loc": locations[4],
            "mineral": StockMovement.MineralType.BAUXITE,
            "qty": 4500.00,
            "grade": 44.5,
            "note": "Expédition vers client international",
            "dest_str": "Port de Rotterdam",
            "ref": "SHIP-2024-001"
        },
        {
            "code": "MOV-LOSS-001",
            "type": StockMovement.MovementType.LOSS,
            "loc": locations[2],
            "mineral": StockMovement.MineralType.BAUXITE,
            "qty": 5.25,
            "grade": 40.0,
            "note": "Perte lors du déchargement"
        },
    ]

    for mov in movements_data:
        # Check if exists
        if StockMovement.objects.filter(movement_code=mov["code"]).exists():
            print(f"Movement {mov['code']} already exists")
            continue
            
        obj = StockMovement.objects.create(
            movement_code=mov["code"],
            movement_type=mov["type"],
            location=mov["loc"],
            destination_location=mov.get("dest"),
            mineral_type=mov["mineral"],
            quantity=Decimal(str(mov["qty"])),
            grade=Decimal(str(mov.get("grade", 0))),
            date=date.today() - timedelta(days=random.randint(0, 5)),
            notes=mov["note"],
            destination=mov.get("dest_str", ""),
            transport_reference=mov.get("ref", ""),
            created_by=user
        )
        print(f"Created movement: {obj.movement_code} ({obj.get_movement_type_display()})")

if __name__ == "__main__":
    populate()
