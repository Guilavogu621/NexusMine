# Generated migration for AuditLog and LockedStatus

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_remove_owner_role'),  # Ou la dernière migration
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(choices=[('CREATE', 'Création'), ('UPDATE', 'Modification'), ('DELETE', 'Suppression'), ('APPROVE', 'Approbation'), ('REJECT', 'Refus'), ('VALIDATE', 'Validation'), ('PUBLISH', 'Publication'), ('EXPORT', 'Export'), ('LOCK', 'Verrouillage'), ('UNLOCK', 'Déverrouillage')], max_length=20, verbose_name="Type d'action")),
                ('content_type', models.CharField(max_length=100, verbose_name='Type de contenu')),
                ('object_id', models.IntegerField(verbose_name='ID de l\'objet')),
                ('object_label', models.CharField(help_text="Ex: 'Rapport Q1 2026'", max_length=255, verbose_name='Label de l\'objet')),
                ('field_changed', models.CharField(blank=True, max_length=100, null=True, verbose_name='Champ modifié')),
                ('old_value', models.JSONField(blank=True, null=True, verbose_name='Ancienne valeur')),
                ('new_value', models.JSONField(blank=True, null=True, verbose_name='Nouvelle valeur')),
                ('reason', models.TextField(blank=True, null=True, verbose_name='Raison')),
                ('timestamp', models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='Date/Heure')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True, verbose_name='Adresse IP')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='audit_logs', to=settings.AUTH_USER_MODEL, verbose_name='Utilisateur')),
            ],
            options={
                'verbose_name': 'Journal d\'audit',
                'verbose_name_plural': 'Journaux d\'audit',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='LockedStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, editable=False, primary_key=True, serialize=False)),
                ('content_type', models.CharField(max_length=100)),
                ('object_id', models.IntegerField()),
                ('locked_status', models.CharField(max_length=100)),
                ('locked_at', models.DateTimeField(auto_now_add=True)),
                ('reason', models.TextField(blank=True, null=True)),
                ('locked_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='locked_items', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Statut verrouillé',
                'verbose_name_plural': 'Statuts verrouillés',
                'unique_together': {('content_type', 'object_id')},
            },
        ),
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['content_type', 'object_id'], name='accounts_aud_content_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['user', 'timestamp'], name='accounts_aud_user_ts_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['action', 'timestamp'], name='accounts_aud_action_ts_idx'),
        ),
    ]
