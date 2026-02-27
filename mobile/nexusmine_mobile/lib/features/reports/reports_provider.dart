import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/report_model.dart';

/// État des rapports
class ReportsState {
  final List<ReportModel> reports;
  final bool isLoading;
  final String? error;

  const ReportsState({
    this.reports = const [],
    this.isLoading = false,
    this.error,
  });

  ReportsState copyWith({
    List<ReportModel>? reports,
    bool? isLoading,
    String? error,
  }) {
    return ReportsState(
      reports: reports ?? this.reports,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les rapports
final reportsProvider =
    StateNotifierProvider<ReportsNotifier, ReportsState>((ref) {
  return ReportsNotifier(ref);
});

class ReportsNotifier extends StateNotifier<ReportsState> {
  final Ref _ref;

  ReportsNotifier(this._ref) : super(const ReportsState());

  /// Charger tous les rapports
  Future<void> loadReports({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.reports,
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

        final reports = results
            .map((json) =>
                ReportModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          reports: reports,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des rapports',
      );
      debugPrint('Erreur loadReports: $e');
    }
  }

  /// Récupérer un rapport par ID
  Future<ReportModel?> getReport(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('${ApiConstants.reports}$id/');

      if (response.statusCode == 200) {
        return ReportModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur récupération rapport: $e');
    }
    return null;
  }
}
