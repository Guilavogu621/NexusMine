from django.db import models


class Personnel(models.Model):
    """
    Entité PERSONNEL - Représente un employé minier
    """
    
    class PersonnelStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Actif'
        ON_LEAVE = 'ON_LEAVE', 'En congé'
        INACTIVE = 'INACTIVE', 'Inactif'
        TERMINATED = 'TERMINATED', 'Licencié'
    
    employee_id = models.CharField(
        max_length=50, unique=True,
        verbose_name="Matricule"
    )
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    position = models.CharField(max_length=150, verbose_name="Fonction/Poste")
    phone = models.CharField(
        max_length=20, blank=True,
        verbose_name="Téléphone"
    )
    email = models.EmailField(blank=True, verbose_name="Email")
    status = models.CharField(
        max_length=20,
        choices=PersonnelStatus.choices,
        default=PersonnelStatus.ACTIVE,
        verbose_name="Statut"
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='personnel',
        verbose_name="Site d'affectation"
    )
    hire_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date d'embauche"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Personnel"
        verbose_name_plural = "Personnel"
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.last_name} {self.first_name} - {self.position}"
