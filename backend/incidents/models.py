from django.db import models


class Incident(models.Model):
    """
    Entité INCIDENT - Représente un incident sur un site minier
    """
    
    class IncidentType(models.TextChoices):
        ACCIDENT = 'ACCIDENT', 'Accident corporel'
        EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE', 'Panne équipement'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Incident environnemental'
        SECURITY = 'SECURITY', 'Incident de sécurité'
        LANDSLIDE = 'LANDSLIDE', 'Glissement de terrain'
        FIRE = 'FIRE', 'Incendie'
        OTHER = 'OTHER', 'Autre'
    
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Faible'
        MEDIUM = 'MEDIUM', 'Moyen'
        HIGH = 'HIGH', 'Élevé'
        CRITICAL = 'CRITICAL', 'Critique'
    
    class IncidentStatus(models.TextChoices):
        REPORTED = 'REPORTED', 'Déclaré'
        INVESTIGATING = 'INVESTIGATING', 'En investigation'
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
    actions_taken = models.TextField(
        blank=True,
        verbose_name="Actions prises"
    )
    
    reported_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reported_incidents',
        verbose_name="Déclaré par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Incident"
        verbose_name_plural = "Incidents"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.incident_code} - {self.get_incident_type_display()} ({self.get_severity_display()})"
