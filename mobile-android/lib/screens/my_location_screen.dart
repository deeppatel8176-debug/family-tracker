import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../providers/location_provider.dart';
import '../constants/app_colors.dart';

class MyLocationScreen extends StatefulWidget {
  const MyLocationScreen({super.key});

  @override
  State<MyLocationScreen> createState() => _MyLocationScreenState();
}

class _MyLocationScreenState extends State<MyLocationScreen> {
  GoogleMapController? _mapController;

  @override
  Widget build(BuildContext context) {
    final location = Provider.of<LocationProvider>(context);
    final pos = location.lastPosition;

    final LatLng currentCoord = pos != null
        ? LatLng(pos.latitude, pos.longitude)
        : const LatLng(37.7749, -122.4194); // Default SF coordinate

    final markers = <Marker>{
      if (pos != null)
        Marker(
          markerId: const MarkerId('current_pos'),
          position: currentCoord,
          infoWindow: InfoWindow(
            title: 'My Current Location',
            snippet: 'Accuracy: ±${pos.accuracy.toStringAsFixed(1)}m',
          ),
        ),
    };

    final circles = <Circle>{
      if (pos != null)
        Circle(
          circleId: const CircleId('accuracy_circle'),
          center: currentCoord,
          radius: pos.accuracy,
          fillColor: AppColors.primary.withOpacity(0.15),
          strokeColor: AppColors.primary,
          strokeWidth: 1,
        ),
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Live Location', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        elevation: 0.5,
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: currentCoord,
              zoom: 15,
            ),
            markers: markers,
            circles: circles,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onMapCreated: (ctrl) => _mapController = ctrl,
          ),
          Positioned(
            bottom: 24,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Icon(
                        location.isTracking ? Icons.check_circle : Icons.pause_circle,
                        color: location.isTracking ? AppColors.success : AppColors.warning,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        location.isTracking ? 'Sharing is Active' : 'Sharing is Off',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.my_location, color: AppColors.primary),
                        onPressed: () {
                          if (pos != null && _mapController != null) {
                            _mapController!.animateCamera(
                              CameraUpdate.newLatLngZoom(LatLng(pos.latitude, pos.longitude), 16),
                            );
                          }
                        },
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        pos != null
                            ? '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}'
                            : 'Acquiring GPS fix...',
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontFamily: 'monospace'),
                      ),
                      Text(
                        pos != null ? '±${pos.accuracy.toStringAsFixed(1)} m' : '',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
