/// Modèle Mouvement de stock — aligné sur StockMovementSerializer Django
class StockMovementModel {
  final int id;
  final String movementCode;
  final String movementType;
  final String? movementTypeDisplay;
  final int locationId;
  final String? locationName;
  final int? destinationLocationId;
  final String? destinationLocationName;
  final String mineralType;
  final String? mineralTypeDisplay;
  final double quantity;
  final double? grade;
  final String date;
  final int? operationId;
  final String? operationCode;
  final String? destination;
  final String? transportReference;
  final String notes;
  final int? createdById;
  final String? createdByName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  StockMovementModel({
    required this.id,
    required this.movementCode,
    required this.movementType,
    this.movementTypeDisplay,
    required this.locationId,
    this.locationName,
    this.destinationLocationId,
    this.destinationLocationName,
    required this.mineralType,
    this.mineralTypeDisplay,
    required this.quantity,
    this.grade,
    required this.date,
    this.operationId,
    this.operationCode,
    this.destination,
    this.transportReference,
    this.notes = '',
    this.createdById,
    this.createdByName,
    this.createdAt,
    this.updatedAt,
  });

  factory StockMovementModel.fromJson(Map<String, dynamic> json) {
    return StockMovementModel(
      id: json['id'] as int,
      movementCode: json['movement_code'] as String? ?? '',
      movementType: json['movement_type'] as String? ?? 'EXTRACTION',
      movementTypeDisplay: json['movement_type_display'] as String?,
      locationId: json['location'] as int? ?? 0,
      locationName: json['location_name'] as String?,
      destinationLocationId: json['destination_location'] as int?,
      destinationLocationName: json['destination_location_name'] as String?,
      mineralType: json['mineral_type'] as String? ?? 'BAUXITE',
      mineralTypeDisplay: json['mineral_type_display'] as String?,
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0,
      grade: (json['grade'] as num?)?.toDouble(),
      date: json['date'] as String? ?? '',
      operationId: json['operation'] as int?,
      operationCode: json['operation_code'] as String?,
      destination: json['destination'] as String?,
      transportReference: json['transport_reference'] as String?,
      notes: json['notes'] as String? ?? '',
      createdById: json['created_by'] as int?,
      createdByName: json['created_by_name'] as String?,
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
      'movement_code': movementCode,
      'movement_type': movementType,
      'location': locationId,
      'destination_location': destinationLocationId,
      'mineral_type': mineralType,
      'quantity': quantity,
      'grade': grade,
      'date': date,
      'operation': operationId,
      'destination': destination,
      'transport_reference': transportReference,
      'notes': notes,
    };
  }
}

/// Modèle Emplacement de stock
class StockLocationModel {
  final int id;
  final String code;
  final String name;
  final int? siteId;
  final String? siteName;
  final String locationType;
  final String? locationTypeDisplay;
  final double? capacity;
  final double? currentStock;
  final double? gpsLatitude;
  final double? gpsLongitude;
  final String description;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  StockLocationModel({
    required this.id,
    required this.code,
    required this.name,
    this.siteId,
    this.siteName,
    required this.locationType,
    this.locationTypeDisplay,
    this.capacity,
    this.currentStock,
    this.gpsLatitude,
    this.gpsLongitude,
    this.description = '',
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  double get fillPercentage {
    if (capacity == null || capacity == 0 || currentStock == null) return 0;
    return (currentStock! / capacity!) * 100;
  }

  factory StockLocationModel.fromJson(Map<String, dynamic> json) {
    return StockLocationModel(
      id: json['id'] as int,
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? '',
      siteId: json['site'] as int?,
      siteName: json['site_name'] as String?,
      locationType: json['location_type'] as String? ?? 'STOCKPILE',
      locationTypeDisplay: json['location_type_display'] as String?,
      capacity: (json['capacity'] as num?)?.toDouble(),
      currentStock: (json['current_stock'] as num?)?.toDouble(),
      gpsLatitude: (json['gps_latitude'] as num?)?.toDouble(),
      gpsLongitude: (json['gps_longitude'] as num?)?.toDouble(),
      description: json['description'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : null,
    );
  }
}

/// Modèle Synthèse stock
class StockSummaryModel {
  final int id;
  final int siteId;
  final String? siteName;
  final String mineralType;
  final String? mineralTypeDisplay;
  final double initialStock;
  final double totalExtracted;
  final double totalExpedited;
  final double currentStock;
  final DateTime? lastUpdated;

  StockSummaryModel({
    required this.id,
    required this.siteId,
    this.siteName,
    required this.mineralType,
    this.mineralTypeDisplay,
    required this.initialStock,
    required this.totalExtracted,
    required this.totalExpedited,
    required this.currentStock,
    this.lastUpdated,
  });

  factory StockSummaryModel.fromJson(Map<String, dynamic> json) {
    return StockSummaryModel(
      id: json['id'] as int,
      siteId: json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      mineralType: json['mineral_type'] as String? ?? 'BAUXITE',
      mineralTypeDisplay: json['mineral_type_display'] as String?,
      initialStock: (json['initial_stock'] as num?)?.toDouble() ?? 0,
      totalExtracted: (json['total_extracted'] as num?)?.toDouble() ?? 0,
      totalExpedited: (json['total_expedited'] as num?)?.toDouble() ?? 0,
      currentStock: (json['current_stock'] as num?)?.toDouble() ?? 0,
      lastUpdated: json['last_updated'] != null
          ? DateTime.tryParse(json['last_updated'] as String)
          : null,
    );
  }
}

/// Types de mouvement
enum MovementType {
  initial('INITIAL', 'Stock initial'),
  extraction('EXTRACTION', 'Extraction'),
  expedition('EXPEDITION', 'Expédition'),
  transferIn('TRANSFER_IN', 'Transfert entrant'),
  transferOut('TRANSFER_OUT', 'Transfert sortant'),
  adjustment('ADJUSTMENT', 'Ajustement'),
  loss('LOSS', 'Perte/Déchet');

  final String value;
  final String label;
  const MovementType(this.value, this.label);

  static MovementType fromString(String value) {
    return MovementType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MovementType.extraction,
    );
  }
}

/// Types de minerai
enum MineralType {
  bauxite('BAUXITE', 'Bauxite'),
  iron('IRON', 'Fer'),
  gold('GOLD', 'Or'),
  diamond('DIAMOND', 'Diamant'),
  manganese('MANGANESE', 'Manganèse'),
  uranium('URANIUM', 'Uranium'),
  other('OTHER', 'Autre');

  final String value;
  final String label;
  const MineralType(this.value, this.label);

  static MineralType fromString(String value) {
    return MineralType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MineralType.bauxite,
    );
  }
}
