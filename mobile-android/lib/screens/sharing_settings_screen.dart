import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';
import '../constants/app_colors.dart';

class SharingSettingsScreen extends StatefulWidget {
  const SharingSettingsScreen({super.key});

  @override
  State<SharingSettingsScreen> createState() => _SharingSettingsScreenState();
}

class _SharingSettingsScreenState extends State<SharingSettingsScreen> {
  bool _batterySaver = false;
  int _activeInterval = 15; // seconds
  int _backgroundInterval = 45; // seconds

  @override
  Widget build(BuildContext context) {
    final location = Provider.of<LocationProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Sharing Settings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildSectionHeader('LOCATION SHARING CONTROLS'),
          SwitchListTile(
            title: const Text('Voluntary Location Sharing', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('Enable or disable sending real-time coordinates to family admin'),
            value: location.isTracking,
            activeColor: AppColors.primary,
            onChanged: (val) => location.toggleTracking(val),
          ),
          const Divider(),
          _buildSectionHeader('UPDATE INTERVALS'),
          ListTile(
            title: const Text('Active App Interval'),
            subtitle: Text('$_activeInterval seconds (while app is open)'),
            trailing: const Icon(Icons.speed_rounded, color: AppColors.textSecondary),
          ),
          ListTile(
            title: const Text('Background Interval'),
            subtitle: Text('$_backgroundInterval seconds (subject to Android battery optimization)'),
            trailing: const Icon(Icons.timer_outlined, color: AppColors.textSecondary),
          ),
          const Divider(),
          _buildSectionHeader('POWER & BATTERY OPTIMIZATION'),
          SwitchListTile(
            title: const Text('Stationary Power Saver'),
            subtitle: const Text('Pause coordinate transmission when device has not moved for 2 minutes'),
            value: _batterySaver,
            activeColor: AppColors.primary,
            onChanged: (val) => setState(() => _batterySaver = val),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.shield_outlined, color: AppColors.primary, size: 24),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Privacy Guarantee: Your family administrator cannot remotely or secretly activate your GPS. Only you control when location sharing is active.',
                    style: TextStyle(fontSize: 13, color: AppColors.primaryDark, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}
