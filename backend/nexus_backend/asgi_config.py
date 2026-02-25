"""
backend/nexus_backend/asgi_config.py - Configuration ASGI pour Django Channels
"""

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.urls import path, re_path

# Import du consumer de notifications
from alerts.consumers import NotificationConsumer

# Websocket URL patterns
websocket_urlpatterns = [
    path('ws/notifications/', NotificationConsumer.as_asgi()),
]
