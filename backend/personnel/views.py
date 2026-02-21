from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Personnel
from .serializers import PersonnelSerializer, PersonnelListSerializer
from accounts.permissions import CanManagePersonnel, IsAdmin
from accounts.mixins import SiteScopedMixin


class PersonnelViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion du personnel

    Permissions:
    - ADMIN: CRUD complet + approbation/refus
    - SITE_MANAGER: CRUD sur le personnel de son site
    - TECHNICIEN (ingénieur terrain): CRUD sur le personnel de ses sites assignés
    - Autres: Lecture seule
    Filtrage: Données filtrées par sites assignés de l'utilisateur
    """
    site_field = 'site'
    queryset = Personnel.objects.select_related('site', 'submitted_by', 'approved_by').all()
    permission_classes = [permissions.IsAuthenticated, CanManagePersonnel]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'site', 'position', 'approval_status', 'role']
    search_fields = ['employee_id', 'first_name', 'last_name', 'position']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PersonnelListSerializer
        return PersonnelSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        """Le créateur est enregistré comme submitted_by, statut = PENDING"""
        user = self.request.user
        # ADMIN crée directement en APPROVED
        if user.role == 'ADMIN':
            serializer.save(
                submitted_by=user,
                approved_by=user,
                approval_status='APPROVED',
                approval_date=timezone.now(),
            )
        else:
            serializer.save(submitted_by=user, approval_status='PENDING')

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """ADMIN approuve un personnel en attente"""
        if request.user.role != 'ADMIN':
            return Response(
                {'detail': 'Seul l\'administrateur peut approuver le personnel.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        personnel = self.get_object()
        if personnel.approval_status != 'PENDING':
            return Response(
                {'detail': f'Ce personnel est déjà {personnel.get_approval_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        personnel.approval_status = 'APPROVED'
        personnel.approved_by = request.user
        personnel.approval_date = timezone.now()
        personnel.rejection_reason = ''
        personnel.save()
        return Response(PersonnelSerializer(personnel).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """ADMIN refuse un personnel en attente"""
        if request.user.role != 'ADMIN':
            return Response(
                {'detail': 'Seul l\'administrateur peut refuser le personnel.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        personnel = self.get_object()
        if personnel.approval_status != 'PENDING':
            return Response(
                {'detail': f'Ce personnel est déjà {personnel.get_approval_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reason = request.data.get('reason', '')
        personnel.approval_status = 'REJECTED'
        personnel.approved_by = request.user
        personnel.approval_date = timezone.now()
        personnel.rejection_reason = reason
        personnel.save()
        return Response(PersonnelSerializer(personnel, context={'request': request}).data)

    @action(detail=True, methods=['post'], url_path='upload-photo',
            parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload ou remplacer la photo d'un personnel"""
        personnel = self.get_object()
        if 'photo' not in request.FILES:
            return Response(
                {'error': 'Aucune photo fournie.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if personnel.photo:
            personnel.photo.delete(save=False)
        personnel.photo = request.FILES['photo']
        personnel.save()
        return Response(
            PersonnelSerializer(personnel, context={'request': request}).data
        )
