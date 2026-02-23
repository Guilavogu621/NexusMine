import os
import django
import asyncio
import websockets
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nexus_backend.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.filter(is_active=True).first()

refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

async def test_websocket():
    url = f"ws://localhost:8001/ws/notifications/?token={access_token}"
    print(f"Connecting to {url} as {user.email}")
    try:
        async with websockets.connect(url) as ws:
            print("Connected.")
            await asyncio.sleep(1)
            msg = await ws.recv()
            print("Received:", msg[:200])
    except Exception as e:
        print("WebSocket Error:", e)

asyncio.run(test_websocket())
