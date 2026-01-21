from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from accounts.views import UserViewSet
from mining_sites.views import MiningSiteViewSet
from personnel.views import PersonnelViewSet
from equipment.views import EquipmentViewSet
from operations.views import OperationViewSet
from incidents.views import IncidentViewSet
from environment.views import EnvironmentalDataViewSet
from analytics.views import IndicatorViewSet
from alerts.views import AlertViewSet
from reports.views import ReportViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sites', MiningSiteViewSet)
router.register(r'personnel', PersonnelViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'operations', OperationViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'environmental-data', EnvironmentalDataViewSet)
router.register(r'indicators', IndicatorViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # API endpoints
    path('', include(router.urls)),
]
