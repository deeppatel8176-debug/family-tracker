import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

class ApiService {
  final StorageService _storage;

  ApiService(this._storage);

  Future<Map<String, String>> _getHeaders({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await _storage.getAccessToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  Future<dynamic> post(String url, Map<String, dynamic> body, {bool auth = true}) async {
    final headers = await _getHeaders(auth: auth);
    final response = await http.post(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );

    if (response.statusCode == 401 && auth) {
      // Try refresh
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders(auth: true);
        final retryResponse = await http.post(
          Uri.parse(url),
          headers: newHeaders,
          body: jsonEncode(body),
        );
        return _handleResponse(retryResponse);
      }
    }

    return _handleResponse(response);
  }

  Future<dynamic> get(String url, {bool auth = true}) async {
    final headers = await _getHeaders(auth: auth);
    final response = await http.get(Uri.parse(url), headers: headers);

    if (response.statusCode == 401 && auth) {
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        final newHeaders = await _getHeaders(auth: true);
        final retryResponse = await http.get(Uri.parse(url), headers: newHeaders);
        return _handleResponse(retryResponse);
      }
    }

    return _handleResponse(response);
  }

  Future<dynamic> patch(String url, Map<String, dynamic> body, {bool auth = true}) async {
    final headers = await _getHeaders(auth: auth);
    final response = await http.patch(
      Uri.parse(url),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) return false;

    try {
      final response = await http.post(
        Uri.parse(ApiEndpoints.refresh),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        await _storage.saveTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );
        return true;
      }
    } catch (_) {}

    return false;
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } else {
      String message = 'Request failed (${response.statusCode})';
      try {
        final err = jsonDecode(response.body);
        if (err['message'] != null) {
          message = err['message'] is List ? (err['message'] as List).join(', ') : err['message'];
        }
      } catch (_) {}
      throw Exception(message);
    }
  }
}
