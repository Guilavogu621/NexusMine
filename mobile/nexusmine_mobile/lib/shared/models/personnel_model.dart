/// Modèle Personnel — aligné sur PersonnelSerializer Django
class PersonnelModel {
  final int id;
  final String employeeId;
  final String firstName;
  final String lastName;
  final String position;
  final String role;
  final String? roleDisplay;
  final String? department;
  final String? phone;
  final String? email;
  final String? emergencyContact;
  final String? emergencyPhone;
  final String status;
  final String? statusDisplay;
  final int? siteId;
  final String? siteName;
  final String approvalStatus;
  final String? approvalStatusDisplay;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  PersonnelModel({
    required this.id,
    required this.employeeId,
    required this.firstName,
    required this.lastName,
    required this.position,
    required this.role,
    this.roleDisplay,
    this.department,
    this.phone,
    this.email,
    this.emergencyContact,
    this.emergencyPhone,
    required this.status,
    this.statusDisplay,
    this.siteId,
    this.siteName,
    this.approvalStatus = 'PENDING',
    this.approvalStatusDisplay,
    this.createdAt,
    this.updatedAt,
  });

  String get fullName => '$firstName $lastName'.trim();
  bool get isActive => status == 'ACTIVE';

  factory PersonnelModel.fromJson(Map<String, dynamic> json) {
    return PersonnelModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as String? ?? '',
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      position: json['position'] as String? ?? '',
      role: json['role'] as String? ?? 'TECHNICIAN',
      roleDisplay: json['role_display'] as String?,
      department: json['department'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      emergencyContact: json['emergency_contact'] as String?,
      emergencyPhone: json['emergency_phone'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
      statusDisplay: json['status_display'] as String?,
      siteId: json['site'] as int?,
      siteName: json['site_name'] as String?,
      approvalStatus: json['approval_status'] as String? ?? 'PENDING',
      approvalStatusDisplay: json['approval_status_display'] as String?,
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
      'employee_id': employeeId,
      'first_name': firstName,
      'last_name': lastName,
      'position': position,
      'role': role,
      'department': department,
      'phone': phone,
      'email': email,
      'emergency_contact': emergencyContact,
      'emergency_phone': emergencyPhone,
      'status': status,
      'site': siteId,
    };
  }
}

/// Rôles du personnel
enum PersonnelRole {
  technician('TECHNICIAN', 'Technicien'),
  engineer('ENGINEER', 'Ingénieur'),
  operator('OPERATOR', 'Opérateur d\'engins'),
  driver('DRIVER', 'Chauffeur'),
  supervisor('SUPERVISOR', 'Chef d\'équipe'),
  hseOfficer('HSE_OFFICER', 'Agent HSE'),
  maintenance('MAINTENANCE', 'Agent de maintenance'),
  security('SECURITY', 'Agent de sécurité'),
  admin('ADMIN', 'Administratif'),
  other('OTHER', 'Autre');

  final String value;
  final String label;
  const PersonnelRole(this.value, this.label);

  static PersonnelRole fromString(String value) {
    return PersonnelRole.values.firstWhere(
      (e) => e.value == value,
      orElse: () => PersonnelRole.technician,
    );
  }
}
