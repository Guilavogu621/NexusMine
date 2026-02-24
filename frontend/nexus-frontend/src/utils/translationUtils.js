/**
 * NexusMine - Professional Translation Utility
 * Maps technical field names and values to user-friendly French labels.
 */

const FIELD_MAP = {
    // General Fields
    'id': 'ID',
    'name': 'Nom',
    'title': 'Titre',
    'description': 'Description',
    'status': 'Statut',
    'created_at': 'Créé le',
    'updated_at': 'Mis à jour le',
    'timestamp': 'Date/Heure',
    'user_email': 'Utilisateur',
    'user_name': 'Nom complet',
    'action': 'Action',
    'content_type': 'Type de ressource',
    'object_label': 'Élément',
    'ip_address': 'Adresse IP',
    'reason': 'Raison / Motif',
    'old_value': 'Ancienne valeur',
    'new_value': 'Nouvelle valeur',
    'field_changed': 'Champ modifié',

    // Incident Fields
    'incident_code': 'Code Incident',
    'incident_type': 'Type d\'incident',
    'severity': 'Sévérité',
    'date': 'Date',
    'time': 'Heure',
    'actions_taken': 'Actions entreprises',
    'site': 'Site minier',
    'site_name': 'Nom du site',

    // Personnel Fields
    'employee_id': 'Matricule',
    'first_name': 'Prénom',
    'last_name': 'Nom de famille',
    'position': 'Poste / Fonction',
    'phone': 'Téléphone',
    'email': 'Email',
    'hire_date': 'Date d\'embauche',

    // Equipment Fields
    'equipment_code': 'Code Équipement',
    'equipment_type': 'Type de matériel',
    'manufacturer': 'Fabricant',
    'model': 'Modèle',
    'serial_number': 'Numéro de série',
    'commissioning_date': 'Mise en service',

    // Operations Fields
    'operation_code': 'Code Opération',
    'operation_type': 'Type d\'opération',
    'start_time': 'Heure de début',
    'end_time': 'Heure de fin',
    'quantity_extracted': 'Quantité (t)',

    // Reports Fields
    'report_type': 'Type de rapport',
    'period_start': 'Début période',
    'period_end': 'Fin période',
    'summary': 'Résumé',
    'content': 'Contenu',
};

const VALUE_MAP = {
    // Status Values
    'PLANNED': '📅 Planifié',
    'IN_PROGRESS': '⚙️ En cours',
    'COMPLETED': '✅ Terminé',
    'CANCELLED': '❌ Annulé',
    'REPORTED': '📋 Signalé',
    'INVESTIGATING': '🔍 En investigation',
    'RESOLVED': '✅ Résolu',
    'CLOSED': '🔒 Clôturé',
    'ACTIVE': '🟢 Actif',
    'ON_LEAVE': '🟡 En congé',
    'INACTIVE': '⚪ Inactif',
    'TERMINATED': '🔴 Terminé',
    'OPERATIONAL': '🟢 Opérationnel',
    'MAINTENANCE': '🟠 Maintenance',
    'BREAKDOWN': '🔴 En panne',
    'RETIRED': '⚪ Hors service',
    'DRAFT': '📝 Brouillon',
    'PENDING_APPROVAL': '⏳ En attente',
    'VALIDATED': '🔍 Validé',
    'PUBLISHED': '📢 Publié',

    // User Roles
    'ADMIN': '👑 Administrateur',
    'MMG': '🏛️ Ministère (MMG)',
    'SITE_MANAGER': '👔 Gestionnaire Site',
    'TECHNICIEN': '🔧 Technicien',
};

/**
 * Translates a field name to its French label.
 * @param {string} field 
 * @returns {string}
 */
export const translateField = (field) => {
    return FIELD_MAP[field] || field;
};

/**
 * Translates a technical value to its French display string.
 * @param {string} value 
 * @returns {string}
 */
export const translateValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    return VALUE_MAP[value] || String(value);
};

/**
 * Formats a date to French standard (DD/MM/YYYY).
 * @param {string|Date} dateStr 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDateFR = (dateStr, includeTime = false) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

export default {
    translateField,
    translateValue,
    formatDateFR
};
