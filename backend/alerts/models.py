from django.db import models


class Alert(models.Model):
    """
    Entité ALERTE - Alertes générées par le système
    Conforme au cahier des charges NexusMine (HSE-01, HSE-02)
    """
    
    class AlertType(models.TextChoices):
        THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED', 'Seuil dépassé'
        SAFETY = 'SAFETY', 'Sécurité'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance requise'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Environnement'
        PRODUCTION = 'PRODUCTION', 'Production'
        INCIDENT = 'INCIDENT', 'Incident'
        EQUIPMENT = 'EQUIPMENT', 'Équipement'
        STOCK = 'STOCK', 'Stock'
        SYSTEM = 'SYSTEM', 'Système'
    
    class AlertStatus(models.TextChoices):
        NEW = 'NEW', 'Nouvelle'
        READ = 'READ', 'Lue'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours de traitement'
        RESOLVED = 'RESOLVED', 'Résolue'
        ARCHIVED = 'ARCHIVED', 'Archivée'
    
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Faible'
        MEDIUM = 'MEDIUM', 'Moyen'
        HIGH = 'HIGH', 'Élevé'
        CRITICAL = 'CRITICAL', 'Critique'
    
    alert_type = models.CharField(
        max_length=20,
        choices=AlertType.choices,
        default=AlertType.SYSTEM,
        verbose_name="Type d'alerte"
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.MEDIUM,
        verbose_name="Gravité"
    )
    status = models.CharField(
        max_length=20,
        choices=AlertStatus.choices,
        default=AlertStatus.NEW,
        verbose_name="Statut"
    )
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    
    # Relations avec les objets source de l'alerte
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
    related_incident = models.ForeignKey(
        'incidents.Incident',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='alerts',
        verbose_name="Incident lié"
    )
    related_environmental_data = models.ForeignKey(
        'environment.EnvironmentalData',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='alerts',
        verbose_name="Donnée environnementale liée"
    )
    related_equipment = models.ForeignKey(
        'equipment.Equipment',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='alerts',
        verbose_name="Équipement lié"
    )
    
    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_alerts',
        verbose_name="Assignée à"
    )
    
    # Notifications
    email_sent = models.BooleanField(
        default=False,
        verbose_name="Email envoyé"
    )
    sms_sent = models.BooleanField(
        default=False,
        verbose_name="SMS envoyé"
    )
    push_sent = models.BooleanField(
        default=False,
        verbose_name="Push envoyé"
    )
    
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de génération")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de lecture")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de résolution")
    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='resolved_alerts',
        verbose_name="Résolu par"
    )
    resolution_notes = models.TextField(
        blank=True,
        verbose_name="Notes de résolution"
    )
    
    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"[{self.get_severity_display()}] {self.title}"
    
    def mark_as_read(self, user=None):
        """Marquer l'alerte comme lue"""
        from django.utils import timezone
        if self.status == 'NEW':
            self.status = 'READ'
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])
    
    def resolve(self, user, notes=''):
        """Résoudre l'alerte"""
        from django.utils import timezone
        self.status = 'RESOLVED'
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.resolution_notes = notes
        self.save()
    
    def send_notifications(self):
        """Envoyer les notifications (email, SMS, push)"""
        # TODO: Implémenter l'envoi des notifications
        # Pour l'instant, marquer comme envoyé
        if self.severity in ['HIGH', 'CRITICAL']:
            # Pour les alertes critiques, envoyer par tous les canaux
            self.email_sent = True
            self.sms_sent = True
            self.push_sent = True
        else:
            # Pour les autres, seulement email et push
            self.email_sent = True
            self.push_sent = True
        self.save(update_fields=['email_sent', 'sms_sent', 'push_sent'])
        return True


class AlertRule(models.Model):
    """
    Règle de génération d'alerte automatique
    """
    name = models.CharField(max_length=200, verbose_name="Nom de la règle")
    description = models.TextField(blank=True, verbose_name="Description")
    
    alert_type = models.CharField(
        max_length=20,
        choices=Alert.AlertType.choices,
        verbose_name="Type d'alerte à générer"
    )
    severity = models.CharField(
        max_length=20,
        choices=Alert.Severity.choices,
        default=Alert.Severity.MEDIUM,
        verbose_name="Gravité"
    )
    
    # Conditions (stockées en JSON)
    conditions = models.JSONField(
        default=dict,
        verbose_name="Conditions",
        help_text="Conditions en format JSON pour déclencher l'alerte"
    )
    
    # Sites concernés (vide = tous)
    sites = models.ManyToManyField(
        'mining_sites.MiningSite',
        blank=True,
        related_name='alert_rules',
        verbose_name="Sites concernés"
    )
    
    # Destinataires
    notify_users = models.ManyToManyField(
        'accounts.User',
        blank=True,
        related_name='alert_rules',
        verbose_name="Utilisateurs à notifier"
    )
    notify_roles = models.JSONField(
        default=list,
        verbose_name="Rôles à notifier",
        help_text="Liste des rôles: ['ADMIN', 'SUPERVISOR', ...]"
    )
    
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Règle d'alerte"
        verbose_name_plural = "Règles d'alerte"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_alert_type_display()})"
