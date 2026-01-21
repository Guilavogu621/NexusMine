from django.db import models


class Equipment(models.Model):
    """
    Entité EQUIPEMENT - Représente un équipement minier
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
    
    equipment_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code équipement"
    )
    name = models.CharField(max_length=200, verbose_name="Nom/Désignation")
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
        verbose_name="État"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='equipment',
        verbose_name="Site"
    )
    commissioning_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date de mise en service"
    )
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        ordering = ['equipment_code']
    
    def __str__(self):
        return f"{self.equipment_code} - {self.name}"
