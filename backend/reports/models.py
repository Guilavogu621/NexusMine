from django.db import models


class Report(models.Model):
    """
    Entité RAPPORT - Rapports générés
    """
    
    class ReportType(models.TextChoices):
        DAILY = 'DAILY', 'Rapport journalier'
        WEEKLY = 'WEEKLY', 'Rapport hebdomadaire'
        MONTHLY = 'MONTHLY', 'Rapport mensuel'
        QUARTERLY = 'QUARTERLY', 'Rapport trimestriel'
        ANNUAL = 'ANNUAL', 'Rapport annuel'
        INCIDENT = 'INCIDENT', 'Rapport d\'incident'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Rapport environnemental'
        CUSTOM = 'CUSTOM', 'Rapport personnalisé'
    
    class ReportStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        PENDING_APPROVAL = 'PENDING_APPROVAL', 'En attente d\'approbation'
        GENERATED = 'GENERATED', 'Généré'
        VALIDATED = 'VALIDATED', 'Validé'
        PUBLISHED = 'PUBLISHED', 'Publié'
    
    title = models.CharField(max_length=300, verbose_name="Titre du rapport")
    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
        default=ReportType.MONTHLY,
        verbose_name="Type de rapport"
    )
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.DRAFT,
        verbose_name="Statut"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='reports',
        verbose_name="Site concerné"
    )
    period_start = models.DateField(verbose_name="Début de période")
    period_end = models.DateField(verbose_name="Fin de période")
    content = models.TextField(blank=True, verbose_name="Contenu")
    summary = models.TextField(blank=True, verbose_name="Résumé")
    file = models.FileField(
        upload_to='reports/',
        null=True, blank=True,
        verbose_name="Fichier"
    )
    
    generated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='generated_reports',
        verbose_name="Généré par"
    )
    validated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='validated_reports',
        verbose_name="Validé par"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rapport"
        verbose_name_plural = "Rapports"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"
