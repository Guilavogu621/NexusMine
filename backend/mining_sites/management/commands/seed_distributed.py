import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from mining_sites.models import MiningSite, DistributedNode

class Command(BaseCommand):
    help = 'Initialise les données de l\'architecture IA distribuée et SIG MG'

    def handle(self, *args, **options):
        sites = MiningSite.objects.all()
        if not sites.exists():
            self.stdout.write(self.style.WARNING("Aucun site trouvé. Veuillez d'abord créer des sites."))
            return

        for site in sites:
            # Update geological data
            site.geological_reserve = random.uniform(1000000, 50000000)
            site.geology_risk_index = random.randint(10, 85)
            site.save()

            # Create or update distributed node
            node, created = DistributedNode.objects.get_or_create(
                site=site,
                defaults={
                    'node_id': f"NODE-{site.code or site.id}-{random.randint(100, 999)}",
                    'ip_address': f"192.168.1.{random.randint(2, 254)}",
                    'status': 'ONLINE',
                    'cpu_usage': random.uniform(5.0, 45.0),
                    'memory_usage': random.uniform(10.0, 60.0),
                    'last_sync': timezone.now()
                }
            )
            if not created:
                node.status = 'ONLINE'
                node.last_sync = timezone.now()
                node.cpu_usage = random.uniform(5.0, 45.0)
                node.save()
                self.stdout.write(self.style.SUCCESS(f"Node mis à jour pour {site.name}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Node créé pour {site.name}"))
