from django.db import models


class Operation(models.Model):
    """
    Entité OPERATION_MINIERE - Représente une opération minière
    """
    
    class OperationType(models.TextChoices):
        EXTRACTION = 'EXTRACTION', 'Extraction'
        DRILLING = 'DRILLING', 'Forage'
        BLASTING = 'BLASTING', 'Dynamitage'
        TRANSPORT = 'TRANSPORT', 'Transport'
        PROCESSING = 'PROCESSING', 'Traitement'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        INSPECTION = 'INSPECTION', 'Inspection'
        OTHER = 'OTHER', 'Autre'
    
    class OperationStatus(models.TextChoices):
        PLANNED = 'PLANNED', 'Planifiée'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours'
        COMPLETED = 'COMPLETED', 'Terminée'
        CANCELLED = 'CANCELLED', 'Annulée'
    
    operation_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code opération"
    )
    operation_type = models.CharField(
        max_length=20,
        choices=OperationType.choices,
        default=OperationType.EXTRACTION,
        verbose_name="Type d'opération"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='operations',
        verbose_name="Site"
    )
    date = models.DateField(verbose_name="Date de l'opération")
    start_time = models.TimeField(
        null=True, blank=True,
        verbose_name="Heure de début"
    )
    end_time = models.TimeField(
        null=True, blank=True,
        verbose_name="Heure de fin"
    )
    status = models.CharField(
        max_length=20,
        choices=OperationStatus.choices,
        default=OperationStatus.PLANNED,
        verbose_name="Statut"
    )
    description = models.TextField(blank=True, verbose_name="Description")
    quantity_extracted = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        verbose_name="Quantité extraite (tonnes)"
    )
    
    # Relations Many-to-Many
    personnel = models.ManyToManyField(
        'personnel.Personnel',
        related_name='operations',
        blank=True,
        verbose_name="Personnel impliqué"
    )
    equipment = models.ManyToManyField(
        'equipment.Equipment',
        related_name='operations',
        blank=True,
        verbose_name="Équipements utilisés"
    )
    
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_operations',
        verbose_name="Créé par"
    )
    validated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='validated_operations',
        verbose_name="Validé par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Opération minière"
        verbose_name_plural = "Opérations minières"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.operation_code} - {self.get_operation_type_display()} ({self.date})"
