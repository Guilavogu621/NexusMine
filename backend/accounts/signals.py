from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from crum import get_current_user
from .audit import AuditLog  # Import de ton modèle

@receiver(pre_delete)
def audit_delete(sender, instance, **kwargs):
    """
    Se déclenche juste AVANT la suppression d'un objet.
    Permet de garder une trace de ce qui a été supprimé.
    """
    # 1. On ignore les logs eux-mêmes
    if sender == AuditLog:
        return

    # 2. On récupère l'utilisateur connecté via le middleware CRUM
    user = get_current_user()
    
    if user and user.is_authenticated:
        # 3. On prépare la "photo" des données avant suppression
        old_data = {}
        for field in instance._meta.fields:
            old_data[field.name] = str(getattr(instance, field.name))

        # 4. On utilise TA méthode log_action
        AuditLog.log_action(
            user=user,
            action=AuditLog.ActionType.DELETE,
            content_type=sender._meta.model_name,
            object_id=instance.pk,
            object_label=str(instance),
            old_value=old_data,
            reason="Suppression automatique (Signal)"
        )

@receiver(post_save)
def audit_create(sender, instance, created, **kwargs):
    """
    Se déclenche juste APRÈS la création d'un objet.
    """
    if not created or sender == AuditLog:
        return

    user = get_current_user()
    if user and user.is_authenticated:
        new_data = {f.name: str(getattr(instance, f.name)) for f in instance._meta.fields}

        AuditLog.log_action(
            user=user,
            action=AuditLog.ActionType.CREATE,
            content_type=sender._meta.model_name,
            object_id=instance.pk,
            object_label=str(instance),
            new_value=new_data,
            reason="Création automatique (Signal)"
        )