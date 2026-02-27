import '../../core/constants/app_constants.dart';

/// Photo d'incident (backend IncidentPhoto)
class IncidentPhotoModel {
  final int id;
  final int incidentId;
  final String photoUrl;
  final String caption;
  final DateTime? takenAt;
  final String? uploadedByName;
  final DateTime createdAt;

  IncidentPhotoModel({
    required this.id,
    required this.incidentId,
    required this.photoUrl,
    this.caption = '',
    this.takenAt,
    this.uploadedByName,
    required this.createdAt,
  });

  factory IncidentPhotoModel.fromJson(Map<String, dynamic> json) {
    return IncidentPhotoModel(
      id: json['id'] as int,
      incidentId: json['incident'] as int? ?? 0,
      photoUrl: json['photo'] as String? ?? '',
      caption: json['caption'] as String? ?? '',
      takenAt: json['taken_at'] != null
          ? DateTime.tryParse(json['taken_at'].toString())
          : null,
      uploadedByName: json['uploaded_by_name'] as String?,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }
}

/// Modèle Incident — aligné sur le backend Django
class IncidentModel {
  final int id;
  final String incidentCode;
  final IncidentType incidentType;
  final String? incidentTypeDisplay;
  final int siteId;
  final String? siteName;
  final String description;
  final SeverityLevel severity;
  final String? severityDisplay;
  final IncidentStatus status;
  final String? statusDisplay;

  // Date & heure
  final DateTime date;
  final String? time; // Format HH:mm

  // Localisation
  final String locationDescription;
  final double? gpsLatitude;
  final double? gpsLongitude;

  // Causes & impacts
  final String rootCause;
  final String contributingFactors;
  final int injuriesCount;
  final int fatalitiesCount;
  final int lostWorkDays;
  final double? estimatedCost;

  // Actions
  final String actionsTaken;
  final String correctiveActions;
  final String preventiveMeasures;

  // Photo principale
  final String? photoUrl;

  // Relations
  final int? reportedById;
  final String? reportedByName;
  final int? investigatedById;
  final String? investigatedByName;
  final int? closedById;
  final String? closedByName;
  final DateTime? closedAt;

  // Alertes
  final bool alertSent;

  // Photos multiples
  final List<IncidentPhotoModel> photos;

  // Timestamps
  final DateTime createdAt;
  final DateTime? updatedAt;

  IncidentModel({
    required this.id,
    required this.incidentCode,
    required this.incidentType,
    this.incidentTypeDisplay,
    required this.siteId,
    this.siteName,
    required this.description,
    required this.severity,
    this.severityDisplay,
    required this.status,
    this.statusDisplay,
    required this.date,
    this.time,
    this.locationDescription = '',
    this.gpsLatitude,
    this.gpsLongitude,
    this.rootCause = '',
    this.contributingFactors = '',
    this.injuriesCount = 0,
    this.fatalitiesCount = 0,
    this.lostWorkDays = 0,
    this.estimatedCost,
    this.actionsTaken = '',
    this.correctiveActions = '',
    this.preventiveMeasures = '',
    this.photoUrl,
    this.reportedById,
    this.reportedByName,
    this.investigatedById,
    this.investigatedByName,
    this.closedById,
    this.closedByName,
    this.closedAt,
    this.alertSent = false,
    this.photos = const [],
    required this.createdAt,
    this.updatedAt,
  });

  /// Titre d'affichage construit à partir du code et type
  String get displayTitle =>
      '$incidentCode — ${incidentTypeDisplay ?? incidentType.label}';

  bool get isOpen =>
      status == IncidentStatus.reported ||
      status == IncidentStatus.investigating;
  bool get isResolved =>
      status == IncidentStatus.resolved || status == IncidentStatus.closed;
  bool get isCritical => severity == SeverityLevel.critical;

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    // Photos (nested from detail serializer)
    final photosJson = json['photos'] as List<dynamic>?;
    final photos = photosJson
            ?.map((p) =>
                IncidentPhotoModel.fromJson(p as Map<String, dynamic>))
            .toList() ??
        [];

    return IncidentModel(
      id: json['id'] as int,
      incidentCode: json['incident_code'] as String? ?? '',
      incidentType:
          IncidentType.fromString(json['incident_type'] as String? ?? 'OTHER'),
      incidentTypeDisplay: json['incident_type_display'] as String?,
      siteId: json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      description: json['description'] as String? ?? '',
      severity:
          SeverityLevel.fromString(json['severity'] as String? ?? 'LOW'),
      severityDisplay: json['severity_display'] as String?,
      status: IncidentStatus.fromString(
          json['status'] as String? ?? 'REPORTED'),
      statusDisplay: json['status_display'] as String?,
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      time: json['time'] as String?,
      locationDescription:
          json['location_description'] as String? ?? '',
      gpsLatitude: (json['gps_latitude'] != null)
          ? double.tryParse(json['gps_latitude'].toString())
          : null,
      gpsLongitude: (json['gps_longitude'] != null)
          ? double.tryParse(json['gps_longitude'].toString())
          : null,
      rootCause: json['root_cause'] as String? ?? '',
      contributingFactors: json['contributing_factors'] as String? ?? '',
      injuriesCount: json['injuries_count'] as int? ?? 0,
      fatalitiesCount: json['fatalities_count'] as int? ?? 0,
      lostWorkDays: json['lost_work_days'] as int? ?? 0,
      estimatedCost: (json['estimated_cost'] != null)
          ? double.tryParse(json['estimated_cost'].toString())
          : null,
      actionsTaken: json['actions_taken'] as String? ?? '',
      correctiveActions: json['corrective_actions'] as String? ?? '',
      preventiveMeasures: json['preventive_measures'] as String? ?? '',
      photoUrl: json['photo'] as String?,
      reportedById: json['reported_by'] as int?,
      reportedByName: json['reported_by_name'] as String?,
      investigatedById: json['investigated_by'] as int?,
      investigatedByName: json['investigated_by_name'] as String?,
      closedById: json['closed_by'] as int?,
      closedByName: json['closed_by_name'] as String?,
      closedAt: json['closed_at'] != null
          ? DateTime.tryParse(json['closed_at'].toString())
          : null,
      alertSent: json['alert_sent'] as bool? ?? false,
      photos: photos,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
    );
  }

