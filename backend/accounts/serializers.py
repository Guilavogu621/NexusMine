from rest_framework import serializers
from django.contrib.auth import get_user_model
from mining_sites.models import MiningSite

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User"""
    profile_photo_url = serializers.SerializerMethodField()
    assigned_sites = serializers.PrimaryKeyRelatedField(
        many=True, queryset=MiningSite.objects.all(), required=False
    )
    assigned_sites_details = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active',
                  'profile_photo', 'profile_photo_url',
                  'assigned_sites', 'assigned_sites_details',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'profile_photo_url', 'assigned_sites_details']
    
    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def get_assigned_sites_details(self, obj):
        """Retourne les détails des sites assignés (id, name, code)"""
        return list(obj.assigned_sites.values('id', 'name', 'code'))

    def update(self, instance, validated_data):
        """Gère la mise à jour des sites assignés (M2M) et is_staff"""
        sites = validated_data.pop('assigned_sites', None)
        instance = super().update(instance, validated_data)
        # Synchroniser is_staff avec le rôle
        instance.is_staff = (instance.role == 'ADMIN')
        instance.save(update_fields=['is_staff'])
        if sites is not None:
            instance.assigned_sites.set(sites)
        return instance


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du profil utilisateur"""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'profile_photo']


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Les mots de passe ne correspondent pas."})
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateur"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    assigned_sites = serializers.PrimaryKeyRelatedField(
        many=True, queryset=MiningSite.objects.all(), required=False
    )
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role',
                  'password', 'password_confirm', 'assigned_sites']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Les mots de passe ne correspondent pas."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        sites = validated_data.pop('assigned_sites', [])
        user = User(**validated_data)
        user.set_password(password)
        # ADMIN doit avoir is_staff=True pour accéder au Django admin
        if user.role == 'ADMIN':
            user.is_staff = True
        user.save()
        if sites:
            user.assigned_sites.set(sites)
        return user
