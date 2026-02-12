from django.db import models


class Certification(models.Model):
    """
    Certifications professionnelles du personnel (REF-01)
    Ex: Permis de conduire engins, Habilitation électrique, etc.
    """
    name = models.CharField(max_length=200, verbose_name="Nom de la certification")
    description = models.TextField(blank=True, verbose_name="Description")
    issuing_authority = models.CharField(
        max_length=200, blank=True,
        verbose_name="Organisme délivrant"
    )
    validity_period_months = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Durée de validité (mois)"
    )
    
    class Meta:
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Personnel(models.Model):
    """
    Entité PERSONNEL - Représente un employé minier
    Conforme au cahier des charges NexusMine (REF-01)
    """
    
    class PersonnelStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Actif'
        ON_LEAVE = 'ON_LEAVE', 'En congé'
        INACTIVE = 'INACTIVE', 'Inactif'
        TERMINATED = 'TERMINATED', 'Licencié'

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente d\'approbation'
        APPROVED = 'APPROVED', 'Approuvé'
        REJECTED = 'REJECTED', 'Refusé'
    
    class PersonnelRole(models.TextChoices):
        TECHNICIAN = 'TECHNICIAN', 'Technicien'
        ENGINEER = 'ENGINEER', 'Ingénieur'
        OPERATOR = 'OPERATOR', 'Opérateur d\'engins'
        DRIVER = 'DRIVER', 'Chauffeur'
        SUPERVISOR = 'SUPERVISOR', 'Chef d\'équipe'
        HSE_OFFICER = 'HSE_OFFICER', 'Agent HSE'
        MAINTENANCE = 'MAINTENANCE', 'Agent de maintenance'
        SECURITY = 'SECURITY', 'Agent de sécurité'
        ADMIN = 'ADMIN', 'Administratif'
        OTHER = 'OTHER', 'Autre'
    
    # Identification
    employee_id = models.CharField(
        max_length=50, unique=True,
        verbose_name="Matricule"
    )
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    
    # Poste et rôle
    position = models.CharField(max_length=150, verbose_name="Fonction/Poste")
    role = models.CharField(
        max_length=20,
        choices=PersonnelRole.choices,
        default=PersonnelRole.TECHNICIAN,
        verbose_name="Rôle"
    )
    department = models.CharField(
        max_length=100, blank=True,
        verbose_name="Département"
    )
    
    # Contact
    phone = models.CharField(
        max_length=20, blank=True,
        verbose_name="Téléphone"
    )
    email = models.EmailField(blank=True, verbose_name="Email")
    emergency_contact = models.CharField(
        max_length=100, blank=True,
        verbose_name="Contact d'urgence"
    )
    emergency_phone = models.CharField(
        max_length=20, blank=True,
        verbose_name="Téléphone d'urgence"
    )
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=PersonnelStatus.choices,
        default=PersonnelStatus.ACTIVE,
        verbose_name="Statut"
    )
    
    # Affectation actuelle
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.PROTECT,
        related_name='personnel',
        verbose_name="Site d'affectation actuel"
    )
    
    # Dates importantes
    hire_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date d'embauche"
    )
    contract_end_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date de fin de contrat"
    )
    
    # Certifications (REF-01)
    certifications = models.ManyToManyField(
        Certification,
        through='PersonnelCertification',
        related_name='personnel',
        blank=True,
        verbose_name="Certifications"
    )
    
    # Photo d'identité
    photo = models.ImageField(
        upload_to='personnel_photos/',
        null=True, blank=True,
        verbose_name="Photo"
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name="Notes")

    # Workflow d'approbation
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        verbose_name="Statut d'approbation"
    )
    submitted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='submitted_personnel',
        verbose_name="Soumis par"
    )
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='approved_personnel',
        verbose_name="Approuvé/Refusé par"
    )
    approval_date = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date d'approbation/refus"
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name="Motif du refus"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Personnel"
        verbose_name_plural = "Personnel"
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.employee_id} - {self.last_name} {self.first_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class PersonnelCertification(models.Model):
    """
    Relation entre Personnel et Certification avec dates
    """
    personnel = models.ForeignKey(
        Personnel,
        on_delete=models.CASCADE,
        related_name='personnel_certifications'
    )
    certification = models.ForeignKey(
        Certification,
        on_delete=models.CASCADE,
        related_name='personnel_certifications'
    )
    obtained_date = models.DateField(verbose_name="Date d'obtention")
    expiry_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date d'expiration"
    )
    certificate_number = models.CharField(
        max_length=100, blank=True,
        verbose_name="Numéro de certificat"
    )
    document = models.FileField(
        upload_to='certifications/',
        null=True, blank=True,
        verbose_name="Document justificatif"
    )
    
    class Meta:
        verbose_name = "Certification du personnel"
        verbose_name_plural = "Certifications du personnel"
        unique_together = ['personnel', 'certification']
    
    def __str__(self):
        return f"{self.personnel.employee_id} - {self.certification.name}"
    
    @property
    def is_valid(self):
        """Vérifie si la certification est encore valide"""
        from django.utils import timezone
        if not self.expiry_date:
            return True
        return self.expiry_date >= timezone.now().date()


class SiteAffectationHistory(models.Model):
    """
    Historique des affectations du personnel sur les sites (REF-01)
    """
    personnel = models.ForeignKey(
        Personnel,
        on_delete=models.CASCADE,
        related_name='affectation_history'
    )
    site = models.ForeignKey(
        'mining_sites.MiningSite',
        on_delete=models.CASCADE,
        related_name='affectation_history'
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(
        null=True, blank=True,
        verbose_name="Date de fin"
    )
    position = models.CharField(
        max_length=150,
        verbose_name="Poste occupé"
    )
    reason = models.CharField(
        max_length=200, blank=True,
        verbose_name="Motif du changement"
    )
    
    class Meta:
        verbose_name = "Historique d'affectation"
        verbose_name_plural = "Historique des affectations"
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.personnel.employee_id} - {self.site.name} ({self.start_date})"
