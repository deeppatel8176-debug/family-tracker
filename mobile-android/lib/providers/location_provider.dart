import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/location_service.dart';
import '../services/api_service.dart';
import '../constants/api_endpoints.dart';
import '../models/location_model.dart';

class LocationProvider extends ChangeNotifier {
  final LocationTrackingService _trackingService;
  final ApiService _api;

  bool _isSosTriggered = false;
  String? _activeSosAlertId;
  List<LocationPoint> _historyPoints = [];
  bool _isLoadingHistory = false;

  LocationProvider(this._trackingService, this._api);

  bool get isTracking => _trackingService.isTracking;
  Position? get lastPosition => _trackingService.lastPosition;
  DateTime? get lastUpdateTime => _trackingService.lastUpdateTime;
  int get batteryLevel => _trackingService.batteryLevel;
  bool get hasInternet => _trackingService.hasInternet;
  String? get lastError => _trackingService.lastError;

  bool get isSosTriggered => _isSosTriggered;
  String? get activeSosAlertId => _activeSosAlertId;
  List<LocationPoint> get historyPoints => _historyPoints;
  bool get isLoadingHistory => _isLoadingHistory;

  Future<bool> requestPermission() async {
    final status = await _trackingService.requestPermission();
    notifyListeners();
    return status == LocationPermission.whileInUse || status == LocationPermission.always;
  }

  Future<bool> toggleTracking(bool enable) async {
    if (enable) {
      final success = await _trackingService.startTracking(onStateChanged: notifyListeners);
      notifyListeners();
      return success;
    } else {
      await _trackingService.stopTracking(onStateChanged: notifyListeners);
      notifyListeners();
      return true;
    }
  }

  Future<bool> triggerSos({String? message}) async {
    try {
      final position = _trackingService.lastPosition ?? await _trackingService.getCurrentPosition();
      if (position == null) {
        throw Exception('Unable to acquire current GPS coordinates for SOS');
      }

      final res = await _api.post(ApiEndpoints.triggerSos, {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'message': message ?? 'Emergency SOS Alert',
      });

      _isSosTriggered = true;
      _activeSosAlertId = res['alert']?['alertId'];
      notifyListeners();
      return true;
    } catch (e) {
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelSos() async {
    if (_activeSosAlertId == null) return false;
    try {
      await _api.patch('${ApiEndpoints.cancelSos}/$_activeSosAlertId/cancel', {});
      _isSosTriggered = false;
      _activeSosAlertId = null;
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> fetchHistory(DateTime start, DateTime end) async {
    _isLoadingHistory = true;
    notifyListeners();

    try {
      final url = '${ApiEndpoints.locationHistory}?startDate=${Uri.encodeComponent(start.toIso8601String())}&endDate=${Uri.encodeComponent(end.toIso8601String())}';
      final res = await _api.get(url);
      final list = (res['points'] as List? ?? [])
          .map((item) => LocationPoint.fromJson(item))
          .toList();
      _historyPoints = list;
    } catch (_) {
      _historyPoints = [];
    }

    _isLoadingHistory = false;
    notifyListeners();
  }
}
