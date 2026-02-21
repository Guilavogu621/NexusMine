from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from accounts.views import UserViewSet
from accounts.audit_views import AuditLogViewSet, LockedStatusViewSet
from accounts.password_reset import password_reset_request, password_reset_confirm
from nexus_backend.chatbot import chatbot_message
from mining_sites.views import MiningSiteViewSet
from personnel.views import PersonnelViewSet
from equipment.views import EquipmentViewSet, MaintenanceRecordViewSet
from operations.views import OperationViewSet, WorkZoneViewSet, ShiftViewSet
from incidents.views import IncidentViewSet
from environment.views import EnvironmentalDataViewSet, EnvironmentalThresholdViewSet, EnvironmentalReportViewSet
from analytics.views import IndicatorViewSet
from alerts.views import AlertViewSet, AlertRuleViewSet
from reports.views import ReportViewSet
from stock.views import StockLocationViewSet, StockMovementViewSet, StockSummaryViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'sites', MiningSiteViewSet)
router.register(r'personnel', PersonnelViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'maintenance', MaintenanceRecordViewSet)
router.register(r'operations', OperationViewSet)
router.register(r'work-zones', WorkZoneViewSet)
router.register(r'shifts', ShiftViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'environmental-data', EnvironmentalDataViewSet)
router.register(r'environmental-thresholds', EnvironmentalThresholdViewSet)
router.register(r'environmental-reports', EnvironmentalReportViewSet)
router.register(r'indicators', IndicatorViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'alert-rules', AlertRuleViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'stock-locations', StockLocationViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'stock-summary', StockSummaryViewSet)
# Audit & Conformité (MMG)
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'locked-statuses', LockedStatusViewSet, basename='lockedstatus')

urlpatterns = [
    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # Password reset
    path('password-reset/', password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', password_reset_confirm, name='password_reset_confirm'),
    # Chatbot IA
    path('chatbot/', chatbot_message, name='chatbot_message'),
    # API endpoints
    path('', include(router.urls)),
]
