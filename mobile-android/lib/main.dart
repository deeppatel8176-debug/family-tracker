import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/app_colors.dart';
import 'services/storage_service.dart';
import 'services/api_service.dart';
import 'services/socket_service.dart';
import 'services/location_service.dart';
import 'providers/auth_provider.dart';
import 'providers/location_provider.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final storage = StorageService();
  await storage.init();

  runApp(const FamilyTrackerApp());
}

class FamilyTrackerApp extends StatefulWidget {
  const FamilyTrackerApp({super.key});

  @override
  State<FamilyTrackerApp> createState() => _FamilyTrackerAppState();
}

class _FamilyTrackerAppState extends State<FamilyTrackerApp> {
  late final StorageService _storage;
  late final ApiService _api;
  late final SocketService _socket;
  late final LocationTrackingService _locationTracker;

  @override
  void initState() {
    super.initState();
    _storage = StorageService();
    _api = ApiService(_storage);
    _socket = SocketService(_storage);
    _locationTracker = LocationTrackingService(_api, _storage);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(_api, _storage, _socket)),
        ChangeNotifierProvider(create: (_) => LocationProvider(_locationTracker, _api)),
      ],
      child: MaterialApp(
        title: 'Family Tracker',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary,
            primary: AppColors.primary,
            surface: AppColors.surface,
          ),
          scaffoldBackgroundColor: AppColors.background,
          fontFamily: 'Roboto',
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
