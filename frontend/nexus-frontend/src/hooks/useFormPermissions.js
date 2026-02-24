import useAuthStore from '../stores/authStore';

/**
 * Hook de permissions par module et par rôle.
 *
 * Règles métier :
 *   ADMIN       → accès total partout
 *   SUPERVISOR  → CRUD complet sur les sites assignés
 *   SITE_MANAGER → lecture seule SAUF opérations (peut créer / lancer)
 *   OPERATOR    → peut créer opérations + incidents, reste en lecture seule
 *   ANALYST     → lecture seule partout
 *   MMG         → lecture seule partout
 *
 * @param {'sites'|'personnel'|'equipment'|'operations'|'incidents'|'environment'|'alerts'|'reports'|'stock'|'analytics'|'users'} module
 * @returns {{ readOnly: boolean, canCreate: boolean, canEdit: boolean, canSubmit: boolean, roleBanner: string|null }}
 */
export default function useFormPermissions(module) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const full = { readOnly: false, canCreate: true, canEdit: true, canSubmit: true, roleBanner: null };

  // ADMIN : accès total
  if (role === 'ADMIN') return full;

  // SITE_MANAGER (gestionnaire) : CRUD complet
  if (role === 'SITE_MANAGER') return full;

  // SITE_MANAGER (propriétaire du site) : CRUD personnel + opérations
  if (role === 'SITE_MANAGER') {
    if (module === 'operations' || module === 'personnel') return full;
    return {
      readOnly: true,
      canCreate: false,
      canEdit: false,
      canSubmit: false,
      roleBanner: 'En tant que propriétaire du site, ce module est en lecture seule. Vous pouvez gérer les opérations et le personnel.',
    };
  }

  // OPERATOR : opérations + incidents
  if (role === 'OPERATOR') {
    if (module === 'operations' || module === 'incidents') return full;
    return {
      readOnly: true,
      canCreate: false,
      canEdit: false,
      canSubmit: false,
      roleBanner: 'En tant qu\'opérateur, ce module est en lecture seule. Vous pouvez créer des opérations et déclarer des incidents.',
    };
  }

  // TECHNICIEN : opérations de terrain
  if (role === 'TECHNICIEN') {
    if (['operations', 'incidents', 'equipment', 'reports', 'personnel'].includes(module)) return full;
    return {
      readOnly: true,
      canCreate: false,
      canEdit: false,
      canSubmit: false,
      roleBanner: 'En tant que technicien, ce module est en lecture seule. Vous pouvez gérer les opérations, incidents, équipements et rapports.',
    };
  }

  // ANALYST, MMG, tout autre rôle → lecture seule
  return {
    readOnly: true,
    canCreate: false,
    canEdit: false,
    canSubmit: false,
    roleBanner: 'Ce module est en lecture seule pour votre rôle.',
  };
}
