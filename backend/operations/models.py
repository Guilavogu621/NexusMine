from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class WorkZone(models.Model):
    """
    Zone de chantier au sein d'un site minier (OPS-01)
    """
    code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code zone"
    )
    name = models.CharField(max_length=200, verbose_name="Nom de la zone")
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        related_name='work_zones',
        verbose_name="Site"
    )
    
    # Coordonnées GPS du centroïde de la zone
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
    
    # Polygone GeoJSON de la zone
    zone_geojson = models.JSONField(
        null=True, blank=True,
        verbose_name="Polygone zone (GeoJSON)",
        help_text="Format: {'type': 'Polygon', 'coordinates': [[[lng, lat], ...]]}"
    )
    
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Zone de chantier"
        verbose_name_plural = "Zones de chantier"
        ordering = ['site', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name} ({self.site.name})"


class Shift(models.Model):
    """
    Rotation/Poste de travail (OPS-01)
    """
    class ShiftType(models.TextChoices):
        DAY = 'DAY', 'Jour (6h-18h)'
        NIGHT = 'NIGHT', 'Nuit (18h-6h)'
        MORNING = 'MORNING', 'Matin (6h-14h)'
        AFTERNOON = 'AFTERNOON', 'Après-midi (14h-22h)'
        EVENING = 'EVENING', 'Soir (22h-6h)'
    
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        related_name='shifts',
        verbose_name="Site"
    )
    date = models.DateField(verbose_name="Date")
    shift_type = models.CharField(
        max_length=20,
        choices=ShiftType.choices,
        default=ShiftType.DAY,
        verbose_name="Type de rotation"
    )
    start_time = models.TimeField(verbose_name="Heure de début")
    end_time = models.TimeField(verbose_name="Heure de fin")
    
    supervisor = models.ForeignKey(
        'personnel.Personnel',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='supervised_shifts',
        verbose_name="Chef de poste"
    )
    
    personnel = models.ManyToManyField(
        'personnel.Personnel',
        related_name='shifts',
        blank=True,
        verbose_name="Personnel affecté"
    )
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rotation"
        verbose_name_plural = "Rotations"
        ordering = ['-date', 'shift_type']
        unique_together = ['site', 'date', 'shift_type']
    
    def __str__(self):
        return f"{self.site.name} - {self.date} - {self.get_shift_type_display()}"


class Operation(models.Model):
    """
    Entité OPERATION_MINIERE - Représente une opération minière
    Conforme au cahier des charges NexusMine (OPS-01)
    """
    
    class OperationType(models.TextChoices):
        EXTRACTION = 'EXTRACTION', 'Extraction'
        DRILLING = 'DRILLING', 'Forage'
        BLASTING = 'BLASTING', 'Dynamitage'
        TRANSPORT = 'TRANSPORT', 'Transport'
        PROCESSING = 'PROCESSING', 'Traitement'
        LOADING = 'LOADING', 'Chargement'
        UNLOADING = 'UNLOADING', 'Déchargement'
        EXPEDITION = 'EXPEDITION', 'Expédition'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        INSPECTION = 'INSPECTION', 'Inspection'
        OTHER = 'OTHER', 'Autre'
    
    class OperationStatus(models.TextChoices):
        PLANNED = 'PLANNED', 'Planifiée'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours'
        COMPLETED = 'COMPLETED', 'Terminée'
        CANCELLED = 'CANCELLED', 'Annulée'
    
    class ValidationStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente de validation'
        APPROVED = 'APPROVED', 'Approuvée'
        REJECTED = 'REJECTED', 'Rejetée'
    
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
    
    # Zone de chantier (OPS-01)
    work_zone = models.ForeignKey(
        WorkZone,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='operations',
        verbose_name="Zone de chantier"
    )
    
    # Rotation (OPS-01)
    shift = models.ForeignKey(
        Shift,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='operations',
        verbose_name="Rotation"
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
        verbose_name="Statut opérationnel"
    )
    
    # Workflow de validation (OPS-01)
    validation_status = models.CharField(
        max_length=20,
        choices=ValidationStatus.choices,
        default=ValidationStatus.PENDING,
        verbose_name="Statut de validation"
    )
    validation_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date de validation"
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name="Motif de rejet"
    )
    
    description = models.TextField(blank=True, verbose_name="Description")
    
    # Quantités (OPS-02) - Valeurs positives uniquement
    quantity_extracted = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Quantité extraite (tonnes)"
    )
    quantity_transported = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Quantité transportée (tonnes)"
    )
    quantity_processed = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Quantité traitée (tonnes)"
    )
    
    # GPS de l'opération (OPS-01)
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
    
    # Photo de l'opération (OPS-01)
    photo = models.ImageField(
        upload_to='operations_photos/',
        null=True, blank=True,
        verbose_name="Photo"
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
    
    def approve(self, validated_by):
        """Approuver l'opération"""
        from django.utils import timezone
        self.validation_status = self.ValidationStatus.APPROVED
        self.validated_by = validated_by
        self.validation_date = timezone.now()
        self.save()
    
    def reject(self, validated_by, reason):
        """Rejeter l'opération"""
        from django.utils import timezone
        self.validation_status = self.ValidationStatus.REJECTED
        self.validated_by = validated_by
        self.validation_date = timezone.now()
        self.rejection_reason = reason
        self.save()


class OperationPhoto(models.Model):
    """
    Photos multiples pour une opération (OPS-01)
    """
    operation = models.ForeignKey(
        Operation,
        on_delete=models.CASCADE,
        related_name='photos',
        verbose_name="Opération"
    )
    photo = models.ImageField(
        upload_to='operations_photos/',
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
    
    # GPS de la photo
    gps_latitude = models.DecimalField(
        max_digits=10, decimal_places=7,
        null=True, blank=True,
        verbose_name="Latitude GPS"
    )
    gps_longitude = models.DecimalField(
        max_digits=10, decimal_places=7,
        null=True, blank=True,
        verbose_name="Longitude GPS"
    )
    
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="Uploadé par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Photo d'opération"
        verbose_name_plural = "Photos d'opérations"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Photo - {self.operation.operation_code}"
