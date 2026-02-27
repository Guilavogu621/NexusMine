/// Types d'indicateurs KPI
enum IndicatorType {
  production('PRODUCTION', 'Production'),
  efficiency('EFFICIENCY', 'Efficacité'),
  safety('SAFETY', 'Sécurité'),
  environmental('ENVIRONMENTAL', 'Environnement'),
  equipment('EQUIPMENT', 'Équipement'),
  financial('FINANCIAL', 'Financier');

  final String value;
  final String label;
  const IndicatorType(this.value, this.label);

  static IndicatorType fromValue(String value) {
    return IndicatorType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => IndicatorType.production,
    );
  }
}

/// Modèle Indicateur (KPI) — conforme au backend Indicator
class IndicatorModel {
  final int id;
  final String name;
  final String indicatorType;
  final String? indicatorTypeDisplay;
  final String? description;
  final int? siteId;
  final String? siteName;
  final double? calculatedValue;
  final double? targetValue;
  final String? unit;
  final double? thresholdWarning;
  final double? thresholdCritical;
  final DateTime? calculationDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  IndicatorModel({
    required this.id,
    required this.name,
    required this.indicatorType,
    this.indicatorTypeDisplay,
    this.description,
    this.siteId,
    this.siteName,
    this.calculatedValue,
    this.targetValue,
    this.unit,
    this.thresholdWarning,
    this.thresholdCritical,
    this.calculationDate,
    this.createdAt,
    this.updatedAt,
  });

  /// Pourcentage d'atteinte de l'objectif (0-100+)
  double? get progressPercent {
    if (calculatedValue == null || targetValue == null || targetValue == 0) {
      return null;
    }
    return (calculatedValue! / targetValue!) * 100;
  }

  /// Statut de performance : bon, attention, critique
  String get performanceStatus {
    if (calculatedValue == null) return 'unknown';
    if (thresholdCritical != null && calculatedValue! >= thresholdCritical!) {
      return 'critical';
    }
    if (thresholdWarning != null && calculatedValue! >= thresholdWarning!) {
      return 'warning';
    }
    return 'good';
  }

  factory IndicatorModel.fromJson(Map<String, dynamic> json) {
    return IndicatorModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      indicatorType: json['indicator_type'] as String? ?? 'PRODUCTION',
      indicatorTypeDisplay: json['indicator_type_display'] as String?,
      description: json['description'] as String?,
      siteId: json['site'] as int?,
      siteName: json['site_name'] as String?,
      calculatedValue: (json['calculated_value'] as num?)?.toDouble(),
      targetValue: (json['target_value'] as num?)?.toDouble(),
      unit: json['unit'] as String?,
      thresholdWarning: (json['threshold_warning'] as num?)?.toDouble(),
      thresholdCritical: (json['threshold_critical'] as num?)?.toDouble(),
      calculationDate: json['calculation_date'] != null
          ? DateTime.tryParse(json['calculation_date'] as String)
          : null,
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
      'indicator_type': indicatorType,
      'description': description,
      'site': siteId,
      'calculated_value': calculatedValue,
      'target_value': targetValue,
      'unit': unit,
      'threshold_warning': thresholdWarning,
      'threshold_critical': thresholdCritical,
    };
  }
}
