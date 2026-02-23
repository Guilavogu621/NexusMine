import os
import django
import urllib.request
import json
from urllib.error import HTTPError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nexus_backend.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.filter(is_active=True).first()

refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f"--- TEST /api/reports/2/generate_pdf/ on port 8000 as {user.email} ---")
req = urllib.request.Request(
    'http://localhost:8000/api/reports/2/generate_pdf/',
    data=b"",
    headers={'Authorization': f'Bearer {access_token}', 'Origin': 'http://localhost:5173', 'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as r:
        print("Status code:", r.getcode())
        print(r.read()[:200])
except HTTPError as e:
    print("Status code:", e.code)
    if e.code == 500:
        import re
        html = e.read().decode('utf-8', errors='ignore')
        match = re.search(r'<div id="summary">.*?<h1>(.*?)</h1>.*?<pre class="exception_value">(.*?)</pre>', html, re.DOTALL)
        if match:
            print("EXCEPTION:", match.group(1).strip())
            print("MESSAGE:", match.group(2).strip())
        else:
            print("Raw Content:", html[:500])
            print("COULD NOT PARSE HTML EXCEPTION")
    else:
        print(e.read().decode('utf-8', errors='ignore')[:500])
