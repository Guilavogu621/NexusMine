"""
Créé par: AI Assistant
Migration pour ajouter les champs de notification WebSocket aux modèles Alert et UserNotificationPreferences
"""

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0001_initial'),  # À adapter selon vos migrations existantes
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Ajouter les champs à Alert
        migrations.AddField(
            model_name='alert',
            name='category',
            field=models.CharField(
                choices=[
                    ('OPERATIONAL', 'Opérationnel'),
                    ('SAFETY', 'Sécurité'),
                    ('MAINTENANCE', 'Maintenance'),
                    ('ENVIRONMENTAL', 'Environnemental'),
                    ('TECHNICAL', 'Technique'),
                    ('ADMINISTRATIVE', 'Administratif'),
                ],
                default='OPERATIONAL',
                max_length=20,
                db_index=True,
            ),
        ),
        migrations.AddField(
            model_name='alert',
            name='priority_order',
            field=models.IntegerField(default=0, db_index=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='is_dismissed',
            field=models.BooleanField(default=False, db_index=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='dismissed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='dismissed_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='dismissed_alerts',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='alert',
            name='expires_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='snoozed_until',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='alert',
            name='dedupe_key',
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=255,
                null=True,
            ),
        ),
        
        # Ajouter le statut DISMISSED et SNOOZED à AlertStatus (si c'est un ChoiceField)
        migrations.RunPython(
            code=lambda apps, schema_editor: None,
            reverse_code=lambda apps, schema_editor: None,
        ),
        
        # Créer le modèle UserNotificationPreferences
        migrations.CreateModel(
            name='UserNotificationPreferences',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'enabled_categories',
                    models.JSONField(
                        default=list,
                        help_text='Liste des catégories d\'alertes activées',
                    ),
                ),
                (
                    'enabled_severity_levels',
                    models.JSONField(
                        default=list,
                        help_text='Liste des niveaux de gravité activés',
                    ),
                ),
                (
                    'enabled_alert_types',
                    models.JSONField(
                        default=list,
                        help_text='Liste des types d\'alertes activés',
                    ),
                ),
                (
                    'max_alerts_per_hour',
                    models.IntegerField(
                        default=100,
                        help_text='Nombre maximal d\'alertes par heure',
                    ),
                ),
                (
                    'max_alerts_per_day',
                    models.IntegerField(
                        default=500,
                        help_text='Nombre maximal d\'alertes par jour',
                    ),
                ),
                (
                    'group_by_category',
                    models.BooleanField(
                        default=True,
                        help_text='Grouper les alertes par catégorie',
                    ),
                ),
                (
                    'group_by_site',
                    models.BooleanField(
                        default=False,
                        help_text='Grouper les alertes par site',
                    ),
                ),
                (
                    'email_on_critical',
                    models.BooleanField(
                        default=True,
                        help_text='Envoyer un e-mail pour les alertes critiques',
                    ),
                ),
                (
                    'push_notifications',
                    models.BooleanField(
                        default=True,
                        help_text='Activer les notifications push',
                    ),
                ),
                (
                    'sms_on_critical',
                    models.BooleanField(
                        default=False,
                        help_text='Envoyer un SMS pour les alertes critiques',
                    ),
                ),
                (
                    'default_snooze_minutes',
                    models.IntegerField(
                        default=30,
                        help_text='Durée par défaut du snooze (en minutes)',
                    ),
                ),
                (
                    'alerts_per_page',
                    models.IntegerField(
                        default=20,
                        help_text='Nombre d\'alertes par page',
                    ),
                ),
                (
                    'user',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'verbose_name': 'Préférences de notification utilisateur',
                'verbose_name_plural': 'Préférences de notification utilisateur',
            },
        ),
    ]
