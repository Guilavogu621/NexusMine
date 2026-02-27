import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

/// Provider pour le stockage sécurisé
final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

/// Service de stockage sécurisé pour tokens et données sensibles
/// Utilise flutter_secure_storage sur mobile, SharedPreferences en fallback (web/Linux)
class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
    lOptions: LinuxOptions(),
    webOptions: WebOptions(
      dbName: 'nexusmine_secure',
      publicKey: 'nexusmine_key',
    ),
  );

  /// Fallback: on web/Linux si flutter_secure_storage échoue
  bool _useFallback = false;

  Future<void> _write(String key, String value) async {
    if (_useFallback) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
      return;
    }
    try {
      await _storage.write(key: key, value: value);
    } catch (e) {
      debugPrint('SecureStorage write failed, switching to SharedPreferences fallback: $e');
      _useFallback = true;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, value);
    }
  }

  Future<String?> _read(String key) async {
    if (_useFallback) {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    }
    try {
      return await _storage.read(key: key);
    } catch (e) {
      debugPrint('SecureStorage read failed, switching to SharedPreferences fallback: $e');
      _useFallback = true;
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    }
  }

  Future<void> _delete(String key) async {
    if (_useFallback) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
      return;
    }
    try {
      await _storage.delete(key: key);
    } catch (e) {
      debugPrint('SecureStorage delete failed: $e');
      _useFallback = true;
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(key);
    }
  }
  
  // Tokens
  
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _write(AppConstants.accessTokenKey, accessToken);
    await _write(AppConstants.refreshTokenKey, refreshToken);
  }
  
  Future<String?> getAccessToken() async {
    return _read(AppConstants.accessTokenKey);
  }
  
  Future<String?> getRefreshToken() async {
    return _read(AppConstants.refreshTokenKey);
  }
  
  Future<void> deleteTokens() async {
    await _delete(AppConstants.accessTokenKey);
    await _delete(AppConstants.refreshTokenKey);
  }
  
  // User data
  
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    final jsonString = jsonEncode(userData);
    await _write(AppConstants.userDataKey, jsonString);
  }
  
  Future<Map<String, dynamic>?> getUserData() async {
    final jsonString = await _read(AppConstants.userDataKey);
    if (jsonString != null) {
      return jsonDecode(jsonString) as Map<String, dynamic>;
    }
    return null;
  }
  
  Future<void> deleteUserData() async {
    await _delete(AppConstants.userDataKey);
  }
  
  // Site sélectionné
  
  Future<void> saveSelectedSite(int siteId) async {
    await _write(AppConstants.selectedSiteKey, siteId.toString());
  }
  
  Future<int?> getSelectedSite() async {
    final value = await _read(AppConstants.selectedSiteKey);
    if (value != null) {
      return int.tryParse(value);
    }
    return null;
  }
  
  // Clear all
  
  Future<void> clearAll() async {
    if (_useFallback) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      return;
    }
    try {
      await _storage.deleteAll();
    } catch (e) {
      debugPrint('SecureStorage deleteAll failed: $e');
      _useFallback = true;
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    }
  }
  
  // Check if authenticated
  
  Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
