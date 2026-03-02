import csv
from django.http import HttpResponse
from rest_framework.decorators import action
from django.utils.text import slugify
from datetime import datetime

class CSVExportMixin:
    """
    Mixin pour exporter les données d'un ViewSet en CSV
    """
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Exporte les données filtrées en format CSV
        """
        # Appliquer les filtres du ViewSet au queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Créer la réponse HTTP avec les headers CSV
        filename = f"export_{slugify(self.get_queryset().model._meta.verbose_name_plural)}_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Initialiser le writer CSV
        writer = csv.writer(response)
        
        # Récupérer les champs à exporter (soit définis, soit tous les champs simples)
        if hasattr(self, 'export_fields'):
            fields = self.export_fields
        else:
            fields = [f.name for f in queryset.model._meta.fields]
            
        # Écrire l'en-tête
        writer.writerow(fields)
        
        # Écrire les données
        for obj in queryset:
            row = []
            for field in fields:
                try:
                    val = getattr(obj, field)
                    # Gérer les ManyToMany (Managers)
                    if hasattr(val, 'all') and callable(val.all):
                        val = ", ".join([str(item) for item in val.all()])
                    # Gérer les dates
                    elif isinstance(val, (datetime, date)) or hasattr(val, 'strftime'):
                        val = val.strftime('%Y-%m-%d %H:%M:%S') if isinstance(val, datetime) else val.strftime('%Y-%m-%d')
                    # Gérer les relations Foreign Key (objets simples)
                    elif hasattr(val, 'email'): # User/Personnel
                        val = val.email
                    elif hasattr(val, 'name'): # Site/Zone
                        val = val.name
                except Exception:
                    val = ""
                row.append(str(val) if val is not None else "")
            writer.writerow(row)
            
        return response
