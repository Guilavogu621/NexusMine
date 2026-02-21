from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from nexus_backend.validators import validate_maintenance_dates


class Equipment(models.Model):
    """
    Entité EQUIPEMENT - Représente un équipement minier
    Conforme au cahier des charges NexusMine (REF-01)
    """
    
    class EquipmentType(models.TextChoices):
        TRUCK = 'TRUCK', 'Camion'
        EXCAVATOR = 'EXCAVATOR', 'Pelle excavatrice'
        LOADER = 'LOADER', 'Chargeuse'
        DRILL = 'DRILL', 'Foreuse'
        CRUSHER = 'CRUSHER', 'Concasseur'
        CONVEYOR = 'CONVEYOR', 'Convoyeur'
        PUMP = 'PUMP', 'Pompe'
        GENERATOR = 'GENERATOR', 'Générateur'
        OTHER = 'OTHER', 'Autre'
    
    class EquipmentStatus(models.TextChoices):
        OPERATIONAL = 'OPERATIONAL', 'Opérationnel'
        MAINTENANCE = 'MAINTENANCE', 'En maintenance'
        BREAKDOWN = 'BREAKDOWN', 'En panne'
        RETIRED = 'RETIRED', 'Hors service'
    
    # Identification (REF-01)
    equipment_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code équipement (ID unique)"
    )
    name = models.CharField(max_length=200, verbose_name="Nom/Désignation")
    
    # QR Code pour scan mobile (OPS-01)
    qr_code = models.CharField(
        max_length=200, blank=True, unique=True, null=True,
        verbose_name="QR Code",
        help_text="Code unique pour scan mobile"
    )
    
    equipment_type = models.CharField(
        max_length=20,
        choices=EquipmentType.choices,
        default=EquipmentType.OTHER,
        verbose_name="Type d'équipement"
    )
    status = models.CharField(
        max_length=20,
        choices=EquipmentStatus.choices,
        default=EquipmentStatus.OPERATIONAL,
        verbose_name="État opérationnel"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='equipment',
        verbose_name="Site"
    )
    
    # Informations fabricant (REF-01)
    manufacturer = models.CharField(
        max_length=150, blank=True,
        verbose_name="Fabricant"
    )
    model = models.CharField(
        max_length=150, blank=True,
        verbose_name="Modèle"
    )
    serial_number = models.CharField(
        max_length=100, blank=True,
        verbose_name="Numéro de série"
    )
    year_of_manufacture = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Année de fabrication"
    )
    
    # Dates (REF-01)
    commissioning_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date de mise en service"
    )
    last_maintenance_date = models.DateField(
        null=True, blank=True,
        verbose_name="Dernière maintenance"
    )
    next_maintenance_date = models.DateField(
        null=True, blank=True,
        verbose_name="Prochaine maintenance prévue"
    )
    
    # Compteurs - Valeurs positives uniquement
    hours_operated = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Heures de fonctionnement"
    )
    fuel_consumption_rate = models.DecimalField(
        max_digits=8, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Consommation carburant (L/h)"
    )
    
    # Capacité - Valeur positive uniquement
    capacity = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Capacité",
        help_text="En tonnes pour camions, m³ pour excavateurs, etc."
    )
    capacity_unit = models.CharField(
        max_length=20, blank=True,
        verbose_name="Unité de capacité"
    )
    
    # Photo
    photo = models.ImageField(
        upload_to='equipment_photos/',
        null=True, blank=True,
        verbose_name="Photo"
    )
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        ordering = ['equipment_code']
    
    def __str__(self):
        return f"{self.equipment_code} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Générer QR Code automatiquement si non défini
        if not self.qr_code:
            self.qr_code = f"EQ-{self.equipment_code}"
        super().save(*args, **kwargs)


class MaintenanceRecord(models.Model):
    """
    Historique de maintenance des équipements (REF-01)
    """
    
    class MaintenanceType(models.TextChoices):
        PREVENTIVE = 'PREVENTIVE', 'Maintenance préventive'
        CORRECTIVE = 'CORRECTIVE', 'Maintenance corrective'
        INSPECTION = 'INSPECTION', 'Inspection'
        OVERHAUL = 'OVERHAUL', 'Révision générale'
        REPAIR = 'REPAIR', 'Réparation'
    
    class MaintenanceStatus(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Planifiée'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours'
        COMPLETED = 'COMPLETED', 'Terminée'
        CANCELLED = 'CANCELLED', 'Annulée'
    
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='maintenance_records',
        verbose_name="Équipement"
    )
    
    maintenance_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code maintenance"
    )
    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.PREVENTIVE,
        verbose_name="Type de maintenance"
    )
    status = models.CharField(
        max_length=20,
        choices=MaintenanceStatus.choices,
        default=MaintenanceStatus.SCHEDULED,
        verbose_name="Statut"
    )
    
    # Dates
    scheduled_date = models.DateField(verbose_name="Date prévue")
    start_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date de début"
    )
    end_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date de fin"
    )
    
    # Description
    description = models.TextField(verbose_name="Description des travaux")
    findings = models.TextField(
        blank=True,
        verbose_name="Constatations"
    )
    actions_taken = models.TextField(
        blank=True,
        verbose_name="Actions réalisées"
    )
    
    # Pièces et coûts
    parts_replaced = models.TextField(
        blank=True,
        verbose_name="Pièces remplacées"
    )
    cost = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        verbose_name="Coût (GNF)"
    )
    
    # Compteur heures au moment de la maintenance
    hours_at_maintenance = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        verbose_name="Heures compteur"
    )
    
    # Responsable
    performed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='maintenance_performed',
        verbose_name="Réalisé par"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Historique de maintenance"
        verbose_name_plural = "Historique des maintenances"
        ordering = ['-scheduled_date']
    
    def clean(self):
        """Validations métier avant sauvegarde"""
        super().clean()
        # Valider que start_date < end_date
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValidationError({
                    'end_date': 'La date de fin doit être après la date de début.'
                })
    
    def save(self, *args, **kwargs):
        """Appeler clean() avant sauvegarde"""
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.maintenance_code} - {self.equipment.equipment_code}"
