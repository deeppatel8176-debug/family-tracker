class ApiEndpoints {
  // 10.0.2.2 is the default alias for host loopback 127.0.0.1 in Android emulator
  static const String defaultBaseUrl = 'http://10.0.2.2:4000';

  static String baseUrl = defaultBaseUrl;

  static String get memberLogin => '$baseUrl/api/auth/member/login';
  static String get refresh => '$baseUrl/api/auth/refresh';
  static String get logout => '$baseUrl/api/auth/logout';
  static String get activateAccount => '$baseUrl/api/members/activate-account';
  static String get profile => '$baseUrl/api/members/profile';

  static String get updateLocation => '$baseUrl/api/locations/update';
  static String get startSharing => '$baseUrl/api/locations/sharing/start';
  static String get stopSharing => '$baseUrl/api/locations/sharing/stop';
  static String get pauseSharing => '$baseUrl/api/locations/sharing/pause';
  static String get memberLocation => '$baseUrl/api/locations/current';
  static String get locationHistory => '$baseUrl/api/locations/history';

  static String get triggerSos => '$baseUrl/api/sos/trigger';
  static String get cancelSos => '$baseUrl/api/sos';
}
