/// Modèle utilisateur — aligné sur le UserSerializer Django
class UserModel {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? phone;
  final bool isActive;
  final String? profilePhotoUrl;
  final List<int> assignedSites;
  final List<Map<String, dynamic>> assignedSitesDetails;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  
  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.phone,
    this.isActive = true,
    this.profilePhotoUrl,
    this.assignedSites = const [],
    this.assignedSitesDetails = const [],
    this.createdAt,
    this.updatedAt,
  });
  
  String get fullName => '$firstName $lastName'.trim();
  
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final last = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$first$last';
  }
  
  /// Libellé du rôle — rôles réels NexusMine
  String get roleLabel {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'SITE_MANAGER':
        return 'Chef de site / Gestionnaire';
      case 'TECHNICIEN':
        return 'Technicien / Ingénieur terrain';
      case 'ANALYST':
        return 'Analyste';
      case 'MMG':
        return 'Audit MMG';
      default:
        return role;
    }
  }
  
  // ── Helpers de rôle ──
  bool get isAdmin => role == 'ADMIN';
  bool get isSiteManager => role == 'ADMIN' || role == 'SITE_MANAGER';
  bool get isTechnicien => role == 'TECHNICIEN';
  bool get isAnalyst => role == 'ANALYST';
  bool get isMMG => role == 'MMG';
  
  /// L'utilisateur peut créer / modifier des données opérationnelles
  bool get canEdit => role != 'MMG';
  
  /// Nom du premier site assigné (raccourci)
  String? get primarySiteName {
    if (assignedSitesDetails.isNotEmpty) {
      return assignedSitesDetails.first['name'] as String?;
    }
    return null;
  }
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    // assigned_sites peut être une liste d'ints
    final rawSites = json['assigned_sites'];
    final siteIds = rawSites is List
        ? rawSites.map((e) => e is int ? e : int.tryParse(e.toString()) ?? 0).toList()
        : <int>[];
    
    // assigned_sites_details est une liste de {id, name, code}
    final rawDetails = json['assigned_sites_details'];
    final siteDetails = rawDetails is List
        ? rawDetails.map((e) => Map<String, dynamic>.from(e as Map)).toList()
        : <Map<String, dynamic>>[];
    
    // id peut être int ou String selon la source (API profil vs JWT)
    final rawId = json['id'];
    final parsedId = rawId is int ? rawId : int.tryParse(rawId?.toString() ?? '0') ?? 0;

    return UserModel(
      id: parsedId,
      email: json['email']?.toString() ?? '',
      firstName: json['first_name']?.toString() ?? '',
      lastName: json['last_name']?.toString() ?? '',
      role: json['role']?.toString() ?? 'OPERATOR',
      phone: json['phone']?.toString(),
      isActive: json['is_active'] == true,
      profilePhotoUrl: json['profile_photo_url']?.toString(),
      assignedSites: siteIds,
      assignedSitesDetails: siteDetails,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'role': role,
      'phone': phone,
      'is_active': isActive,
      'profile_photo_url': profilePhotoUrl,
      'assigned_sites': assignedSites,
      'assigned_sites_details': assignedSitesDetails,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
  
  UserModel copyWith({
    int? id,
    String? email,
    String? firstName,
    String? lastName,
    String? role,
    String? phone,
    bool? isActive,
    String? profilePhotoUrl,
    List<int>? assignedSites,
    List<Map<String, dynamic>>? assignedSitesDetails,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
      phone: phone ?? this.phone,
      isActive: isActive ?? this.isActive,
      profilePhotoUrl: profilePhotoUrl ?? this.profilePhotoUrl,
      assignedSites: assignedSites ?? this.assignedSites,
      assignedSitesDetails: assignedSitesDetails ?? this.assignedSitesDetails,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
