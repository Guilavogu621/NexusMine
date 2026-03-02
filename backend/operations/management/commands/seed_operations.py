import os
import random
from datetime import date, time, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from mining_sites.models import MiningSite
from operations.models import WorkZone, Shift, Operation
from personnel.models import Personnel
from equipment.models import Equipment

class Command(BaseCommand):
    help = 'Seed operations data for testing (WorkZones, Shifts, Operations) across all sites'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Operations Data...")

        sites = MiningSite.objects.all()
        if not sites.exists():
            self.stdout.write("No MiningSites found. Please run seed_stock first.")
            return

        User = get_user_model()
        # Try to find the existing admin Lux Guilavogui
        admin_user = User.objects.filter(email='admin@nexusmine.com').first()
        if not admin_user:
            admin_user = User.objects.filter(is_superuser=True).first()

        if not admin_user:
            self.stdout.write("No admin user found for attribution.")
            return

        for site in sites:
            self.stdout.write(f"--- Seeding Operations for Site: {site.name} ---")

            # 1. Create WorkZones (OPS-01)
            zones = []
            zone_types = [
                ("A1", "Zone d'Extraction Nord"),
                ("B2", "Zone de Forage Est"),
                ("T1", "Zone de Transit"),
            ]
            for code, name in zone_types:
                zone_code = f"WZ-{site.id}-{code}"
                zone, created = WorkZone.objects.get_or_create(
                    code=zone_code,
                    defaults={
                        "name": name,
                        "site": site,
                        "description": f"Zone opérationnelle {name} sur le site {site.name}"
                    }
                )
                zones.append(zone)

            # 2. Ensure Personnel exist (REF-01)
            workers = Personnel.objects.filter(site=site)
            if not workers.exists():
                for i in range(5):
                    Personnel.objects.create(
                        employee_id=f"W-{site.id}-00{i}",
                        first_name=f"Worker_{i}",
                        last_name=f"{site.name[:3].upper()}",
                        position="Opérateur de terrain",
                        role="OPERATOR",
                        site=site,
                        status="ACTIVE",
                        approval_status="APPROVED"
                    )
                workers = Personnel.objects.filter(site=site)

            # 3. Ensure Equipment exist (REF-01)
            machines = Equipment.objects.filter(site=site)
            if not machines.exists():
                for i in range(3):
                    Equipment.objects.create(
                        equipment_code=f"MACH-{site.id}-00{i}",
                        name=f"Engin {site.name} #{i}",
                        equipment_type=random.choice(["TRUCK", "EXCAVATOR", "DRILL"]),
                        status="OPERATIONAL",
                        site=site
                    )
                machines = Equipment.objects.filter(site=site)

            # 4. Create Shift for Today (OPS-01)
            shift, _ = Shift.objects.get_or_create(
                site=site,
                date=date.today(),
                shift_type='DAY',
                defaults={
                    "start_time": time(6, 0),
                    "end_time": time(18, 0),
                    "supervisor": workers.first()
                }
            )

            # 5. Create Operations (OPS-01)
            op_types = [
                ("EXTRACTION", "Extraction Bauxite Fosse A"),
                ("TRANSPORT", "Transfert minerai vers stockage"),
                ("DRILLING", "Forage préparatoire"),
                ("MAINTENANCE", "Entretien hebdomadaire engins")
            ]

            for i, (op_type, desc) in enumerate(op_types):
                op_code = f"OP-{site.id}-{op_type}-{i}"
                if not Operation.objects.filter(operation_code=op_code).exists():
                    status = random.choice(["COMPLETED", "IN_PROGRESS", "PLANNED"])
                    val_status = "APPROVED" if status == "COMPLETED" else "PENDING"
                    
                    op = Operation.objects.create(
                        operation_code=op_code,
                        operation_type=op_type,
                        site=site,
                        work_zone=random.choice(zones),
                        shift=shift,
                        date=date.today() - timedelta(days=random.randint(0, 3)),
                        status=status,
                        validation_status=val_status,
                        description=desc,
                        quantity_extracted=Decimal(f"{random.randint(800, 3500)}.50") if op_type == "EXTRACTION" else None,
                        quantity_transported=Decimal(f"{random.randint(500, 2500)}.00") if op_type == "TRANSPORT" else None,
                        created_by=admin_user
                    )
                    # Assign workers and equipment
                    num_workers = min(workers.count(), 2)
                    op.personnel.add(*workers[:num_workers])
                    num_machines = min(machines.count(), 1)
                    op.equipment.add(*machines[:num_machines])
                    
                    self.stdout.write(f"Created operation: {op_code}")

        self.stdout.write(self.style.SUCCESS("Operations seeding successfully completed."))
