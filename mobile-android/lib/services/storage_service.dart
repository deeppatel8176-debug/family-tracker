import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../constants/api_endpoints.dart';

class StorageService {
  static const String _keyAccessToken = 'ft_access_token';
  static const String _keyRefreshToken = 'ft_refresh_token';
  static const String _keyUser = 'ft_user';
  static const String _keyBaseUrl = 'ft_base_url';
  static const String _keySharingEnabled = 'ft_sharing_enabled';

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString(_keyBaseUrl);
    if (customUrl != null && customUrl.isNotEmpty) {
      ApiEndpoints.baseUrl = customUrl;
    }
  }

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyAccessToken, accessToken);
    await prefs.setString(_keyRefreshToken, refreshToken);
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRefreshToken);
  }

  Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUser, jsonEncode(user.toJson()));
  }

  Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_keyUser);
    if (userStr == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(userStr));
    } catch (_) {
      return null;
    }
  }

  Future<void> saveBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, url);
    ApiEndpoints.baseUrl = url;
  }

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBaseUrl) ?? ApiEndpoints.defaultBaseUrl;
  }

  Future<void> setSharingEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keySharingEnabled, enabled);
  }

  Future<bool> isSharingEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keySharingEnabled) ?? false;
  }

  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAccessToken);
    await prefs.remove(_keyRefreshToken);
    await prefs.remove(_keyUser);
    await prefs.remove(_keySharingEnabled);
  }
}
