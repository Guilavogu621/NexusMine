/// Modèle Site Minier — conforme au backend MiningSite
class SiteModel {
  final int id;
  final String name;
  final String? code;
  final String? mineralType;
  final String? mineralTypeDisplay;
  final String? region;
  final String? prefecture;
  final String? location;
  final double? latitude;
  final double? longitude;
  final double? surfaceArea;
  final String? siteType;
  final String? siteTypeDisplay;
  final String? status;
  final String? statusDisplay;
  final String? operatorName;
  final String? description;
  final String? licenseDate;
  final String? licenseExpiry;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  SiteModel({
    required this.id,
    required this.name,
    this.code,
    this.mineralType,
    this.mineralTypeDisplay,
    this.region,
    this.prefecture,
    this.location,
    this.latitude,
    this.longitude,
    this.surfaceArea,
    this.siteType,
    this.siteTypeDisplay,
    this.status,
    this.statusDisplay,
    this.operatorName,
    this.description,
    this.licenseDate,
    this.licenseExpiry,
    this.createdAt,
    this.updatedAt,
  });

  bool get isActive => status == 'ACTIVE';
  bool get isSuspended => status == 'SUSPENDED';
  bool get isClosed => status == 'CLOSED';

  factory SiteModel.fromJson(Map<String, dynamic> json) {
    return SiteModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      code: json['code'] as String?,
      mineralType: json['mineral_type'] as String?,
      mineralTypeDisplay: json['mineral_type_display'] as String?,
      region: json['region'] as String?,
      prefecture: json['prefecture'] as String?,
      location: json['location'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      surfaceArea: (json['surface_area'] as num?)?.toDouble(),
      siteType: json['site_type'] as String?,
      siteTypeDisplay: json['site_type_display'] as String?,
      status: json['status'] as String?,
      statusDisplay: json['status_display'] as String?,
      operatorName: json['operator_name'] as String?,
      description: json['description'] as String?,
      licenseDate: json['license_date'] as String?,
      licenseExpiry: json['license_expiry'] as String?,
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
      'name': name,
      'code': code,
      'mineral_type': mineralType,
      'region': region,
      'prefecture': prefecture,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'surface_area': surfaceArea,
      'site_type': siteType,
      'status': status,
      'operator_name': operatorName,
      'description': description,
      'license_date': licenseDate,
      'license_expiry': licenseExpiry,
    };
  }
}
