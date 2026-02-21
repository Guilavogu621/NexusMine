from io import BytesIO
from datetime import datetime
from django.http import FileResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.text import slugify
from accounts.audit import AuditLog
from django.contrib.contenttypes.models import ContentType

class PDFExportMixin:
    """Mixin pour exporter les données en PDF avec audit trail"""

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """
        Exporte l'objet et son audit trail complet en PDF
        """
        obj = self.get_object()
        
        # Créer le buffer PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=30,
            fontName='Helvetica-Bold',
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold',
        )
        
        # Titre principal
        model_name = obj.__class__.__name__
        elements.append(Paragraph(f"Rapport {model_name}", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Métadonnées document
        metadata = [
            [Paragraph("<b>Propriété</b>", styles['Normal']), Paragraph("<b>Valeur</b>", styles['Normal'])],
            ["Date d'export", datetime.now().strftime('%d/%m/%Y %H:%M:%S')],
            ["Exporté par", request.user.email],
            ["Modèle", model_name],
            ["ID", str(obj.id)],
        ]
        
        metadata_table = Table(metadata, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        
        elements.append(metadata_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Données de l'objet
        elements.append(Paragraph("Détails de l'objet", heading_style))
        
        # Sérialiser les données de l'objet
        serializer = self.get_serializer(obj)
        obj_data = serializer.data
        
        if isinstance(obj_data, dict):
            obj_rows = [
                [Paragraph("<b>Champ</b>", styles['Normal']), Paragraph("<b>Valeur</b>", styles['Normal'])]
            ]
            
            for key, value in obj_data.items():
                if key not in ['id', 'created_at', 'updated_at']:
                    # Formater la valeur
                    if isinstance(value, (dict, list)):
                        value_str = str(value)[:100]
                    else:
                        value_str = str(value) if value else "—"
                    
                    obj_rows.append([
                        Paragraph(str(key).replace('_', ' ').title(), styles['Normal']),
                        Paragraph(value_str, styles['Normal'])
                    ])
            
            obj_table = Table(obj_rows, colWidths=[2*inch, 4*inch])
            obj_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            
            elements.append(obj_table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Audit trail
        elements.append(PageBreak())
        elements.append(Paragraph("Historique d'audit", heading_style))
        
        # Récupérer l'audit trail
        content_type = ContentType.objects.get_for_model(obj.__class__)
        audit_logs = AuditLog.objects.filter(
            content_type=content_type,
            object_id=obj.id
        ).order_by('-timestamp')
        
        if audit_logs.exists():
            audit_rows = [
                [
                    Paragraph("<b>Date/Heure</b>", styles['Normal']),
                    Paragraph("<b>Utilisateur</b>", styles['Normal']),
                    Paragraph("<b>Action</b>", styles['Normal']),
                    Paragraph("<b>Détails</b>", styles['Normal']),
                ]
            ]
            
            for log in audit_logs[:50]:  # Limiter à 50 derniers logs
                details = f"{log.field_changed or 'N/A'}"
                if log.old_value is not None and log.new_value is not None:
                    details += f"\n{log.old_value} → {log.new_value}"
                
                audit_rows.append([
                    datetime.fromisoformat(log.timestamp.isoformat()).strftime('%d/%m/%Y %H:%M'),
                    log.user.email[:20],
                    log.get_action_display(),
                    details[:100],
                ])
            
            audit_table = Table(audit_rows, colWidths=[1.2*inch, 1.2*inch, 1*inch, 2.6*inch])
            audit_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            
            elements.append(audit_table)
        else:
            elements.append(Paragraph("Aucun enregistrement d'audit disponible", styles['Normal']))
        
        # Horodatage officiel
        elements.append(Spacer(1, 0.3*inch))
        timestamp = datetime.now().strftime('%d/%m/%Y à %H:%M:%S UTC')
        elements.append(Paragraph(
            f"<i>Document généré le {timestamp} | Certification numérique: MMG</i>",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
        ))
        
        # Construire le PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Retourner le fichier
        filename = f"{slugify(model_name)}-{obj.id}-{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        return FileResponse(buffer, as_attachment=True, filename=filename)
