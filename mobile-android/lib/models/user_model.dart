class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? familyId;
  final String? phone;
  final String? relationship;
  final String? profileImage;
  final String accountStatus;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.familyId,
    this.phone,
    this.relationship,
    this.profileImage,
    required this.accountStatus,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'member',
      familyId: json['familyId'] is Map ? json['familyId']['_id'] : json['familyId'],
      phone: json['phone'],
      relationship: json['relationship'],
      profileImage: json['profileImage'],
      accountStatus: json['accountStatus'] ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'familyId': familyId,
      'phone': phone,
      'relationship': relationship,
      'profileImage': profileImage,
      'accountStatus': accountStatus,
    };
  }
}
