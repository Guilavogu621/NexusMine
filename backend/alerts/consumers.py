"""
consumers.py - WebSocket consumers pour les notifications en temps réel
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import timedelta
from .models import Alert, UserNotificationPreferences
import logging

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour les notifications en temps réel
    Supporte:
    - Filtrage par catégorie, gravité, type
    - Routing par rôle
    - Throttling
    - Actions (dismiss, snooze, read)
    """
    
    async def connect(self):
        """Connexion du client"""
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Groupes basés sur le rôle et l'utilisateur
        self.user_group = f"notifications_{self.user.id}"
        self.role_group = f"notifications_role_{self.user.role}"
        
        # Rejoindre les groupes
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add(self.role_group, self.channel_name)
        
        await self.accept()
        logger.info(f"User {self.user.email} connected to notifications")
        
        # Envoyer les alertes non lues existantes
        await self.send_initial_alerts()
    
    async def disconnect(self, close_code):
        """Déconnexion du client"""
        await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard(self.role_group, self.channel_name)
        logger.info(f"User {self.user.email} disconnected from notifications")
    
    async def receive(self, text_data):
        """Recevoir un message du client"""
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'dismiss':
                await self.handle_dismiss(data)
            elif action == 'snooze':
                await self.handle_snooze(data)
            elif action == 'read':
                await self.handle_read(data)
            elif action == 'mark_all_read':
                await self.handle_mark_all_read()
            elif action == 'filter':
                await self.handle_filter(data)
            elif action == 'get_preferences':
                await self.send_preferences()
            elif action == 'update_preferences':
                await self.handle_update_preferences(data)
            else:
                await self.send_error(f"Action inconnue: {action}")
        
        except json.JSONDecodeError:
            await self.send_error("Format JSON invalide")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send_error(str(e))
    
    # ============ HANDLERS D'ACTIONS ============
    
    async def handle_dismiss(self, data):
        """Rejeter une alerte"""
        alert_id = data.get('alert_id')
        
        alert = await self._get_alert(alert_id)
        if not alert:
            await self.send_error("Alerte non trouvée")
            return
        
        await self._dismiss_alert(alert, self.user)
        
        # Notifier les autres utilisateurs du groupe
        await self.channel_layer.group_send(
            self.role_group,
            {
                'type': 'alert_dismissed',
                'alert_id': alert_id
            }
        )
        
        await self.send_success("Alerte rejetée")
    
    async def handle_snooze(self, data):
        """Mettre une alerte en attente (snooze)"""
        alert_id = data.get('alert_id')
        minutes = data.get('minutes', 30)
        
        alert = await self._get_alert(alert_id)
        if not alert:
            await self.send_error("Alerte non trouvée")
            return
        
        await self._snooze_alert(alert, minutes)
        
        await self.send_success(f"Alerte en attente pour {minutes} minutes")
    
    async def handle_read(self, data):
        """Marquer une alerte comme lue"""
        alert_id = data.get('alert_id')
        
        alert = await self._get_alert(alert_id)
        if not alert:
            await self.send_error("Alerte non trouvée")
            return
        
        await self._mark_alert_read(alert, self.user)
        await self.send_success("Alerte marquée comme lue")
    
    async def handle_mark_all_read(self):
        """Marquer toutes les alertes comme lues"""
        await self._mark_all_alerts_read(self.user)
        await self.send_success("Toutes les alertes marquées comme lues")
    
    async def handle_filter(self, data):
        """Appliquer des filtres et renvoyer les alertes"""
        filters = data.get('filters', {})
        alerts = await self._get_filtered_alerts(filters)
        
        await self.send_filtered_alerts(alerts)
    
    async def handle_update_preferences(self, data):
        """Mettre à jour les préférences de notification"""
        preferences = data.get('preferences', {})
        
        await self._update_user_preferences(preferences)
        await self.send_success("Préférences mises à jour")
    
    # ============ SENDERS (Événements) ============
    
    async def alert_notification(self, event):
        """Recevoir une nouvelle alerte du groupe"""
        alert = event['alert']
        
        # Vérifier si l'utilisateur doit recevoir cette alerte
        should_receive = await self._should_receive_alert(alert)
        
        if should_receive:
            await self.send_alert({
                'type': 'alert_notification',
                'alert': alert,
                'timestamp': timezone.now().isoformat()
            })
    
    async def alert_dismissed(self, event):
        """Notification de rejet d'alerte"""
        await self.send_json({
            'type': 'alert_dismissed',
            'alert_id': event['alert_id']
        })
    
    # ============ HELPERS BD ============
    
    @database_sync_to_async
    def _get_alert(self, alert_id):
        """Récupérer une alerte"""
        try:
            return Alert.objects.get(id=alert_id)
        except Alert.DoesNotExist:
            return None
    
    @database_sync_to_async
    def _dismiss_alert(self, alert, user):
        """Rejeter une alerte"""
        alert.is_dismissed = True
        alert.dismissed_at = timezone.now()
        alert.dismissed_by = user
        alert.status = 'DISMISSED'
        alert.save()
    
    @database_sync_to_async
    def _snooze_alert(self, alert, minutes):
        """Mettre une alerte en attente"""
        alert.snoozed_until = timezone.now() + timedelta(minutes=minutes)
        alert.status = 'SNOOZED'
        alert.save()
    
    @database_sync_to_async
    def _mark_alert_read(self, alert, user):
        """Marquer une alerte comme lue"""
        alert.mark_as_read(user)
    
    @database_sync_to_async
    def _mark_all_alerts_read(self, user):
        """Marquer toutes les alertes comme lues"""
        alerts = Alert.objects.filter(
            status='NEW',
            is_dismissed=False
        )
        for alert in alerts:
            alert.mark_as_read(user)
    
    @database_sync_to_async
    def _get_filtered_alerts(self, filters):
        """Récupérer les alertes filtrées"""
        queryset = Alert.objects.filter(
            is_dismissed=False,
            status__in=['NEW', 'IN_PROGRESS']
        ).order_by('-priority_order', '-generated_at')[:50]
        
        # Appliquer les filtres
        if 'category' in filters and filters['category']:
            queryset = queryset.filter(category=filters['category'])
        
        if 'severity' in filters and filters['severity']:
            queryset = queryset.filter(severity__in=filters['severity'])
        
        if 'alert_type' in filters and filters['alert_type']:
            queryset = queryset.filter(alert_type=filters['alert_type'])
        
        if 'site_id' in filters and filters['site_id']:
            queryset = queryset.filter(site_id=filters['site_id'])
        
        # Convertir en dictionnaires
        return [
            {
                'id': alert.id,
                'title': alert.title,
                'message': alert.message,
                'category': alert.category,
                'severity': alert.severity,
                'alert_type': alert.alert_type,
                'priority_order': alert.priority_order,
                'generated_at': alert.generated_at.isoformat(),
                'status': alert.status,
            }
            for alert in queryset
        ]
    
    @database_sync_to_async
    def _should_receive_alert(self, alert):
        """Vérifier si l'utilisateur doit recevoir l'alerte"""
        try:
            prefs = UserNotificationPreferences.objects.get(user=self.user)
            return prefs.should_receive_alert(alert)
        except UserNotificationPreferences.DoesNotExist:
            # Par défaut, recevoir toutes les alertes
            return True
    
    @database_sync_to_async
    def _update_user_preferences(self, preferences_data):
        """Mettre à jour les préférences utilisateur"""
        prefs, created = UserNotificationPreferences.objects.get_or_create(
            user=self.user
        )
        
        for key, value in preferences_data.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)
        
        prefs.save()
    
    @database_sync_to_async
    def _get_user_preferences(self):
        """Récupérer les préférences utilisateur"""
        try:
            prefs = UserNotificationPreferences.objects.get(user=self.user)
            return {
                'enabled_categories': prefs.enabled_categories,
                'enabled_severity_levels': prefs.enabled_severity_levels,
                'enabled_alert_types': prefs.enabled_alert_types,
                'max_alerts_per_hour': prefs.max_alerts_per_hour,
                'max_alerts_per_day': prefs.max_alerts_per_day,
                'group_by_category': prefs.group_by_category,
                'group_by_site': prefs.group_by_site,
                'default_snooze_minutes': prefs.default_snooze_minutes,
                'alerts_per_page': prefs.alerts_per_page,
            }
        except UserNotificationPreferences.DoesNotExist:
            return {
                'enabled_categories': [],
                'enabled_severity_levels': ['HIGH', 'CRITICAL'],
                'enabled_alert_types': [],
                'max_alerts_per_hour': 100,
                'max_alerts_per_day': 500,
                'group_by_category': True,
                'group_by_site': True,
                'default_snooze_minutes': 30,
                'alerts_per_page': 20,
            }
    
    async def send_initial_alerts(self):
        """Envoyer les alertes existantes non lues"""
        alerts = await self._get_filtered_alerts({})
        await self.send_filtered_alerts(alerts)
    
    # ============ ENVOI DE MESSAGES ============
    
    async def send_alert(self, data):
        """Envoyer une alerte"""
        await self.send_json(data)
    
    async def send_filtered_alerts(self, alerts):
        """Envoyer les alertes filtrées"""
        await self.send_json({
            'type': 'alerts_list',
            'alerts': alerts,
            'count': len(alerts)
        })
    
    async def send_preferences(self):
        """Envoyer les préférences"""
        prefs = await self._get_user_preferences()
        await self.send_json({
            'type': 'preferences',
            'preferences': prefs
        })
    
    async def send_success(self, message):
        """Envoyer un message de succès"""
        await self.send_json({
            'type': 'success',
            'message': message
        })
    
    async def send_error(self, message):
        """Envoyer un message d'erreur"""
        await self.send_json({
            'type': 'error',
            'message': message
        })
