from io import BytesIO
import qrcode
from datetime import datetime
from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib import colors
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.text import slugify
from accounts.audit import AuditLog
from django.contrib.contenttypes.models import ContentType

class PDFExportMixin:
    """Mixin pour exporter les données en PDF avec audit trail et QR Code"""

    def _get_qr_code(self, data, size=1.5*inch):
        """Génère un QR code pour le PDF"""
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        return Image(img_buffer, width=size, height=size)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """
        Exporte l'objet et son audit trail complet en PDF avec design premium
        """
        obj = self.get_object()
        
        # Créer le buffer PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=50, leftMargin=50,
            topMargin=50, bottomMargin=50
        )
        elements = []
        
        # Couleurs Premium NexusMine
        PREMIUM_INDIGO = colors.HexColor('#4F46E5')
        PREMIUM_BLUE = colors.HexColor('#3B82F6')
        DARK_TEXT = colors.HexColor('#0F172A')
        LIGHT_TEXT = colors.HexColor('#64748B')
        BORDER_LIGHT = colors.HexColor('#E2E8F0')
        
        # Styles
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'PremiumTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=PREMIUM_INDIGO,
            spaceAfter=2,
            fontName='Helvetica-Bold',
        )
        
        subtitle_style = ParagraphStyle(
            'PremiumSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=LIGHT_TEXT,
            spaceAfter=20,
            fontName='Helvetica',
            letterSpacing=1
        )
        
        heading_style = ParagraphStyle(
            'PremiumHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=DARK_TEXT,
            spaceAfter=12,
            spaceBefore=18,
            fontName='Helvetica-Bold',
            borderPadding=(5, 5, 5, 5),
            leftIndent=0,
        )

        label_style = ParagraphStyle(
            'LabelStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=LIGHT_TEXT,
            fontName='Helvetica-Bold',
        )

        value_style = ParagraphStyle(
            'ValueStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=DARK_TEXT,
        )
        
        # --- HEADER SECTION ---
        # Logo placeholder or Icon as text
        elements.append(Paragraph("NEXUSMINE", ParagraphStyle('Logo', fontSize=14, fontName='Helvetica-Bold', textColor=PREMIUM_INDIGO)))
        elements.append(Spacer(1, 0.2*inch))
        
        model_name = obj.__class__.__name__
        title_text = f"RAPPORT {model_name.upper()}"
        if hasattr(obj, 'report_type'):
            title_text = obj.title.upper()
            
        elements.append(Paragraph(title_text, title_style))
        elements.append(Paragraph(f"Généré le {datetime.now().strftime('%d %B %Y à %H:%M')}", subtitle_style))
        
        # HR
        elements.append(Table([['']], colWidths=[7.2*inch], style=[('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_LIGHT)]))
        elements.append(Spacer(1, 0.3*inch))

        # --- QR CODE & METADATA SECTION ---
        # QR Code deeply linked to mobile app or dashboard
        # Format: nexusmine://reports/{id}
        qr_data = f"https://nexusmine.app/reports/{obj.id}" 
        qr_img = self._get_qr_code(qr_data, size=1.2*inch)
        
        meta_table_data = [
            [Paragraph("<b>RÉFÉRENCE</b>", label_style), Paragraph(str(obj.id), value_style), qr_img],
            [Paragraph("<b>ÉMIS PAR</b>", label_style), Paragraph(request.user.get_full_name() or request.user.email, value_style), ''],
            [Paragraph("<b>STATUT</b>", label_style), Paragraph(getattr(obj, 'status', 'N/A'), value_style), ''],
            [Paragraph("<b>DATE D'ÉMISSION</b>", label_style), Paragraph(datetime.now().strftime('%d/%m/%Y'), value_style), ''],
        ]
        
        meta_table = Table(meta_table_data, colWidths=[1.5*inch, 3.5*inch, 1.5*inch])
        meta_table.setStyle(TableStyle([
            ('SPAN', (2, 0), (2, 3)),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 0.3*inch))

        # --- MAIN CONTENT ---
        elements.append(Paragraph("INFORMATIONS DÉTAILLÉES", heading_style))
        
        # Sérialiser les données de l'objet
        serializer = self.get_serializer(obj)
        obj_data = serializer.data
        
        if isinstance(obj_data, dict):
            obj_rows = []
            # Traduction des champs en français
            field_translations = {
                'title': 'TITRE DU RAPPORT',
                'report_type': 'TYPE DE RAPPORT',
                'report_type_display': 'TYPE (AFFICHAGE)',
                'status': 'STATUT',
                'status_display': 'STATUT (AFFICHAGE)',
                'site': 'ID SITE',
                'site_name': 'NOM DU SITE',
                'period_start': 'DÉBUT DE PÉRIODE',
                'period_end': 'FIN DE PÉRIODE',
                'generated_by': 'GÉNÉRÉ PAR (ID)',
                'generated_by_name': 'GÉNÉRÉ PAR',
                'validated_by': 'VALIDÉ PAR (ID)',
                'validated_by_name': 'VALIDÉ PAR',
            }

            # Corriger la date si inversée
            try:
                if 'period_start' in obj_data and 'period_end' in obj_data:
                    start_date = datetime.strptime(obj_data['period_start'], '%Y-%m-%d').date()
                    end_date = datetime.strptime(obj_data['period_end'], '%Y-%m-%d').date()
                    if start_date > end_date:
                        obj_data['period_start'], obj_data['period_end'] = obj_data['period_end'], obj_data['period_start']
            except (ValueError, TypeError):
                pass
                
            for key, value in obj_data.items():
                if key not in ['id', 'created_at', 'updated_at', 'file', 'content', 'summary', 'site', 'generated_by', 'validated_by', 'report_type', 'status']:
                    if value and value != "":
                        french_key = field_translations.get(key, str(key).replace('_', ' ').upper())
                        obj_rows.append([
                            Paragraph(french_key, label_style),
                            Paragraph(str(value), value_style)
                        ])
            
            obj_table = Table(obj_rows, colWidths=[2.5*inch, 4.5*inch])
            obj_table.setStyle(TableStyle([
                ('LINEBELOW', (0, 0), (-1, -1), 0.25, BORDER_LIGHT),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(obj_table)

        # Content/Summary specific fields
        if hasattr(obj, 'summary') and obj.summary:
            elements.append(Paragraph("RÉSUMÉ EXÉCUTIF", heading_style))
            elements.append(Paragraph(obj.summary, value_style))
            
        if hasattr(obj, 'content') and obj.content:
            elements.append(Paragraph("CONTENU DU RAPPORT", heading_style))
            # Split by lines to maintain paragraphs
            for line in obj.content.split('\n'):
                if line.strip():
                    elements.append(Paragraph(line, value_style))
                    elements.append(Spacer(1, 0.1*inch))
        
        # --- AUDIT TRAIL PAGE ---
        elements.append(PageBreak())
        elements.append(Paragraph("HISTORIQUE D'AUDIT & TRAÇABILITÉ", heading_style))
        
        content_type = ContentType.objects.get_for_model(obj.__class__)
        audit_logs = AuditLog.objects.filter(
            content_type=content_type,
            object_id=obj.id
        ).order_by('-timestamp')
        
        if audit_logs.exists():
            audit_rows = [[
                Paragraph("DATE", label_style),
                Paragraph("ACTEUR", label_style),
                Paragraph("ACTION", label_style),
                Paragraph("MODIFICATION", label_style),
            ]]
            
            for log in audit_logs[:30]:
                audit_rows.append([
                    Paragraph(log.timestamp.strftime('%d/%m/%Y %H:%M'), value_style),
                    Paragraph(log.user.email, value_style),
                    Paragraph(log.get_action_display(), value_style),
                    Paragraph(log.field_changed or "-", value_style),
                ])
            
            audit_table = Table(audit_rows, colWidths=[1*inch, 1.8*inch, 1*inch, 3.2*inch])
            audit_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
                ('LINEBELOW', (0, 0), (-1, 0), 1, DARK_TEXT),
                ('LINEBELOW', (0, 1), (-1, -1), 0.25, BORDER_LIGHT),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(audit_table)
        
        # --- FOOTER ---
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(
            "Ce document est une certification officielle générée par le système NexusMine. Scannez le QR code pour vérifier l'authenticité.",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, textColor=colors.grey, alignment=1)
        ))
        
        # Construire le PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Retourner le fichier
        filename = f"{slugify(model_name)}-{obj.id}.pdf"
        return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')

