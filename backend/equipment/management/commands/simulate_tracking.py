import random
import time
from django.core.management.base import BaseCommand
from django.utils import timezone
from equipment.models import Equipment, EquipmentTracking

class Command(BaseCommand):
    help = 'Simule le mouvement en temps réel des camions/trains pour démonstration'

    def add_arguments(self, parser):
        parser.add_argument('--iterations', type=int, default=10, help='Nombre de mouvements à simuler')
        parser.add_argument('--delay', type=int, default=2, help='Délai en secondes entre chaque mouvement')

    def handle(self, *args, **options):
        trucks = Equipment.objects.filter(equipment_type__in=['TRUCK', 'TRAIN'])
        if not trucks.exists():
            self.stdout.write(self.style.WARNING("Aucun camion ou train trouvé pour le tracking."))
            return

        iterations = options['iterations']
        delay = options['delay']

        self.stdout.write(self.style.SUCCESS(f"Démarrage de la simulation pour {trucks.count()} véhicules..."))
        
        try:
            for i in range(iterations):
                self.stdout.write(f"\n--- Itération {i+1}/{iterations} ---")
                for truck in trucks:
                    # Récupérer coordonnées actuelles
                    base_lat = truck.last_latitude or 10.8
                    base_lon = truck.last_longitude or -11.0
                    
                    # Simuler un petit déplacement
                    new_lat = float(base_lat) + random.uniform(-0.002, 0.002)
                    new_lon = float(base_lon) + random.uniform(-0.002, 0.002)
                    speed = random.uniform(25.0, 55.0)

                    # Mise à jour
                    truck.last_latitude = new_lat
                    truck.last_longitude = new_lon
                    truck.current_speed = speed
                    truck.last_position_update = timezone.now()
                    truck.save()

                    # Historique
                    EquipmentTracking.objects.create(
                        equipment=truck,
                        latitude=new_lat,
                        longitude=new_lon,
                        speed=speed
                    )
                    self.stdout.write(f"  [{truck.equipment_code}] Position: ({new_lat:.4f}, {new_lon:.4f}) | Vitesse: {speed:.1f} km/h")
                
                if i < iterations - 1:
                    time.sleep(delay)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\nSimulation interrompue par l'utilisateur."))

        self.stdout.write(self.style.SUCCESS("Simulation terminée."))
