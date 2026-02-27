/// Constantes générales de l'application
class AppConstants {
  AppConstants._();
  
  // App info
  static const String appName = 'NexusMine';
  static const String appVersion = '1.0.0';
  
  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String selectedSiteKey = 'selected_site';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language';
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Cache durations
  static const Duration cacheValidDuration = Duration(minutes: 15);
  static const Duration offlineCacheDuration = Duration(days: 7);
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxDescriptionLength = 1000;
  
  // Date formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String timeFormat = 'HH:mm';
  
  // Rôles utilisateur
  static const String roleAdmin = 'admin';
  static const String roleManager = 'manager';
  static const String roleEngineer = 'engineer';
  static const String roleOperator = 'operator';
  static const String roleViewer = 'viewer';
}

/// Types de sévérité pour incidents et alertes (match backend UPPERCASE)
enum SeverityLevel {
  low('Faible', 'LOW'),
  medium('Moyen', 'MEDIUM'),
  high('Élevé', 'HIGH'),
  critical('Critique', 'CRITICAL');
  
  final String label;
  final String value;
  
  const SeverityLevel(this.label, this.value);
  
  static SeverityLevel fromString(String value) {
    return SeverityLevel.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => SeverityLevel.low,
    );
  }
}

/// Types d'incident (match backend IncidentType)
enum IncidentType {
  accident('Accident corporel', 'ACCIDENT'),
  nearMiss('Presqu\'accident', 'NEAR_MISS'),
  equipmentFailure('Panne équipement', 'EQUIPMENT_FAILURE'),
  environmental('Incident environnemental', 'ENVIRONMENTAL'),
  security('Incident de sécurité', 'SECURITY'),
  landslide('Glissement de terrain', 'LANDSLIDE'),
  fire('Incendie', 'FIRE'),
  explosion('Explosion', 'EXPLOSION'),
  chemicalSpill('Déversement chimique', 'CHEMICAL_SPILL'),
  other('Autre', 'OTHER');
  
  final String label;
  final String value;
  
  const IncidentType(this.label, this.value);
  
  static IncidentType fromString(String value) {
    return IncidentType.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => IncidentType.other,
    );
  }
}

/// Statuts d'équipement
enum EquipmentStatus {
  operational('Opérationnel', 'operational'),
  maintenance('Maintenance', 'maintenance'),
  repair('Réparation', 'repair'),
  outOfService('Hors service', 'out_of_service');
  
  final String label;
  final String value;
  
  const EquipmentStatus(this.label, this.value);
  
  static EquipmentStatus fromString(String value) {
    return EquipmentStatus.values.firstWhere(
      (e) => e.value == value.toLowerCase(),
      orElse: () => EquipmentStatus.operational,
    );
  }
}

/// Statuts d'incident (match backend IncidentStatus UPPERCASE)
enum IncidentStatus {
  reported('Déclaré', 'REPORTED'),
  investigating('En investigation', 'INVESTIGATING'),
  actionRequired('Action requise', 'ACTION_REQUIRED'),
  resolved('Résolu', 'RESOLVED'),
  closed('Clôturé', 'CLOSED');
  
  final String label;
  final String value;
  
  const IncidentStatus(this.label, this.value);
  
  static IncidentStatus fromString(String value) {
    return IncidentStatus.values.firstWhere(
      (e) => e.value == value.toUpperCase(),
      orElse: () => IncidentStatus.reported,
    );
  }
}
