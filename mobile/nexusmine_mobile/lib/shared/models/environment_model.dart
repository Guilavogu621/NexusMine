/// Modèle Données Environnementales
class EnvironmentDataModel {
  final int id;
  final int siteId;
  final String? siteName;
  final DateTime recordedAt;
  final int? recordedById;
  final String? recordedByName;
  
  // Qualité de l'air
  final double? pm25;
  final double? pm10;
  final double? co2;
  final double? no2;
  final double? so2;
  
  // Qualité de l'eau
  final double? ph;
  final double? turbidity;
  final double? dissolvedOxygen;
  final double? temperature;
  
  // Bruit
  final double? noiseLevel;
  
  // Météo
  final double? ambientTemperature;
  final double? humidity;
  final double? windSpeed;
  final String? windDirection;
  
  final String? notes;
  final double? latitude;
  final double? longitude;
  
  EnvironmentDataModel({
    required this.id,
    required this.siteId,
    this.siteName,
    required this.recordedAt,
    this.recordedById,
    this.recordedByName,
    this.pm25,
    this.pm10,
    this.co2,
    this.no2,
    this.so2,
    this.ph,
    this.turbidity,
    this.dissolvedOxygen,
    this.temperature,
    this.noiseLevel,
    this.ambientTemperature,
    this.humidity,
    this.windSpeed,
    this.windDirection,
    this.notes,
    this.latitude,
    this.longitude,
  });
  
  factory EnvironmentDataModel.fromJson(Map<String, dynamic> json) {
    return EnvironmentDataModel(
      id: json['id'] as int,
      siteId: json['site_id'] as int? ?? json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      recordedAt: DateTime.parse(json['recorded_at'] as String? ?? DateTime.now().toIso8601String()),
      recordedById: json['recorded_by_id'] as int? ?? json['recorded_by'] as int?,
      recordedByName: json['recorded_by_name'] as String?,
      pm25: (json['pm25'] as num?)?.toDouble(),
      pm10: (json['pm10'] as num?)?.toDouble(),
      co2: (json['co2'] as num?)?.toDouble(),
      no2: (json['no2'] as num?)?.toDouble(),
      so2: (json['so2'] as num?)?.toDouble(),
      ph: (json['ph'] as num?)?.toDouble(),
      turbidity: (json['turbidity'] as num?)?.toDouble(),
      dissolvedOxygen: (json['dissolved_oxygen'] as num?)?.toDouble(),
      temperature: (json['temperature'] as num?)?.toDouble(),
      noiseLevel: (json['noise_level'] as num?)?.toDouble(),
      ambientTemperature: (json['ambient_temperature'] as num?)?.toDouble(),
      humidity: (json['humidity'] as num?)?.toDouble(),
      windSpeed: (json['wind_speed'] as num?)?.toDouble(),
      windDirection: json['wind_direction'] as String?,
      notes: json['notes'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'site': siteId,
      'pm25': pm25,
      'pm10': pm10,
      'co2': co2,
      'no2': no2,
      'so2': so2,
      'ph': ph,
      'turbidity': turbidity,
      'dissolved_oxygen': dissolvedOxygen,
      'temperature': temperature,
      'noise_level': noiseLevel,
      'ambient_temperature': ambientTemperature,
      'humidity': humidity,
      'wind_speed': windSpeed,
      'wind_direction': windDirection,
      'notes': notes,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
