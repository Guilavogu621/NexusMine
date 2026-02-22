"""
signals.py - Signaux pour la déduplication et gestion des alertes
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Alert
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@receiver(post_save, sender=Alert)
def handle_alert_deduplication(sender, instance, created, **kwargs):
    """
    Déduplication intelligente des alertes
    - Génère une clé de déduplication basée sur type + site + message
    - Regroupe les alertes similaires
    - Supprime les doublons récents
    """
    if created and instance.dedupe_key is None:
        # Générer la clé de déduplication
        dedupe_data = {
            'alert_type': instance.alert_type,
            'category': instance.category,
            'site_id': instance.site_id,
            'message': instance.message[:100],  # Premiers 100 chars
        }
        
        # Hash MD5 pour la clé
        dedupe_hash = hashlib.md5(json.dumps(dedupe_data, sort_keys=True).encode()).hexdigest()
        instance.dedupe_key = dedupe_hash
        instance.save(update_fields=['dedupe_key'])
        
        # Chercher et archiver les doublons récents (< 5 minutes)
        similar_alerts = Alert.objects.filter(
            dedupe_key=dedupe_hash,
            generated_at__gte=timezone.now() - timedelta(minutes=5),
            status='NEW',
            is_dismissed=False
        ).exclude(id=instance.id)
        
        for alert in similar_alerts:
            alert.status = 'ARCHIVED'
            alert.save(update_fields=['status'])


@receiver(post_save, sender=Alert)
def cleanup_expired_alerts(sender, instance, **kwargs):
    """
    Nettoyer les alertes expirées
    """
    if instance.expires_at and instance.expires_at <= timezone.now():
        if instance.status in ['NEW', 'SNOOZED']:
            instance.status = 'ARCHIVED'
            instance.save(update_fields=['status'])


@receiver(post_save, sender=Alert)
def check_snoozed_alerts(sender, instance, **kwargs):
    """
    Réveiller les alertes snoozées
    """
    if instance.snoozed_until and instance.snoozed_until <= timezone.now():
        if instance.status == 'SNOOZED':
            instance.status = 'NEW'
            instance.snoozed_until = None
            instance.save(update_fields=['status', 'snoozed_until'])


@receiver(post_save, sender=Alert)
def broadcast_new_alert(sender, instance, created, **kwargs):
    """
    Diffuser la nouvelle alerte via WebSocket
    """
    if created:
        channel_layer = get_channel_layer()
        
        # Données de l'alerte pour le WebSocket
        alert_data = {
            'id': instance.id,
            'title': instance.title,
            'message': instance.message,
            'category': instance.category,
            'severity': instance.severity,
            'alert_type': instance.alert_type,
            'priority_order': instance.priority_order,
            'generated_at': instance.generated_at.isoformat(),
            'status': instance.status,
            'site_name': instance.site.name if instance.site else 'Tous sites',
        }
        
        # Envoyer au groupe global des notifications
        async_to_sync(channel_layer.group_send)(
            "notifications_role_ADMIN",  # Exemple: notifier les admins par défaut
            {
                'type': 'alert_notification',
                'alert': alert_data
            }
        )
        
        # Si assigné à un utilisateur spécifique
        if instance.assigned_to:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{instance.assigned_to.id}",
                {
                    'type': 'alert_notification',
                    'alert': alert_data
                }
            )
