from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.core.files.base import ContentFile
from io import BytesIO
from .models import Report
from .serializers import ReportSerializer, ReportListSerializer
from accounts.permissions import CanManageReports
from accounts.mixins import SiteScopedMixin


class ReportViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des rapports
    
    Permissions:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Validation des rapports du site
    - SUPERVISOR: Création + lecture
    - ANALYST: Création rapports d'analyse
    - OPERATOR / MMG: Lecture seule
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
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
        """
        Logique de création:
        - OPERATOR: Rapport créé avec statut PENDING_APPROVAL (nécessite validation par SUPERVISOR/SITE_MANAGER)
        - Autres rôles (ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST): Rapport créé directement en DRAFT (pas d'approbation requise)
        """
        if self.request.user.role == 'OPERATOR':
            serializer.save(generated_by=self.request.user, status=Report.ReportStatus.PENDING_APPROVAL)
        else:
            serializer.save(generated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Générer un PDF pour le rapport
        
        Seuls ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST peuvent générer.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'ANALYST']:
            return Response(
                {'error': 'Permission insuffisante pour générer un rapport.'},
                status=status.HTTP_403_FORBIDDEN
            )
        report = self.get_object()

        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
        except ImportError:
            return Response(
                {"error": "Dépendance reportlab manquante"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        y = height - 50
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, y, report.title)
        y -= 30

        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Type: {report.get_report_type_display()}")
        y -= 15
        pdf.drawString(50, y, f"Période: {report.period_start} -> {report.period_end}")
        y -= 20

        if report.site:
            pdf.drawString(50, y, f"Site: {report.site.name}")
            y -= 20

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Résumé")
        y -= 15
        pdf.setFont("Helvetica", 10)
        for line in (report.summary or "").splitlines():
            pdf.drawString(50, y, line[:100])
            y -= 12
            if y < 80:
                pdf.showPage()
                y = height - 50

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Contenu")
        y -= 15
        pdf.setFont("Helvetica", 10)
        for line in (report.content or "").splitlines():
            pdf.drawString(50, y, line[:100])
            y -= 12
            if y < 80:
                pdf.showPage()
                y = height - 50

        pdf.save()
        buffer.seek(0)

        filename = f"report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M')}.pdf"
        report.file.save(filename, ContentFile(buffer.read()), save=False)
        report.status = Report.ReportStatus.GENERATED
        report.save(update_fields=['file', 'status', 'updated_at'])

        return Response(ReportSerializer(report).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approuver un rapport créé par un OPERATOR.
        Seuls SITE_MANAGER, SUPERVISOR peuvent approuver.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']:
            return Response(
                {'error': 'Seuls les gestionnaires peuvent approuver des rapports.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        report = self.get_object()
        
        if report.status != Report.ReportStatus.PENDING_APPROVAL:
            return Response(
                {'error': 'Ce rapport n\'est pas en attente d\'approbation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = Report.ReportStatus.VALIDATED
        report.validated_by = request.user
        report.save(update_fields=['status', 'validated_by', 'updated_at'])
        
        return Response(ReportSerializer(report).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Rejeter un rapport créé par un OPERATOR.
        Seuls SITE_MANAGER, SUPERVISOR peuvent rejeter.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']:
            return Response(
                {'error': 'Seuls les gestionnaires peuvent rejeter des rapports.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        report = self.get_object()
        
        if report.status != Report.ReportStatus.PENDING_APPROVAL:
            return Response(
                {'error': 'Ce rapport n\'est pas en attente d\'approbation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = Report.ReportStatus.DRAFT
        report.save(update_fields=['status', 'updated_at'])
        
        return Response(ReportSerializer(report).data)

    @action(detail=True, methods=['post'])
    def generate_excel(self, request, pk=None):
        """Générer un fichier Excel pour le rapport
        
        Seuls ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST peuvent générer.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'ANALYST']:
            return Response(
                {'error': 'Permission insuffisante pour générer un rapport.'},
                status=status.HTTP_403_FORBIDDEN
            )
        report = self.get_object()

        try:
            import openpyxl
        except ImportError:
            return Response(
                {"error": "Dépendance openpyxl manquante"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Rapport"

        ws.append(["Titre", report.title])
        ws.append(["Type", report.get_report_type_display()])
        ws.append(["Période", f"{report.period_start} -> {report.period_end}"])
        ws.append(["Site", report.site.name if report.site else "-"])
        ws.append([])
        ws.append(["Résumé"])
        for line in (report.summary or "").splitlines():
            ws.append([line])
        ws.append([])
        ws.append(["Contenu"])
        for line in (report.content or "").splitlines():
            ws.append([line])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        filename = f"report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M')}.xlsx"
        report.file.save(filename, ContentFile(output.read()), save=False)
        report.status = Report.ReportStatus.GENERATED
        report.save(update_fields=['file', 'status', 'updated_at'])

        return Response(ReportSerializer(report).data)
