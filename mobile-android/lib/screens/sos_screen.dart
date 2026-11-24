import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/location_provider.dart';
import '../constants/app_colors.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  final _messageController = TextEditingController(text: 'I need immediate assistance!');

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final location = Provider.of<LocationProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Emergency SOS', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.danger)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: GestureDetector(
                onTap: () async {
                  if (location.isSosTriggered) {
                    await location.cancelSos();
                  } else {
                    await location.triggerSos(message: _messageController.text);
                  }
                },
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: location.isSosTriggered ? AppColors.warning : AppColors.danger,
                    boxShadow: [
                      BoxShadow(
                        color: (location.isSosTriggered ? AppColors.warning : AppColors.danger).withOpacity(0.4),
                        blurRadius: 24,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          location.isSosTriggered ? Icons.cancel_outlined : Icons.sos_rounded,
                          size: 64,
                          color: Colors.white,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          location.isSosTriggered ? 'CANCEL ALARM' : 'TAP FOR SOS',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            if (location.isSosTriggered)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.dangerLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.danger),
                ),
                child: const Column(
                  children: [
                    Text(
                      'SOS EMERGENCY ALERT ACTIVE',
                      style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.danger, fontSize: 15),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Your family administrator has received your emergency alert with live coordinates.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              )
            else ...[
              const Text(
                'Emergency Note (Optional)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _messageController,
                decoration: InputDecoration(
                  hintText: 'Enter emergency message',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: AppColors.surface,
                ),
                maxLines: 2,
              ),
            ],
            const SizedBox(height: 32),
            const Text(
              'When you activate SOS:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 12),
            _buildInfoRow(Icons.pin_drop, 'Captures your high-accuracy GPS coordinates instantly'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.notification_important, 'Sends urgent push and audio-visual alerts to admin'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.undo, 'You can cancel a false alarm at any time'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary))),
      ],
    );
  }
}
