import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../services/storage_service.dart';

class AppSettingsScreen extends StatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  State<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends State<AppSettingsScreen> {
  final _urlController = TextEditingController();
  final _storage = StorageService();

  @override
  void initState() {
    super.initState();
    _loadUrl();
  }

  Future<void> _loadUrl() async {
    final url = await _storage.getBaseUrl();
    _urlController.text = url;
  }

  Future<void> _saveUrl() async {
    final newUrl = _urlController.text.trim();
    if (newUrl.isNotEmpty) {
      await _storage.saveBaseUrl(newUrl);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Backend URL saved successfully')),
        );
      }
    }
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('App Settings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'BACKEND CONNECTION',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _urlController,
            decoration: InputDecoration(
              labelText: 'Server Base URL',
              hintText: 'http://10.0.2.2:4000 or http://your-ip:4000',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: AppColors.surface,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _saveUrl,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Save URL'),
          ),
          const Divider(height: 40),
          const Text(
            'APPLICATION INFO',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          const ListTile(
            title: Text('Version'),
            subtitle: Text('1.0.0 (Build 1)'),
            trailing: Icon(Icons.info_outline, color: AppColors.textSecondary),
          ),
          const ListTile(
            title: Text('Platform'),
            subtitle: Text('Android Mobile Application (Flutter SDK)'),
          ),
          const ListTile(
            title: Text('Privacy Policy'),
            subtitle: Text('Locations are voluntarily shared and never recorded without consent.'),
          ),
        ],
      ),
    );
  }
}
