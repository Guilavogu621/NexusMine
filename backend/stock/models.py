from django.db import models
from django.db.models import Sum
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class StockLocation(models.Model):
    """
    Emplacement de stockage (OPS-02)
    Représente un lieu de stockage de minerai sur un site
    """
    code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code emplacement"
    )
    name = models.CharField(max_length=200, verbose_name="Nom")
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        related_name='stock_locations',
        verbose_name="Site"
    )
    
    # Capacité - Valeur positive uniquement
    capacity = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Capacité maximale (tonnes)"
    )
    
    # Type de stockage
    class LocationType(models.TextChoices):
        PIT = 'PIT', 'Fosse'
        STOCKPILE = 'STOCKPILE', 'Terril/Stock'
        WAREHOUSE = 'WAREHOUSE', 'Entrepôt'
        LOADING_ZONE = 'LOADING_ZONE', 'Zone de chargement'
        PORT = 'PORT', 'Port/Terminal'
    
    location_type = models.CharField(
        max_length=20,
        choices=LocationType.choices,
        default=LocationType.STOCKPILE,
        verbose_name="Type d'emplacement"
    )
    
    # GPS
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
    
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Emplacement de stockage"
        verbose_name_plural = "Emplacements de stockage"
        ordering = ['site', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def get_current_stock(self, mineral_type=None):
        """Calcule le stock actuel à cet emplacement"""
        movements = self.stock_movements.all()
        if mineral_type:
            movements = movements.filter(mineral_type=mineral_type)
        
        incoming = movements.filter(
            movement_type__in=['INITIAL', 'EXTRACTION', 'TRANSFER_IN']
        ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        
        outgoing = movements.filter(
            movement_type__in=['EXPEDITION', 'TRANSFER_OUT', 'LOSS']
        ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        
        return incoming - outgoing


class StockMovement(models.Model):
    """
    Mouvement de stock (OPS-02)
    Stock = Initial + Extraction - Expédition
    """
    
    class MovementType(models.TextChoices):
        INITIAL = 'INITIAL', 'Stock initial'
        EXTRACTION = 'EXTRACTION', 'Extraction'
        EXPEDITION = 'EXPEDITION', 'Expédition'
        TRANSFER_IN = 'TRANSFER_IN', 'Transfert entrant'
        TRANSFER_OUT = 'TRANSFER_OUT', 'Transfert sortant'
        ADJUSTMENT = 'ADJUSTMENT', 'Ajustement inventaire'
        LOSS = 'LOSS', 'Perte/Déchet'
    
    class MineralType(models.TextChoices):
        BAUXITE = 'BAUXITE', 'Bauxite'
        IRON = 'IRON', 'Fer'
        GOLD = 'GOLD', 'Or'
        DIAMOND = 'DIAMOND', 'Diamant'
        MANGANESE = 'MANGANESE', 'Manganèse'
        URANIUM = 'URANIUM', 'Uranium'
        OTHER = 'OTHER', 'Autre'
    
    movement_code = models.CharField(
        max_length=50, unique=True,
        verbose_name="Code mouvement"
    )
    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices,
        verbose_name="Type de mouvement"
    )
    
    # Localisation
    location = models.ForeignKey(
        StockLocation,
        on_delete=models.PROTECT,
        related_name='stock_movements',
        verbose_name="Emplacement"
    )
    
    # Pour les transferts, emplacement destination
    destination_location = models.ForeignKey(
        StockLocation,
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='incoming_movements',
        verbose_name="Emplacement destination"
    )
    
    # Type de minerai
    mineral_type = models.CharField(
        max_length=20,
        choices=MineralType.choices,
        default=MineralType.BAUXITE,
        verbose_name="Type de minerai"
    )
    
    # Quantité - Valeur positive uniquement
    quantity = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Quantité (tonnes)"
    )
    
    # Qualité/Grade - Entre 0 et 100%
    grade = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        verbose_name="Grade/Teneur (%)"
    )
    
    # Date
    date = models.DateField(verbose_name="Date du mouvement")
    
    # Lien avec opération (si applicable)
    operation = models.ForeignKey(
        'operations.Operation',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='stock_movements',
        verbose_name="Opération liée"
    )
    
    # Pour expéditions
    destination = models.CharField(
        max_length=255, blank=True,
        verbose_name="Destination (client/port)"
    )
    transport_reference = models.CharField(
        max_length=100, blank=True,
        verbose_name="Référence transport"
    )
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_stock_movements',
        verbose_name="Créé par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.movement_code} - {self.get_movement_type_display()} - {self.quantity}t"
    
    def save(self, *args, **kwargs):
        # Si c'est un transfert, créer le mouvement entrant à destination
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.movement_type == 'TRANSFER_OUT' and self.destination_location:
            # Créer mouvement entrant
            StockMovement.objects.create(
                movement_code=f"{self.movement_code}-IN",
                movement_type='TRANSFER_IN',
                location=self.destination_location,
                mineral_type=self.mineral_type,
                quantity=self.quantity,
                grade=self.grade,
                date=self.date,
                operation=self.operation,
                notes=f"Transfert depuis {self.location.code}",
                created_by=self.created_by
            )


class StockSummary(models.Model):
    """
    Vue agrégée du stock par site et type de minerai (lecture seule)
    Mise à jour automatique par signal ou tâche périodique
    """
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        related_name='stock_summaries',
        verbose_name="Site"
    )
    mineral_type = models.CharField(
        max_length=20,
        choices=StockMovement.MineralType.choices,
        verbose_name="Type de minerai"
    )
    
    # Quantités calculées
    initial_stock = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name="Stock initial"
    )
    total_extracted = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name="Total extrait"
    )
    total_expedited = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name="Total expédié"
    )
    current_stock = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name="Stock actuel"
    )
    
    # Période
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Synthèse stock"
        verbose_name_plural = "Synthèses stock"
        unique_together = ['site', 'mineral_type']
    
    def __str__(self):
        return f"{self.site.name} - {self.get_mineral_type_display()}: {self.current_stock}t"
    
    def recalculate(self):
        """Recalcule les totaux depuis les mouvements"""
        from django.db.models import Sum
        
        movements = StockMovement.objects.filter(
            location__site=self.site,
            mineral_type=self.mineral_type
        )
        
        self.initial_stock = movements.filter(
            movement_type='INITIAL'
        ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        
        self.total_extracted = movements.filter(
            movement_type='EXTRACTION'
        ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        
        self.total_expedited = movements.filter(
            movement_type='EXPEDITION'
        ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
        
        # Stock = Initial + Extraction - Expédition
        self.current_stock = (
            self.initial_stock + self.total_extracted - self.total_expedited
        )
        self.save()
