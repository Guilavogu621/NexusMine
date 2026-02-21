"""
Système d'audit immuable pour conformité réglementaire MMG

Trace toutes les modifications avec:
- Utilisateur qui a modifié
- Horodatage exact
- Avant/Après (versioning)
- Raison de la modification (si fournie)
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class AuditLog(models.Model):
    """
    Enregistrement immutable de toutes les modifications
    
    Critique pour la conformité MMG (Ministère des Mines et Géologie)
    """
    
    class ActionType(models.TextChoices):
        CREATE = 'CREATE', 'Création'
        UPDATE = 'UPDATE', 'Modification'
        DELETE = 'DELETE', 'Suppression'
        APPROVE = 'APPROVE', 'Approbation'
        REJECT = 'REJECT', 'Refus'
        VALIDATE = 'VALIDATE', 'Validation'
        PUBLISH = 'PUBLISH', 'Publication'
        EXPORT = 'EXPORT', 'Export'
        LOCK = 'LOCK', 'Verrouillage'
        UNLOCK = 'UNLOCK', 'Déverrouillage'
    
    # Identifiant unique (immutable)
    id = models.BigAutoField(primary_key=True, editable=False)
    
    # Traçabilité de l'utilisateur
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,  # Ne pas pouvoir supprimer l'utilisateur
        related_name='audit_logs',
        verbose_name="Utilisateur"
    )
    
    # Type de modification
    action = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        verbose_name="Type d'action"
    )
    
    # Identifiant de l'objet modifié
    content_type = models.CharField(
        max_length=100,
        verbose_name="Type de contenu",
        help_text="Ex: reports.Report, operations.Operation"
    )
    object_id = models.IntegerField(verbose_name="ID de l'objet")
    object_label = models.CharField(
        max_length=255,
        verbose_name="Label de l'objet",
        help_text="Ex: 'Rapport Q1 2026'"
    )
    
    # Modifications
    field_changed = models.CharField(
        max_length=100,
        null=True, blank=True,
        verbose_name="Champ modifié"
    )
    old_value = models.JSONField(
        null=True, blank=True,
        verbose_name="Ancienne valeur"
    )
    new_value = models.JSONField(
        null=True, blank=True,
        verbose_name="Nouvelle valeur"
    )
    
    # Raison de la modification (si fournie)
    reason = models.TextField(
        null=True, blank=True,
        verbose_name="Raison"
    )
    
    # Horodatage (immutable)
    timestamp = models.DateTimeField(
        auto_now_add=True,  # Défini une seule fois
        db_index=True,
        verbose_name="Date/Heure"
    )
    
    # Adresse IP (pour sécurité)
    ip_address = models.GenericIPAddressField(
        null=True, blank=True,
        verbose_name="Adresse IP"
    )
    
    class Meta:
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.object_label} par {self.user.email} ({self.timestamp})"
    
    @classmethod
    def log_action(cls, user, action, content_type, object_id, object_label, 
                   field_changed=None, old_value=None, new_value=None, reason=None, ip_address=None):
        """
        Enregistrer une action dans l'audit trail
        
        Exemple:
            AuditLog.log_action(
                user=request.user,
                action='UPDATE',
                content_type='reports.Report',
                object_id=report.id,
                object_label=report.title,
                field_changed='status',
                old_value='DRAFT',
                new_value='PENDING_APPROVAL',
                reason='Soumis pour approbation',
                ip_address=get_client_ip(request)
            )
        """
        return cls.objects.create(
            user=user,
            action=action,
            content_type=content_type,
            object_id=object_id,
            object_label=object_label,
            field_changed=field_changed,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            ip_address=ip_address
        )


class LockedStatus(models.Model):
    """
    Registre des statuts verrouillés (non-modifiables)
    
    Une fois approuvé/validé/publié, le document ne peut plus être modifié
    """
    
    # Identifiant de l'objet verrouillé
    content_type = models.CharField(max_length=100)
    object_id = models.IntegerField()
    
    # Statut qui la verrouille
    locked_status = models.CharField(max_length=100)
    
    # Qui a verrouillé et quand
    locked_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='locked_items'
    )
    locked_at = models.DateTimeField(auto_now_add=True)
    
    # Raison du verrouillage
    reason = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ['content_type', 'object_id']
        verbose_name = "Statut verrouillé"
        verbose_name_plural = "Statuts verrouillés"
    
    def __str__(self):
        return f"{self.content_type} #{self.object_id} locked at {self.locked_at}"
    
    @classmethod
    def lock(cls, content_type, object_id, locked_status, user, reason=None):
        """Verrouiller un objet"""
        obj, created = cls.objects.get_or_create(
            content_type=content_type,
            object_id=object_id,
            defaults={
                'locked_status': locked_status,
                'locked_by': user,
                'reason': reason
            }
        )
        return obj, created
    
    @classmethod
    def is_locked(cls, content_type, object_id):
        """Vérifier si un objet est verrouillé"""
        return cls.objects.filter(
            content_type=content_type,
            object_id=object_id
        ).exists()
    
    @classmethod
    def unlock(cls, content_type, object_id):
        """Déverrouiller un objet (ADMIN uniquement)"""
        return cls.objects.filter(
            content_type=content_type,
            object_id=object_id
        ).delete()
