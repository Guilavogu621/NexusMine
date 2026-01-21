from django.db import models


class Indicator(models.Model):
    """
    Entité INDICATEUR - KPI de performance minière
    """
    
    class IndicatorType(models.TextChoices):
        PRODUCTION = 'PRODUCTION', 'Production'
        EFFICIENCY = 'EFFICIENCY', 'Efficacité'
        SAFETY = 'SAFETY', 'Sécurité'
        ENVIRONMENTAL = 'ENVIRONMENTAL', 'Environnement'
        EQUIPMENT = 'EQUIPMENT', 'Équipement'
        FINANCIAL = 'FINANCIAL', 'Financier'
    
    name = models.CharField(max_length=200, verbose_name="Nom de l'indicateur")
    indicator_type = models.CharField(
        max_length=20,
        choices=IndicatorType.choices,
        default=IndicatorType.PRODUCTION,
        verbose_name="Type d'indicateur"
    )
    description = models.TextField(blank=True, verbose_name="Description")
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='indicators',
        verbose_name="Site"
    )
    calculated_value = models.DecimalField(
        max_digits=15, decimal_places=4,
        null=True, blank=True,
        verbose_name="Valeur calculée"
    )
    target_value = models.DecimalField(
        max_digits=15, decimal_places=4,
        null=True, blank=True,
        verbose_name="Valeur cible"
    )
    unit = models.CharField(
        max_length=50, blank=True,
        verbose_name="Unité"
    )
    threshold_warning = models.DecimalField(
        max_digits=15, decimal_places=4,
        null=True, blank=True,
        verbose_name="Seuil d'alerte"
    )
    threshold_critical = models.DecimalField(
        max_digits=15, decimal_places=4,
        null=True, blank=True,
        verbose_name="Seuil critique"
    )
    calculation_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date de calcul"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Indicateur"
        verbose_name_plural = "Indicateurs"
        ordering = ['site', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.site.name}"
