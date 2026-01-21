from django.db import models


class MiningSite(models.Model):
    """
    Entité SITE_MINIER - Représente un site minier
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
    
    name = models.CharField(max_length=200, verbose_name="Nom du site")
    location = models.CharField(max_length=500, verbose_name="Localisation")
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        verbose_name="Longitude"
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
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Site minier"
        verbose_name_plural = "Sites miniers"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_site_type_display()})"