  /// Convertir en JSON pour envoi au backend (create / update)
  Map<String, dynamic> toJson() {
    return {
      'incident_code': incidentCode,
      'incident_type': incidentType.value,
      'description': description,
      'severity': severity.value,
      'status': status.value,
      'site': siteId,
      'date': '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
      if (time != null && time!.isNotEmpty) 'time': time,
      if (locationDescription.isNotEmpty)
        'location_description': locationDescription,
      if (gpsLatitude != null) 'gps_latitude': gpsLatitude,
      if (gpsLongitude != null) 'gps_longitude': gpsLongitude,
      if (rootCause.isNotEmpty) 'root_cause': rootCause,
      if (contributingFactors.isNotEmpty)
        'contributing_factors': contributingFactors,
      'injuries_count': injuriesCount,
      'fatalities_count': fatalitiesCount,
      'lost_work_days': lostWorkDays,
      if (estimatedCost != null) 'estimated_cost': estimatedCost,
      if (actionsTaken.isNotEmpty) 'actions_taken': actionsTaken,
      if (correctiveActions.isNotEmpty)
        'corrective_actions': correctiveActions,
      if (preventiveMeasures.isNotEmpty)
        'preventive_measures': preventiveMeasures,
    };
  }

  IncidentModel copyWith({
    int? id,
    String? incidentCode,
    IncidentType? incidentType,
    String? incidentTypeDisplay,
    int? siteId,
    String? siteName,
    String? description,
    SeverityLevel? severity,
    String? severityDisplay,
    IncidentStatus? status,
    String? statusDisplay,
    DateTime? date,
    String? time,
    String? locationDescription,
    double? gpsLatitude,
    double? gpsLongitude,
    String? rootCause,
    String? contributingFactors,
    int? injuriesCount,
    int? fatalitiesCount,
    int? lostWorkDays,
    double? estimatedCost,
    String? actionsTaken,
    String? correctiveActions,
    String? preventiveMeasures,
    String? photoUrl,
    int? reportedById,
    String? reportedByName,
    int? investigatedById,
    String? investigatedByName,
    int? closedById,
    String? closedByName,
    DateTime? closedAt,
    bool? alertSent,
    List<IncidentPhotoModel>? photos,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return IncidentModel(
      id: id ?? this.id,
      incidentCode: incidentCode ?? this.incidentCode,
      incidentType: incidentType ?? this.incidentType,
      incidentTypeDisplay: incidentTypeDisplay ?? this.incidentTypeDisplay,
      siteId: siteId ?? this.siteId,
      siteName: siteName ?? this.siteName,
      description: description ?? this.description,
      severity: severity ?? this.severity,
      severityDisplay: severityDisplay ?? this.severityDisplay,
      status: status ?? this.status,
      statusDisplay: statusDisplay ?? this.statusDisplay,
      date: date ?? this.date,
      time: time ?? this.time,
      locationDescription: locationDescription ?? this.locationDescription,
      gpsLatitude: gpsLatitude ?? this.gpsLatitude,
      gpsLongitude: gpsLongitude ?? this.gpsLongitude,
      rootCause: rootCause ?? this.rootCause,
      contributingFactors: contributingFactors ?? this.contributingFactors,
      injuriesCount: injuriesCount ?? this.injuriesCount,
      fatalitiesCount: fatalitiesCount ?? this.fatalitiesCount,
      lostWorkDays: lostWorkDays ?? this.lostWorkDays,
      estimatedCost: estimatedCost ?? this.estimatedCost,
      actionsTaken: actionsTaken ?? this.actionsTaken,
      correctiveActions: correctiveActions ?? this.correctiveActions,
      preventiveMeasures: preventiveMeasures ?? this.preventiveMeasures,
      photoUrl: photoUrl ?? this.photoUrl,
      reportedById: reportedById ?? this.reportedById,
      reportedByName: reportedByName ?? this.reportedByName,
      investigatedById: investigatedById ?? this.investigatedById,
      investigatedByName: investigatedByName ?? this.investigatedByName,
      closedById: closedById ?? this.closedById,
      closedByName: closedByName ?? this.closedByName,
      closedAt: closedAt ?? this.closedAt,
      alertSent: alertSent ?? this.alertSent,
      photos: photos ?? this.photos,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
