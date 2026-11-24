import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

class SocketService {
  final StorageService _storage;
  io.Socket? _socket;
  bool _isConnected = false;

  SocketService(this._storage);

  bool get isConnected => _isConnected;

  Future<void> connect({Function(dynamic)? onSosAlert, Function(dynamic)? onStatusChange}) async {
    final token = await _storage.getAccessToken();
    if (token == null) return;

    disconnect();

    final options = io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .enableReconnection()
        .build();

    _socket = io.io(ApiEndpoints.baseUrl, options);

    _socket?.onConnect((_) {
      _isConnected = true;
    });

    _socket?.onDisconnect((_) {
      _isConnected = false;
    });

    if (onSosAlert != null) {
      _socket?.on('sos:alert', onSosAlert);
    }

    if (onStatusChange != null) {
      _socket?.on('member:sharing-status', onStatusChange);
    }
  }

  void disconnect() {
    if (_socket != null) {
      _socket?.disconnect();
      _socket?.dispose();
      _socket = null;
      _isConnected = false;
    }
  }
}
