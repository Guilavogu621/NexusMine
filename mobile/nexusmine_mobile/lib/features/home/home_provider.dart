import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';

/// État du dashboard terrain (Home)
class HomeStats {
  final int openIncidents;
  final int brokenEquipment;
  final int activeAlerts;
  final int todayOperations;
  final bool isLoading;
  final String? error;

  const HomeStats({
    this.openIncidents = 0,
    this.brokenEquipment = 0,
    this.activeAlerts = 0,
    this.todayOperations = 0,
    this.isLoading = false,
    this.error,
  });

  HomeStats copyWith({
    int? openIncidents,
    int? brokenEquipment,
    int? activeAlerts,
    int? todayOperations,
    bool? isLoading,
    String? error,
  }) {
    return HomeStats(
      openIncidents: openIncidents ?? this.openIncidents,
      brokenEquipment: brokenEquipment ?? this.brokenEquipment,
      activeAlerts: activeAlerts ?? this.activeAlerts,
      todayOperations: todayOperations ?? this.todayOperations,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les statistiques du dashboard
final homeStatsProvider =
    StateNotifierProvider<HomeStatsNotifier, HomeStats>((ref) {
  return HomeStatsNotifier(ref);
});

class HomeStatsNotifier extends StateNotifier<HomeStats> {
  final Ref _ref;

  HomeStatsNotifier(this._ref) : super(const HomeStats());

  /// Charger les stats depuis /indicators/dashboard_overview/
  Future<void> loadStats() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        '${ApiConstants.analytics}dashboard_overview/',
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final stats = data['stats'] as Map<String, dynamic>? ?? {};
        final equipmentStatus =
            data['equipment_status'] as List<dynamic>? ?? [];

        // Compteur incidents ouverts (non RESOLVED, non CLOSED)
        final totalIncidents = stats['incidents'] as int? ?? 0;

        // Équipements en panne / hors service
        int broken = 0;
        for (final eq in equipmentStatus) {
          final s = eq['status'] as String? ?? '';
          if (s == 'OUT_OF_SERVICE' || s == 'REPAIR') {
            broken += (eq['total'] as int? ?? 0);
          }
        }

        // Alertes actives (récentes)
        final recentAlerts = data['recent_alerts'] as List<dynamic>? ?? [];

        // Opérations récentes
        final recentOps = data['recent_operations'] as List<dynamic>? ?? [];

        state = state.copyWith(
          openIncidents: totalIncidents,
          brokenEquipment: broken,
          activeAlerts: recentAlerts.length,
          todayOperations: recentOps.length,
          isLoading: false,
        );
      }
    } catch (e) {
      debugPrint('Erreur chargement stats: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'Impossible de charger les statistiques',
      );
    }
  }
}
