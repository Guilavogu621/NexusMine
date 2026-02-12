from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class EnvironmentalThreshold(models.Model):
    """
    Seuils d'alerte pour les mesures environnementales (HSE-02)
    Permet de définir des limites réglementaires ou internes
    """
    
    class DataType(models.TextChoices):
        AIR_QUALITY = 'AIR_QUALITY', 'Qualité de l\'air'
        WATER_QUALITY = 'WATER_QUALITY', 'Qualité de l\'eau'
        NOISE_LEVEL = 'NOISE_LEVEL', 'Niveau sonore'
        DUST_LEVEL = 'DUST_LEVEL', 'Niveau de poussière'
        PH_LEVEL = 'PH_LEVEL', 'Niveau pH'
        TEMPERATURE = 'TEMPERATURE', 'Température'
        HUMIDITY = 'HUMIDITY', 'Humidité'
        CO2_LEVEL = 'CO2_LEVEL', 'Niveau CO2'
        PARTICULATE_MATTER = 'PARTICULATE_MATTER', 'Particules fines'
        OTHER = 'OTHER', 'Autre'
    
    class ThresholdType(models.TextChoices):
        REGULATORY = 'REGULATORY', 'Réglementaire'
        INTERNAL = 'INTERNAL', 'Interne'
        WARNING = 'WARNING', 'Avertissement'
    
    name = models.CharField(
        max_length=200,
        verbose_name="Nom du seuil"
    )
    data_type = models.CharField(
        max_length=20,
        choices=DataType.choices,
        verbose_name="Type de mesure"
    )
    threshold_type = models.CharField(
        max_length=20,
        choices=ThresholdType.choices,
        default=ThresholdType.INTERNAL,
        verbose_name="Type de seuil"
    )
    
    # Site spécifique ou global
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='environmental_thresholds',
        verbose_name="Site (vide = global)"
    )
    
    # Valeurs seuils
    min_value = models.DecimalField(
        max_digits=10, decimal_places=4,
        null=True, blank=True,
        verbose_name="Valeur minimale acceptable"
    )
    max_value = models.DecimalField(
        max_digits=10, decimal_places=4,
        null=True, blank=True,
        verbose_name="Valeur maximale acceptable"
    )
    warning_min = models.DecimalField(
        max_digits=10, decimal_places=4,
        null=True, blank=True,
        verbose_name="Seuil d'avertissement min"
    )
    warning_max = models.DecimalField(
        max_digits=10, decimal_places=4,
        null=True, blank=True,
        verbose_name="Seuil d'avertissement max"
    )
    
    unit = models.CharField(
        max_length=20,
        verbose_name="Unité de mesure"
    )
    
    # Référence réglementaire
    regulatory_reference = models.CharField(
        max_length=255, blank=True,
        verbose_name="Référence réglementaire",
        help_text="Ex: Code minier Art. 45, Norme ISO..."
    )
    
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Seuil environnemental"
        verbose_name_plural = "Seuils environnementaux"
        ordering = ['data_type', 'name']
    
    def __str__(self):
        site_str = f" ({self.site.name})" if self.site else " (Global)"
        return f"{self.name} - {self.get_data_type_display()}{site_str}"
    
    def check_value(self, value):
        """
        Vérifie si une valeur dépasse les seuils
        Retourne: (is_alert, severity, message)
        """
        if self.max_value and value > self.max_value:
            return (True, 'CRITICAL', f"Valeur {value} dépasse le maximum {self.max_value} {self.unit}")
        if self.min_value and value < self.min_value:
            return (True, 'CRITICAL', f"Valeur {value} en dessous du minimum {self.min_value} {self.unit}")
        if self.warning_max and value > self.warning_max:
            return (True, 'HIGH', f"Valeur {value} approche du seuil max {self.max_value} {self.unit}")
        if self.warning_min and value < self.warning_min:
            return (True, 'HIGH', f"Valeur {value} approche du seuil min {self.min_value} {self.unit}")
        return (False, None, None)


