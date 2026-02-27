import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../core/constants/api_constants.dart';
import '../../core/storage/secure_storage.dart';
import '../auth/auth_provider.dart';
import 'alerts_provider.dart';

final alertsWebSocketProvider = Provider<AlertsWebSocketService>((ref) {
  return AlertsWebSocketService(ref);
});

class AlertsWebSocketService {
  final Ref _ref;
  WebSocketChannel? _channel;
  bool _isConnected = false;

  AlertsWebSocketService(this._ref);

  Future<void> connect() async {
    if (_isConnected) return;

    final storage = _ref.read(secureStorageProvider);
    final token = await storage.getAccessToken();

    if (token == null || token.isEmpty) {
      debugPrint('WebSocket: No token available for connection');
      return;
    }

    final uri = Uri.parse('${ApiConstants.wsUrl}?token=$token');
    debugPrint('WebSocket: Connecting to $uri');

    try {
      _channel = WebSocketChannel.connect(uri);
      _isConnected = true;

      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onDone: () {
          debugPrint('WebSocket: Connection closed');
          _isConnected = false;
          _reconnect();
        },
        onError: (error) {
          debugPrint('WebSocket: Error: $error');
          _isConnected = false;
          _reconnect();
        },
      );
    } catch (e) {
      debugPrint('WebSocket: Connection failed: $e');
      _isConnected = false;
      _reconnect();
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message as String);
      final type = data['type'];

      if (type == 'alert_notification') {
        debugPrint('WebSocket: New alert received!');
        // Refresh the alerts list
        _ref.read(alertsProvider.notifier).loadAlerts();
      }
    } catch (e) {
      debugPrint('WebSocket: Error decoding message: $e');
    }
  }

  void _reconnect() {
    Future.delayed(const Duration(seconds: 5), () {
      if (!_isConnected) {
        connect();
      }
    });
  }

  void disconnect() {
    _channel?.sink.close();
    _isConnected = false;
  }
}
