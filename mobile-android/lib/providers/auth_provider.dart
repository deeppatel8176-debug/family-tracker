import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/socket_service.dart';
import '../constants/api_endpoints.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api;
  final StorageService _storage;
  final SocketService _socket;

  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._api, this._storage, this._socket);

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final savedUser = await _storage.getUser();
      final token = await _storage.getAccessToken();

      if (savedUser != null && token != null) {
        _user = savedUser;
        _socket.connect();
      }
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password, {String? deviceName}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.post(
        ApiEndpoints.memberLogin,
        {
          'email': email.trim(),
          'password': password,
          'deviceType': 'android',
          'deviceName': deviceName ?? 'Android Device',
        },
        auth: false,
      );

      final user = UserModel.fromJson(response['user']);
      await _storage.saveTokens(
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
      );
      await _storage.saveUser(user);

      _user = user;
      _socket.connect();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> activateAccount(String invitationCode, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _api.post(
        ApiEndpoints.activateAccount,
        {
          'invitationCode': invitationCode.trim().toUpperCase(),
          'password': password,
        },
        auth: false,
      );

      final user = UserModel.fromJson(response['user']);
      await _storage.saveTokens(
        accessToken: response['accessToken'],
        refreshToken: response['refreshToken'],
      );
      await _storage.saveUser(user);

      _user = user;
      _socket.connect();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiEndpoints.logout, {});
    } catch (_) {}

    _socket.disconnect();
    await _storage.clearAll();
    _user = null;
    notifyListeners();
  }
}
