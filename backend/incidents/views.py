from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Incident, IncidentPhoto, IncidentFollowUp
from .serializers import (
    IncidentSerializer, IncidentListSerializer,
    IncidentPhotoSerializer, IncidentFollowUpSerializer
)
from accounts.permissions import CanManageIncidents
from accounts.mixins import SiteScopedMixin


class IncidentViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des incidents

    Permissions:
    - ADMIN: Configuration système
    - SITE_MANAGER: Déclaration, gestion, clôture (premier responsable légal)
    - TECHNICIEN (ingénieur terrain): Signalement (création + lecture)
    - ANALYST: Lecture + analyse post-incident
    - MMG: Lecture seule, audit incidents majeurs
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = Incident.objects.select_related(
        'site', 'reported_by', 'investigated_by', 'closed_by'
    ).prefetch_related('photos', 'follow_ups', 'personnel_involved', 'equipment_involved').all()
    permission_classes = [permissions.IsAuthenticated, CanManageIncidents]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['incident_type', 'severity', 'status', 'site', 'date']
    search_fields = ['incident_code', 'description']
    ordering_fields = ['date', 'severity', 'created_at']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return IncidentListSerializer
        return IncidentSerializer
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    @action(detail=True, methods=['post'])
    def send_alert(self, request, pk=None):
        """Envoyer une alerte pour l'incident"""
        if request.user.role not in ['ADMIN', 'SITE_MANAGER']:
            return Response(
                {'error': 'Permission insuffisante pour envoyer une alerte.'},
                status=status.HTTP_403_FORBIDDEN
            )
        incident = self.get_object()
        incident.send_alert()
        return Response({"message": "Alerte envoyée"})

    @action(detail=True, methods=['post'])
    def add_photo(self, request, pk=None):
        """Ajouter une photo à l'incident"""
        incident = self.get_object()
        photo_data = {
            'incident': incident.id,
            'photo': request.FILES.get('photo'),
            'caption': request.data.get('caption', ''),
        }
        taken_at = request.data.get('taken_at')
        if taken_at:
            photo_data['taken_at'] = taken_at
        serializer = IncidentPhotoSerializer(data=photo_data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_follow_up(self, request, pk=None):
        """Ajouter un suivi d'incident"""
        incident = self.get_object()
        data = request.data.copy()
        data['incident'] = incident.id
        serializer = IncidentFollowUpSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Clôturer un incident
        
        Seuls ADMIN et SITE_MANAGER (premier responsable légal) peuvent clôturer.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER']:
            return Response(
                {'error': 'Seuls les administrateurs et responsables de site peuvent clôturer les incidents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        incident = self.get_object()
        incident.close(user=request.user)
        return Response({"message": "Incident clôturé"})
