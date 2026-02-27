/// Modèle Rapport — aligné sur ReportSerializer Django
class ReportModel {
  final int id;
  final String title;
  final String reportType;
  final String? reportTypeDisplay;
  final String status;
  final String? statusDisplay;
  final int? siteId;
  final String? siteName;
  final String periodStart;
  final String periodEnd;
  final String content;
  final String summary;
  final String? fileUrl;
  final int? generatedById;
  final String? generatedByName;
  final int? validatedById;
  final String? validatedByName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ReportModel({
    required this.id,
    required this.title,
    required this.reportType,
    this.reportTypeDisplay,
    required this.status,
    this.statusDisplay,
    this.siteId,
    this.siteName,
    required this.periodStart,
    required this.periodEnd,
    this.content = '',
    this.summary = '',
    this.fileUrl,
    this.generatedById,
    this.generatedByName,
    this.validatedById,
    this.validatedByName,
    this.createdAt,
    this.updatedAt,
  });

  bool get isDraft => status == 'DRAFT';
  bool get isPublished => status == 'PUBLISHED';

  factory ReportModel.fromJson(Map<String, dynamic> json) {
    return ReportModel(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      reportType: json['report_type'] as String? ?? 'MONTHLY',
      reportTypeDisplay: json['report_type_display'] as String?,
      status: json['status'] as String? ?? 'DRAFT',
      statusDisplay: json['status_display'] as String?,
      siteId: json['site'] as int?,
      siteName: json['site_name'] as String?,
      periodStart: json['period_start'] as String? ?? '',
      periodEnd: json['period_end'] as String? ?? '',
      content: json['content'] as String? ?? '',
      summary: json['summary'] as String? ?? '',
      fileUrl: json['file'] as String?,
      generatedById: json['generated_by'] as int?,
      generatedByName: json['generated_by_name'] as String?,
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
      'title': title,
      'report_type': reportType,
      'status': status,
      'site': siteId,
      'period_start': periodStart,
      'period_end': periodEnd,
      'content': content,
      'summary': summary,
    };
  }
}

/// Types de rapport
enum ReportType {
  daily('DAILY', 'Journalier'),
  weekly('WEEKLY', 'Hebdomadaire'),
  monthly('MONTHLY', 'Mensuel'),
  quarterly('QUARTERLY', 'Trimestriel'),
  annual('ANNUAL', 'Annuel'),
  incident('INCIDENT', 'Incident'),
  environmental('ENVIRONMENTAL', 'Environnemental'),
  custom('CUSTOM', 'Personnalisé');

  final String value;
  final String label;
  const ReportType(this.value, this.label);

  static ReportType fromString(String value) {
    return ReportType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ReportType.monthly,
    );
  }
}

/// Statuts de rapport
enum ReportStatus {
  draft('DRAFT', 'Brouillon'),
  generated('GENERATED', 'Généré'),
  validated('VALIDATED', 'Validé'),
  published('PUBLISHED', 'Publié');

  final String value;
  final String label;
  const ReportStatus(this.value, this.label);

  static ReportStatus fromString(String value) {
    return ReportStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => ReportStatus.draft,
    );
  }
}
