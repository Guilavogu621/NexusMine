"""
Vues pour la réinitialisation de mot de passe.

Flux :
  1. POST /api/password-reset/          → envoie un code à 6 chiffres par email
  2. POST /api/password-reset/confirm/  → valide le code + définit le nouveau mdp
"""
import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

User = get_user_model()


# --------------- stockage léger en mémoire (suffisant pour MVP) ---------------
_reset_codes = {}  # { email: { code, expires_at } }


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField(min_length=8)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return data


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Envoie un code de réinitialisation à l'email fourni."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email'].lower()

    # Toujours répondre 200 pour éviter l'énumération d'emails
    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response(
            {"message": "Si un compte existe avec cet email, un code de réinitialisation a été envoyé."},
            status=status.HTTP_200_OK,
        )

    code = str(random.randint(100000, 999999))
    _reset_codes[email] = {
        'code': code,
        'expires_at': timezone.now() + timedelta(minutes=15),
    }

    # Envoi email
    try:
        send_mail(
            subject='NexusMine — Code de réinitialisation',
            message=(
                f"Bonjour {user.first_name},\n\n"
                f"Votre code de réinitialisation est : {code}\n\n"
                f"Ce code expire dans 15 minutes.\n\n"
                f"Si vous n'avez pas demandé la réinitialisation, ignorez cet email.\n\n"
                f"— NexusMine"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        # En dev, on imprime le code dans la console Django
        print(f"[PASSWORD RESET] Code pour {email} : {code}  (erreur envoi : {exc})")

    return Response(
        {"message": "Si un compte existe avec cet email, un code de réinitialisation a été envoyé."},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Vérifie le code et définit le nouveau mot de passe."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email'].lower()
    code = serializer.validated_data['code']
    new_password = serializer.validated_data['new_password']

    entry = _reset_codes.get(email)
    if not entry or entry['code'] != code:
        return Response(
            {"detail": "Code invalide ou expiré."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if timezone.now() > entry['expires_at']:
        _reset_codes.pop(email, None)
        return Response(
            {"detail": "Le code a expiré. Veuillez en demander un nouveau."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    _reset_codes.pop(email, None)

    return Response({"message": "Mot de passe réinitialisé avec succès."}, status=status.HTTP_200_OK)
