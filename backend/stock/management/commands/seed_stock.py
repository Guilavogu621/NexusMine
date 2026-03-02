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

        sites = MiningSite.objects.all()
        if not sites.exists():
            site = MiningSite.objects.create(
                name="Boke Mining Corp",
                location="Boke, Guinea",
                description="Site minier principal"
            )
            sites = [site]
            self.stdout.write(f"Created default site: {site.name}")

        # Get admin user
        User = get_user_model()
        user = User.objects.filter(is_superuser=True).first()

        for site in sites:
            self.stdout.write(f"--- Seeding for Site: {site.name} ---")
            
            # Create Stock Locations for THIS site
            locations_data = [
                {"code": f"PIT-{site.id}", "name": f"Fosse {site.name}", "type": "PIT", "cap": 100000},
                {"code": f"STK-{site.id}", "name": f"Stockpile {site.name}", "type": "STOCKPILE", "cap": 250000},
                {"code": f"WARE-{site.id}", "name": f"Hangar {site.name}", "type": "WAREHOUSE", "cap": 5000},
                {"code": f"LZ-{site.id}", "name": f"Loading Zone {site.name}", "type": "LOADING_ZONE", "cap": 50000},
                {"code": f"PORT-{site.id}", "name": f"Port {site.name}", "type": "PORT", "cap": 1000000},
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
                    }
                )
                locations.append(obj)

            # Create Movements
            movements_data = [
                {
                    "code": f"EXT-{site.id}-001", "type": "EXTRACTION", "loc": locations[0], 
                    "mineral": "BAUXITE", "qty": 25000.00, "grade": 46.5, "note": "Extraction initiale"
                },
                {
                    "code": f"TRA-{site.id}-001", "type": "TRANSFER_OUT", "loc": locations[0], "dest": locations[1],
                    "mineral": "BAUXITE", "qty": 15000.00, "grade": 46.5, "note": "Vers Stockpile"
                },
                {
                    "code": f"EXP-{site.id}-001", "type": "EXPEDITION", "loc": locations[4], 
                    "mineral": "BAUXITE", "qty": 8000.00, "grade": 44.0, "note": "Export 1",
                    "dest_str": "Chine", "ref": "RN-001"
                },
            ]

            for mov in movements_data:
                if not StockMovement.objects.filter(movement_code=mov["code"]).exists():
                    StockMovement.objects.create(
                        movement_code=mov["code"],
                        movement_type=mov["type"],
                        location=mov["loc"],
                        destination_location=mov.get("dest"),
                        mineral_type=mov["mineral"],
                        quantity=Decimal(str(mov["qty"])),
                        grade=Decimal(str(mov.get("grade", 0))),
                        date=date.today(),
                        notes=mov["note"],
                        destination=mov.get("dest_str", ""),
                        transport_reference=mov.get("ref", ""),
                        created_by=user
                    )

            # IMPORTANT: Recalculate Summary for this site and BAUXITE
            from stock.models import StockSummary
            summary, _ = StockSummary.objects.get_or_create(site=site, mineral_type='BAUXITE')
            summary.recalculate()
            self.stdout.write(self.style.SUCCESS(f"Recalculated summary for {site.name}"))

        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
