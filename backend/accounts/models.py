from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from .audit import AuditLog, LockedStatus


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    ROLE_CHOICES = [
        ("ADMIN", "Administrateur"),
        ("SITE_MANAGER", "Gestionnaire de site"),
        ("TECHNICIEN", "Technicien/Ingénieur"),
        ("ANALYST", "Analyste/Décideur"),
        ("MMG", "Autorité MMG"),
    ]

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default="TECHNICIEN",
    )

    # Sites assignés — filtre automatique des données visibles
    # ADMIN voit tout (ce champ est ignoré pour lui)
    # Les autres rôles ne voient que les données liées à leurs sites
    assigned_sites = models.ManyToManyField(
        'mining_sites.MiningSite',
        blank=True,
        related_name='assigned_users',
        verbose_name="Sites assignés",
        help_text="Sites auxquels cet utilisateur a accès. Vide = aucun accès site (sauf ADMIN)."
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]

    def get_site_ids(self):
                """Retourne les IDs des sites assignés (cache-friendly)

                - ADMIN, ANALYST, MMG voient toutes les données (pas de filtre)
                    MMG = Ministère des Mines, contrôle tous les sites
                - SITE_MANAGER, TECHNICIEN voient uniquement
                    les données de leurs sites assignés
                """
                if self.role in ('ADMIN', 'ANALYST', 'MMG'):
                        return None  # None = pas de filtre, voit tout
                return list(self.assigned_sites.values_list('id', flat=True))
