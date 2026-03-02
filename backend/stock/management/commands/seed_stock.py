from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from mining_sites.models import MiningSite
from stock.models import StockLocation, StockMovement
from decimal import Decimal
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Seed stock data for testing (Location and Movements)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Stock Data...")

        # Get first site, or create one if none exist
        site = MiningSite.objects.first()
        if not site:
            site = MiningSite.objects.create(
                name="Boke Mining",
                location="Boke, Guinea",
                description="Site minier principal"
            )
            self.stdout.write(f"Created site: {site.name}")

        # Get admin user
        User = get_user_model()
        user = User.objects.filter(is_superuser=True).first()

        # Create Stock Locations
        locations_data = [
            {"code": "PIT-01", "name": "Fosse Principale", "type": "PIT", "cap": 100000},
            {"code": "STK-W1", "name": "Terril Ouest", "type": "STOCKPILE", "cap": 250000},
            {"code": "WARE-MAIN", "name": "Entrepôt Central", "type": "WAREHOUSE", "cap": 5000},
            {"code": "LZ-01", "name": "Zone de Chargement Boke", "type": "LOADING_ZONE", "cap": 50000},
            {"code": "PORT-KAMSAR", "name": "Terminal Kamsar", "type": "PORT", "cap": 1000000},
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
                    "description": f"Zone {loc['name']} (Générée automatiquement sur Render)"
                }
            )
            locations.append(obj)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Location created: {obj.code}"))
            else:
                self.stdout.write(f"Location already exists: {obj.code}")

        # Create 5 Movements
        movements_data = [
            {
                "code": "MOV-R-01", "type": "EXTRACTION", "loc": locations[0], 
                "mineral": "BAUXITE", "qty": 4500.25, "grade": 45.5, "note": "Production initiale Render"
            },
            {
                "code": "MOV-R-02", "type": "INITIAL", "loc": locations[1], 
                "mineral": "BAUXITE", "qty": 75000.00, "grade": 42.0, "note": "Inventaire reporté"
            },
            {
                "code": "MOV-R-03", "type": "TRANSFER_OUT", "loc": locations[1], "dest": locations[3], 
                "mineral": "BAUXITE", "qty": 2000.00, "grade": 42.0, "note": "Transfert interne Render"
            },
            {
                "code": "MOV-R-04", "type": "EXPEDITION", "loc": locations[4], 
                "mineral": "BAUXITE", "qty": 15000.00, "grade": 44.2, "note": "Export maritime",
                "dest_str": "Terminal Shijiazhuang, Chine", "ref": "RN-SHIP-001"
            },
            {
                "code": "MOV-R-05", "type": "LOSS", "loc": locations[0], 
                "mineral": "BAUXITE", "qty": 25.50, "grade": 40.0, "note": "Pertes logistiques"
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
                    date=date.today() - timedelta(days=random.randint(0, 5)),
                    notes=mov["note"],
                    destination=mov.get("dest_str", ""),
                    transport_reference=mov.get("ref", ""),
                    created_by=user
                )
                self.stdout.write(self.style.SUCCESS(f"Movement created: {obj.movement_code} ({obj.movement_type})"))
            else:
                self.stdout.write(f"Movement already exists: {mov['code']}")

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