class EnvironmentalData(models.Model):
    """
    Entité DONNEE_ENVIRONNEMENTALE - Mesures environnementales
    Conforme au cahier des charges NexusMine (HSE-02)
    """
    
    class DataType(models.TextChoices):
        AIR_QUALITY = 'AIR_QUALITY', 'Qualité de l\'air'
        WATER_QUALITY = 'WATER_QUALITY', 'Qualité de l\'eau'
        NOISE_LEVEL = 'NOISE_LEVEL', 'Niveau sonore'
        DUST_LEVEL = 'DUST_LEVEL', 'Niveau de poussière'
        PH_LEVEL = 'PH_LEVEL', 'Niveau pH'
        TEMPERATURE = 'TEMPERATURE', 'Température'
        HUMIDITY = 'HUMIDITY', 'Humidité'
        CO2_LEVEL = 'CO2_LEVEL', 'Niveau CO2'
        PARTICULATE_MATTER = 'PARTICULATE_MATTER', 'Particules fines'
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
    
    # Localisation GPS
    gps_latitude = models.DecimalField(
        max_digits=10, decimal_places=7,
        null=True, blank=True,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name="Latitude GPS"
    )
    gps_longitude = models.DecimalField(
        max_digits=10, decimal_places=7,
        null=True, blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name="Longitude GPS"
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
    
    # Lien avec le seuil applicable
    threshold = models.ForeignKey(
        EnvironmentalThreshold,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='measurements',
        verbose_name="Seuil de référence"
    )
    
    # Statut de conformité
    is_compliant = models.BooleanField(
        default=True,
        verbose_name="Conforme aux seuils"
    )
    alert_generated = models.BooleanField(
        default=False,
        verbose_name="Alerte générée"
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
    
    def save(self, *args, **kwargs):
        # Vérifier les seuils et générer alerte si nécessaire
        self.check_thresholds()
        super().save(*args, **kwargs)
    
    def check_thresholds(self):
        """Vérifie les seuils et génère une alerte si nécessaire"""
        from alerts.models import Alert
        
        # Trouver le seuil applicable
        threshold = self.threshold
        if not threshold:
            # Chercher un seuil site-spécifique ou global
            threshold = EnvironmentalThreshold.objects.filter(
                data_type=self.data_type,
                is_active=True
            ).filter(
                models.Q(site=self.site) | models.Q(site__isnull=True)
            ).order_by('-site').first()
        
        if threshold:
            is_alert, severity, message = threshold.check_value(self.value)
            self.is_compliant = not is_alert
            
            if is_alert and not self.alert_generated:
                # Créer une alerte
                Alert.objects.create(
                    alert_type='ENVIRONMENTAL',
                    severity=severity,
                    site=self.site,
                    title=f"Alerte {threshold.get_data_type_display()}",
                    message=message,
                    related_environmental_data=self
                )
                self.alert_generated = True


class EnvironmentalReport(models.Model):
    """
    Rapport environnemental périodique (HSE-02)
    """
    class ReportPeriod(models.TextChoices):
        DAILY = 'DAILY', 'Quotidien'
        WEEKLY = 'WEEKLY', 'Hebdomadaire'
        MONTHLY = 'MONTHLY', 'Mensuel'
        QUARTERLY = 'QUARTERLY', 'Trimestriel'
        ANNUAL = 'ANNUAL', 'Annuel'
    
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='environmental_reports',
        verbose_name="Site"
    )
    report_period = models.CharField(
        max_length=20,
        choices=ReportPeriod.choices,
        default=ReportPeriod.MONTHLY,
        verbose_name="Période"
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    
    # Statistiques agrégées
    total_measurements = models.PositiveIntegerField(
        default=0,
        verbose_name="Total des mesures"
    )
    compliant_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Mesures conformes"
    )
    non_compliant_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Mesures non conformes"
    )
    
    summary = models.TextField(
        blank=True,
        verbose_name="Résumé"
    )
    recommendations = models.TextField(
        blank=True,
        verbose_name="Recommandations"
    )
    
    report_file = models.FileField(
        upload_to='environmental_reports/',
        null=True, blank=True,
        verbose_name="Fichier du rapport"
    )
    
    generated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='generated_environmental_reports',
        verbose_name="Généré par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Rapport environnemental"
        verbose_name_plural = "Rapports environnementaux"
        ordering = ['-end_date']
    
    def __str__(self):
        return f"{self.site.name} - {self.get_report_period_display()} ({self.start_date} - {self.end_date})"
