from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Incident(models.Model):
    """
    Entité INCIDENT - Représente un incident sur un site minier
    Conforme au cahier des charges NexusMine (HSE-01)
    """
    
    class IncidentType(models.TextChoices):
        ACCIDENT = 'ACCIDENT', 'Accident corporel'
        NEAR_MISS = 'NEAR_MISS', 'Presqu\'accident'
        EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE', 'Panne équipement'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Incident environnemental'
        SECURITY = 'SECURITY', 'Incident de sécurité'
        LANDSLIDE = 'LANDSLIDE', 'Glissement de terrain'
        FIRE = 'FIRE', 'Incendie'
        EXPLOSION = 'EXPLOSION', 'Explosion'
        CHEMICAL_SPILL = 'CHEMICAL_SPILL', 'Déversement chimique'
        OTHER = 'OTHER', 'Autre'
    
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Faible'
        MEDIUM = 'MEDIUM', 'Moyen'
        HIGH = 'HIGH', 'Élevé'
        CRITICAL = 'CRITICAL', 'Critique'
    
    class IncidentStatus(models.TextChoices):
        REPORTED = 'REPORTED', 'Déclaré'
        INVESTIGATING = 'INVESTIGATING', 'En investigation'
        ACTION_REQUIRED = 'ACTION_REQUIRED', 'Action requise'
        RESOLVED = 'RESOLVED', 'Résolu'
        CLOSED = 'CLOSED', 'Clôturé'
    
    incident_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code incident"
    )
    incident_type = models.CharField(
        max_length=20,
        choices=IncidentType.choices,
        default=IncidentType.OTHER,
        verbose_name="Type d'incident"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='incidents',
        verbose_name="Site"
    )
    
    # Localisation précise (HSE-01)
    location_description = models.CharField(
        max_length=255, blank=True,
        verbose_name="Localisation (description)"
    )
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
    
    date = models.DateField(verbose_name="Date de l'incident")
    time = models.TimeField(
        null=True, blank=True,
        verbose_name="Heure de l'incident"
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.LOW,
        verbose_name="Gravité"
    )
    status = models.CharField(
        max_length=20,
        choices=IncidentStatus.choices,
        default=IncidentStatus.REPORTED,
        verbose_name="Statut"
    )
    description = models.TextField(verbose_name="Description détaillée")
    
    # Causes et impacts (HSE-01)
    root_cause = models.TextField(
        blank=True,
        verbose_name="Cause racine"
    )
    contributing_factors = models.TextField(
        blank=True,
        verbose_name="Facteurs contributifs"
    )
    
    # Impacts
    injuries_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de blessés"
    )
    fatalities_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Nombre de décès"
    )
    lost_work_days = models.PositiveIntegerField(
        default=0,
        verbose_name="Jours de travail perdus"
    )
    estimated_cost = models.DecimalField(
        max_digits=14, decimal_places=2,
        null=True, blank=True,
        verbose_name="Coût estimé (GNF)"
    )
    
    # Actions
    actions_taken = models.TextField(
        blank=True,
        verbose_name="Actions prises"
    )
    corrective_actions = models.TextField(
        blank=True,
        verbose_name="Actions correctives planifiées"
    )
    preventive_measures = models.TextField(
        blank=True,
        verbose_name="Mesures préventives"
    )
    
    # Photo principale
    photo = models.ImageField(
        upload_to='incidents_photos/',
        null=True, blank=True,
        verbose_name="Photo principale"
    )
    
    # Équipements impliqués
    equipment_involved = models.ManyToManyField(
        'equipment.Equipment',
        related_name='incidents',
        blank=True,
        verbose_name="Équipements impliqués"
    )
    
    # Personnel impliqué
    personnel_involved = models.ManyToManyField(
        'personnel.Personnel',
        related_name='incidents',
        blank=True,
        verbose_name="Personnel impliqué"
    )
    
    # Notification et alerte
    alert_sent = models.BooleanField(
        default=False,
        verbose_name="Alerte envoyée"
    )
    alert_sent_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date d'envoi de l'alerte"
    )
    
    reported_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reported_incidents',
        verbose_name="Déclaré par"
    )
    investigated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='investigated_incidents',
        verbose_name="Enquêté par"
    )
    closed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='closed_incidents',
        verbose_name="Clôturé par"
    )
    closed_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date de clôture"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.incident_code} - {self.get_incident_type_display()} ({self.get_severity_display()})"
    
    def send_alert(self):
        """Envoyer une alerte pour cet incident"""
        from django.utils import timezone
        from alerts.models import Alert
        
        # Créer une alerte
        Alert.objects.create(
            alert_type='INCIDENT',
            severity=self.severity,
            site=self.site,
            title=f"Incident {self.incident_code}: {self.get_incident_type_display()}",
            message=f"Gravité: {self.get_severity_display()}\n{self.description[:200]}",
            related_incident=self
        )
        
        self.alert_sent = True
        self.alert_sent_at = timezone.now()
        self.save(update_fields=['alert_sent', 'alert_sent_at'])
        
        # TODO: Implémenter envoi SMS/Email
        return True


class IncidentPhoto(models.Model):
    """
    Photos multiples pour un incident (HSE-01)
    """
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name="Incident"
    )
    photo = models.ImageField(
        upload_to='incidents_photos/',
        verbose_name="Photo"
    )
    caption = models.CharField(
        max_length=255, blank=True,
        verbose_name="Légende"
    )
    taken_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Prise le"
    )
    
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Uploadé par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Photo d'incident"
        verbose_name_plural = "Photos d'incidents"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Photo - {self.incident.incident_code}"


class IncidentFollowUp(models.Model):
    """
    Suivi des actions pour un incident (HSE-01)
    """
    class FollowUpStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours'
        COMPLETED = 'COMPLETED', 'Terminé'
        OVERDUE = 'OVERDUE', 'En retard'
    
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='follow_ups',
        verbose_name="Incident"
    )
    action_description = models.TextField(
        verbose_name="Description de l'action"
    )
    status = models.CharField(
        max_length=20,
        choices=FollowUpStatus.choices,
        default=FollowUpStatus.PENDING,
        verbose_name="Statut"
    )
    due_date = models.DateField(
        verbose_name="Date limite"
    )
    completed_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date de réalisation"
    )
    
    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='incident_follow_ups',
        verbose_name="Assigné à"
    )
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Suivi d'incident"
        verbose_name_plural = "Suivis d'incidents"
        ordering = ['due_date']
    
    def __str__(self):
        return f"{self.incident.incident_code} - {self.action_description[:50]}"
