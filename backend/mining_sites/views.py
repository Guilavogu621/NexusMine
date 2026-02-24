from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import MiningSite, DistributedNode
from .serializers import MiningSiteSerializer, MiningSiteListSerializer, DistributedNodeSerializer
from accounts.permissions import CanManageSites, IsAdmin
from accounts.mixins import SiteScopedMixin
from accounts.serializers import UserSerializer

User = get_user_model()


class MiningSiteViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des sites miniers

    Permissions:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Peut modifier son site assigné (autorité locale)
    - TECHNICIEN (ingénieur terrain): Lecture + mise à jour limitée
    - OWNER: Lecture multi-sites
    - Autres: Lecture des sites assignés uniquement
    """
    # Pour MiningSite, le filtre porte sur 'id' directement (pas un FK 'site')
    site_field = 'id'
    queryset = MiningSite.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanManageSites]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['site_type', 'status']
    search_fields = ['name', 'location']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        from django.db.models import Count, Q
        qs = super().get_queryset()
        qs = qs.annotate(
            personnel_count=Count('personnel', distinct=True),
            equipment_count=Count('equipment', distinct=True),
            incidents_count=Count(
                'incidents', 
                filter=Q(incidents__status__in=['REPORTED', 'INVESTIGATING', 'ACTION_REQUIRED']), 
                distinct=True
            )
        )
        return qs
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MiningSiteListSerializer
        return MiningSiteSerializer

    @action(detail=True, methods=['get'], url_path='assigned-users')
    def assigned_users(self, request, pk=None):
        """Récupère la liste des utilisateurs assignés à ce site"""
        site = self.get_object()
        users = User.objects.filter(assigned_sites=site)
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='assign-users')
    def assign_users(self, request, pk=None):
        """Assigne des utilisateurs à ce site (ADMIN uniquement)"""
        if request.user.role != 'ADMIN':
            return Response(
                {'detail': 'Seul l\'administrateur peut assigner des utilisateurs aux sites.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        site = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not isinstance(user_ids, list):
            return Response(
                {'detail': 'user_ids doit être une liste d\'IDs.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        users = User.objects.filter(id__in=user_ids)
        for user in users:
            user.assigned_sites.add(site)
        
        # Retourner la liste mise à jour
        all_assigned = User.objects.filter(assigned_sites=site)
        serializer = UserSerializer(all_assigned, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='remove-user')
    def remove_user(self, request, pk=None):
        """Retire un utilisateur de ce site (ADMIN uniquement)"""
        if request.user.role != 'ADMIN':
            return Response(
                {'detail': 'Seul l\'administrateur peut retirer des utilisateurs des sites.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        site = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'detail': 'user_id est requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            user = User.objects.get(id=user_id)
            user.assigned_sites.remove(site)
            return Response({'detail': f'{user.email} retiré du site.'})
        except User.DoesNotExist:
            return Response(
                {'detail': 'Utilisateur non trouvé.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class DistributedNodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Vue pour monitorer l'état de l'architecture IA distribuée.
    ReadOnly à ce stade pour simulation.
    """
    site_field = 'site'
    queryset = DistributedNode.objects.all()
    serializer_class = DistributedNodeSerializer
    permission_classes = [permissions.IsAuthenticated]
