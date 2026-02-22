from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Cette ligne permet d'importer le fichier signals.py 
        # dès que l'application 'accounts' est prête.
        import accounts.signals