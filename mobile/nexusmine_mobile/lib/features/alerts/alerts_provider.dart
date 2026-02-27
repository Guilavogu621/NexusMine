import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/alert_model.dart';

/// État des alertes
class AlertsState {
  final List<AlertModel> alerts;
  final bool isLoading;
  final String? error;
  
  const AlertsState({
    this.alerts = const [],
    this.isLoading = false,
    this.error,
  });
  
  AlertsState copyWith({
    List<AlertModel>? alerts,
    bool? isLoading,
    String? error,
  }) {
    return AlertsState(
      alerts: alerts ?? this.alerts,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
  
  int get unreadCount => alerts.where((a) => !a.isRead).length;
  int get unacknowledgedCount => alerts.where((a) => !a.isAcknowledged).length;
}

/// Provider pour les alertes
final alertsProvider = StateNotifierProvider<AlertsNotifier, AlertsState>((ref) {
  return AlertsNotifier(ref);
});

class AlertsNotifier extends StateNotifier<AlertsState> {
  final Ref _ref;
  
  AlertsNotifier(this._ref) : super(const AlertsState());
  
  /// Charger toutes les alertes
  Future<void> loadAlerts({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.alerts,
        queryParameters: filters,
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> results;
        
        if (data is Map && data.containsKey('results')) {
          results = data['results'] as List<dynamic>;
        } else if (data is List) {
          results = data;
        } else {
          results = [];
        }
        
        final alerts = results
            .map((json) => AlertModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        // Trier par date (plus récentes en premier)
        alerts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        
        state = state.copyWith(
          alerts: alerts,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des alertes',
      );
    }
  }
  
  /// Acquitter/marquer comme lue une alerte via POST /alerts/{id}/mark_read/
  Future<bool> acknowledgeAlert(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.dio.post(
        '${ApiConstants.alerts}$id/mark_read/',
      );
      
      if (response.statusCode == 200) {
        // Recharger la liste pour avoir les données à jour
        await loadAlerts();
        return true;
      }
    } catch (e) {
      debugPrint('Erreur acquittement alerte: $e');
    }
    return false;
  }
  
  /// Acquitter toutes les alertes
  Future<void> acknowledgeAll() async {
    final unacknowledged = state.alerts.where((a) => !a.isAcknowledged).toList();
    
    for (final alert in unacknowledged) {
      await acknowledgeAlert(alert.id);
    }
  }
  
  /// Marquer une alerte comme lue via POST /alerts/{id}/mark_read/
  Future<bool> markAsRead(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.dio.post(
        '${ApiConstants.alerts}$id/mark_read/',
      );
      
      if (response.statusCode == 200) {
        await loadAlerts();
        return true;
      }
    } catch (e) {
      debugPrint('Erreur marquage alerte: $e');
    }
    return false;
  }
}
