from django.db import models


class EnvironmentalData(models.Model):
    """
    Entité DONNEE_ENVIRONNEMENTALE - Mesures environnementales
    """
    
    class DataType(models.TextChoices):
        AIR_QUALITY = 'AIR_QUALITY', 'Qualité de l\'air'
        WATER_QUALITY = 'WATER_QUALITY', 'Qualité de l\'eau'
        NOISE_LEVEL = 'NOISE_LEVEL', 'Niveau sonore'
        DUST_LEVEL = 'DUST_LEVEL', 'Niveau de poussière'
        PH_LEVEL = 'PH_LEVEL', 'Niveau pH'
        TEMPERATURE = 'TEMPERATURE', 'Température'
        HUMIDITY = 'HUMIDITY', 'Humidité'
        OTHER = 'OTHER', 'Autre'
    
    data_type = models.CharField(
        max_length=20,
        choices=DataType.choices,
        default=DataType.OTHER,
        verbose_name="Type de mesure"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='environmental_data',
        verbose_name="Site"
    )
    value = models.DecimalField(
        max_digits=10, decimal_places=4,
        verbose_name="Valeur mesurée"
    )
    unit = models.CharField(
        max_length=20,
        verbose_name="Unité de mesure"
    )
    measurement_date = models.DateField(verbose_name="Date de mesure")
    measurement_time = models.TimeField(
        null=True, blank=True,
        verbose_name="Heure de mesure"
    )
    location_details = models.CharField(
        max_length=200, blank=True,
        verbose_name="Emplacement précis"
    )
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    recorded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='recorded_environmental_data',
        verbose_name="Enregistré par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Donnée environnementale"
        verbose_name_plural = "Données environnementales"
        ordering = ['-measurement_date', '-measurement_time']
    
    def __str__(self):
        return f"{self.get_data_type_display()} - {self.value} {self.unit} ({self.measurement_date})"
