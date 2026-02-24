from rest_framework import serializers
from .models import Incident, IncidentPhoto, IncidentFollowUp


class IncidentPhotoSerializer(serializers.ModelSerializer):
    """Serializer pour les photos d'incident"""
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.email', read_only=True
    )

    class Meta:
        model = IncidentPhoto
        fields = [
            'id', 'incident', 'photo', 'caption', 'taken_at',
            'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']


class IncidentFollowUpSerializer(serializers.ModelSerializer):
    """Serializer pour le suivi des incidents"""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    assigned_to_name = serializers.CharField(
        source='assigned_to.email', read_only=True
    )

    class Meta:
        model = IncidentFollowUp
        fields = [
            'id', 'incident', 'action_description', 'status', 'status_display',
            'due_date', 'completed_date', 'assigned_to', 'assigned_to_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncidentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Incident"""
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.email', read_only=True)
    investigated_by_name = serializers.CharField(source='investigated_by.email', read_only=True)
    closed_by_name = serializers.CharField(source='closed_by.email', read_only=True)
    photos = IncidentPhotoSerializer(many=True, read_only=True)
    follow_ups = IncidentFollowUpSerializer(many=True, read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_code', 'incident_type', 'incident_type_display',
            'site', 'site_name', 'date', 'time', 'severity', 'severity_display',
            'status', 'status_display', 'description',
            'location_description', 'gps_latitude', 'gps_longitude',
            'root_cause', 'contributing_factors',
            'actions_taken', 'corrective_actions', 'preventive_measures',
            'injuries_count', 'fatalities_count', 'lost_work_days',
            'estimated_cost', 'photo',
            'equipment_involved', 'personnel_involved',
            'alert_sent', 'alert_sent_at',
            'reported_by', 'reported_by_name',
            'investigated_by', 'investigated_by_name',
            'closed_by', 'closed_by_name', 'closed_at',
            'photos', 'follow_ups',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        """Validation SIG MG : Geofencing des incidents"""
        lat = data.get('gps_latitude')
        lon = data.get('gps_longitude')
        site = data.get('site')
        
        # En cas d'update partial, on récupère les valeurs existantes si non fournies
        if self.instance:
            lat = lat if lat is not None else self.instance.gps_latitude
            lon = lon if lon is not None else self.instance.gps_longitude
            site = site if site else self.instance.site

        if lat is not None and lon is not None and site:
            if not site.is_point_in_concession(lat, lon):
                raise serializers.ValidationError({
                    'gps_latitude': "Alerte SIG MG : Les coordonnées GPS de l'incident se trouvent en dehors de la concession autorisée pour ce site minier."
                })
        return data


class IncidentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    photo_count = serializers.IntegerField(source='photos.count', read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_code', 'incident_type', 'incident_type_display',
            'severity', 'severity_display',
            'site', 'site_name', 'date',
            'status', 'status_display',
            'description', 'photo_count',
        ]
