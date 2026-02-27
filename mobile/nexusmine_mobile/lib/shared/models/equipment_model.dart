import '../../core/constants/app_constants.dart';

/// Modèle Équipement
class EquipmentModel {
  final int id;
  final String name;
  final String? code;
  final String type;
  final EquipmentStatus status;
  final int siteId;
  final String? siteName;
  final String? manufacturer;
  final String? model;
  final String? serialNumber;
  final DateTime? purchaseDate;
  final DateTime? lastMaintenanceDate;
  final DateTime? nextMaintenanceDate;
  final String? description;
  final double? latitude;
  final double? longitude;
  
  EquipmentModel({
    required this.id,
    required this.name,
    this.code,
    required this.type,
    required this.status,
    required this.siteId,
    this.siteName,
    this.manufacturer,
    this.model,
    this.serialNumber,
    this.purchaseDate,
    this.lastMaintenanceDate,
    this.nextMaintenanceDate,
    this.description,
    this.latitude,
    this.longitude,
  });
  
  bool get needsMaintenance {
    if (nextMaintenanceDate == null) return false;
    return DateTime.now().isAfter(nextMaintenanceDate!);
  }
  
  bool get isOperational => status == EquipmentStatus.operational;
  
  factory EquipmentModel.fromJson(Map<String, dynamic> json) {
    return EquipmentModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      code: json['code'] as String?,
      type: json['type'] as String? ?? json['equipment_type'] as String? ?? '',
      status: EquipmentStatus.fromString(json['status'] as String? ?? 'operational'),
      siteId: json['site_id'] as int? ?? json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      manufacturer: json['manufacturer'] as String?,
      model: json['model'] as String?,
      serialNumber: json['serial_number'] as String?,
      purchaseDate: json['purchase_date'] != null
          ? DateTime.tryParse(json['purchase_date'] as String)
          : null,
      lastMaintenanceDate: json['last_maintenance_date'] != null
          ? DateTime.tryParse(json['last_maintenance_date'] as String)
          : null,
      nextMaintenanceDate: json['next_maintenance_date'] != null
          ? DateTime.tryParse(json['next_maintenance_date'] as String)
          : null,
      description: json['description'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'code': code,
      'type': type,
      'status': status.value,
      'site': siteId,
      'manufacturer': manufacturer,
      'model': model,
      'serial_number': serialNumber,
      'purchase_date': purchaseDate?.toIso8601String().split('T')[0],
      'last_maintenance_date': lastMaintenanceDate?.toIso8601String().split('T')[0],
      'next_maintenance_date': nextMaintenanceDate?.toIso8601String().split('T')[0],
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
