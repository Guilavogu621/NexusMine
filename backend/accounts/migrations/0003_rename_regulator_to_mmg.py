# Generated migration to rename REGULATOR role to MMG

from django.db import migrations, models


def rename_regulator_to_mmg(apps, schema_editor):
    """Renomme le rôle REGULATOR en MMG pour tous les utilisateurs existants"""
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='REGULATOR').update(role='MMG')


def rename_mmg_to_regulator(apps, schema_editor):
    """Opération inverse - revenir à REGULATOR"""
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='MMG').update(role='REGULATOR')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_role'),
    ]

    operations = [
        migrations.RunPython(rename_regulator_to_mmg, rename_mmg_to_regulator),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('ADMIN', 'Administrateur Système'),
                    ('SUPERVISOR', 'Gestionnaire de Site'),
                    ('OPERATOR', 'Technicien/Opérateur'),
                    ('ANALYST', 'Analyste/Décideur'),
                    ('MMG', 'Autorité (MMG)'),
                ],
                default='OPERATOR',
                max_length=50,
            ),
        ),
    ]
