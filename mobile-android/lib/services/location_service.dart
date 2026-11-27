import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../constants/api_endpoints.dart';
import 'api_service.dart';
import 'storage_service.dart';

class LocationTrackingService {
  final ApiService _api;
  final StorageService _storage;
  final Battery _battery = Battery();
  final Connectivity _connectivity = Connectivity();

  StreamSubscription<Position>? _positionStreamSub;
  Timer? _periodicTimer;
  bool _isTracking = false;

  Position? _lastPosition;
  DateTime? _lastUpdateTime;
  int _batteryLevel = 100;
  bool _hasInternet = true;
  String? _lastError;

  LocationTrackingService(this._api, this._storage);

  bool get isTracking => _isTracking;
  Position? get lastPosition => _lastPosition;
  DateTime? get lastUpdateTime => _lastUpdateTime;
  int get batteryLevel => _batteryLevel;
  bool get hasInternet => _hasInternet;
  String? get lastError => _lastError;

  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  Future<LocationPermission> requestPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      await Geolocator.openLocationSettings();
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _lastError = 'Please enable GPS Location in your device settings';
        return LocationPermission.denied;
      }
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      _lastError = 'Location permission is permanently denied. Please allow it in App Settings.';
      await Geolocator.openAppSettings();
      permission = await Geolocator.checkPermission();
    }

    return permission;
  }

  Future<bool> startTracking({required Function() onStateChanged}) async {
    final permission = await checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      _lastError = 'Location permission is denied';
      return false;
    }

    try {
      // Tell backend sharing started
      await _api.post(ApiEndpoints.startSharing, {});
      await _storage.setSharingEnabled(true);
      _isTracking = true;

      // Initial fix
      await _fetchAndSendPosition();

      // Configure location stream with Android Foreground Service for 24/7 background tracking
      late LocationSettings locationSettings;
      if (defaultTargetPlatform == TargetPlatform.android) {
        locationSettings = AndroidSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
          forceLocationManager: false,
          intervalDuration: const Duration(seconds: 15),
          foregroundNotificationConfig: const ForegroundNotificationConfig(
            notificationTitle: "Family Tracker • Location Sharing Active",
            notificationText: "Voluntarily sharing live GPS position with family administrator.",
            enableWakeLock: true,
          ),
        );
      } else {
        locationSettings = const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        );
      }

      _positionStreamSub = Geolocator.getPositionStream(locationSettings: locationSettings).listen(
        (Position position) {
          _sendPosition(position);
          onStateChanged();
        },
        onError: (err) {
          _lastError = err.toString();
          onStateChanged();
        },
      );

      // Setup periodic timer for background fallback (30-60s)
      _periodicTimer?.cancel();
      _periodicTimer = Timer.periodic(const Duration(seconds: 30), (_) async {
        if (_isTracking) {
          await _fetchAndSendPosition();
          onStateChanged();
        }
      });

      onStateChanged();
      return true;
    } catch (e) {
      _lastError = e.toString();
      _isTracking = false;
      return false;
    }
  }

  Future<void> stopTracking({required Function() onStateChanged}) async {
    _isTracking = false;
    _positionStreamSub?.cancel();
    _positionStreamSub = null;
    _periodicTimer?.cancel();
    _periodicTimer = null;

    try {
      await _api.post(ApiEndpoints.stopSharing, {});
      await _storage.setSharingEnabled(false);
    } catch (_) {}

    onStateChanged();
  }

  Future<void> _fetchAndSendPosition() async {
    try {
      final conn = await _connectivity.checkConnectivity();
      _hasInternet = !conn.contains(ConnectivityResult.none);

      if (!_hasInternet) {
        _lastError = 'No internet connection';
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      await _sendPosition(position);
    } catch (e) {
      _lastError = e.toString();
    }
  }

  Future<void> _sendPosition(Position position) async {
    try {
      _lastPosition = position;
      _batteryLevel = await _battery.batteryLevel;

      await _api.post(ApiEndpoints.updateLocation, {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy': position.accuracy,
        'altitude': position.altitude,
        'speed': position.speed,
        'batteryPercentage': _batteryLevel,
        'recordedAt': position.timestamp.toIso8601String(),
      });

      _lastUpdateTime = DateTime.now();
      _lastError = null;
    } catch (e) {
      _lastError = e.toString();
    }
  }

  Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
    } catch (_) {
      return null;
    }
  }
}
