from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Report
from .serializers import ReportSerializer, ReportListSerializer
from accounts.permissions import CanManageReports


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des rapports
    
    Permissions:
    - ADMIN: CRUD complet
    - SUPERVISOR/ANALYST: Créer et lire
    - OPERATOR/REGULATOR: Lecture seule
    """
    queryset = Report.objects.select_related('site', 'generated_by', 'validated_by').all()
    permission_classes = [permissions.IsAuthenticated, CanManageReports]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'status', 'site']
    search_fields = ['title', 'content', 'summary']
    ordering_fields = ['created_at', 'period_start']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        return ReportSerializer
    
    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
