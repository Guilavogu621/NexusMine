from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Sum, Count, Avg, F, Q, Case, When, Value, CharField
from django.db.models.functions import TruncMonth, TruncDate, TruncWeek
from collections import Counter
from .models import Indicator
from .serializers import IndicatorSerializer, IndicatorListSerializer
from accounts.permissions import CanManageAnalytics
from accounts.mixins import SiteScopedMixin
from mining_sites.models import MiningSite
from personnel.models import Personnel
from equipment.models import Equipment
from incidents.models import Incident
from alerts.models import Alert
from operations.models import Operation
from environment.models import EnvironmentalData


class IndicatorViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des indicateurs (KPIs)
    
    Permissions:
    - ADMIN: Configuration système
    - SITE_MANAGER: Supervision indicateurs globaux et KPIs de ses sites
    - ANALYST: Définition KPI, création analyses (aide à la décision)
    - Autres: Lecture limitée
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = Indicator.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, CanManageAnalytics]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['indicator_type', 'site']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return IndicatorListSerializer
        return IndicatorSerializer

    @action(detail=False, methods=['get'])
    def dashboard_overview(self, request):
        """Résumé global pour le dashboard en un seul appel - OPTIMISÉ
        
        ADMIN/SITE_MANAGER : voit toutes les données
        Autres rôles : voit uniquement les données de ses sites assignés
        """
        user = request.user
        site_ids = user.get_site_ids()  # None = pas de filtre (ADMIN)
        
        # Filtres de base par site (optimisés pour réutilisation)
        site_filter = {'site_id__in': site_ids} if site_ids is not None else {}
        
        # Une seule requête pour les stats principales avec Count agrégé
        stats = {}
        if site_ids is not None:
            stats['sites'] = MiningSite.objects.filter(id__in=site_ids).count()
        else:
            stats['sites'] = MiningSite.objects.count()
        
        # Agrégat unique au lieu de 3 requêtes séparées
        stats['personnel'] = Personnel.objects.filter(**site_filter).count()
        stats['equipment'] = Equipment.objects.filter(**site_filter).count()
        stats['incidents'] = Incident.objects.filter(**site_filter).count()

        # Alertes récentes (1 requête optimisée)
        alerts_qs = Alert.objects.filter(**site_filter).only(
            'id', 'title', 'alert_type', 'severity', 'generated_at'
        )
        recent_alerts = list(alerts_qs.order_by('-generated_at')[:5].values(
            'id', 'title', 'alert_type', 'severity', 'generated_at'
        ))

        # Opérations récentes (1 requête avec select_related)
        operations_qs = Operation.objects.filter(**site_filter).select_related('site').only(
            'id', 'operation_code', 'operation_type', 'status', 'date',
            'quantity_extracted', 'quantity_processed', 'quantity_transported',
            'site__name'
        )
        recent_operations = list(operations_qs.order_by('-date')[:5].values(
            'id', 'operation_code', 'operation_type', 'status', 'date',
            'quantity_extracted', 'quantity_processed', 'quantity_transported',
            'site__name'
        ))

        # Incidents récents (1 requête avec select_related)
        incidents_qs = Incident.objects.filter(**site_filter).select_related('site').only(
            'id', 'incident_code', 'incident_type', 'severity', 'date', 'site__name'
        )
        recent_incidents = list(incidents_qs.order_by('-date')[:5].values(
            'id', 'incident_code', 'incident_type', 'severity', 'date', 'site__name'
        ))

        # Production sur 7 derniers mois (1 seule requête agrégée)
        today = timezone.now().date()
        months = []
        for i in range(6, -1, -1):
            month = today.month - i
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            months.append((year, month))

        oldest_year, oldest_month = months[0]
        oldest_date = date(oldest_year, oldest_month, 1)

        monthly = (
            Operation.objects.filter(**site_filter, date__gte=oldest_date)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('quantity_extracted'))
        )
        monthly_map = {m['month']: (m['total'] or 0) for m in monthly}

        production_data = []
        for year, month in months:
            label = date(year, month, 1).strftime('%b')
            production_data.append({
                'name': label,
                'production': float(monthly_map.get(date(year, month, 1), 0)),
                'objectif': 1000,
            })

        # 7 derniers jours (1 seule requête agrégée)
        start_date = today - timedelta(days=6)
        daily = (
            Operation.objects.filter(**site_filter, date__gte=start_date, date__lte=today)
            .annotate(day=TruncDate('date'))
            .values('day')
            .annotate(
                extraction=Sum('quantity_extracted'),
                traitement=Sum('quantity_processed'),
                transport=Sum('quantity_transported')
            )
        )
        daily_map = {
            d['day']: {
                'extraction': float(d['extraction'] or 0),
                'traitement': float(d['traitement'] or 0),
                'transport': float(d['transport'] or 0),
            }
            for d in daily
        }

        weekly_operations = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            label = day.strftime('%a')
            values = daily_map.get(day, {'extraction': 0, 'traitement': 0, 'transport': 0})
            weekly_operations.append({
                'name': label,
                **values,
            })

        # Équipements par statut (1 seule requête agrégée)
        equipment_status = list(
            Equipment.objects.filter(**site_filter).values('status').annotate(total=Count('id'))
        )

        return Response({
            'stats': stats,
            'recent_alerts': recent_alerts,
            'recent_operations': recent_operations,
            'recent_incidents': recent_incidents,
            'production_data': production_data,
            'weekly_operations': weekly_operations,
            'equipment_status': equipment_status,
        })

    @action(detail=False, methods=['get'])
    def intelligence(self, request):
        """🧠 NexusMine Intelligence — analyse prédictive et insights
        
        Fournit:
        - Score de risque par site
        - Tendances d'incidents (hausse/baisse)
        - Prédictions de pannes équipements
        - Recommandations intelligentes
        - Indicateurs de performance
        """
        user = request.user
        site_ids = user.get_site_ids()
        
        # Filtres de base
        site_filter = {'site__in': site_ids} if site_ids is not None else {}
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        last_60 = today - timedelta(days=60)
        last_7 = today - timedelta(days=7)
        
        # ══════════════════════════════════════════════
        # 1. SCORE DE RISQUE PAR SITE
        # ══════════════════════════════════════════════
        sites_qs = MiningSite.objects.filter(
            **({'id__in': site_ids} if site_ids is not None else {})
        )
        
        site_risks = []
        for site in sites_qs:
            # Incidents récents (30 jours)
            incidents_30d = Incident.objects.filter(
                site=site, date__gte=last_30
            )
            total_incidents = incidents_30d.count()
            critical_count = incidents_30d.filter(severity='CRITICAL').count()
            high_count = incidents_30d.filter(severity='HIGH').count()
            unresolved = incidents_30d.exclude(
                status__in=['RESOLVED', 'CLOSED']
            ).count()
            
            # Équipements en panne
            broken_eq = Equipment.objects.filter(
                site=site, status__in=['OUT_OF_SERVICE', 'REPAIR']
            ).count()
            total_eq = Equipment.objects.filter(site=site).count()
            
            # Score de risque (0-100)
            risk_score = min(100, (
                critical_count * 25 +
                high_count * 15 +
                unresolved * 10 +
                broken_eq * 8 +
                (total_incidents * 3)
            ))
            
            # Niveau de risque
            if risk_score >= 70:
                risk_level = 'CRITIQUE'
                risk_color = '#EF4444'
            elif risk_score >= 45:
                risk_level = 'ÉLEVÉ'
                risk_color = '#F97316'
            elif risk_score >= 20:
                risk_level = 'MODÉRÉ'
                risk_color = '#EAB308'
            else:
                risk_level = 'FAIBLE'
                risk_color = '#22C55E'
            
            site_risks.append({
                'site_id': site.id,
                'site_name': site.name,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_color': risk_color,
                'incidents_30d': total_incidents,
                'critical_incidents': critical_count,
                'unresolved_incidents': unresolved,
                'broken_equipment': broken_eq,
                'total_equipment': total_eq,
            })
        
        # Trier par score décroissant
        site_risks.sort(key=lambda x: x['risk_score'], reverse=True)
        
        # ══════════════════════════════════════════════
        # 2. TENDANCES D'INCIDENTS
        # ══════════════════════════════════════════════
        # Comparer incidents 30 derniers jours vs 30 jours précédents
        incidents_current = Incident.objects.filter(
            **site_filter, date__gte=last_30
        ).count()
        incidents_previous = Incident.objects.filter(
            **site_filter, date__gte=last_60, date__lt=last_30
        ).count()
        
        if incidents_previous > 0:
            incident_trend_pct = round(
                ((incidents_current - incidents_previous) / incidents_previous) * 100, 1
            )
        else:
            incident_trend_pct = 100 if incidents_current > 0 else 0
        
        incident_trend = 'hausse' if incident_trend_pct > 5 else (
            'baisse' if incident_trend_pct < -5 else 'stable'
        )
        
        # Incidents par type (30 jours)
        incidents_by_type = list(
            Incident.objects.filter(**site_filter, date__gte=last_30)
            .values('incident_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Incidents par semaine (8 semaines)
        weekly_incidents = list(
            Incident.objects.filter(
                **site_filter, date__gte=today - timedelta(weeks=8)
            )
            .annotate(week=TruncWeek('date'))
            .values('week')
            .annotate(count=Count('id'))
            .order_by('week')
        )
        weekly_trend = [
            {
                'week': w['week'].strftime('%d/%m'),
                'count': w['count'],
            }
            for w in weekly_incidents
        ]
        
        # ══════════════════════════════════════════════
        # 3. PRÉDICTIONS & ALERTES INTELLIGENTES
        # ══════════════════════════════════════════════
        # Équipements à risque de panne (maintenance en retard)
        equipment_at_risk = list(
            Equipment.objects.filter(
                **({'site__in': site_ids} if site_ids is not None else {}),
                status='OPERATIONAL'
            ).annotate(
                incident_count=Count(
                    'incidents',
                    filter=Q(incidents__date__gte=last_30)
                )
            ).filter(
                incident_count__gte=2
            ).values(
                'id', 'name', 'equipment_type', 'site__name', 'incident_count'
            ).order_by('-incident_count')[:10]
        )
        
        # ══════════════════════════════════════════════
        # 4. RECOMMANDATIONS INTELLIGENTES
        # ══════════════════════════════════════════════
        recommendations = []
        
        # Recommandation: incidents critiques non résolus
        critical_unresolved = Incident.objects.filter(
            **site_filter,
            severity='CRITICAL',
        ).exclude(status__in=['RESOLVED', 'CLOSED']).count()
        
        if critical_unresolved > 0:
            recommendations.append({
                'priority': 'CRITICAL',
                'icon': '🚨',
                'title': f'{critical_unresolved} incident(s) critique(s) non résolu(s)',
                'description': 'Action immédiate requise. Assignez des enquêteurs et escaladez au management.',
                'category': 'SAFETY',
            })
        
        # Recommandation: tendance à la hausse
        if incident_trend == 'hausse' and incident_trend_pct > 20:
            recommendations.append({
                'priority': 'HIGH',
                'icon': '📈',
                'title': f'Hausse des incidents de {incident_trend_pct}%',
                'description': 'Renforcez les procédures de sécurité et planifiez une réunion HSE d\'urgence.',
                'category': 'SAFETY',
            })
        
        # Recommandation: équipements à risque
        if len(equipment_at_risk) > 0:
            recommendations.append({
                'priority': 'HIGH',
                'icon': '⚙️',
                'title': f'{len(equipment_at_risk)} équipement(s) à risque de panne',
                'description': 'Ces équipements ont eu plusieurs incidents récents. Planifiez une maintenance préventive.',
                'category': 'EQUIPMENT',
            })
        
        # Recommandation: production
        ops_7d = Operation.objects.filter(
            **site_filter, date__gte=last_7
        ).aggregate(
            total_extracted=Sum('quantity_extracted'),
            total_processed=Sum('quantity_processed'),
        )
        
        extracted = float(ops_7d['total_extracted'] or 0)
        processed = float(ops_7d['total_processed'] or 0)
        
        if extracted > 0 and processed > 0:
            efficiency = round((processed / extracted) * 100, 1)
            if efficiency < 70:
                recommendations.append({
                    'priority': 'MEDIUM',
                    'icon': '📊',
                    'title': f'Efficacité de traitement faible ({efficiency}%)',
                    'description': 'Le ratio traitement/extraction est bas. Vérifiez les installations de traitement.',
                    'category': 'PRODUCTION',
                })
        
        # Pas de recommandation = bonne nouvelle
        if not recommendations:
            recommendations.append({
                'priority': 'LOW',
                'icon': '✅',
                'title': 'Situation sous contrôle',
                'description': 'Aucune alerte critique. Continuez la surveillance régulière.',
                'category': 'GENERAL',
            })
        
        # ══════════════════════════════════════════════
        # 5. INDICATEURS DE PERFORMANCE (KPIs)
        # ══════════════════════════════════════════════
        # Taux de résolution incidents
        total_incidents_all = Incident.objects.filter(**site_filter).count()
        resolved_incidents = Incident.objects.filter(
            **site_filter, status__in=['RESOLVED', 'CLOSED']
        ).count()
        resolution_rate = round(
            (resolved_incidents / total_incidents_all * 100) if total_incidents_all > 0 else 100, 1
        )
        
        # Sécurité: jours sans incident critique
        last_critical = Incident.objects.filter(
            **site_filter, severity='CRITICAL'
        ).order_by('-date').first()
        
        days_without_critical = (
            (today - last_critical.date).days if last_critical else 365
        )
        
        kpis = {
            'resolution_rate': resolution_rate,
            'days_without_critical': days_without_critical,
            'total_incidents_30d': incidents_current,
            'incident_trend': incident_trend,
            'incident_trend_pct': incident_trend_pct,
            'production_7d': {
                'extracted': extracted,
                'processed': processed,
                'efficiency': round((processed / extracted * 100) if extracted > 0 else 0, 1),
            },
        }
        
        return Response({
            'site_risks': site_risks,
            'incident_trends': {
                'current_30d': incidents_current,
                'previous_30d': incidents_previous,
                'trend': incident_trend,
                'trend_pct': incident_trend_pct,
                'by_type': incidents_by_type,
                'weekly': weekly_trend,
            },
            'equipment_at_risk': equipment_at_risk,
            'recommendations': recommendations,
            'kpis': kpis,
        })
