from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserCreateSerializer
from .permissions import CanManageUsers, IsAdmin

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des utilisateurs"""
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        # Inscription publique désactivée - seul l'admin crée des utilisateurs
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), CanManageUsers()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retourne l'utilisateur connecté"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
