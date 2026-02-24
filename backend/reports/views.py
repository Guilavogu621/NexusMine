from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.core.files.base import ContentFile
from django.http import FileResponse
from io import BytesIO
from .models import Report
from .serializers import ReportSerializer, ReportListSerializer
from accounts.permissions import CanManageReports
from accounts.mixins import SiteScopedMixin
from nexus_backend.pdf_export import PDFExportMixin


class ReportViewSet(PDFExportMixin, SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des rapports

    Permissions:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Validation des rapports du site
    - TECHNICIEN (ingénieur terrain): Création + lecture
    - ANALYST: Création rapports d'analyse
    - MMG: Lecture seule
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
    
    def get_permissions(self):
        """Allow public access to verification endpoint AND pdf download."""
        if self.action in ['verify', 'export_pdf']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """
        Logique de création:
        - TECHNICIEN (ingénieur terrain): Rapport créé avec statut PENDING_APPROVAL (nécessite validation par SITE_MANAGER)
        - Autres rôles (ADMIN, SITE_MANAGER, ANALYST): Rapport créé directement en DRAFT (pas d'approbation requise)
        """
        if self.request.user.role == 'TECHNICIEN':
            serializer.save(generated_by=self.request.user, status=Report.ReportStatus.PENDING_APPROVAL)
        else:
            serializer.save(generated_by=self.request.user)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Exporter en PDF avec vérification du statut"""
        report = self.get_object()
        if report.status == Report.ReportStatus.PENDING_APPROVAL:
            return Response(
                {'error': 'Ce rapport doit être approuvé par un gestionnaire avant d\'être généré.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().export_pdf(request, pk=pk)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Générer un PDF premium avec QR Code pour le rapport"""
        report = self.get_object()
        
        # Sécurité : Un rapport en attente d'approbation ne peut pas être généré
        if report.status == Report.ReportStatus.PENDING_APPROVAL:
            return Response(
                {'error': 'Ce rapport doit être approuvé par un gestionnaire avant d\'être généré.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Utiliser la logique de PDFExportMixin pour générer le contenu
        response = self.export_pdf(request, pk=pk)
        
        if isinstance(response, FileResponse):
            # Sauvegarder le PDF généré dans le champ file du modèle
            # On doit collecter tout le contenu du streaming_content
            full_content = b"".join(response.streaming_content)
            
            filename = f"report_{report.id}_{timezone.now().strftime('%Y%m%d_%H%M')}.pdf"
            report.file.save(filename, ContentFile(full_content), save=False)
            report.status = Report.ReportStatus.GENERATED
            report.save(update_fields=['file', 'status', 'updated_at'])
            
            return Response(ReportSerializer(report).data)
        
        return response

    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """Web view for report verification via QR Code"""
        from django.http import HttpResponse
        report = self.get_object()
        
        status_color = "#10B981" if report.status in ['VALIDATED', 'PUBLISHED', 'GENERATED'] else "#F59E0B"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Verification Rapport NexusMine</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; color: #1e293b; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 25px; margin-bottom: 25px; }}
                h1 {{ color: #4F46E5; margin: 0 0 15px 0; font-size: 28px; font-weight: 900; }}
                .badge {{ display: inline-block; background-color: {status_color}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 10px; }}
                .description {{ color: #64748b; font-size: 14px; margin-top: 10px; }}
                .grid {{ display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 30px; }}
                .info-item {{ background: #f1f5f9; padding: 15px; border-radius: 10px; }}
                .info-label {{ font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }}
                .info-value {{ font-size: 15px; margin-top: 5px; font-weight: 600; color: #0f172a; }}
                .btn {{ display: block; width: 100%; box-sizing: border-box; text-align: center; background: #4F46E5; color: white; padding: 16px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; transition: background 0.3s; }}
                .btn:hover {{ background: #4338ca; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>NEXUSMINE</h1>
                    <div class="badge">✓ Document Certifié et Authentique</div>
                    <p class="description">Ce document a été généré via le système de traçabilité NexusMine.</p>
                </div>
                
                <div class="grid">
                    <div class="info-item">
                        <div class="info-label">Référence du Rapport</div>
                        <div class="info-value">#{report.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Titre</div>
                        <div class="info-value">{report.title}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Type de Rapport</div>
                        <div class="info-value">{report.get_report_type_display()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut Actuel</div>
                        <div class="info-value">{report.get_status_display()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Site concerné</div>
                        <div class="info-value">{report.site.name if report.site else 'Tous sites'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Auteur (Email)</div>
                        <div class="info-value">{report.generated_by.email if report.generated_by else 'Système'}</div>
                    </div>
                </div>
                
                <a href="/api/reports/{report.id}/export_pdf/" class="btn">Télécharger le Document (PDF)</a>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approuver un rapport créé par un TECHNICIEN (ingénieur terrain).
        Seul SITE_MANAGER peut approuver.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER']:
            return Response(
                {'error': 'Seuls les responsables de site peuvent approuver des rapports.'},
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
        Rejeter un rapport créé par un TECHNICIEN (ingénieur terrain).
        Seul SITE_MANAGER peut rejeter.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER']:
            return Response(
                {'error': 'Seuls les responsables de site peuvent rejeter des rapports.'},
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
        """Générer un fichier Excel pour le rapport"""
        report = self.get_object()

        # Sécurité : Un rapport en attente d'approbation ne peut pas être généré
        if report.status == Report.ReportStatus.PENDING_APPROVAL:
            return Response(
                {'error': 'Ce rapport doit être approuvé par un gestionnaire avant d\'être généré.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'ANALYST']:
            return Response(
                {'error': 'Permission insuffisante pour générer un rapport.'},
                status=status.HTTP_403_FORBIDDEN
            )

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
