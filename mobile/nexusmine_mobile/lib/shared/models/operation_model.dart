/// Modèle Opération minière — aligné sur OperationSerializer Django
class OperationModel {
  final int id;
  final String operationCode;
  final String operationType;
  final String? operationTypeDisplay;
  final int siteId;
  final String? siteName;
  final int? workZoneId;
  final String? workZoneName;
  final int? shiftId;
  final String? shiftInfo;
  final String date;
  final String? startTime;
  final String? endTime;
  final String status;
  final String? statusDisplay;
  final String validationStatus;
  final String? validationStatusDisplay;
  final String? validationDate;
  final String? rejectionReason;
  final String description;
  final double? quantityExtracted;
  final double? quantityTransported;
  final double? quantityProcessed;
  final double? gpsLatitude;
  final double? gpsLongitude;
  final String? photo;
  final int? createdById;
  final String? createdByName;
  final int? validatedById;
  final String? validatedByName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  OperationModel({
    required this.id,
    required this.operationCode,
    required this.operationType,
    this.operationTypeDisplay,
    required this.siteId,
    this.siteName,
    this.workZoneId,
    this.workZoneName,
    this.shiftId,
    this.shiftInfo,
    required this.date,
    this.startTime,
    this.endTime,
    required this.status,
    this.statusDisplay,
    required this.validationStatus,
    this.validationStatusDisplay,
    this.validationDate,
    this.rejectionReason,
    this.description = '',
    this.quantityExtracted,
    this.quantityTransported,
    this.quantityProcessed,
    this.gpsLatitude,
    this.gpsLongitude,
    this.photo,
    this.createdById,
    this.createdByName,
    this.validatedById,
    this.validatedByName,
    this.createdAt,
    this.updatedAt,
  });

  bool get isPending => validationStatus == 'PENDING';
  bool get isApproved => validationStatus == 'APPROVED';
  bool get isRejected => validationStatus == 'REJECTED';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';

  factory OperationModel.fromJson(Map<String, dynamic> json) {
    return OperationModel(
      id: json['id'] as int,
      operationCode: json['operation_code'] as String? ?? '',
      operationType: json['operation_type'] as String? ?? 'EXTRACTION',
      operationTypeDisplay: json['operation_type_display'] as String?,
      siteId: json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      workZoneId: json['work_zone'] as int?,
      workZoneName: json['work_zone_name'] as String?,
      shiftId: json['shift'] as int?,
      shiftInfo: json['shift_info'] as String?,
      date: json['date'] as String? ?? '',
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      status: json['status'] as String? ?? 'PLANNED',
      statusDisplay: json['status_display'] as String?,
      validationStatus: json['validation_status'] as String? ?? 'PENDING',
      validationStatusDisplay: json['validation_status_display'] as String?,
      validationDate: json['validation_date'] as String?,
      rejectionReason: json['rejection_reason'] as String?,
      description: json['description'] as String? ?? '',
      quantityExtracted: (json['quantity_extracted'] as num?)?.toDouble(),
      quantityTransported: (json['quantity_transported'] as num?)?.toDouble(),
      quantityProcessed: (json['quantity_processed'] as num?)?.toDouble(),
      gpsLatitude: (json['gps_latitude'] as num?)?.toDouble(),
      gpsLongitude: (json['gps_longitude'] as num?)?.toDouble(),
      photo: json['photo'] as String?,
      createdById: json['created_by'] as int?,
      createdByName: json['created_by_name'] as String?,
      validatedById: json['validated_by'] as int?,
      validatedByName: json['validated_by_name'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'operation_code': operationCode,
      'operation_type': operationType,
      'site': siteId,
      'work_zone': workZoneId,
      'shift': shiftId,
      'date': date,
      'start_time': startTime,
      'end_time': endTime,
      'status': status,
      'description': description,
      'quantity_extracted': quantityExtracted,
      'quantity_transported': quantityTransported,
      'quantity_processed': quantityProcessed,
      'gps_latitude': gpsLatitude,
      'gps_longitude': gpsLongitude,
    };
  }
}

/// Types d'opérations
enum OperationType {
  extraction('EXTRACTION', 'Extraction'),
  drilling('DRILLING', 'Forage'),
  blasting('BLASTING', 'Dynamitage'),
  transport('TRANSPORT', 'Transport'),
  processing('PROCESSING', 'Traitement'),
  loading('LOADING', 'Chargement'),
  unloading('UNLOADING', 'Déchargement'),
  expedition('EXPEDITION', 'Expédition'),
  maintenance('MAINTENANCE', 'Maintenance'),
  inspection('INSPECTION', 'Inspection'),
  other('OTHER', 'Autre');

  final String value;
  final String label;
  const OperationType(this.value, this.label);

  static OperationType fromString(String value) {
    return OperationType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => OperationType.extraction,
    );
  }
}

/// Statuts d'opération
enum OperationStatus {
  planned('PLANNED', 'Planifiée'),
  inProgress('IN_PROGRESS', 'En cours'),
  completed('COMPLETED', 'Terminée'),
  cancelled('CANCELLED', 'Annulée');

  final String value;
  final String label;
  const OperationStatus(this.value, this.label);

  static OperationStatus fromString(String value) {
    return OperationStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => OperationStatus.planned,
    );
  }
}

/// Statuts de validation
enum ValidationStatus {
  pending('PENDING', 'En attente'),
  approved('APPROVED', 'Approuvée'),
  rejected('REJECTED', 'Rejetée');

  final String value;
  final String label;
  const ValidationStatus(this.value, this.label);

  static ValidationStatus fromString(String value) {
    return ValidationStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ValidationStatus.pending,
    );
  }
}
