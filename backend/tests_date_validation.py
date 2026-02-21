"""
tests_date_validation.py - Tests de validation des plages de dates
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta, time, date
from equipment.models import MaintenanceRecord, Equipment
from mining_sites.models import MiningSite
from operations.models import Operation, Shift, WorkZone
from accounts.models import User


class MaintenanceRecordValidationTests(TestCase):
    """Tests de validation des plages de dates pour Maintenance"""
    
    def setUp(self):
        """Initialiser les données de test"""
        self.site = MiningSite.objects.create(
            name="Site Test",
            location="Test Location",
            country="Test Country",
            latitude=0.0,
            longitude=0.0
        )
        
        self.equipment = Equipment.objects.create(
            equipment_code="TEST-001",
            name="Equipment Test",
            equipment_type="EXCAVATOR",
            site=self.site
        )
    
    def test_valid_maintenance_dates(self):
        """Test: dates de fin > dates de début doivent être acceptées"""
        start = timezone.now()
        end = start + timedelta(hours=2)
        
        maintenance = MaintenanceRecord(
            equipment=self.equipment,
            maintenance_code="MAINT-001",
            maintenance_type="PREVENTIVE",
            scheduled_date=date.today(),
            start_date=start,
            end_date=end,
            description="Test maintenance"
        )
        
        # Doit pas lever d'exception
        maintenance.clean()
        maintenance.save()
        
        self.assertIsNotNone(maintenance.id)
        self.assertTrue(maintenance.start_date < maintenance.end_date)
    
    def test_invalid_maintenance_dates_same(self):
        """Test: dates identiques doivent être rejetées"""
        same_time = timezone.now()
        
        maintenance = MaintenanceRecord(
            equipment=self.equipment,
            maintenance_code="MAINT-002",
            maintenance_type="PREVENTIVE",
            scheduled_date=date.today(),
            start_date=same_time,
            end_date=same_time,
            description="Test maintenance"
        )
        
        with self.assertRaises(ValidationError):
            maintenance.clean()
    
    def test_invalid_maintenance_dates_end_before_start(self):
        """Test: date de fin < date de début doit être rejetée"""
        start = timezone.now() + timedelta(hours=2)
        end = timezone.now()
        
        maintenance = MaintenanceRecord(
            equipment=self.equipment,
            maintenance_code="MAINT-003",
            maintenance_type="PREVENTIVE",
            scheduled_date=date.today(),
            start_date=start,
            end_date=end,
            description="Test maintenance"
        )
        
        with self.assertRaises(ValidationError) as context:
            maintenance.clean()
        
        self.assertIn('end_date', context.exception.error_dict)
        self.assertIn('après', str(context.exception))


class OperationValidationTests(TestCase):
    """Tests de validation des plages d'horaires pour Operations"""
    
    def setUp(self):
        """Initialiser les données de test"""
        self.site = MiningSite.objects.create(
            name="Site Test",
            location="Test Location",
            country="Test Country",
            latitude=0.0,
            longitude=0.0
        )
        
        self.work_zone = WorkZone.objects.create(
            code="ZONE-001",
            name="Zone Test",
            site=self.site
        )
    
    def test_valid_operation_times(self):
        """Test: horaires de fin > horaires de début doivent être acceptés"""
        start_time = time(8, 0)
        end_time = time(17, 0)
        
        operation = Operation(
            operation_code="OP-2026-001",
            site=self.site,
            work_zone=self.work_zone,
            date=date.today(),
            start_time=start_time,
            end_time=end_time,
            operation_type="EXTRACTION",
            description="Test operation"
        )
        
        # Doit pas lever d'exception
        operation.clean()
        operation.save()
        
        self.assertIsNotNone(operation.id)
        self.assertTrue(operation.start_time < operation.end_time)
    
    def test_invalid_operation_times_same(self):
        """Test: horaires identiques doivent être rejetés"""
        same_time = time(10, 0)
        
        operation = Operation(
            operation_code="OP-2026-002",
            site=self.site,
            work_zone=self.work_zone,
            date=date.today(),
            start_time=same_time,
            end_time=same_time,
            operation_type="EXTRACTION",
            description="Test operation"
        )
        
        with self.assertRaises(ValidationError):
            operation.clean()
    
    def test_invalid_operation_times_end_before_start(self):
        """Test: heure de fin < heure de début doit être rejetée"""
        start_time = time(17, 0)
        end_time = time(8, 0)
        
        operation = Operation(
            operation_code="OP-2026-003",
            site=self.site,
            work_zone=self.work_zone,
            date=date.today(),
            start_time=start_time,
            end_time=end_time,
            operation_type="EXTRACTION",
            description="Test operation"
        )
        
        with self.assertRaises(ValidationError) as context:
            operation.clean()
        
        self.assertIn('end_time', context.exception.error_dict)
        self.assertIn('après', str(context.exception))


class DateValidationSerializerTests(TestCase):
    """Tests de validation au niveau des serializers"""
    
    def setUp(self):
        """Initialiser les données de test"""
        self.site = MiningSite.objects.create(
            name="Site Test",
            location="Test Location",
            country="Test Country",
            latitude=0.0,
            longitude=0.0
        )
    
    def test_maintenance_serializer_validation(self):
        """Test: le serializer doit valider les dates"""
        from equipment.serializers import MaintenanceRecordSerializer
        
        start = timezone.now()
        end = start + timedelta(hours=2)
        
        # Données valides
        valid_data = {
            'maintenance_code': 'TEST-001',
            'maintenance_type': 'PREVENTIVE',
            'status': 'SCHEDULED',
            'scheduled_date': date.today(),
            'start_date': start,
            'end_date': end,
            'description': 'Test'
        }
        
        serializer = MaintenanceRecordSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
    
    def test_maintenance_serializer_invalid_dates(self):
        """Test: le serializer doit rejeter les dates invalides"""
        from equipment.serializers import MaintenanceRecordSerializer
        
        start = timezone.now()
        end = start - timedelta(hours=2)  # end < start
        
        invalid_data = {
            'maintenance_code': 'TEST-002',
            'maintenance_type': 'PREVENTIVE',
            'status': 'SCHEDULED',
            'scheduled_date': date.today(),
            'start_date': start,
            'end_date': end,
            'description': 'Test'
        }
        
        serializer = MaintenanceRecordSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('end_date', serializer.errors)
    
    def test_operation_serializer_validation(self):
        """Test: le serializer Operation doit valider les horaires"""
        from operations.serializers import OperationSerializer
        
        valid_data = {
            'operation_code': 'OP-001',
            'site': self.site.id,
            'date': date.today(),
            'start_time': time(8, 0),
            'end_time': time(17, 0),
            'operation_type': 'EXTRACTION',
            'description': 'Test'
        }
        
        serializer = OperationSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())


# Pour exécuter les tests:
# python manage.py test equipment.tests_date_validation
# python manage.py test operations.tests_date_validation
