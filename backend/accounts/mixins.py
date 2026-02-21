"""
Mixin de filtrage automatique par sites assignés.

Logique:
- ADMIN / ANALYST / MMG : voit TOUTES les données (pas de filtre)
    MMG = Ministère des Mines, contrôle réglementaire sur tous les sites
- SITE_MANAGER / TECHNICIEN : voit uniquement les données
    liées à ses `assigned_sites`

Usage dans un ViewSet:
    from accounts.mixins import SiteScopedMixin

    class PersonnelViewSet(SiteScopedMixin, viewsets.ModelViewSet):
        site_field = 'site'  # nom du FK vers MiningSite (défaut)
        ...
"""


class SiteScopedMixin:
    """
    Filtre automatiquement le queryset selon les sites assignés à l'utilisateur.

    Attributs configurables sur le ViewSet:
        site_field (str): Nom du champ FK vers MiningSite. Défaut = 'site'.
                          Utiliser 'site__id' ou un lookup Django si relation indirecte.
        site_scope_exempt_roles (list): Rôles exemptés du filtrage.
                                        Défaut = ['ADMIN', 'MANAGER'].
    """
    site_field = 'site'
    site_scope_exempt_roles = ['ADMIN', 'ANALYST', 'MMG']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            return qs.none()

        # Rôles exemptés voient tout
        if user.role in self.site_scope_exempt_roles:
            return qs

        # Récupérer les IDs des sites assignés
        site_ids = user.get_site_ids()

        # Aucun site assigné → aucune donnée
        if not site_ids:
            return qs.none()

        # Filtrer par le champ site configuré
        lookup = f'{self.site_field}__in'
        return qs.filter(**{lookup: site_ids})
