from django.db import models


class Alert(models.Model):
    """
    Entité ALERTE - Alertes générées par le système
    """
    
    class AlertType(models.TextChoices):
        THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED', 'Seuil dépassé'
        SAFETY = 'SAFETY', 'Sécurité'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance requise'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Environnement'
        PRODUCTION = 'PRODUCTION', 'Production'
        SYSTEM = 'SYSTEM', 'Système'
    
    class AlertStatus(models.TextChoices):
        NEW = 'NEW', 'Nouvelle'
        READ = 'READ', 'Lue'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours de traitement'
        RESOLVED = 'RESOLVED', 'Résolue'
        ARCHIVED = 'ARCHIVED', 'Archivée'
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Basse'
        MEDIUM = 'MEDIUM', 'Moyenne'
        HIGH = 'HIGH', 'Haute'
        URGENT = 'URGENT', 'Urgente'
    
    alert_type = models.CharField(
        max_length=20,
        choices=AlertType.choices,
        default=AlertType.SYSTEM,
        verbose_name="Type d'alerte"
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        verbose_name="Priorité"
    )
    status = models.CharField(
        max_length=20,
        choices=AlertStatus.choices,
        default=AlertStatus.NEW,
        verbose_name="Statut"
    )
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    
    indicator = models.ForeignKey(
        'analytics.Indicator',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='alerts',
        verbose_name="Indicateur lié"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='alerts',
        verbose_name="Site concerné"
    )
    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_alerts',
        verbose_name="Assignée à"
    )
    
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de génération")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de lecture")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de résolution")
    
    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title}"
