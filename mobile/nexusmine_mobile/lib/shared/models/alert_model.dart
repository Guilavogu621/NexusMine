import '../../core/constants/app_constants.dart';

/// Modèle Alerte — aligné sur le backend (status field)
class AlertModel {
  final int id;
  final String title;
  final String message;
  final SeverityLevel severity;
  final String type;
  final int siteId;
  final String? siteName;
  final String status; // NEW, READ, IN_PROGRESS, RESOLVED, ARCHIVED
  final DateTime createdAt;
  final DateTime? readAt;
  final DateTime? resolvedAt;
  
  AlertModel({
    required this.id,
    required this.title,
    required this.message,
    required this.severity,
    required this.type,
    required this.siteId,
    this.siteName,
    this.status = 'NEW',
    required this.createdAt,
    this.readAt,
    this.resolvedAt,
  });
  
  /// Dérivé du status backend
  bool get isRead => status != 'NEW';
  bool get isAcknowledged => status == 'RESOLVED' || status == 'ARCHIVED';
  bool get isActive => status == 'NEW' || status == 'READ' || status == 'IN_PROGRESS';
  
  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      severity: SeverityLevel.fromString(json['severity'] as String? ?? 'low'),
      type: json['type'] as String? ?? json['alert_type'] as String? ?? '',
      siteId: json['site_id'] as int? ?? json['site'] as int? ?? 0,
      siteName: json['site_name'] as String?,
      status: json['status'] as String? ?? 'NEW',
      createdAt: DateTime.parse(
        json['generated_at'] as String? ?? 
        json['created_at'] as String? ?? 
        DateTime.now().toIso8601String(),
      ),
      readAt: json['read_at'] != null
          ? DateTime.tryParse(json['read_at'] as String)
          : null,
      resolvedAt: json['resolved_at'] != null
          ? DateTime.tryParse(json['resolved_at'] as String)
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'message': message,
      'severity': severity.value,
      'type': type,
      'site': siteId,
      'status': status,
    };
  }
}
