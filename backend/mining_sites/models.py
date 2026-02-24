from django.db import models


class MiningSite(models.Model):
    """
    Entité SITE_MINIER - Représente un site minier
    Conforme au cahier des charges NexusMine
    """
    
    class SiteType(models.TextChoices):
        OPEN_PIT = 'OPEN_PIT', 'Ciel ouvert'
        UNDERGROUND = 'UNDERGROUND', 'Souterrain'
        ALLUVIAL = 'ALLUVIAL', 'Alluvionnaire'
        MIXED = 'MIXED', 'Mixte'
    
    class SiteStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'En exploitation'
        SUSPENDED = 'SUSPENDED', 'Suspendu'
        CLOSED = 'CLOSED', 'Fermé'
        EXPLORATION = 'EXPLORATION', 'En exploration'
    
    class MineralType(models.TextChoices):
        BAUXITE = 'BAUXITE', 'Bauxite'
        IRON = 'IRON', 'Fer'
        GOLD = 'GOLD', 'Or'
        DIAMOND = 'DIAMOND', 'Diamant'
        MANGANESE = 'MANGANESE', 'Manganèse'
        URANIUM = 'URANIUM', 'Uranium'
        OTHER = 'OTHER', 'Autre'
    
    # Informations de base
    name = models.CharField(max_length=200, verbose_name="Nom du site")
    code = models.CharField(
        max_length=50, unique=True,
        null=True, blank=True,
        verbose_name="Code du site"
    )
    
    # Type de minerai (REF-01)
    mineral_type = models.CharField(
        max_length=20,
        choices=MineralType.choices,
        default=MineralType.BAUXITE,
        verbose_name="Type de minerai"
    )
    
    # Localisation administrative (REF-01)
    region = models.CharField(
        max_length=100, null=True, blank=True,
        verbose_name="Région administrative"
    )
    prefecture = models.CharField(
        max_length=100, null=True, blank=True,
        verbose_name="Préfecture"
    )
    location = models.CharField(max_length=500, verbose_name="Localisation détaillée")
    
    # Coordonnées GPS
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        verbose_name="Longitude"
    )
    
    # Polygone de la concession au format GeoJSON (REF-01)
    concession_geojson = models.JSONField(
        null=True, blank=True,
        verbose_name="Polygone de concession (GeoJSON)",
        help_text="Définit les limites géographiques de la concession minière"
    )
    
    # Superficie de la concession
    surface_area = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Superficie (hectares)"
    )
    
    site_type = models.CharField(
        max_length=20,
        choices=SiteType.choices,
        default=SiteType.OPEN_PIT,
        verbose_name="Type de site"
    )
    status = models.CharField(
        max_length=20,
        choices=SiteStatus.choices,
        default=SiteStatus.ACTIVE,
        verbose_name="Statut"
    )
    
    # Informations opérateur
    operator_name = models.CharField(
        max_length=200, blank=True,
        verbose_name="Nom de l'opérateur",
        help_text="Ex: CBG, GAC, SMB, etc."
    )
    
    description = models.TextField(blank=True, verbose_name="Description")
    
    # Données Géologiques (SIG MG)
    geological_reserve = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        verbose_name="Réserve géologique estimée (tonnes)"
    )
    geology_risk_index = models.IntegerField(
        default=0, verbose_name="Index de risque géologique (0-100)",
        help_text="Calculé par l'IA basée sur les sols et l'humidité"
    )
    
    # Date d'obtention de la licence
    license_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date d'obtention de la licence"
    )
    license_expiry = models.DateField(
        null=True, blank=True,
        verbose_name="Date d'expiration de la licence"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Site minier"
        verbose_name_plural = "Sites miniers"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name} ({self.get_mineral_type_display()})"
    
    def is_point_in_concession(self, lat, lon):
        """
        Vérifie si un point GPS (lat, lon) est à l'intérieur du polygone de concession.
        Implémentation de l'algorithme de Ray Casting (Point in Polygon).
        """
        if not self.concession_geojson:
            return True

        try:
            # Conversion en flottants pour la précision
            lat = float(lat)
            lon = float(lon)
            
            geojson = self.concession_geojson
            geom_type = geojson.get('type')
            coords = geojson.get('coordinates', [])

            if geom_type == 'Polygon':
                # Un polygone GeoJSON est une liste de "rings", le 1er est l'extérieur
                return self._ray_casting(lat, lon, coords[0])
            
            elif geom_type == 'MultiPolygon':
                # Un MultiPolygon est une liste de Polygones
                for polygon_coords in coords:
                    if self._ray_casting(lat, lon, polygon_coords[0]):
                        return True
                return False
            
            return True # Type non supporté, on autorise par défaut
        except (ValueError, TypeError, IndexError, KeyError):
            return True # Erreur de format, on ne bloque pas l'utilisateur

    def _ray_casting(self, lat, lon, ring):
        """Algorithme de Ray Casting : compte les intersections avec les segments du polygone"""
        n = len(ring)
        inside = False
        
        # En GeoJSON, les points sont [longitude, latitude]
        p1x, p1y = ring[0]
        for i in range(1, n + 1):
            p2x, p2y = ring[i % n]
            
            # Vérifie si le rayon horizontal depuis (lon, lat) intersecte le segment [p1, p2]
            if lat > min(p1y, p2y):
                if lat <= max(p1y, p2y):
                    if lon <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (lat - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or lon <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
            
        return inside


class DistributedNode(models.Model):
    """
    Représente un nœud d'intelligence locale (Edge Node) sur un site minier.
    Composant de l'architecture distribuée.
    """
    site = models.OneToOneField(
        MiningSite, on_delete=models.CASCADE, 
        related_name='distributed_node',
        verbose_name="Site rattaché"
    )
    node_id = models.CharField(max_length=100, unique=True, verbose_name="Identifiant du nœud")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Adresse IP locale")
    status = models.CharField(
        max_length=20,
        choices=[('ONLINE', 'En ligne'), ('OFFLINE', 'Hors ligne'), ('SYNCING', 'Synchronisation')],
        default='OFFLINE'
    )
    last_sync = models.DateTimeField(null=True, blank=True, verbose_name="Dernière synchronisation")
    cpu_usage = models.FloatField(default=0.0, verbose_name="Utilisation CPU (%)")
    memory_usage = models.FloatField(default=0.0, verbose_name="Utilisation RAM (%)")
    ai_model_version = models.CharField(max_length=50, default="v1.0-alpha")

    def __str__(self):
        return f"Node {self.node_id} ({self.site.name})"

    class Meta:
        verbose_name = "Nœud Distribué"
        verbose_name_plural = "Nœuds Distribués"
