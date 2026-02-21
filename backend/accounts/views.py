from rest_framework import viewsets, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer, ProfileUpdateSerializer, PasswordChangeSerializer
from .permissions import CanManageUsers, IsAdmin

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    pagination_class = PageNumberPagination
    """ViewSet pour la gestion des utilisateurs"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        
        # Filtrage par recherche texte (nom, prénom, email)
        search = self.request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Filtrage par rôle
        role = self.request.query_params.get('role', '').strip()
        if role:
            qs = qs.filter(role=role)
        
        # Filtrage par statut actif/inactif
        is_active = self.request.query_params.get('is_active', '').strip()
        if is_active != '':
            qs = qs.filter(is_active=is_active.lower() in ('true', '1'))
        
        return qs
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action == 'update_profile':
            return ProfileUpdateSerializer
        if self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer
    
    def get_permissions(self):
        # Inscription publique désactivée - seul l'admin crée des utilisateurs
        if self.action in ['me', 'update_profile', 'change_password', 'upload_photo']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageUsers()]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retourne l'utilisateur connecté"""
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], url_path='update-profile')
    def update_profile(self, request):
        """Met à jour le profil de l'utilisateur connecté"""
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """Change le mot de passe de l'utilisateur connecté"""
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['current_password']):
                return Response(
                    {"current_password": "Mot de passe actuel incorrect."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Mot de passe modifié avec succès."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='upload-photo', parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request):
        """Upload la photo de profil"""
        if 'profile_photo' not in request.FILES:
            return Response(
                {"error": "Aucune photo fournie."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        # Supprimer l'ancienne photo si elle existe
        if user.profile_photo:
            user.profile_photo.delete(save=False)
        
        user.profile_photo = request.FILES['profile_photo']
        user.save()
        
        return Response(UserSerializer(user, context={'request': request}).data)
