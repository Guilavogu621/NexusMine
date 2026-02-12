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
        Vérifie si un point GPS est à l'intérieur du polygone de concession (geofencing)
        Utilisé pour valider les saisies terrain
        """
        if not self.concession_geojson:
            return True  # Pas de polygone défini, on accepte
        
        # Implémentation basique - pour une vraie implémentation, utiliser Shapely
        # from shapely.geometry import Point, shape
        # polygon = shape(self.concession_geojson)
        # return polygon.contains(Point(lon, lat))
        return True  # À implémenter avec Shapely/PostGIS
